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
  RefreshCw,
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
      <div className="border-b border-cr-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cr-accent tracking-widest uppercase mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            STAKE PROTECTION ENGINE
          </div>
          <h1 className="text-3xl font-heading font-bold text-cr-text tracking-tight">
            Delegation Guardian
          </h1>
          <p className="text-sm text-cr-muted mt-1 max-w-2xl">
            Protect your governance influence. Monitor your chosen delegates, receive instant alerts when participation dips below your guarded threshold, and execute 1-click re-delegation via NEAR wallet.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-cr-muted bg-cr-surface border border-cr-border px-3 py-1.5 rounded-lg">
          <Wallet className="w-3.5 h-3.5 text-cr-accent" />
          <span>Active Guard: {activeAccount}</span>
        </div>
      </div>

      {/* Switch Receipt Banner */}
      {switchReceipt && (
        <div className="p-4 bg-cr-accent/10 border border-cr-accent/40 rounded-lg flex items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-cr-accent shrink-0" />
            <div>
              <span className="font-bold text-cr-accent block">
                RE-DELEGATION TRANSACTION BROADCAST ON NEAR TESTNET
              </span>
              <span className="text-cr-muted">
                Transaction Hash:{' '}
                <MonospaceAddress value={switchReceipt.txHash} type="hash" truncate={false} />
              </span>
            </div>
          </div>
          <a
            href={switchReceipt.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded bg-cr-accent text-cr-bg font-bold hover:bg-cr-accentHover transition-colors flex items-center gap-1 shrink-0"
          >
            <span>View Receipt</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Add Delegate Watchlist Form */}
      <TerminalBox
        title="Add Delegate to Guarded Watchlist"
        tag="Threshold Automation"
      >
        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-cr-muted mb-1.5">
              Select Watched Delegate:
            </label>
            <select
              value={selectedDelegate}
              onChange={(e) => setSelectedDelegate(e.target.value)}
              className="w-full bg-cr-bg font-mono text-xs text-cr-text px-3 py-2 rounded border border-cr-border focus:border-cr-accent focus:outline-none"
            >
              <option value="">-- Choose Delegate --</option>
              {delegates?.map((d) => (
                <option key={d.accountId} value={d.accountId}>
                  {d.name} ({d.accountId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-cr-muted mb-1.5">
              Alert Threshold (Participation %):
            </label>
            <input
              type="number"
              min="50"
              max="100"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full bg-cr-bg font-mono text-xs text-cr-text px-3 py-2 rounded border border-cr-border focus:border-cr-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-cr-muted mb-1.5">
              Backup Delegate Target:
            </label>
            <select
              value={selectedBackup}
              onChange={(e) => setSelectedBackup(e.target.value)}
              className="w-full bg-cr-bg font-mono text-xs text-cr-text px-3 py-2 rounded border border-cr-border focus:border-cr-accent focus:outline-none"
            >
              <option value="">-- Automatic Highest Ranked --</option>
              {delegates?.map((d) => (
                <option key={d.accountId} value={d.accountId}>
                  {d.name} (Grade {d.performanceGrade})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={!selectedDelegate || addMutation.isPending}
              className="w-full py-2 px-4 rounded bg-cr-accent text-cr-bg font-mono text-xs font-bold hover:bg-cr-accentHover transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Guard Delegate</span>
            </button>
          </div>
        </form>
      </TerminalBox>

      {/* Watchlist Cards */}
      <div className="space-y-4">
        <h3 className="font-heading font-bold text-lg text-cr-text">
          Active Watchlist ({watchlist?.length || 0})
        </h3>

        {isLoading ? (
          <div className="py-12 text-center text-cr-muted font-mono text-xs">
            LOADING GUARDED WATCHLIST TELEMETRY...
          </div>
        ) : !watchlist || watchlist.length === 0 ? (
          <div className="py-12 bg-cr-surface border border-cr-border rounded-lg text-center text-cr-muted font-mono text-xs">
            NO DELEGATES CURRENTLY UNDER GUARDIAN WATCH
          </div>
        ) : (
          watchlist.map((entry) => (
            <div
              key={entry.delegateAccountId}
              className={`bg-cr-surface border rounded-lg p-5 transition-all ${
                entry.alertActive
                  ? 'border-cr-warning/60 bg-cr-warning/5'
                  : 'border-cr-border'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-heading font-bold text-base text-cr-text">
                      {entry.delegateName}
                    </h4>
                    <GradeBadge grade={entry.currentGrade as any} size="sm" />
                    {entry.alertActive ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-cr-warning bg-cr-warning/10 px-2 py-0.5 rounded border border-cr-warning/40 font-semibold">
                        <AlertTriangle className="w-3 h-3" />
                        Threshold Breached
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-cr-accent bg-cr-accent/10 px-2 py-0.5 rounded border border-cr-accent/30 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        Guarded & Compliant
                      </span>
                    )}
                  </div>

                  <div className="font-mono text-xs text-cr-muted mb-2">
                    <MonospaceAddress value={entry.delegateAccountId} type="account" truncate={false} />
                  </div>

                  {entry.alertActive && entry.alertMessage && (
                    <p className="text-xs text-cr-warning font-sans leading-relaxed mb-3 bg-cr-warning/10 p-2.5 rounded border border-cr-warning/20">
                      {entry.alertMessage}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-cr-muted">
                    <span>
                      Participation:{' '}
                      <span
                        className={
                          entry.currentParticipationRate >= entry.minParticipationThreshold
                            ? 'text-cr-accent font-bold'
                            : 'text-cr-warning font-bold'
                        }
                      >
                        {entry.currentParticipationRate}%
                      </span>
                    </span>
                    <span>•</span>
                    <span>
                      Alert Target: <span className="text-cr-text font-bold">&lt; {entry.minParticipationThreshold}%</span>
                    </span>
                    <span>•</span>
                    <span>
                      Backup Delegate:{' '}
                      <span className="text-cr-secondaryAccent font-semibold">
                        {entry.backupDelegateName || entry.backupDelegateAccountId || 'None Selected'}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start shrink-0">
                  {entry.alertActive && (
                    <button
                      onClick={() => handleExecuteSwitch(entry)}
                      disabled={isSwitching}
                      className="px-3.5 py-2 rounded bg-cr-warning text-cr-bg font-mono text-xs font-bold hover:bg-yellow-400 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Re-Delegate Stake</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => removeMutation.mutate({ delegate: entry.delegateAccountId })}
                    className="p-2 rounded bg-cr-bgSecondary border border-cr-border text-cr-muted hover:text-cr-critical transition-colors"
                    title="Remove from watchlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

