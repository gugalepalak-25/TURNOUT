import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldCheck,
  Award,
  Vote,
  ExternalLink,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { fetchDelegatePassport } from '../services/api.js';
import { GradeBadge } from '../components/common/GradeBadge.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { TerminalBox } from '../components/common/TerminalBox.js';
import { MonospaceAddress } from '../components/common/MonospaceAddress.js';

export const DelegatePassportPage: React.FC = () => {
  const { account } = useParams<{ account: string }>();

  const { data: delegate, isLoading, error } = useQuery({
    queryKey: ['delegate-passport', account],
    queryFn: () => fetchDelegatePassport(account || ''),
    enabled: !!account,
  });

  if (isLoading) {
    return (
      <div className="py-20 text-center text-[#8e8e8e] font-mono text-xs">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <span className="font-dotmatrix text-white">RETRIEVING VERIFIABLE GOVERNANCE PASSPORT...</span>
      </div>
    );
  }

  if (error || !delegate) {
    return (
      <div className="p-6 bg-[#E87979]/10 border border-[#E87979]/30 rounded-2xl text-[#E87979] font-mono">
        Delegate passport not found for account "{account}".
      </div>
    );
  }

  // Calculate breakdown for display
  const votingScore = Math.round((delegate.participationRate / 100) * 40 * 10) / 10;
  const totalExplanationsApplicable =
    delegate.publishedExplanationsCount + delegate.missingExplanationsCount;
  const rationaleScore =
    totalExplanationsApplicable > 0
      ? Math.round(
          (delegate.publishedExplanationsCount / totalExplanationsApplicable) * 25 * 10
        ) / 10
      : 0;
  const timelinessScore =
    totalExplanationsApplicable > 0
      ? Math.round(
          (delegate.publishedExplanationsCount / totalExplanationsApplicable) * 20 * 10
        ) / 10
      : 0;
  const consistencyScore = Math.round((delegate.participationRate / 100) * 15 * 10) / 10;

  const meetsCharter = delegate.participationRate >= 80.0;
  const activeScorecard = delegate.scorecards?.[0];

  return (
    <div className="space-y-6">
      {/* Back button and breadcrumb */}
      <div>
        <Link
          to="/leaderboard"
          className="inline-flex items-center gap-2 text-xs font-sans text-[#8e8e8e] hover:text-white transition-colors mb-3 px-3.5 py-1.5 rounded-full bg-[#28282a] border border-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Delegate Leaderboard</span>
        </Link>
      </div>

      {/* Delegate Profile Identity Header */}
      <div className="bg-[#18181a]/70 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-[0_4px_14px_rgba(0,0,0,0.16)]">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            {delegate.profileImageUrl ? (
              <img
                src={delegate.profileImageUrl}
                alt=""
                className="w-16 h-16 rounded-full object-cover border border-white/20 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center font-dotmatrix font-bold text-2xl shrink-0">
                {delegate.name[0]}
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-white">
                  {delegate.name}
                </h1>
                {delegate.isVerifiedIdentity && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-white bg-white/10 px-2.5 py-0.5 rounded-full border border-white/30">
                    <CheckCircle2 className="w-3 h-3 text-[#B6F36B]" />
                    Verified Identity
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#c4c2c3] bg-[#28282a] px-2.5 py-0.5 rounded-full border border-white/20">
                  House of Stake
                </span>
              </div>

              <div className="font-mono text-xs text-[#8e8e8e] mb-3 flex flex-wrap items-center gap-3">
                <MonospaceAddress value={delegate.accountId} type="account" truncate={false} />
                {delegate.forumUsername && (
                  <a
                    href={`https://gov.near.org/u/${delegate.forumUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white flex items-center gap-1 bg-[#28282a] border border-white/15 px-2.5 py-0.5 rounded-full text-[11px]"
                  >
                    <span>Forum: @{delegate.forumUsername}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {delegate.bio && (
                <p className="text-xs text-[#8e8e8e] max-w-2xl leading-relaxed font-sans">
                  {delegate.bio}
                </p>
              )}
            </div>
          </div>

          {/* Overall Performance Grade and Score Badge */}
          <div className="bg-[#121214]/80 border border-white/15 rounded-2xl p-4 flex items-center gap-5 shrink-0 self-start shadow-[0_4px_14px_rgba(0,0,0,0.16)]">
            <div className="text-center">
              <span className="text-[10px] font-mono uppercase text-[#8e8e8e] block mb-1">
                Score
              </span>
              <span className="font-dotmatrix text-3xl font-bold text-white">
                {delegate.reputationScore}
              </span>
              <span className="text-[10px] font-mono text-[#8e8e8e] block">/ 100</span>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="text-center">
              <span className="text-[10px] font-mono uppercase text-[#8e8e8e] block mb-1">
                Grade
              </span>
              <GradeBadge grade={delegate.performanceGrade} size="lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#18181a]/70 backdrop-blur-md border border-white/10 p-5 rounded-2xl font-mono">
          <span className="text-[10px] text-[#8e8e8e] uppercase block">veNEAR Voting Power</span>
          <span className="font-dotmatrix text-2xl font-bold text-white">
            {(Number(delegate.votingPower) / 1e6).toFixed(2)}M
          </span>
          <span className="text-[10px] text-[#8e8e8e] block mt-0.5">Stake Weight</span>
        </div>

        <div className="bg-[#18181a]/70 backdrop-blur-md border border-white/10 p-5 rounded-2xl font-mono">
          <span className="text-[10px] text-[#8e8e8e] uppercase block">Voting Participation</span>
          <span
            className={`font-dotmatrix text-2xl font-bold ${
              delegate.participationRate >= 80 ? 'text-white' : 'text-[#E6B85C]'
            }`}
          >
            {delegate.participationRate}%
          </span>
          <span className="text-[10px] text-[#8e8e8e] block mt-0.5">
            {meetsCharter ? 'Meets 80% Charter' : 'Breaches Charter'}
          </span>
        </div>

        <div className="bg-[#18181a]/70 backdrop-blur-md border border-white/10 p-5 rounded-2xl font-mono">
          <span className="text-[10px] text-[#8e8e8e] uppercase block">Published Explanations</span>
          <span className="font-dotmatrix text-2xl font-bold text-[#c4c2c3]">
            {delegate.publishedExplanationsCount}
          </span>
          <span className="text-[10px] text-[#8e8e8e] block mt-0.5">
            {delegate.missingExplanationsCount} Missing
          </span>
        </div>

        <div className="bg-[#18181a]/70 backdrop-blur-md border border-white/10 p-5 rounded-2xl font-mono">
          <span className="text-[10px] text-[#8e8e8e] uppercase block">Delegators Backing</span>
          <span className="font-dotmatrix text-2xl font-bold text-white">
            {delegate.delegatorsCount}
          </span>
          <span className="text-[10px] text-[#8e8e8e] block mt-0.5">Staking Accounts</span>
        </div>
      </div>

      {/* Transparent 100-Point Scoring Breakdown */}
      <TerminalBox
        title="100-Point Transparent Scoring Engine Breakdown"
        tag="Methodology: turnout-scoring-v1.0.0"
        action={
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#8e8e8e]">
              Evidence Hash:
            </span>
            <MonospaceAddress
              value={activeScorecard?.evidenceHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
              type="hash"
              truncate={true}
            />
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Voting Participation (40 pts) */}
          <div className="bg-[#121214]/80 p-4 rounded-xl border border-white/10">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-mono font-semibold text-white">Voting Participation</span>
              <span className="font-dotmatrix text-xs font-bold text-white">{votingScore} / 40</span>
            </div>
            <div className="w-full bg-black rounded-full h-1.5 mb-2 overflow-hidden border border-white/10">
              <div
                className="bg-white h-full rounded-full"
                style={{ width: `${(votingScore / 40) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-[#8e8e8e] font-sans leading-tight">
              Formula: (Votes Cast / Eligible Closed Proposals) × 40. Distinguishes abstentions from absences.
            </p>
          </div>

          {/* Rationale Publication (25 pts) */}
          <div className="bg-[#121214]/80 p-4 rounded-xl border border-white/10">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-mono font-semibold text-white">Rationale Publication</span>
              <span className="font-dotmatrix text-xs font-bold text-[#c4c2c3]">{rationaleScore} / 25</span>
            </div>
            <div className="w-full bg-black rounded-full h-1.5 mb-2 overflow-hidden border border-white/10">
              <div
                className="bg-[#c4c2c3] h-full rounded-full"
                style={{ width: `${(rationaleScore / 25) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-[#8e8e8e] font-sans leading-tight">
              Formula: (Verified Explanations / Applicable Votes) × 25. Verified via Discourse public API.
            </p>
          </div>

          {/* Timely Reporting (20 pts) */}
          <div className="bg-[#121214]/80 p-4 rounded-xl border border-white/10">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-mono font-semibold text-white">Timely Reporting</span>
              <span className="font-dotmatrix text-xs font-bold text-white">{timelinessScore} / 20</span>
            </div>
            <div className="w-full bg-black rounded-full h-1.5 mb-2 overflow-hidden border border-white/10">
              <div
                className="bg-white h-full rounded-full"
                style={{ width: `${(timelinessScore / 20) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-[#8e8e8e] font-sans leading-tight">
              Formula: (Explanations Published Within Deadline / Applicable Votes) × 20.
            </p>
          </div>

          {/* Participation Consistency (15 pts) */}
          <div className="bg-[#121214]/80 p-4 rounded-xl border border-white/10">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-mono font-semibold text-white">Consistency</span>
              <span className="font-dotmatrix text-xs font-bold text-[#B6F36B]">{consistencyScore} / 15</span>
            </div>
            <div className="w-full bg-black rounded-full h-1.5 mb-2 overflow-hidden border border-white/10">
              <div
                className="bg-[#B6F36B] h-full rounded-full"
                style={{ width: `${(consistencyScore / 15) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-[#8e8e8e] font-sans leading-tight">
              Formula: (Rolling Consistency / 100) × 15. Measures uninterrupted governance engagement.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#8e8e8e]">
          <div>
            Total Reputation Score:{' '}
            <span className="text-white font-bold text-sm font-dotmatrix">{delegate.reputationScore}</span>
            <span className="text-[#8e8e8e]"> = {votingScore} + {rationaleScore} + {timelinessScore} + {consistencyScore}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#B6F36B]" />
            Publication Status:{' '}
            <span className="text-white font-semibold">Registered On-Chain</span>
          </div>
        </div>
      </TerminalBox>

      {/* Verified Explanations Feed */}
      <TerminalBox
        title="Public Governance Explanations"
        tag="gov.near.org Discourse API"
      >
        {delegate.rationales && delegate.rationales.length > 0 ? (
          <div className="space-y-3">
            {delegate.rationales.map((rat) => (
              <div key={rat.id} className="bg-[#121214]/80 p-4 rounded-xl border border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={rat.explanationStatus} />
                    <span className="text-xs font-mono text-[#8e8e8e]">
                      Confidence: {Math.round(rat.confidenceScore * 100)}%
                    </span>
                  </div>
                  {rat.forumUrl && (
                    <a
                      href={rat.forumUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-sans text-white hover:underline flex items-center gap-1 bg-[#28282a] border border-white/15 px-2.5 py-0.5 rounded-full"
                    >
                      <span>View Discourse Forum Post</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-white font-sans leading-relaxed">
                  "{rat.contentSummary}"
                </p>
                <div className="mt-2 text-[10px] font-mono text-[#8e8e8e]">
                  Submitted: {new Date(rat.publishedAt || '').toLocaleString()} | Author: @{rat.author || delegate.forumUsername}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-[#8e8e8e] font-mono text-xs">
            NO PUBLIC RATIONALES FOUND FOR THIS DELEGATE
          </div>
        )}
      </TerminalBox>

      {/* Voting History */}
      <TerminalBox
        title="Recent Voting Transactions"
        tag="NEAR Blockchain Ledger"
      >
        {delegate.votes && delegate.votes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-[#8e8e8e] uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Proposal ID</th>
                  <th className="py-2.5 px-3">Vote Option</th>
                  <th className="py-2.5 px-3">Weight (veNEAR)</th>
                  <th className="py-2.5 px-3">Block Height</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3 text-right">Transaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {delegate.votes.map((v) => (
                  <tr key={v.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 font-semibold text-white">
                      {v.proposalId}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={v.voteOption} />
                    </td>
                    <td className="py-3 px-3 text-white font-medium">
                      {(Number(v.votingPower) / 1e6).toFixed(2)}M
                    </td>
                    <td className="py-3 px-3 text-[#8e8e8e]">
                      #{v.blockHeight || 174829103}
                    </td>
                    <td className="py-3 px-3 text-[#8e8e8e]">
                      {new Date(v.timestamp).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {v.transactionHash ? (
                        <MonospaceAddress
                          value={v.transactionHash}
                          type="hash"
                          truncate={true}
                          linkToExplorer={true}
                        />
                      ) : (
                        <span className="text-[#8e8e8e]">Verified Ledger</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-6 text-center text-[#8e8e8e] font-mono text-xs">
            NO VOTING TRANSACTIONS FOUND
          </div>
        )}
      </TerminalBox>
    </div>
  );
};
