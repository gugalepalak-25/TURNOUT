import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck,
  AlertTriangle,
  Plus,
  Trash2,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Wallet,
} from 'lucide-react';
import { useNearWallet } from '../context/NearWalletContext.js';
import { fetchWatchlist, addToWatchlist, removeFromWatchlist, fetchDelegates } from '../services/api.js';
import { TerminalBox } from '../components/common/TerminalBox.js';
import { GradeBadge } from '../components/common/GradeBadge.js';
import { MonospaceAddress } from '../components/common/MonospaceAddress.js';

export const GuardianPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { accountId, isConnected, signTransaction } = useNearWallet();

  const [selectedDelegate, setSelectedDelegate] = useState('');
  const [threshold, setThreshold] = useState<number>(80);
  const [selectedBackup, setSelectedBackup] = useState('');
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchReceipt, setSwitchReceipt] = useState<{ txHash: string; explorerUrl: string } | null>(null);

  const activeAccount = accountId || 'governance-user.testnet';

  const { data: watchlist, isLoading } = useQuery({
    queryKey: ['guardian-watchlist', activeAccount],
    queryFn: () => fetchWatchlist(activeAccount),
  });

  const { data: delegates } = useQuery({
    queryKey: ['delegates'],
    queryFn: fetchDelegates,
  });

  const addMutation = useMutation({
    mutationFn: addToWatchlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardian-watchlist', activeAccount] });
      setSelectedDelegate('');
      setSelectedBackup('');
    },
  });

  const removeMutation = useMutation({
    mutationFn: ({ delegate }: { delegate: string }) =>
      removeFromWatchlist(delegate, activeAccount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardian-watchlist', activeAccount] });
    },
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDelegate) return;

    addMutation.mutate({
      delegatorAccountId: activeAccount,
      delegateAccountId: selectedDelegate,
      minParticipationThreshold: threshold,
      backupDelegateAccountId: selectedBackup || undefined,
    });
  };

  const handleExecuteSwitch = async (entry: any) => {
    setIsSwitching(true);
    setSwitchReceipt(null);
    try {
      const backupTarget = entry.backupDelegateAccountId || entry.recommendedAlternatives?.[0]?.accountId;
      if (!backupTarget) {
        alert('Please designate a backup delegate first.');
        return;
      }

      const receipt = await signTransaction({
        receiverId: 'venear.hos.testnet',
        methodName: 'set_delegations',
        args: {
          delegations: [{ delegate: backupTarget, weight: 100 }],
        },
      });

      setSwitchReceipt(receipt);
    } catch (err: any) {
      alert(`Transaction failed: ${err.message}`);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8e8e8e] tracking-widest uppercase mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>AUTOMATED STAKE PROTECTION</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-dotmatrix font-bold text-white tracking-tight">
            DELEGATION GUARDIAN
          </h1>
          <p className="text-sm text-[#8e8e8e] mt-1 max-w-2xl font-sans">
            Monitor your delegated NEAR stake in real time. Receive instant alerts if a delegate breaches the 80% House of Stake threshold, and execute 1-click re-delegation directly to verified backup candidates.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#c4c2c3] bg-[#28282a] border border-white/20 px-4 py-2 rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.16)]">
          <Wallet className="w-3.5 h-3.5 text-[#B6F36B]" />
          <span>Active Delegator: {activeAccount}</span>
        </div>
      </div>

      {/* Re-delegation Success Alert */}
      {switchReceipt && (
        <div className="p-4 rounded-2xl bg-white/10 border border-white/30 text-white flex items-center justify-between shadow-[0_0_22px_rgba(255,255,255,0.2)]">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#B6F36B]" />
            <div>
              <div className="font-heading font-bold text-sm">Delegation Successfully Reassigned on NEAR Testnet</div>
              <div className="text-xs text-[#8e8e8e] font-mono">
                Transaction Hash: {switchReceipt.txHash}
              </div>
            </div>
          </div>
          <a
            href={switchReceipt.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-sans font-semibold hover:bg-neutral-100 flex items-center gap-1.5"
          >
            <span>View Receipt</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Add to Watchlist Form */}
      <TerminalBox
        title="Add Delegate to Protection Watchlist"
        tag="Config"
      >
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#8e8e8e] mb-2">
              Select Monitored Delegate:
            </label>
            <select
              value={selectedDelegate}
              onChange={(e) => setSelectedDelegate(e.target.value)}
              className="w-full bg-black font-mono text-xs text-white px-4 py-2.5 rounded-full border border-white/20 focus:border-white focus:outline-none"
            >
              <option value="">-- Choose Delegate --</option>
              {(delegates || []).map((d) => (
                <option key={d.accountId} value={d.accountId}>
                  {d.name} ({d.accountId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#8e8e8e] mb-2">
              Alert Threshold (Min %):
            </label>
            <input
              type="number"
              min="50"
              max="95"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full bg-black font-mono text-xs text-white px-4 py-2.5 rounded-full border border-white/20 focus:border-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#8e8e8e] mb-2">
              Designate Backup Delegate:
            </label>
            <select
              value={selectedBackup}
              onChange={(e) => setSelectedBackup(e.target.value)}
              className="w-full bg-black font-mono text-xs text-white px-4 py-2.5 rounded-full border border-white/20 focus:border-white focus:outline-none"
            >
              <option value="">-- Choose Backup (Optional) --</option>
              {(delegates || [])
                .filter((d) => d.accountId !== selectedDelegate)
                .map((d) => (
                  <option key={d.accountId} value={d.accountId}>
                    {d.name} (Grade {d.performanceGrade} • {d.participationRate}%)
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={!selectedDelegate || addMutation.isPending}
              className="w-full py-2.5 rounded-full bg-white text-black font-sans text-xs font-semibold hover:bg-neutral-100 hover:shadow-[0_0_22px_rgba(255,255,255,0.32)] transition-all flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
              <span>{addMutation.isPending ? 'Arming...' : 'Arm Guardian'}</span>
            </button>
          </div>
        </form>
      </TerminalBox>

      {/* Monitored Watchlist Cards */}
      <TerminalBox
        title="Active Monitored Delegations"
        tag={`${watchlist?.length || 0} Delegates Guarded`}
      >
        {isLoading ? (
          <div className="py-12 text-center text-[#8e8e8e] font-mono text-xs">
            CHECKING DELEGATION INTEGRITY ON NEAR LEDGER...
          </div>
        ) : !watchlist || watchlist.length === 0 ? (
          <div className="py-12 text-center text-[#8e8e8e] font-mono text-xs">
            NO DELEGATES CURRENTLY IN YOUR PROTECTION WATCHLIST
          </div>
        ) : (
          <div className="space-y-4">
            {watchlist.map((entry) => {
              const isBreached = entry.currentParticipationRate < entry.minParticipationThreshold;

              return (
                <div
                  key={entry.delegateAccountId}
                  className={`p-5 rounded-2xl border transition-all ${
                    isBreached
                      ? 'bg-[#18181a] border-[#E87979]/40 shadow-[0_0_15px_rgba(232,121,121,0.15)]'
                      : 'bg-[#18181a]/70 border-white/10'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-dotmatrix font-bold text-base shrink-0">
                        {entry.delegateName?.[0] || 'D'}
                      </div>
                      <div>
                        <div className="font-heading font-bold text-base text-white">
                          {entry.delegateName}
                        </div>
                        <div className="text-xs text-[#8e8e8e] font-mono">
                          {entry.delegateAccountId}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <GradeBadge grade={entry.currentGrade as any} size="sm" />
                      <button
                        onClick={() => removeMutation.mutate({ delegate: entry.delegateAccountId })}
                        className="text-[#8e8e8e] hover:text-[#E87979] p-2 rounded-full hover:bg-white/5 transition-colors"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-white/10 font-mono text-xs">
                    <div>
                      <span className="text-[#8e8e8e] uppercase block text-[10px]">Current Participation</span>
                      <span
                        className={`font-dotmatrix text-lg font-bold ${
                          isBreached ? 'text-[#E87979]' : 'text-white'
                        }`}
                      >
                        {entry.currentParticipationRate}%
                      </span>
                    </div>

                    <div>
                      <span className="text-[#8e8e8e] uppercase block text-[10px]">Monitored Threshold</span>
                      <span className="font-dotmatrix text-lg font-bold text-white">
                        ≥ {entry.minParticipationThreshold}%
                      </span>
                    </div>

                    <div>
                      <span className="text-[#8e8e8e] uppercase block text-[10px]">Health Status</span>
                      {isBreached ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-[#E87979] font-bold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Charter Breach Detected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-white">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#B6F36B]" />
                          Healthy & Diligent
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 1-Click Re-delegation Action if in breach */}
                  {isBreached && (
                    <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs text-[#8e8e8e] font-sans">
                        Re-delegate to verified alternative:{' '}
                        <span className="text-white font-mono font-semibold">
                          {entry.backupDelegateAccountId || entry.recommendedAlternatives?.[0]?.accountId || 'stakewithus.near'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleExecuteSwitch(entry)}
                        disabled={isSwitching}
                        className="px-5 py-2 rounded-full bg-white text-black font-sans font-bold text-xs hover:bg-neutral-100 hover:shadow-[0_0_22px_rgba(255,255,255,0.32)] transition-all flex items-center justify-center gap-2"
                      >
                        <span>{isSwitching ? 'Signing on NEAR...' : '1-Click Re-delegate'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </TerminalBox>
    </div>
  );
};
