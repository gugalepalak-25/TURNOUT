import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Vote, Search, Filter, ExternalLink, Calendar, Users, ArrowRight } from 'lucide-react';
import { fetchProposals } from '../services/api.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import { TerminalBox } from '../components/common/TerminalBox.js';
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
      <div className="border-b border-cr-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cr-secondaryAccent tracking-widest uppercase mb-1">
            <Vote className="w-3.5 h-3.5" />
            HOUSE OF STAKE GOVERNANCE
          </div>
          <h1 className="text-3xl font-heading font-bold text-cr-text tracking-tight">
            Proposal Explorer
          </h1>
          <p className="text-sm text-cr-muted mt-1 max-w-2xl">
            Live on-chain House of Stake proposals, quorum verification, veNEAR stake-weighted votes, and linked discussion threads from gov.near.org.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-cr-surface border border-cr-border rounded-lg p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-cr-muted" />
          <input
            type="text"
            placeholder="Search proposals by title or ID (e.g. HSP-001)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-cr-bg font-mono text-xs text-cr-text pl-9 pr-3 py-2 rounded border border-cr-border focus:border-cr-accent focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'Voting', 'Executed', 'Succeeded'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                selectedStatus === st
                  ? 'bg-cr-secondaryAccent text-cr-bg font-bold shadow-sm'
                  : 'bg-cr-bg text-cr-muted hover:text-white border border-cr-border'
              }`}
            >
              {st}
            </button>
          ))}

          <div className="h-4 w-px bg-cr-border hidden sm:block" />

          {['ALL', 'Classic', 'FastTrack'].map((kd) => (
            <button
              key={kd}
              onClick={() => setSelectedKind(kd)}
              className={`px-2.5 py-1 rounded text-xs font-mono border transition-all ${
                selectedKind === kd
                  ? 'bg-cr-surface text-cr-accent border-cr-accent font-semibold'
                  : 'bg-cr-bg text-cr-muted border-cr-border hover:border-cr-borderLight'
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
          <div className="py-12 text-center text-cr-muted font-mono text-xs">
            SYNCHRONIZING PROPOSALS FROM VOTING CONTRACT...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-cr-muted font-mono text-xs">
            NO PROPOSALS MATCHING CURRENT FILTER
          </div>
        ) : (
          filtered.map((prop) => {
            const yesNum = Number(prop.yesVotes) || 0;
            const noNum = Number(prop.noVotes) || 0;
            const abstainNum = Number(prop.abstainVotes) || 0;
            const totalWeight = yesNum + noNum + abstainNum;
            const yesPct = totalWeight > 0 ? Math.round((yesNum / totalWeight) * 100) : 0;
            const noPct = totalWeight > 0 ? Math.round((noNum / totalWeight) * 100) : 0;

            return (
              <div
                key={prop.id}
                className="bg-cr-surface border border-cr-border rounded-lg p-5 hover:border-cr-borderLight transition-all duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs font-bold text-cr-accent bg-cr-accent/10 px-2 py-0.5 rounded border border-cr-accent/30">
                        {prop.proposalId}
                      </span>
                      <StatusBadge status={prop.status} />
                      <span className="text-[11px] font-mono text-cr-muted bg-cr-bgSecondary px-2 py-0.5 rounded border border-cr-border">
                        {prop.kind} Flow
                      </span>
                    </div>

                    <Link
                      to={`/proposals/${prop.id}`}
                      className="font-heading font-bold text-lg text-cr-text hover:text-cr-accent transition-colors block"
                    >
                      {prop.title}
                    </Link>

                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-cr-muted mt-2">
                      <span>
                        Proposer:{' '}
                        <MonospaceAddress value={prop.proposer} type="account" truncate={true} />
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Voting Closes: {new Date(prop.voteEndTime).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-cr-text font-medium">
                        <Users className="w-3.5 h-3.5 text-cr-secondaryAccent" />
                        {prop.totalVotesCast} Votes Cast
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {prop.forumUrl && (
                      <a
                        href={prop.forumUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded bg-cr-bgSecondary border border-cr-border hover:border-cr-accent text-cr-muted hover:text-white text-xs font-mono transition-colors flex items-center gap-1.5"
                      >
                        <span>Forum Thread</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <Link
                      to={`/proposals/${prop.id}`}
                      className="px-3 py-1.5 rounded bg-cr-accent text-cr-bg hover:bg-cr-accentHover text-xs font-mono font-bold transition-colors flex items-center gap-1"
                    >
                      <span>Inspect Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                <p className="text-xs text-cr-muted leading-relaxed font-sans line-clamp-2 mb-4">
                  {prop.description}
                </p>

                {/* Vote weight bar */}
                <div className="bg-cr-bgSecondary/60 p-3 rounded border border-cr-border/60">
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <span className="text-cr-accent font-semibold">
                      Approve: {yesPct}% ({(yesNum / 1e6).toFixed(2)}M veNEAR)
                    </span>
                    <span className="text-cr-critical font-semibold">
                      Reject: {noPct}% ({(noNum / 1e6).toFixed(2)}M veNEAR)
                    </span>
                  </div>
                  <div className="w-full bg-cr-bg rounded-full h-2 flex overflow-hidden">
                    <div className="bg-cr-accent h-full" style={{ width: `${yesPct}%` }} />
                    <div className="bg-cr-critical h-full" style={{ width: `${noPct}%` }} />
                    <div
                      className="bg-cr-muted/40 h-full"
                      style={{ width: `${100 - yesPct - noPct}%` }}
                    />
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

