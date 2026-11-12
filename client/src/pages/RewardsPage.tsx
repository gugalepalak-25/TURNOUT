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
  ExternalLink,
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
      <div className="border-b border-cr-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cr-accent tracking-widest uppercase mb-1">
            <Gift className="w-3.5 h-3.5" />
            PERFORMANCE-BASED REWARD DISTRIBUTION
          </div>
          <h1 className="text-3xl font-heading font-bold text-cr-text tracking-tight">
            Governance Reward Manager
          </h1>
          <p className="text-sm text-cr-muted mt-1 max-w-2xl">
            Incentivize diligent governance through performance-weighted payouts. Rewards are allocated strictly based on verified scorecards and require formal DAO multi-sig approval.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-cr-muted bg-cr-surface border border-cr-border px-3 py-1.5 rounded-lg">
          <ShieldCheck className="w-3.5 h-3.5 text-cr-accent" />
          <span>Non-Custodial DAO Proposal Pipeline</span>
        </div>
      </div>

      {/* Simulator Control & Config */}
      <TerminalBox
        title="Reward Pool Configuration & Simulator"
        tag="HOS Epoch 14 Payout"
      >
        <form onSubmit={handleRecalculate} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-mono uppercase text-cr-muted mb-1.5">
              Total Pool Amount (NEAR):
            </label>
            <input
              type="number"
              min="1000"
              step="1000"
              value={rewardAmount}
              onChange={(e) => setRewardAmount(Number(e.target.value))}
              className="w-full bg-cr-bg font-mono text-xs text-cr-text px-3 py-2 rounded border border-cr-border focus:border-cr-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-cr-muted mb-1.5">
              Minimum Reputation Score (0-100):
            </label>
            <input
              type="number"
              min="50"
              max="100"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full bg-cr-bg font-mono text-xs text-cr-text px-3 py-2 rounded border border-cr-border focus:border-cr-accent focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isCalculating}
              className="w-full py-2 px-4 rounded bg-cr-accent text-cr-bg font-mono text-xs font-bold hover:bg-cr-accentHover transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>{isCalculating ? 'Computing Shares...' : 'Simulate Distribution'}</span>
            </button>
          </div>
        </form>

        <div className="p-3 bg-cr-bgSecondary/60 rounded border border-cr-border text-xs font-mono text-cr-muted flex flex-wrap items-center justify-between gap-4">
          <div>
            Eligibility Rule:{' '}
            <span className="text-cr-text font-bold">Reputation Score ≥ {minScore}</span> AND{' '}
            <span className="text-cr-accent font-bold">HoS Participation ≥ 80.0%</span>
          </div>
          <div>
            DAO Treasury Safeguard:{' '}
            <span className="text-cr-secondaryAccent">Requires DAO On-Chain Approval</span>
          </div>
        </div>
      </TerminalBox>

      {/* Allocation Breakdown Table */}
      {activeDistribution && (
        <TerminalBox
          title={`Epoch Allocations: ${activeDistribution.poolName}`}
          tag={`${activeDistribution.totalEligibleDelegates} Eligible | ${activeDistribution.totalRewardAmount.toLocaleString()} ${activeDistribution.tokenSymbol}`}
          action={
            <button
              onClick={() => setShowProposalJson(!showProposalJson)}
              className="text-xs font-mono text-cr-accent hover:underline flex items-center gap-1.5"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{showProposalJson ? 'Hide DAO Proposal' : 'View Generated Proposal'}</span>
            </button>
          }
        >
          {showProposalJson && (
            <div className="mb-5 bg-cr-bg border border-cr-border rounded p-4 font-mono text-xs overflow-x-auto">
              <div className="flex items-center justify-between text-cr-muted text-[11px] mb-2 border-b border-cr-border/40 pb-1">
                <span>ON-CHAIN PROPOSAL PAYLOAD (READY FOR DAO SUBMISSION):</span>
                <span className="text-cr-accent">Target: turnout-rewards.testnet</span>
              </div>
              <pre className="text-cr-text text-[11px]">
                {JSON.stringify(activeDistribution.generatedProposal, null, 2)}
              </pre>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-cr-border text-cr-muted uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Delegate</th>
                  <th className="py-2.5 px-3 text-center">Grade</th>
                  <th className="py-2.5 px-3 text-right">Reputation Score</th>
                  <th className="py-2.5 px-3 text-right">Participation</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Pool Share</th>
                  <th className="py-2.5 px-3 text-right">Allocated Reward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cr-border/40">
                {activeDistribution.allocations.map((alloc: any) => (
                  <tr
                    key={alloc.delegateAccountId}
                    className={`hover:bg-cr-surfaceHover/50 transition-colors ${
                      !alloc.eligible ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <span className="font-sans font-medium text-cr-text block">
                        {alloc.name}
                      </span>
                      <span className="text-[10px] text-cr-muted">
                        {alloc.delegateAccountId}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <GradeBadge grade={alloc.grade} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-cr-text">
                      {alloc.score}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {alloc.participationRate}%
                    </td>
                    <td className="py-3 px-3 text-center">
                      {alloc.eligible ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-cr-accent bg-cr-accent/10 px-2 py-0.5 rounded border border-cr-accent/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Eligible
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 text-[11px] text-cr-critical bg-cr-critical/10 px-2 py-0.5 rounded border border-cr-critical/30"
                          title={alloc.ineligibilityReason}
                        >
                          <AlertCircle className="w-3 h-3" />
                          Ineligible
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-medium">
                      {alloc.allocatedPercentage}%
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-cr-accent text-sm">
                      {alloc.allocatedAmount.toLocaleString()} NEAR
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

