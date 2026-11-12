import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Award, Search, ShieldCheck, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { fetchLeaderboard } from '../services/api.js';
import { GradeBadge } from '../components/common/GradeBadge.js';
import { TerminalBox } from '../components/common/TerminalBox.js';

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
      <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8e8e8e] tracking-widest uppercase mb-1">
            <Award className="w-3.5 h-3.5 text-white" />
            <span>REPUTATION LEADERBOARD</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-dotmatrix font-bold text-white tracking-tight">
            HOUSE OF STAKE DELEGATES
          </h1>
          <p className="text-sm text-[#8e8e8e] mt-1 max-w-2xl font-sans">
            Transparent 100-point reputation evaluation: Voting Participation (40%), Rationale Publication (25%), Timely Reporting (20%), and Consistency (15%).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-[#28282a] border border-white/20 px-4 py-2 rounded-full text-[#c4c2c3] shadow-[0_4px_14px_rgba(0,0,0,0.16)]">
          <span>Charter Threshold:</span>
          <span className="text-white font-bold">≥ 80.0% Participation</span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-[#18181a]/70 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-[0_4px_14px_rgba(0,0,0,0.16)]">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-4 top-3 text-[#8e8e8e]" />
          <input
            type="text"
            placeholder="Search by account ID or delegate name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black font-mono text-xs text-white pl-10 pr-4 py-2.5 rounded-full border border-white/20 focus:border-white focus:outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'A', 'B', 'C', 'D', 'F'].map((grade) => (
            <button
              key={grade}
              onClick={() => setSelectedGrade(grade)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-sans transition-all ${
                selectedGrade === grade
                  ? 'bg-white text-black font-semibold shadow-[0_4px_14px_rgba(0,0,0,0.2)]'
                  : 'bg-[#28282a] text-[#8e8e8e] hover:text-white border border-white/15 hover:bg-[#323234]'
              }`}
            >
              {grade === 'ALL' ? 'All Grades' : `Grade ${grade}`}
            </button>
          ))}

          <button
            onClick={() => setHosOnly(!hosOnly)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-sans border transition-all flex items-center gap-1.5 ${
              hosOnly
                ? 'bg-white text-black border-white font-semibold'
                : 'bg-[#28282a] text-[#8e8e8e] border-white/15 hover:text-white'
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
          <div className="py-12 text-center text-[#8e8e8e] font-mono text-xs">
            COMPUTING VERIFIABLE REPUTATION SCORES...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-[#8e8e8e] font-mono text-xs">
            NO DELEGATES MATCHING CURRENT FILTER CRITERIA
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-[#8e8e8e] uppercase tracking-wider text-[10px]">
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
              <tbody className="divide-y divide-white/5">
                {filtered.map((del, idx) => {
                  const meetsCharter = del.participationRate >= 80.0;
                  return (
                    <tr key={del.accountId} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-3 text-center text-[#8e8e8e] font-bold font-dotmatrix">
                        #{idx + 1}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          {del.profileImageUrl ? (
                            <img
                              src={del.profileImageUrl}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border border-white/20 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#28282a] border border-white/20 flex items-center justify-center font-bold text-xs text-white">
                              {del.name[0]}
                            </div>
                          )}
                          <div>
                            <Link
                              to={`/delegate/${del.accountId}`}
                              className="font-medium font-sans text-white hover:underline transition-colors block text-sm"
                            >
                              {del.name}
                            </Link>
                            <span className="text-[11px] text-[#8e8e8e]">
                              {del.accountId}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <GradeBadge grade={del.performanceGrade} size="sm" />
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-white text-sm">
                        <span className="font-dotmatrix text-base">{del.reputationScore}</span>
                        <span className="text-[#8e8e8e] text-[10px] font-normal"> /100</span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-medium">
                        <span
                          className={
                            del.participationRate >= 80 ? 'text-white' : 'text-[#E6B85C]'
                          }
                        >
                          {del.participationRate}%
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        {meetsCharter ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-white bg-white/10 px-2.5 py-0.5 rounded-full border border-white/30">
                            <CheckCircle2 className="w-3 h-3 text-[#B6F36B]" />
                            Pass
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#E87979] bg-[#E87979]/10 px-2.5 py-0.5 rounded-full border border-[#E87979]/30">
                            <AlertCircle className="w-3 h-3" />
                            Breach
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right font-medium text-white">
                        {(Number(del.votingPower) / 1e6).toFixed(2)}M veNEAR
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <Link
                          to={`/delegate/${del.accountId}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#28282a] hover:bg-white hover:text-black border border-white/20 text-white transition-all text-[11px] font-sans font-medium"
                        >
                          <span>Passport</span>
                          <ArrowRight className="w-3 h-3" />
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
