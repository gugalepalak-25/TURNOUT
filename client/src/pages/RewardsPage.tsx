import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Gift,
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Calculator,
  FileCode,
  ArrowRight,
} from 'lucide-react';
import { fetchRewards, calculateCustomRewardPool } from '../services/api.js';
import { TerminalBox } from '../components/common/TerminalBox.js';
import { GradeBadge } from '../components/common/GradeBadge.js';
import { MonospaceAddress } from '../components/common/MonospaceAddress.js';

export const RewardsPage: React.FC = () => {
  const [rewardAmount, setRewardAmount] = useState<number>(50000);
  const [minScore, setMinScore] = useState<number>(80);
  const [customDistribution, setCustomDistribution] = useState<any | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showProposalJson, setShowProposalJson] = useState(false);

  const { data: rewardData, isLoading } = useQuery({
    queryKey: ['rewards'],
    queryFn: fetchRewards,
  });

  const activeDistribution = customDistribution || rewardData?.activeDistribution;

  const handleRecalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    try {
      const dist = await calculateCustomRewardPool({
        name: 'House of Stake Epoch Reward Pool',
        totalRewardAmount: rewardAmount,
        tokenSymbol: 'NEAR',
        period: 'HOS-2026-Q1',
        minScoreRequired: minScore,
        minHoSThreshold: 80.0,
      });
      setCustomDistribution(dist);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8e8e8e] tracking-widest uppercase mb-1">
            <Gift className="w-3.5 h-3.5 text-white" />
            <span>PERFORMANCE-BASED REWARD DISTRIBUTION</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-dotmatrix font-bold text-white tracking-tight">
            GOVERNANCE REWARD MANAGER
          </h1>
          <p className="text-sm text-[#8e8e8e] mt-1 max-w-2xl font-sans">
            Incentivize diligent governance through performance-weighted payouts. Rewards are allocated strictly based on verified scorecards and require formal DAO multi-sig approval.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#c4c2c3] bg-[#28282a] border border-white/20 px-4 py-2 rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.16)]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#B6F36B]" />
          <span>Non-Custodial DAO Pipeline</span>
        </div>
      </div>

      {/* Simulator Control & Config */}
      <TerminalBox
        title="Reward Pool Configuration & Simulator"
        tag="HOS Epoch 14 Payout"
      >
        <form onSubmit={handleRecalculate} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#8e8e8e] mb-2">
              Total Pool Amount (NEAR):
            </label>
            <input
              type="number"
              min="1000"
              step="1000"
              value={rewardAmount}
              onChange={(e) => setRewardAmount(Number(e.target.value))}
              className="w-full bg-black font-mono text-xs text-white px-4 py-2.5 rounded-full border border-white/20 focus:border-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#8e8e8e] mb-2">
              Minimum Reputation Score (0-100):
            </label>
            <input
              type="number"
              min="50"
              max="100"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full bg-black font-mono text-xs text-white px-4 py-2.5 rounded-full border border-white/20 focus:border-white focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isCalculating}
              className="w-full py-2.5 rounded-full bg-white text-black font-sans text-xs font-semibold hover:bg-neutral-100 hover:shadow-[0_0_22px_rgba(255,255,255,0.32)] transition-all flex items-center justify-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              <span>{isCalculating ? 'Computing...' : 'Recalculate Distribution'}</span>
            </button>
          </div>
        </form>

        {activeDistribution && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 font-mono text-xs">
            <div className="bg-[#121214] p-4 rounded-xl border border-white/10">
              <span className="text-[#8e8e8e] uppercase block text-[10px]">Eligible Delegates</span>
              <span className="font-dotmatrix text-2xl font-bold text-white">
                {activeDistribution.eligibleDelegatesCount} / {activeDistribution.totalDelegatesEvaluated}
              </span>
            </div>
            <div className="bg-[#121214] p-4 rounded-xl border border-white/10">
              <span className="text-[#8e8e8e] uppercase block text-[10px]">Total Allocated</span>
              <span className="font-dotmatrix text-2xl font-bold text-white">
                {activeDistribution.totalDistributedAmount?.toLocaleString()} {activeDistribution.tokenSymbol}
              </span>
            </div>
            <div className="bg-[#121214] p-4 rounded-xl border border-white/10">
              <span className="text-[#8e8e8e] uppercase block text-[10px]">Status</span>
              <span className="font-dotmatrix text-2xl font-bold text-[#c4c2c3]">
                {activeDistribution.status}
              </span>
            </div>
          </div>
        )}
      </TerminalBox>

      {/* Allocated Delegate Rewards Table */}
      {activeDistribution && (
        <TerminalBox
          title="Calculated Reward Allocation Matrix"
          tag={`Epoch: ${activeDistribution.period}`}
          action={
            <button
              onClick={() => setShowProposalJson(!showProposalJson)}
              className="text-xs font-mono text-white hover:underline flex items-center gap-1.5 bg-[#28282a] border border-white/20 px-3 py-1 rounded-full"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{showProposalJson ? 'Hide DAO Payload' : 'Export Sputnik DAO Call'}</span>
            </button>
          }
        >
          {showProposalJson && (
            <div className="mb-4 p-4 rounded-xl bg-black border border-white/20 font-mono text-xs text-white overflow-x-auto">
              <div className="text-[10px] text-[#8e8e8e] uppercase mb-2">
                Generated Sputnik DAO Proposal JSON (Non-Custodial Batch Transfer):
              </div>
              <pre className="text-[11px] leading-relaxed text-[#B6F36B]">
                {JSON.stringify(
                  {
                    description: `Turnout Automated Reward Distribution for ${activeDistribution.period}`,
                    kind: {
                      FunctionCall: {
                        receiver_id: 'rewards.hos.testnet',
                        actions: activeDistribution.items.map((it: any) => ({
                          method_name: 'distribute_reward',
                          args: Buffer.from(
                            JSON.stringify({
                              delegate_id: it.delegateAccountId,
                              amount: it.allocatedAmount,
                              score: it.reputationScore,
                            })
                          ).toString('base64'),
                          deposit: '0',
                          gas: '30000000000000',
                        })),
                      },
                    },
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-[#8e8e8e] uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Delegate</th>
                  <th className="py-2.5 px-3 text-center">Grade</th>
                  <th className="py-2.5 px-3 text-right">Reputation Score</th>
                  <th className="py-2.5 px-3 text-right">Participation</th>
                  <th className="py-2.5 px-3 text-right">Allocated Reward</th>
                  <th className="py-2.5 px-3 text-center">Eligibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {activeDistribution.items.map((item: any) => (
                  <tr key={item.delegateAccountId} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-medium text-white block">
                        {item.delegateName || item.delegateAccountId}
                      </span>
                      <span className="text-[10px] text-[#8e8e8e]">{item.delegateAccountId}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <GradeBadge grade={item.performanceGrade} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-white">
                      <span className="font-dotmatrix text-base">{item.reputationScore}</span>
                      <span className="text-[#8e8e8e] text-[10px]"> /100</span>
                    </td>
                    <td className="py-3 px-3 text-right text-white">
                      {item.participationRate}%
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-white">
                      <span className="font-dotmatrix text-base">{item.allocatedAmount?.toLocaleString()}</span> {activeDistribution.tokenSymbol}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {item.isEligible ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-white bg-white/10 px-2.5 py-0.5 rounded-full border border-white/30">
                          <CheckCircle2 className="w-3 h-3 text-[#B6F36B]" />
                          Qualified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#E87979] bg-[#E87979]/10 px-2.5 py-0.5 rounded-full border border-[#E87979]/30">
                          <AlertCircle className="w-3 h-3" />
                          Ineligible
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TerminalBox>
      )}
    </div>
  );
};
