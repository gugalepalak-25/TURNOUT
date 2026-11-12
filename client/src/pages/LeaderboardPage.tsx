import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Award, Search, Filter, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { fetchLeaderboard } from '../services/api.js';
import { GradeBadge } from '../components/common/GradeBadge.js';
import { TerminalBox } from '../components/common/TerminalBox.js';
import { MonospaceAddress } from '../components/common/MonospaceAddress.js';

export const LeaderboardPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [hosOnly, setHosOnly] = useState(false);

  const { data: delegates, isLoading } = useQuery({
    queryKey: ['leaderboard', selectedGrade, hosOnly],
    queryFn: () =>
      fetchLeaderboard({
        grade: selectedGrade === 'ALL' ? undefined : selectedGrade,
        hosOnly,
      }),
  });

  const filtered = (delegates || []).filter((d) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return d.name.toLowerCase().includes(term) || d.accountId.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-cr-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cr-accent tracking-widest uppercase mb-1">
            <Award className="w-3.5 h-3.5" />
            REPUTATION LEADERBOARD
          </div>
          <h1 className="text-3xl font-heading font-bold text-cr-text tracking-tight">
            House of Stake Delegates
          </h1>
          <p className="text-sm text-cr-muted mt-1 max-w-2xl">
            Transparent 100-point reputation evaluation: Voting Participation (40%), Rationale Publication (25%), Timely Reporting (20%), and Consistency (15%).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-cr-surface border border-cr-border px-3.5 py-2 rounded-lg text-cr-muted">
          <span>Charter Threshold:</span>
          <span className="text-cr-accent font-bold">≥ 80.0% Participation</span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-cr-surface border border-cr-border rounded-lg p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-cr-muted" />
          <input
            type="text"
            placeholder="Search by account ID or delegate name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-cr-bg font-mono text-xs text-cr-text pl-9 pr-3 py-2 rounded border border-cr-border focus:border-cr-accent focus:outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'A', 'B', 'C', 'D', 'F'].map((grade) => (
            <button
              key={grade}
              onClick={() => setSelectedGrade(grade)}
              className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                selectedGrade === grade
                  ? 'bg-cr-accent text-cr-bg font-bold shadow-sm'
                  : 'bg-cr-bg text-cr-muted hover:text-white border border-cr-border'
              }`}
            >
              {grade === 'ALL' ? 'All Grades' : `Grade ${grade}`}
            </button>
          ))}

          <button
            onClick={() => setHosOnly(!hosOnly)}
            className={`px-3 py-1 rounded text-xs font-mono border transition-all flex items-center gap-1.5 ${
              hosOnly
                ? 'bg-cr-secondaryAccent/20 text-cr-secondaryAccent border-cr-secondaryAccent font-semibold'
                : 'bg-cr-bg text-cr-muted border-cr-border hover:border-cr-borderLight'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>HoS ≥80% Only</span>
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <TerminalBox
        title="Evaluated Delegate Roster"
        tag={`Period: HOS-2026-Q1 | ${filtered.length} Delegates`}
      >
        {isLoading ? (
          <div className="py-12 text-center text-cr-muted font-mono text-xs">
            COMPUTING VERIFIABLE REPUTATION SCORES...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-cr-muted font-mono text-xs">
            NO DELEGATES MATCHING CURRENT FILTER CRITERIA
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-cr-border text-cr-muted uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3 w-12 text-center">Rank</th>
                  <th className="py-3 px-3">Delegate Identity</th>
                  <th className="py-3 px-3 text-center">Grade</th>
                  <th className="py-3 px-3 text-right">Reputation Score</th>
                  <th className="py-3 px-3 text-right">Participation</th>
                  <th className="py-3 px-3 text-center">HoS Charter</th>
                  <th className="py-3 px-3 text-right">Voting Power</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cr-border/40">
                {filtered.map((del, idx) => {
                  const meetsCharter = del.participationRate >= 80.0;
                  return (
                    <tr key={del.accountId} className="hover:bg-cr-surfaceHover/50 transition-colors">
                      <td className="py-3.5 px-3 text-center text-cr-muted font-bold">
                        #{idx + 1}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          {del.profileImageUrl ? (
                            <img
                              src={del.profileImageUrl}
                              alt=""
                              className="w-7 h-7 rounded-full object-cover border border-cr-border shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-cr-bgSecondary border border-cr-border flex items-center justify-center font-bold text-[10px] text-cr-muted">
                              {del.name[0]}
                            </div>
                          )}
                          <div>
                            <Link
                              to={`/delegate/${del.accountId}`}
                              className="font-medium font-sans text-cr-text hover:text-cr-accent transition-colors block text-sm"
                            >
                              {del.name}
                            </Link>
                            <span className="text-[11px] text-cr-muted">
                              {del.accountId}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <GradeBadge grade={del.performanceGrade} size="sm" />
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-cr-text text-sm">
                        {del.reputationScore}
                        <span className="text-cr-muted text-[10px] font-normal"> /100</span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-medium">
                        <span
                          className={
                            del.participationRate >= 80 ? 'text-cr-accent' : 'text-cr-warning'
                          }
                        >
                          {del.participationRate}%
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        {meetsCharter ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-cr-accent bg-cr-accent/10 px-2 py-0.5 rounded border border-cr-accent/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Pass
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-cr-critical bg-cr-critical/10 px-2 py-0.5 rounded border border-cr-critical/30">
                            <AlertCircle className="w-3 h-3" />
                            Breach
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right font-medium text-cr-text">
                        {(Number(del.votingPower) / 1e6).toFixed(2)}M veNEAR
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <Link
                          to={`/delegate/${del.accountId}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-cr-surface border border-cr-border hover:border-cr-accent text-cr-text hover:text-white transition-colors text-[11px]"
                        >
                          <span>Passport</span>
                          <ArrowRight className="w-3 h-3 text-cr-accent" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </TerminalBox>
    </div>
  );
};

