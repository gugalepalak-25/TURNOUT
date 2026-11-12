import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Vote,
  ExternalLink,
  Users,
  ArrowLeft,
  Bot,
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
      <div className="py-20 text-center text-[#8e8e8e] font-mono text-xs">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <span className="font-dotmatrix text-white">RETRIEVING PROPOSAL ON-CHAIN SPECIFICATION...</span>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="p-6 bg-[#E87979]/10 border border-[#E87979]/30 rounded-2xl text-[#E87979] font-mono">
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
          className="inline-flex items-center gap-2 text-xs font-sans text-[#8e8e8e] hover:text-white transition-colors px-3.5 py-1.5 rounded-full bg-[#28282a] border border-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Proposal Explorer</span>
        </Link>
      </div>

      {/* Proposal Main Overview Header */}
      <div className="bg-[#18181a]/70 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-[0_4px_14px_rgba(0,0,0,0.16)]">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-dotmatrix text-sm font-bold text-white bg-[#28282a] px-3 py-1 rounded-full border border-white/20">
                {proposal.proposalId}
              </span>
              <StatusBadge status={proposal.status} />
              <span className="text-xs font-mono text-[#c4c2c3] bg-[#28282a] px-3 py-1 rounded-full border border-white/15">
                {proposal.kind} Governance Flow
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-white">
              {proposal.title}
            </h1>
          </div>

          <button
            onClick={handleAskAI}
            disabled={isGeneratingAi}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black hover:bg-neutral-100 text-xs font-sans font-semibold transition-all shadow-[0_4px_14px_rgba(0,0,0,0.16)] shrink-0 disabled:opacity-40"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGeneratingAi ? 'Analyzing...' : 'AI Proposal Audit'}</span>
          </button>
        </div>

        <p className="text-xs md:text-sm text-[#8e8e8e] leading-relaxed mb-6 font-sans">
          {proposal.description}
        </p>

        {/* AI Insight Box */}
        {aiSummary && (
          <div className="mb-6 p-5 rounded-2xl bg-[#121214] border border-white/20 text-xs text-white space-y-3 font-sans shadow-inner">
            <div className="flex items-center gap-2 font-mono text-[#B6F36B] font-semibold text-xs">
              <Bot className="w-4 h-4" />
              <span>AI Governance Analysis Output</span>
            </div>
            <p className="leading-relaxed whitespace-pre-line text-[#c8c8c8]">{aiSummary.shortAnswer}</p>
          </div>
        )}

        {/* Voting Progress */}
        <div className="space-y-2 pt-4 border-t border-white/10 font-mono">
          <div className="flex justify-between items-center text-xs">
            <span className="text-white font-semibold">
              In Favor: {yesPct}% ({(yesNum / 1e6).toFixed(2)}M veNEAR)
            </span>
            <span className="text-[#8e8e8e]">
              Opposed: {noPct}% ({(noNum / 1e6).toFixed(2)}M veNEAR)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-black overflow-hidden flex border border-white/10">
            <div className="bg-white h-full" style={{ width: `${yesPct}%` }} />
            <div className="bg-[#28282a] h-full" style={{ width: `${noPct}%` }} />
          </div>
        </div>
      </div>

      {/* Votes Cast Breakdown Table */}
      <TerminalBox
        title="Recorded Delegate Votes"
        tag={`${proposal.votes?.length || 0} Votes Cast`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-[#8e8e8e] uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Delegate</th>
                <th className="py-2.5 px-3">Vote Decision</th>
                <th className="py-2.5 px-3">veNEAR Stake Weight</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3 text-right">Transaction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(proposal.votes || []).map((vote: any) => (
                <tr key={vote.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3">
                    <Link
                      to={`/delegate/${vote.delegateAccountId}`}
                      className="font-medium text-white hover:underline block"
                    >
                      {vote.delegateName || vote.delegateAccountId}
                    </Link>
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={vote.voteOption} />
                  </td>
                  <td className="py-3 px-3 text-white font-medium">
                    {(Number(vote.votingPower) / 1e6).toFixed(2)}M
                  </td>
                  <td className="py-3 px-3 text-[#8e8e8e]">
                    {new Date(vote.timestamp).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {vote.transactionHash ? (
                      <MonospaceAddress
                        value={vote.transactionHash}
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
      </TerminalBox>
    </div>
  );
};
