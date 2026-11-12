import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Vote,
  ExternalLink,
  Calendar,
  Users,
  ArrowLeft,
  Bot,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { fetchProposalDetail, queryAIAnalyst } from '../services/api.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { TerminalBox } from '../components/common/TerminalBox.js';
import { MonospaceAddress } from '../components/common/MonospaceAddress.js';

export const ProposalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [aiSummary, setAiSummary] = useState<any | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const { data: proposal, isLoading, error } = useQuery({
    queryKey: ['proposal-detail', id],
    queryFn: () => fetchProposalDetail(id || ''),
    enabled: !!id,
  });

  const handleAskAI = async () => {
    if (!proposal) return;
    setIsGeneratingAi(true);
    try {
      const res = await queryAIAnalyst({
        query: `Summarise governance proposal ${proposal.proposalId}: ${proposal.title} and explain voting alignment.`,
        proposalId: proposal.id,
        contextType: 'proposal',
      });
      setAiSummary(res);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-cr-muted font-mono text-xs">
        RETRIEVING PROPOSAL ON-CHAIN SPECIFICATION...
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="p-6 bg-cr-critical/10 border border-cr-critical/30 rounded-lg text-cr-critical font-mono">
        Proposal "{id}" not found on House of Stake voting contract.
      </div>
    );
  }

  const yesNum = Number(proposal.yesVotes) || 0;
  const noNum = Number(proposal.noVotes) || 0;
  const abstainNum = Number(proposal.abstainVotes) || 0;
  const totalWeight = yesNum + noNum + abstainNum;
  const yesPct = totalWeight > 0 ? Math.round((yesNum / totalWeight) * 100) : 0;
  const noPct = totalWeight > 0 ? Math.round((noNum / totalWeight) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/proposals"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-cr-muted hover:text-cr-accent transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Proposal Explorer</span>
        </Link>
      </div>

      {/* Proposal Main Overview Header */}
      <div className="bg-cr-surface border border-cr-border rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-cr-accent bg-cr-accent/10 px-2.5 py-0.5 rounded border border-cr-accent/30">
                {proposal.proposalId}
              </span>
              <StatusBadge status={proposal.status} />
              <span className="text-xs font-mono text-cr-secondaryAccent bg-cr-secondaryAccent/10 px-2 py-0.5 rounded border border-cr-secondaryAccent/30">
                {proposal.kind} Governance Flow
              </span>
            </div>
            <h1 className="text-2xl font-heading font-bold text-cr-text">
              {proposal.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {proposal.forumUrl && (
              <a
                href={proposal.forumUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded bg-cr-bgSecondary border border-cr-border hover:border-cr-accent text-cr-text hover:text-white text-xs font-mono transition-colors flex items-center gap-1.5"
              >
                <span>Discourse Discussion</span>
                <ExternalLink className="w-3.5 h-3.5 text-cr-accent" />
              </a>
            )}
            <button
              onClick={handleAskAI}
              disabled={isGeneratingAi}
              className="px-3.5 py-2 rounded bg-cr-surface border border-cr-secondaryAccent text-cr-secondaryAccent hover:bg-cr-secondaryAccent/10 text-xs font-mono font-semibold transition-colors flex items-center gap-1.5"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>{isGeneratingAi ? 'Analyzing...' : 'AI Proposal Brief'}</span>
            </button>
          </div>
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-cr-border/40 font-mono text-xs">
          <div>
            <span className="text-[10px] text-cr-muted uppercase block">Proposer Account</span>
            <MonospaceAddress value={proposal.proposer} type="account" truncate={true} />
          </div>
          <div>
            <span className="text-[10px] text-cr-muted uppercase block">Voting Concluded</span>
            <span className="text-cr-text font-medium">{new Date(proposal.voteEndTime).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-[10px] text-cr-muted uppercase block">Snapshot Block</span>
            <span className="text-cr-text font-medium">#{proposal.snapshotBlockHeight || 172401990}</span>
          </div>
          <div>
            <span className="text-[10px] text-cr-muted uppercase block">Total Turnout</span>
            <span className="text-cr-accent font-bold">{proposal.totalVotesCast} Delegates</span>
          </div>
        </div>

        {/* Description body */}
        <div className="mt-5">
          <h3 className="text-xs font-mono uppercase text-cr-muted mb-2 tracking-wider">
            Proposal Specification & Impact
          </h3>
          <p className="text-sm text-cr-text leading-relaxed font-sans whitespace-pre-line">
            {proposal.description}
          </p>
        </div>

        {/* Voting Progress */}
        <div className="mt-6 bg-cr-bgSecondary/60 p-4 rounded border border-cr-border/60">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-cr-accent font-bold">
              APPROVE: {yesPct}% ({(yesNum / 1e6).toFixed(2)}M veNEAR)
            </span>
            <span className="text-cr-critical font-bold">
              REJECT: {noPct}% ({(noNum / 1e6).toFixed(2)}M veNEAR)
            </span>
          </div>
          <div className="w-full bg-cr-bg rounded-full h-2.5 flex overflow-hidden">
            <div className="bg-cr-accent h-full" style={{ width: `${yesPct}%` }} />
            <div className="bg-cr-critical h-full" style={{ width: `${noPct}%` }} />
            <div
              className="bg-cr-muted/40 h-full"
              style={{ width: `${100 - yesPct - noPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* AI Proposal Brief Section */}
      {aiSummary && (
        <TerminalBox
          title="AI Governance Analyst: Proposal Intelligence Brief"
          tag={aiSummary.generatedByModel}
          action={
            <span className="text-[10px] font-mono text-cr-accent bg-cr-accent/10 px-2 py-0.5 rounded border border-cr-accent/30">
              Confidence: {aiSummary.confidenceLevel}
            </span>
          }
        >
          <div className="space-y-4">
            <div className="bg-cr-bgSecondary/80 p-4 rounded border border-cr-border text-sm text-cr-text font-sans leading-relaxed">
              {aiSummary.shortAnswer}
            </div>

            {aiSummary.supportingEvidence?.length > 0 && (
              <div>
                <h4 className="text-xs font-mono uppercase text-cr-muted mb-2">Key Findings & Evidence:</h4>
                <ul className="space-y-1.5 text-xs text-cr-text font-sans">
                  {aiSummary.supportingEvidence.map((ev: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-cr-accent font-mono font-bold">•</span>
                      <span>{ev}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {aiSummary.limitations?.length > 0 && (
              <div className="pt-2 border-t border-cr-border/40 text-[11px] font-mono text-cr-muted">
                <span className="text-cr-warning">Notice: </span>
                {aiSummary.limitations.join(' ')}
              </div>
            )}
          </div>
        </TerminalBox>
      )}

      {/* Delegate Voting Breakdown */}
      <TerminalBox
        title="Recorded Delegate Votes"
        tag={`${proposal.votes?.length || 0} Votes Cast`}
      >
        {proposal.votes && proposal.votes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-cr-border text-cr-muted uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Delegate Account</th>
                  <th className="py-2.5 px-3">Decision</th>
                  <th className="py-2.5 px-3">Voting Power</th>
                  <th className="py-2.5 px-3">Block Height</th>
                  <th className="py-2.5 px-3 text-right">Transaction Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cr-border/40">
                {proposal.votes.map((v) => (
                  <tr key={v.id} className="hover:bg-cr-surfaceHover/50 transition-colors">
                    <td className="py-3 px-3">
                      <Link
                        to={`/delegate/${v.delegateAccountId}`}
                        className="text-cr-text font-medium hover:text-cr-accent transition-colors"
                      >
                        {v.delegateAccountId}
                      </Link>
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={v.voteOption} />
                    </td>
                    <td className="py-3 px-3 text-cr-text">
                      {(Number(v.votingPower) / 1e6).toFixed(2)}M veNEAR
                    </td>
                    <td className="py-3 px-3 text-cr-muted">
                      #{v.blockHeight}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {v.transactionHash ? (
                        <MonospaceAddress
                          value={v.transactionHash}
                          type="hash"
                          truncate={true}
                        />
                      ) : (
                        <span className="text-cr-muted">On-Chain</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-6 text-center text-cr-muted font-mono text-xs">
            NO DELEGATE VOTES RECORDED YET
          </div>
        )}
      </TerminalBox>
    </div>
  );
};

