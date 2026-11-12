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
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8e8e8e] tracking-widest uppercase mb-1">
            <FileCheck2 className="w-3.5 h-3.5 text-white" />
            <span>ON-CHAIN SCORECARD REGISTRY</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-dotmatrix font-bold text-white tracking-tight">
            VERIFIABLE SCORECARDS
          </h1>
          <p className="text-sm text-[#8e8e8e] mt-1 max-w-2xl font-sans">
            Immutable performance scorecards registered in the Turnout NEAR smart contract. Every score links to reproducible SHA-256 evidence hashes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPublishModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black hover:bg-neutral-100 hover:shadow-[0_0_22px_rgba(255,255,255,0.32)] text-xs font-sans font-semibold transition-all shadow-[0_4px_14px_rgba(0,0,0,0.16)]"
          >
            <Plus className="w-4 h-4" />
            <span>Publish New Scorecard</span>
          </button>
        </div>
      </div>

      {/* Contract Verification Info */}
      <div className="bg-[#18181a]/70 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_4px_14px_rgba(0,0,0,0.16)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center font-dotmatrix">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono text-[#8e8e8e] uppercase">
              Turnout Scorecard Registry Contract:
            </div>
            <div className="font-mono text-sm font-bold text-white">
              turnout-scorecard.testnet
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-[#8e8e8e]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#B6F36B] shadow-[0_0_8px_#B6F36B]" />
            Methodology: turnout-scoring-v1.0.0
          </span>
          <span className="bg-[#28282a] border border-white/20 px-3 py-1 rounded-full text-white">
            Rust near-sdk-rs
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-[#18181a]/70 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-[0_4px_14px_rgba(0,0,0,0.16)]">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-4 top-3 text-[#8e8e8e]" />
          <input
            type="text"
            placeholder="Search by delegate account or evidence hash..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black font-mono text-xs text-white pl-10 pr-4 py-2.5 rounded-full border border-white/20 focus:border-white focus:outline-none"
          />
        </div>
      </div>

      {/* Scorecards Table */}
      <TerminalBox
        title="Registered Tamper-Evident Scorecards"
        tag={`${filtered.length} On-Chain Records`}
      >
        {isLoading ? (
          <div className="py-12 text-center text-[#8e8e8e] font-mono text-xs">
            QUERYING SCORECARD REGISTRY ON NEAR TESTNET...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-[#8e8e8e] font-mono text-xs">
            NO SCORECARDS MATCHING SEARCH FILTER
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-[#8e8e8e] uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Delegate</th>
                  <th className="py-2.5 px-3">Evaluation Period</th>
                  <th className="py-2.5 px-3 text-center">Grade</th>
                  <th className="py-2.5 px-3 text-right">Reputation Score</th>
                  <th className="py-2.5 px-3">Canonical Evidence Hash</th>
                  <th className="py-2.5 px-3">Registered At</th>
                  <th className="py-2.5 px-3 text-right">On-Chain Tx</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((sc) => (
                  <tr key={sc.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-medium text-white block">
                        {sc.delegateAccountId}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#c4c2c3]">
                      {sc.evaluationPeriod}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <GradeBadge grade={sc.grade} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-white">
                      <span className="font-dotmatrix text-base">{sc.totalScore}</span>
                      <span className="text-[#8e8e8e] text-[10px]"> /100</span>
                    </td>
                    <td className="py-3 px-3">
                      <MonospaceAddress value={sc.evidenceHash} type="hash" truncate={true} />
                    </td>
                    <td className="py-3 px-3 text-[#8e8e8e]">
                      {sc.onChainPublishedAt ? new Date(sc.onChainPublishedAt).toLocaleDateString() : 'Confirmed'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {sc.onChainTxHash ? (
                        <MonospaceAddress
                          value={sc.onChainTxHash}
                          type="hash"
                          truncate={true}
                          linkToExplorer={true}
                        />
                      ) : (
                        <span className="text-[#8e8e8e]">Verified Block</span>
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181a] border border-white/20 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative shadow-white-glow">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-white" />
                <h3 className="font-heading font-bold text-lg text-white">
                  Publish Verifiable Scorecard to NEAR
                </h3>
              </div>
              <button
                onClick={() => setShowPublishModal(false)}
                className="text-[#8e8e8e] hover:text-white text-xs font-mono px-2 py-1 rounded-full bg-[#28282a]"
              >
                [ESC]
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#8e8e8e] mb-1">
                    Delegate Account:
                  </label>
                  <input
                    type="text"
                    value={delegateAccount}
                    onChange={(e) => setDelegateAccount(e.target.value)}
                    className="w-full bg-black font-mono text-xs text-white px-3 py-2 rounded-full border border-white/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-[#8e8e8e] mb-1">
                    Evaluation Period:
                  </label>
                  <input
                    type="text"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full bg-black font-mono text-xs text-white px-3 py-2 rounded-full border border-white/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase text-[#8e8e8e] mb-1">
                    Votes Cast / Eligible:
                  </label>
                  <input
                    type="number"
                    value={votesCast}
                    onChange={(e) => setVotesCast(Number(e.target.value))}
                    className="w-full bg-black font-mono text-xs text-white px-3 py-2 rounded-full border border-white/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-[#8e8e8e] mb-1">
                    Verified Explanations:
                  </label>
                  <input
                    type="number"
                    value={verifiedRationales}
                    onChange={(e) => setVerifiedRationales(Number(e.target.value))}
                    className="w-full bg-black font-mono text-xs text-white px-3 py-2 rounded-full border border-white/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-[#8e8e8e] mb-1">
                    Consistency (%):
                  </label>
                  <input
                    type="number"
                    value={consistency}
                    onChange={(e) => setConsistency(Number(e.target.value))}
                    className="w-full bg-black font-mono text-xs text-white px-3 py-2 rounded-full border border-white/20"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={handleCalculatePreview}
                  className="px-5 py-2.5 rounded-full bg-[#28282a] hover:bg-[#323234] border border-white/20 text-white font-sans text-xs font-semibold"
                >
                  Compute Hash & Score Preview
                </button>
              </div>

              {calcPreview && (
                <div className="p-4 rounded-xl bg-black border border-white/20 font-mono text-xs text-white space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8e8e8e]">Calculated Score:</span>
                    <span className="font-dotmatrix text-lg font-bold text-white">{calcPreview.totalScore} / 100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8e8e8e]">Grade:</span>
                    <GradeBadge grade={calcPreview.grade} size="sm" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8e8e8e]">Reproducible SHA-256:</span>
                    <MonospaceAddress value={calcPreview.evidenceHash} type="hash" truncate={true} />
                  </div>

                  <button
                    onClick={handleExecutePublish}
                    disabled={publishMutation.isPending}
                    className="w-full mt-3 py-2.5 rounded-full bg-white text-black font-sans text-xs font-bold hover:bg-neutral-100 flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{publishMutation.isPending ? 'Publishing to NEAR...' : 'Commit Scorecard to Blockchain'}</span>
                  </button>
                </div>
              )}

              {publishTx && (
                <div className="p-3 rounded-xl bg-white/10 border border-white/30 text-white font-mono text-xs flex items-center justify-between">
                  <span>Scorecard Committed: {publishTx.transactionHash?.substring(0, 16)}...</span>
                  <a
                    href={publishTx.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-white flex items-center gap-1"
                  >
                    <span>Explorer</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
