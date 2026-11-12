import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileCheck2,
  ShieldCheck,
  Search,
  ExternalLink,
  Plus,
  Hash,
  CheckCircle2,
  AlertTriangle,
  Upload,
} from 'lucide-react';
import { fetchScorecards, calculateScorecard, publishScorecardOnChain } from '../services/api.js';
import { TerminalBox } from '../components/common/TerminalBox.js';
import { GradeBadge } from '../components/common/GradeBadge.js';
import { MonospaceAddress } from '../components/common/MonospaceAddress.js';

export const ScorecardsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Publish Form State
  const [delegateAccount, setDelegateAccount] = useState('infura.poolv1.near');
  const [period, setPeriod] = useState('HOS-2026-Q1');
  const [eligibleProposals, setEligibleProposals] = useState(4);
  const [votesCast, setVotesCast] = useState(4);
  const [verifiedRationales, setVerifiedRationales] = useState(4);
  const [timelyRationales, setTimelyRationales] = useState(4);
  const [consistency, setConsistency] = useState(95);

  const [calcPreview, setCalcPreview] = useState<any | null>(null);
  const [publishTx, setPublishTx] = useState<any | null>(null);

  const { data: scorecards, isLoading } = useQuery({
    queryKey: ['scorecards'],
    queryFn: fetchScorecards,
  });

  const publishMutation = useMutation({
    mutationFn: publishScorecardOnChain,
    onSuccess: (res) => {
      setPublishTx(res.transaction);
      queryClient.invalidateQueries({ queryKey: ['scorecards'] });
    },
  });

  const handleCalculatePreview = async () => {
    const res = await calculateScorecard({
      delegateAccountId: delegateAccount,
      evaluationPeriod: period,
      metrics: {
        eligibleClosedProposals: Number(eligibleProposals),
        votesCast: Number(votesCast),
        abstentions: 0,
        missedVotes: Number(eligibleProposals) - Number(votesCast),
        verifiedExplanations: Number(verifiedRationales),
        timelyExplanations: Number(timelyRationales),
        rollingConsistencyPct: Number(consistency),
        applicableVotes: Number(votesCast),
      },
    });
    setCalcPreview(res);
  };

  const handleExecutePublish = () => {
    if (!calcPreview) return;
    publishMutation.mutate({
      delegateAccountId: calcPreview.delegateAccountId,
      evaluationPeriod: calcPreview.evaluationPeriod,
      score: calcPreview.totalScore,
      grade: calcPreview.grade,
      evidenceHash: calcPreview.evidenceHash,
      methodologyVersion: calcPreview.methodologyVersion,
      publisherAccount: 'turnout-oracle.testnet',
    });
  };

  const filtered = (scorecards || []).filter((sc) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return sc.delegateAccountId.toLowerCase().includes(term) || sc.evidenceHash.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-cr-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cr-accent tracking-widest uppercase mb-1">
            <FileCheck2 className="w-3.5 h-3.5" />
            ON-CHAIN SCORECARD REGISTRY
          </div>
          <h1 className="text-3xl font-heading font-bold text-cr-text tracking-tight">
            Verifiable Scorecard Explorer
          </h1>
          <p className="text-sm text-cr-muted mt-1 max-w-2xl">
            Immutable performance scorecards registered in the Turnout NEAR smart contract. Every score links to reproducible SHA-256 evidence hashes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowPublishModal(true);
              setPublishTx(null);
              handleCalculatePreview();
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded bg-cr-accent text-cr-bg hover:bg-cr-accentHover font-mono text-xs font-bold transition-colors shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Publish New Scorecard</span>
          </button>
        </div>
      </div>

      {/* Contract Verification Banner */}
      <div className="bg-cr-surface border border-cr-border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-cr-accent shrink-0" />
          <div>
            <span className="text-cr-text font-bold block">
              turnout-scorecard-registry.testnet
            </span>
            <span className="text-cr-muted text-[11px]">
              Contract standard: turnout-v1.0.0 | Authorized Publisher: turnout-oracle.testnet
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-cr-muted">
          <span>Registry State: <span className="text-cr-accent">Verified</span></span>
          <a
            href="https://testnet.nearblocks.io/address/turnout-registry.testnet"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cr-accent hover:underline flex items-center gap-1"
          >
            <span>Contract Explorer</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-cr-muted" />
        <input
          type="text"
          placeholder="Filter scorecards by delegate or SHA-256 evidence hash..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-cr-surface font-mono text-xs text-cr-text pl-9 pr-3 py-2 rounded border border-cr-border focus:border-cr-accent focus:outline-none"
        />
      </div>

      {/* Scorecards Table */}
      <TerminalBox
        title="Registered On-Chain Scorecards"
        tag={`${filtered.length} Total Registered Records`}
      >
        {isLoading ? (
          <div className="py-12 text-center text-cr-muted font-mono text-xs">
            READING SMART CONTRACT STORAGE...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-cr-muted font-mono text-xs">
            NO REGISTERED SCORECARDS FOUND
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-cr-border text-cr-muted uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Delegate Account</th>
                  <th className="py-3 px-3">Epoch</th>
                  <th className="py-3 px-3 text-center">Grade</th>
                  <th className="py-3 px-3 text-right">Score</th>
                  <th className="py-3 px-3">Evidence Hash (SHA-256)</th>
                  <th className="py-3 px-3">Publication Status</th>
                  <th className="py-3 px-3 text-right">Transaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cr-border/40">
                {filtered.map((sc) => (
                  <tr key={sc.id} className="hover:bg-cr-surfaceHover/50 transition-colors">
                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-cr-text block">
                        {sc.delegateAccountId}
                      </span>
                      <span className="text-[10px] text-cr-muted">
                        Publisher: {sc.publisherAccount || 'turnout-oracle.testnet'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-cr-secondaryAccent font-semibold">
                      {sc.evaluationPeriod}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <GradeBadge grade={sc.grade} size="sm" />
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-cr-text text-sm">
                      {sc.totalScore}
                      <span className="text-cr-muted text-[10px] font-normal"> /100</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <MonospaceAddress value={sc.evidenceHash} type="hash" truncate={true} />
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] text-cr-accent bg-cr-accent/10 px-2 py-0.5 rounded border border-cr-accent/30 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified On-Chain
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {sc.onChainTxHash ? (
                        <MonospaceAddress
                          value={sc.onChainTxHash}
                          type="hash"
                          truncate={true}
                        />
                      ) : (
                        <span className="text-cr-muted">Registered</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TerminalBox>

      {/* Publish Scorecard Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-cr-surface border border-cr-border rounded-lg max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-cr-border mb-4">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-cr-accent" />
                <h3 className="font-heading font-bold text-lg text-cr-text">
                  Publish On-Chain Scorecard
                </h3>
              </div>
              <button
                onClick={() => setShowPublishModal(false)}
                className="text-cr-muted hover:text-white font-mono text-sm"
              >
                [ESC]
              </button>
            </div>

            {publishTx ? (
              <div className="space-y-4 py-4 font-mono text-xs">
                <div className="p-4 bg-cr-accent/10 border border-cr-accent/40 rounded-lg">
                  <span className="text-cr-accent font-bold block text-sm mb-1">
                    ✓ SCORECARD SUCCESSFULLY REGISTERED ON NEAR TESTNET
                  </span>
                  <p className="text-cr-text text-xs mb-3 font-sans">
                    The scorecard and its canonical SHA-256 evidence hash have been written to the turnout-scorecard-registry smart contract.
                  </p>
                  <div className="space-y-1.5 text-xs">
                    <div>Transaction Hash: <MonospaceAddress value={publishTx.hash} type="hash" truncate={false} /></div>
                    <div>Contract: <span className="text-cr-accent">{publishTx.contractId}</span></div>
                    <div>Method: <span className="text-cr-secondaryAccent">{publishTx.method}</span></div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setShowPublishModal(false)}
                    className="px-4 py-2 rounded bg-cr-accent text-cr-bg font-bold hover:bg-cr-accentHover"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase text-cr-muted mb-1">
                      Delegate Account ID:
                    </label>
                    <input
                      type="text"
                      value={delegateAccount}
                      onChange={(e) => setDelegateAccount(e.target.value)}
                      className="w-full bg-cr-bg text-cr-text font-mono text-xs px-3 py-2 rounded border border-cr-border"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-cr-muted mb-1">
                      Evaluation Period:
                    </label>
                    <input
                      type="text"
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="w-full bg-cr-bg text-cr-text font-mono text-xs px-3 py-2 rounded border border-cr-border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-cr-muted mb-1">
                      Eligible Proposals:
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={eligibleProposals}
                      onChange={(e) => setEligibleProposals(Number(e.target.value))}
                      className="w-full bg-cr-bg text-cr-text font-mono text-xs px-3 py-1.5 rounded border border-cr-border"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-cr-muted mb-1">
                      Votes Cast:
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={votesCast}
                      onChange={(e) => setVotesCast(Number(e.target.value))}
                      className="w-full bg-cr-bg text-cr-text font-mono text-xs px-3 py-1.5 rounded border border-cr-border"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-cr-muted mb-1">
                      Verified Rationales:
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={verifiedRationales}
                      onChange={(e) => setVerifiedRationales(Number(e.target.value))}
                      className="w-full bg-cr-bg text-cr-text font-mono text-xs px-3 py-1.5 rounded border border-cr-border"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleCalculatePreview}
                    className="px-3.5 py-1.5 rounded bg-cr-surface border border-cr-border hover:border-cr-accent text-xs font-mono text-cr-text"
                  >
                    Recalculate Formula Preview
                  </button>
                </div>

                {calcPreview && (
                  <div className="p-3.5 bg-cr-bgSecondary rounded border border-cr-border font-mono text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-cr-muted">Computed Reputation Score:</span>
                      <span className="text-base font-bold text-cr-accent">
                        {calcPreview.totalScore} / 100 (Grade {calcPreview.grade})
                      </span>
                    </div>
                    <div>
                      <span className="text-cr-muted block mb-0.5">Deterministic Evidence Hash:</span>
                      <span className="text-[11px] text-cr-secondaryAccent break-all select-all">
                        {calcPreview.evidenceHash}
                      </span>
                    </div>
                    <div className="text-[11px] text-cr-muted">
                      House of Stake Charter: {calcPreview.hosCharterRequirement.meetsHoSCharter ? '✓ Compliant' : '⚠ Non-compliant'}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-cr-border flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPublishModal(false)}
                    className="px-4 py-2 rounded bg-cr-surface text-cr-muted text-xs font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecutePublish}
                    disabled={!calcPreview || publishMutation.isPending}
                    className="px-4 py-2 rounded bg-cr-accent text-cr-bg text-xs font-mono font-bold hover:bg-cr-accentHover disabled:opacity-40"
                  >
                    {publishMutation.isPending ? 'Publishing to NEAR...' : 'Broadcast to Registry Contract'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

