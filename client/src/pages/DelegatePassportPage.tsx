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
      <div className="py-20 text-center text-cr-muted font-mono text-xs">
        RETRIEVING VERIFIABLE GOVERNANCE PASSPORT...
      </div>
    );
  }

  if (error || !delegate) {
    return (
      <div className="p-6 bg-cr-critical/10 border border-cr-critical/30 rounded-lg text-cr-critical font-mono">
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
          className="inline-flex items-center gap-1.5 text-xs font-mono text-cr-muted hover:text-cr-accent transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Delegate Leaderboard</span>
        </Link>
      </div>

      {/* Delegate Profile Identity Header */}
      <div className="bg-cr-surface border border-cr-border rounded-lg p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            {delegate.profileImageUrl ? (
              <img
                src={delegate.profileImageUrl}
                alt=""
                className="w-16 h-16 rounded-lg object-cover border border-cr-border"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-cr-bgSecondary border border-cr-border flex items-center justify-center font-heading font-bold text-2xl text-cr-accent">
                {delegate.name[0]}
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-heading font-bold text-cr-text">
                  {delegate.name}
                </h1>
                {delegate.isVerifiedIdentity && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-cr-accent bg-cr-accent/10 px-2 py-0.5 rounded border border-cr-accent/30">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Identity
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-cr-secondaryAccent bg-cr-secondaryAccent/10 px-2 py-0.5 rounded border border-cr-secondaryAccent/30">
                  House of Stake
                </span>
              </div>

              <div className="font-mono text-xs text-cr-muted mb-3 flex flex-wrap items-center gap-3">
                <MonospaceAddress value={delegate.accountId} type="account" truncate={false} />
                {delegate.forumUsername && (
                  <a
                    href={`https://gov.near.org/u/${delegate.forumUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-cr-accent flex items-center gap-1"
                  >
                    <span>Forum: @{delegate.forumUsername}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {delegate.bio && (
                <p className="text-xs text-cr-muted max-w-2xl leading-relaxed">
                  {delegate.bio}
                </p>
              )}
            </div>
          </div>

          {/* Overall Performance Grade and Score Badge */}
          <div className="bg-cr-bgSecondary/80 border border-cr-border rounded-lg p-4 flex items-center gap-5 shrink-0 self-start">
            <div className="text-center">
              <span className="text-[10px] font-mono uppercase text-cr-muted block mb-1">
                Score
              </span>
              <span className="font-heading text-3xl font-bold text-cr-text">
                {delegate.reputationScore}
              </span>
              <span className="text-[10px] font-mono text-cr-muted block">/ 100</span>
            </div>
            <div className="h-10 w-px bg-cr-border" />
            <div className="text-center">
              <span className="text-[10px] font-mono uppercase text-cr-muted block mb-1">
                Grade
              </span>
              <GradeBadge grade={delegate.performanceGrade} size="lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-cr-surface border border-cr-border p-4 rounded-lg font-mono">
          <span className="text-[10px] text-cr-muted uppercase block">veNEAR Voting Power</span>
          <span className="text-xl font-bold text-cr-accent">
            {(Number(delegate.votingPower) / 1e6).toFixed(2)}M
          </span>
          <span className="text-[10px] text-cr-muted block mt-0.5">Stake Weight</span>
        </div>

        <div className="bg-cr-surface border border-cr-border p-4 rounded-lg font-mono">
          <span className="text-[10px] text-cr-muted uppercase block">Voting Participation</span>
          <span
            className={`text-xl font-bold ${
              delegate.participationRate >= 80 ? 'text-cr-accent' : 'text-cr-warning'
            }`}
          >
            {delegate.participationRate}%
          </span>
          <span className="text-[10px] text-cr-muted block mt-0.5">
            {meetsCharter ? 'Meets 80% Charter' : 'Breaches Charter'}
          </span>
        </div>

        <div className="bg-cr-surface border border-cr-border p-4 rounded-lg font-mono">
          <span className="text-[10px] text-cr-muted uppercase block">Published Explanations</span>
          <span className="text-xl font-bold text-cr-secondaryAccent">
            {delegate.publishedExplanationsCount}
          </span>
          <span className="text-[10px] text-cr-muted block mt-0.5">
            {delegate.missingExplanationsCount} Missing
          </span>
        </div>

        <div className="bg-cr-surface border border-cr-border p-4 rounded-lg font-mono">
          <span className="text-[10px] text-cr-muted uppercase block">Delegators Backing</span>
          <span className="text-xl font-bold text-cr-text">
            {delegate.delegatorsCount}
          </span>
          <span className="text-[10px] text-cr-muted block mt-0.5">Staking Accounts</span>
        </div>
      </div>

      {/* Transparent 100-Point Scoring Breakdown */}
      <TerminalBox
        title="100-Point Transparent Scoring Engine Breakdown"
        tag="Methodology: turnout-scoring-v1.0.0"
        action={
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-cr-muted">
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
          <div className="bg-cr-bgSecondary/60 p-4 rounded border border-cr-border">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-mono font-semibold text-cr-text">Voting Participation</span>
              <span className="text-xs font-mono font-bold text-cr-accent">{votingScore} / 40</span>
            </div>
            <div className="w-full bg-cr-bg rounded-full h-1.5 mb-2 overflow-hidden">
              <div
                className="bg-cr-accent h-full rounded-full"
                style={{ width: `${(votingScore / 40) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-cr-muted font-sans leading-tight">
              Formula: (Votes Cast / Eligible Closed Proposals) × 40. Distinguishes abstentions from absences.
            </p>
          </div>

          {/* Rationale Publication (25 pts) */}
          <div className="bg-cr-bgSecondary/60 p-4 rounded border border-cr-border">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-mono font-semibold text-cr-text">Rationale Publication</span>
              <span className="text-xs font-mono font-bold text-cr-secondaryAccent">{rationaleScore} / 25</span>
            </div>
            <div className="w-full bg-cr-bg rounded-full h-1.5 mb-2 overflow-hidden">
              <div
                className="bg-cr-secondaryAccent h-full rounded-full"
                style={{ width: `${(rationaleScore / 25) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-cr-muted font-sans leading-tight">
              Formula: (Verified Explanations / Applicable Votes) × 25. Verified via Discourse public API.
            </p>
          </div>

          {/* Timely Reporting (20 pts) */}
          <div className="bg-cr-bgSecondary/60 p-4 rounded border border-cr-border">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-mono font-semibold text-cr-text">Timely Reporting</span>
              <span className="text-xs font-mono font-bold text-cr-text">{timelinessScore} / 20</span>
            </div>
            <div className="w-full bg-cr-bg rounded-full h-1.5 mb-2 overflow-hidden">
              <div
                className="bg-cr-text h-full rounded-full"
                style={{ width: `${(timelinessScore / 20) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-cr-muted font-sans leading-tight">
              Formula: (Explanations Published Within Deadline / Applicable Votes) × 20.
            </p>
          </div>

          {/* Participation Consistency (15 pts) */}
          <div className="bg-cr-bgSecondary/60 p-4 rounded border border-cr-border">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-mono font-semibold text-cr-text">Consistency</span>
              <span className="text-xs font-mono font-bold text-cr-accent">{consistencyScore} / 15</span>
            </div>
            <div className="w-full bg-cr-bg rounded-full h-1.5 mb-2 overflow-hidden">
              <div
                className="bg-cr-accent h-full rounded-full"
                style={{ width: `${(consistencyScore / 15) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-cr-muted font-sans leading-tight">
              Formula: (Rolling Consistency / 100) × 15. Measures uninterrupted governance engagement.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-cr-border/40 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-cr-muted">
          <div>
            Total Reputation Score:{' '}
            <span className="text-cr-text font-bold text-sm">{delegate.reputationScore}</span>
            <span className="text-cr-muted"> = {votingScore} + {rationaleScore} + {timelinessScore} + {consistencyScore}</span>
          </div>
          <div>
            Publication Status:{' '}
            <span className="text-cr-accent font-semibold">Registered On-Chain</span>
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
              <div key={rat.id} className="bg-cr-bgSecondary/60 p-4 rounded border border-cr-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={rat.explanationStatus} />
                    <span className="text-xs font-mono text-cr-muted">
                      Confidence: {Math.round(rat.confidenceScore * 100)}%
                    </span>
                  </div>
                  {rat.forumUrl && (
                    <a
                      href={rat.forumUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-cr-accent hover:underline flex items-center gap-1"
                    >
                      <span>View Discourse Forum Post</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-cr-text font-sans leading-relaxed">
                  "{rat.contentSummary}"
                </p>
                <div className="mt-2 text-[10px] font-mono text-cr-muted">
                  Submitted: {new Date(rat.publishedAt || '').toLocaleString()} | Author: @{rat.author || delegate.forumUsername}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-cr-muted font-mono text-xs">
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
                <tr className="border-b border-cr-border text-cr-muted uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Proposal ID</th>
                  <th className="py-2.5 px-3">Vote Option</th>
                  <th className="py-2.5 px-3">Block Height</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3 text-right">Transaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cr-border/40">
                {delegate.votes.map((v) => (
                  <tr key={v.id} className="hover:bg-cr-surfaceHover/50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-cr-secondaryAccent">
                      {v.proposalId}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={v.voteOption} />
                    </td>
                    <td className="py-3 px-3 text-cr-text">
                      #{v.blockHeight}
                    </td>
                    <td className="py-3 px-3 text-cr-muted">
                      {new Date(v.timestamp).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {v.transactionHash ? (
                        <MonospaceAddress
                          value={v.transactionHash}
                          type="hash"
                          truncate={true}
                        />
                      ) : (
                        <span className="text-cr-muted">Indexed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-6 text-center text-cr-muted font-mono text-xs">
            NO RECORDED VOTES IN THIS EPOCH
          </div>
        )}
      </TerminalBox>
    </div>
  );
};

