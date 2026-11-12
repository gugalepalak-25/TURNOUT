import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Vote,
  Activity,
  Award,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchOverview } from '../services/api.js';
import { MetricCard } from '../components/common/MetricCard.js';
import { TerminalBox } from '../components/common/TerminalBox.js';
import { MonospaceAddress } from '../components/common/MonospaceAddress.js';
import { StatusBadge } from '../components/common/StatusBadge.js';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

export const OverviewPage: React.FC = () => {
  const { data: overview, isLoading, error } = useQuery({
    queryKey: ['governance-overview'],
    queryFn: fetchOverview,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-[#8e8e8e] font-mono">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-4" />
        <span className="font-dotmatrix text-white tracking-wider">SYNCHRONIZING GOVERNANCE TELEMETRY...</span>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="p-6 bg-[#E87979]/10 border border-[#E87979]/30 rounded-2xl text-[#E87979] font-mono">
        Failed to load governance intelligence overview. Ensure Turnout backend is running.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enterprise Trust Proof & Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          {/* Trust Row */}
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="flex items-center -space-x-2">
              <div className="w-7 h-7 rounded-full bg-[#28282a] border border-white/40 p-1 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-black text-[10px]">
                  <i className="fa-brands fa-microsoft" />
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-[#28282a] border border-white/40 p-1 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-black text-[10px]">
                  <i className="fa-brands fa-amazon" />
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-[#28282a] border border-white/40 p-1 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-black text-[10px]">
                  <i className="fa-brands fa-google" />
                </div>
              </div>
            </div>
            <div className="bg-[#28282a] border border-white/40 rounded-full px-3 py-1 text-[11px] text-[#c4c2c3] font-medium shadow-[0_4px_14px_rgba(0,0,0,0.16)]">
              Trusted by 2,000+ Governance Stakeholders
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-dotmatrix font-bold text-white tracking-tight">
            ACCOUNTABILITY CONTROL ROOM
          </h1>
          <p className="text-sm text-[#8e8e8e] mt-1 max-w-2xl font-sans">
            Real-time reputation monitoring, verifiable participation metrics, and tamper-evident scorecards for NEAR House of Stake.
          </p>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/analyst"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#28282a] border border-white/20 hover:border-white text-xs font-sans text-[#c8c8c8] hover:text-white transition-all shadow-[0_4px_14px_rgba(0,0,0,0.16)] hover:-translate-y-0.5"
          >
            <span>Launch AI Analyst</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </Link>
          <Link
            to="/leaderboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black hover:bg-neutral-100 hover:shadow-[0_0_22px_rgba(255,255,255,0.32)] text-xs font-sans font-semibold transition-all shadow-[0_4px_14px_rgba(0,0,0,0.16)] hover:-translate-y-0.5"
          >
            <span>Delegate Directory</span>
          </Link>
        </div>
      </div>

      {/* Primary Governance Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Tracked Delegates"
          value={overview.totalDelegates}
          subtitle="House of Stake active validator nodes"
          icon={Users}
          badge="100% On-Chain"
        />
        <MetricCard
          title="Avg Participation"
          value={`${overview.averageParticipationRate}%`}
          subtitle="Charter threshold requires 80.0%"
          icon={Activity}
          trend={{ value: '+4.2% vs Q4', isPositive: true }}
          badge={overview.averageParticipationRate >= 80 ? 'Compliant' : 'At Risk'}
          badgeType={overview.averageParticipationRate >= 80 ? 'accent' : 'warning'}
        />
        <MetricCard
          title="Governance Proposals"
          value={overview.totalProposals}
          subtitle={`${overview.activeProposals} voting proposals active`}
          icon={Vote}
          badge="Active"
        />
        <MetricCard
          title="Avg Reputation"
          value={`${overview.averageReputationScore} / 100`}
          subtitle="100-pt verifiable scoring formula"
          icon={Award}
          badge="Grade B"
          badgeType="accent"
        />
      </div>

      {/* Charts Section: Delegation Power & Turnout Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delegation Power Distribution */}
        <TerminalBox
          title="veNEAR Voting Power Distribution"
          tag="Stake Weight"
          action={
            <span className="text-[11px] font-mono text-[#8e8e8e]">
              Total: {(Number(overview.totalVotingPower) / 1e6).toFixed(2)}M veNEAR
            </span>
          }
        >
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={overview.delegationDistribution}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#8e8e8e"
                  fontSize={10}
                  tickLine={false}
                  interval={0}
                  tickFormatter={(val) => (val.length > 10 ? `${val.substring(0, 9)}...` : val)}
                />
                <YAxis
                  stroke="#8e8e8e"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 1e6).toFixed(1)}M`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181a',
                    borderColor: 'rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    fontFamily: 'Inter',
                    fontSize: '12px',
                    color: '#ffffff',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
                  }}
                  formatter={(value: any) => [`${(Number(value) / 1e6).toFixed(2)}M veNEAR`, 'Voting Power']}
                />
                <Bar dataKey="votingPower" fill="#ffffff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TerminalBox>

        {/* Historical Proposal Turnout Trends */}
        <TerminalBox
          title="Historical Participation Turnout"
          tag="House of Stake"
          action={
            <span className="text-[11px] font-mono text-[#B6F36B]">
              80% Quorum Target
            </span>
          }
        >
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={overview.participationTrends}
                margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis
                  dataKey="proposalId"
                  stroke="#8e8e8e"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#8e8e8e"
                  fontSize={10}
                  tickLine={false}
                  domain={[0, 100]}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181a',
                    borderColor: 'rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    fontFamily: 'Inter',
                    fontSize: '12px',
                    color: '#ffffff',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
                  }}
                  formatter={(value: any) => [`${value}%`, 'Turnout']}
                />
                <Line
                  type="monotone"
                  dataKey="turnoutPct"
                  stroke="#ffffff"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#ffffff', stroke: '#000000', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#B6F36B' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TerminalBox>
      </div>

      {/* Recent On-Chain Governance Activity Feed */}
      <TerminalBox
        title="Live House of Stake Voting Ledger"
        tag="Recent Verified Votes"
        action={
          <Link
            to="/proposals"
            className="text-xs font-mono text-white hover:underline flex items-center gap-1.5"
          >
            <span>View All Proposals</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-[#8e8e8e] uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Delegate</th>
                <th className="py-3 px-4">Proposal</th>
                <th className="py-3 px-4">Vote Option</th>
                <th className="py-3 px-4">Weight (veNEAR)</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Transaction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {overview.recentActivity.map((act) => (
                <tr key={act.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4">
                    <Link
                      to={`/delegate/${act.delegateAccountId}`}
                      className="font-medium text-white hover:underline transition-colors block"
                    >
                      {act.delegateName}
                    </Link>
                    <span className="text-[10px] text-[#8e8e8e] block">
                      {act.delegateAccountId}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-white font-semibold">
                      {act.proposalId}
                    </span>
                    <span className="text-[#8e8e8e] text-[11px] block truncate max-w-xs font-sans">
                      {act.proposalTitle}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={act.voteOption} />
                  </td>
                  <td className="py-3.5 px-4 text-white font-medium">
                    {(Number(act.votingPower) / 1e6).toFixed(2)}M
                  </td>
                  <td className="py-3.5 px-4 text-[#8e8e8e]">
                    {new Date(act.timestamp).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {act.transactionHash ? (
                      <MonospaceAddress
                          value={act.transactionHash}
                          type="hash"
                          truncate={true}
                          linkToExplorer={true}
                        />
                    ) : (
                      <span className="text-[#8e8e8e]">Synchronized</span>
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
