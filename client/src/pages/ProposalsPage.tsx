import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Vote, Search, ExternalLink, Calendar, Users, ArrowRight } from 'lucide-react';
import { fetchProposals } from '../services/api.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { MonospaceAddress } from '../components/common/MonospaceAddress.js';

export const ProposalsPage: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedKind, setSelectedKind] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const { data: proposals, isLoading } = useQuery({
    queryKey: ['proposals', selectedStatus, selectedKind],
    queryFn: () =>
      fetchProposals({
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        kind: selectedKind === 'ALL' ? undefined : selectedKind,
      }),
  });

  const filtered = (proposals || []).filter((p) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return p.title.toLowerCase().includes(term) || p.proposalId.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8e8e8e] tracking-widest uppercase mb-1">
            <Vote className="w-3.5 h-3.5 text-white" />
            <span>HOUSE OF STAKE GOVERNANCE</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-dotmatrix font-bold text-white tracking-tight">
            PROPOSAL EXPLORER
          </h1>
          <p className="text-sm text-[#8e8e8e] mt-1 max-w-2xl font-sans">
            Live on-chain House of Stake proposals, quorum verification, veNEAR stake-weighted votes, and linked discussion threads from gov.near.org.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#18181a]/70 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-[0_4px_14px_rgba(0,0,0,0.16)]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-4 top-3 text-[#8e8e8e]" />
          <input
            type="text"
            placeholder="Search proposals by title or ID (e.g. HSP-001)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black font-mono text-xs text-white pl-10 pr-4 py-2.5 rounded-full border border-white/20 focus:border-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'Voting', 'Executed', 'Succeeded'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-sans transition-all ${
                selectedStatus === st
                  ? 'bg-white text-black font-semibold shadow-[0_4px_14px_rgba(0,0,0,0.2)]'
                  : 'bg-[#28282a] text-[#8e8e8e] hover:text-white border border-white/15 hover:bg-[#323234]'
              }`}
            >
              {st}
            </button>
          ))}

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          {['ALL', 'Classic', 'FastTrack'].map((kd) => (
            <button
              key={kd}
              onClick={() => setSelectedKind(kd)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-sans border transition-all ${
                selectedKind === kd
                  ? 'bg-white/10 text-white border-white/30 font-semibold'
                  : 'bg-[#28282a] text-[#8e8e8e] border-white/15 hover:text-white'
              }`}
            >
              {kd}
            </button>
          ))}
        </div>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-[#8e8e8e] font-mono text-xs">
            SYNCHRONIZING PROPOSALS FROM VOTING CONTRACT...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-[#8e8e8e] font-mono text-xs">
            NO PROPOSALS MATCHING CURRENT CRITERIA
          </div>
        ) : (
          filtered.map((prop) => {
            const yesPower = Number(prop.yesVotes) || 0;
            const noPower = Number(prop.noVotes) || 0;
            const total = yesPower + noPower;
            const yesPct = total > 0 ? Math.round((yesPower / total) * 100) : 0;
            const noPct = total > 0 ? 100 - yesPct : 0;

            return (
              <div
                key={prop.id}
                className="bg-[#18181a]/70 backdrop-blur-md border border-white/10 hover:border-white/30 rounded-2xl p-6 transition-all duration-200 group shadow-[0_4px_14px_rgba(0,0,0,0.16)]"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5 mb-2">
                      <span className="font-dotmatrix font-bold text-sm text-white px-2.5 py-0.5 rounded-full bg-[#28282a] border border-white/20">
                        {prop.proposalId}
                      </span>
                      <StatusBadge status={prop.status} />
                      <span className="text-[10px] font-mono uppercase bg-[#28282a] text-[#c4c2c3] px-2.5 py-0.5 rounded-full border border-white/15">
                        {prop.kind} Flow
                      </span>
                      <span className="text-xs text-[#8e8e8e] font-mono">
                        {new Date(prop.voteStartTime).toLocaleDateString()}
                      </span>
                    </div>

                    <Link
                      to={`/proposals/${prop.proposalId}`}
                      className="font-heading font-bold text-xl text-white group-hover:text-white transition-colors block leading-snug"
                    >
                      {prop.title}
                    </Link>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <Link
                      to={`/proposals/${prop.proposalId}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black hover:bg-neutral-100 text-xs font-sans font-semibold transition-all shadow-[0_4px_14px_rgba(0,0,0,0.16)]"
                    >
                      <span>Examine & Vote</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <p className="text-xs text-[#8e8e8e] line-clamp-2 mb-4 leading-relaxed font-sans">
                  {prop.description}
                </p>

                {/* Progress bar for Votes */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-white font-semibold">
                      Support: {yesPct}% ({(yesPower / 1e6).toFixed(2)}M veNEAR)
                    </span>
                    <span className="text-[#8e8e8e]">
                      Reject: {noPct}% ({(noPower / 1e6).toFixed(2)}M veNEAR)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-black overflow-hidden flex border border-white/10">
                    <div className="bg-white h-full" style={{ width: `${yesPct}%` }} />
                    <div className="bg-[#28282a] h-full" style={{ width: `${noPct}%` }} />
                  </div>
                </div>

                {/* Proposal Metadata Footer */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/10 text-xs font-mono text-[#8e8e8e]">
                  <div className="flex items-center gap-2">
                    <span>Proposer:</span>
                    <MonospaceAddress value={prop.proposer} type="account" truncate={true} />
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {prop.totalVotesCast || 12} Cast Votes
                    </span>

                    {prop.forumUrl && (
                      <a
                        href={prop.forumUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:underline inline-flex items-center gap-1 bg-[#28282a] border border-white/15 px-2.5 py-0.5 rounded-full"
                      >
                        <span>Gov Forum</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
