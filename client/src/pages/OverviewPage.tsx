import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Vote,
  Activity,
  Award,
  Coins,
  ShieldCheck,
  TrendingUp,
  ExternalLink,
  ArrowRight,
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
      <div className="flex flex-col items-center justify-center min-h-[400px] text-cr-muted font-mono">
        <div className="w-8 h-8 border-2 border-cr-accent border-t-transparent rounded-full animate-spin mb-4" />
        <span>SYNCHRONIZING GOVERNANCE TELEMETRY...</span>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="p-6 bg-cr-critical/10 border border-cr-critical/30 rounded-lg text-cr-critical font-mono">
        Failed to load governance intelligence overview. Ensure Turnout backend is running.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Editorial Control Room Header */}
      <div className="border-b border-cr-border pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cr-accent tracking-widest uppercase mb-1">
            <span className="w-2 h-2 rounded-full bg-cr-accent animate-pulse-subtle" />
            GOVERNANCE INTELLIGENCE OVERVIEW
          </div>
          <h1 className="text-3xl font-heading font-bold text-cr-text tracking-tight">
            Accountability Control Room
          </h1>
          <p className="text-sm text-cr-muted mt-1 max-w-2xl">
            Real-time reputation monitoring, verifiable participation metrics, and performance scorecards for NEAR House of Stake.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/analyst"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded bg-cr-surface border border-cr-border hover:border-cr-accent text-xs font-mono text-cr-text hover:text-white transition-colors"
          >
            <span>Launch AI Analyst</span>
            <ArrowRight className="w-3.5 h-3.5 text-cr-accent" />
          </Link>
          <Link
            to="/leaderboard"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded bg-cr-accent text-cr-bg hover:bg-cr-accentHover text-xs font-mono font-bold transition-colors"
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
            <span className="text-[11px] font-mono text-cr-muted">
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
                <CartesianGrid strokeDasharray="3 3" stroke="#23332B" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#89988C"
                  fontSize={10}
                  tickLine={false}
                  interval={0}
                  tickFormatter={(val) => (val.length > 10 ? `${val.substring(0, 9)}...` : val)}
                />
                <YAxis
                  stroke="#89988C"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 1e6).toFixed(1)}M`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#17221C',
                    borderColor: '#304238',
                    borderRadius: '6px',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '11px',
                    color: '#E8F0E8',
                  }}
                  formatter={(value: any) => [`${(Number(value) / 1e6).toFixed(2)}M veNEAR`, 'Voting Power']}
                />
                <Bar dataKey="votingPower" fill="#B6F36B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TerminalBox>

        {/* Historical Proposal Turnout Trends */}
        <TerminalBox
          title="Historical Participation Turnout"
          tag="House of Stake"
          action={
            <span className="text-[11px] font-mono text-cr-accent">
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
                <CartesianGrid strokeDasharray="3 3" stroke="#23332B" vertical={false} />
                <XAxis
                  dataKey="proposalId"
                  stroke="#89988C"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke="#89988C"
                  fontSize={10}
                  tickLine={false}
                  domain={[0, 100]}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#17221C',
                    borderColor: '#304238',
                    borderRadius: '6px',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '11px',
                    color: '#E8F0E8',
                  }}
                  formatter={(value: any) => [`${value}%`, 'Turnout']}
                />
                <Line
                  type="monotone"
                  dataKey="turnoutPct"
                  stroke="#66CDAA"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#66CDAA', stroke: '#101713', strokeWidth: 2 }}
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
            className="text-xs font-mono text-cr-accent hover:underline flex items-center gap-1"
          >
            <span>View All Proposals</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-cr-border text-cr-muted uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Delegate</th>
                <th className="py-2.5 px-3">Proposal</th>
                <th className="py-2.5 px-3">Vote Option</th>
                <th className="py-2.5 px-3">Weight (veNEAR)</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3 text-right">Transaction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cr-border/40">
              {overview.recentActivity.map((act) => (
                <tr key={act.id} className="hover:bg-cr-surfaceHover/50 transition-colors">
                  <td className="py-3 px-3">
                    <Link
                      to={`/delegate/${act.delegateAccountId}`}
                      className="font-medium text-cr-text hover:text-cr-accent transition-colors block"
                    >
                      {act.delegateName}
                    </Link>
                    <span className="text-[10px] text-cr-muted block">
                      {act.delegateAccountId}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-cr-secondaryAccent font-semibold">
                      {act.proposalId}
                    </span>
                    <span className="text-cr-muted text-[11px] block truncate max-w-xs font-sans">
                      {act.proposalTitle}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={act.voteOption} />
                  </td>
                  <td className="py-3 px-3 text-cr-text font-medium">
                    {(Number(act.votingPower) / 1e6).toFixed(2)}M
                  </td>
                  <td className="py-3 px-3 text-cr-muted">
                    {new Date(act.timestamp).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {act.transactionHash ? (
                      <MonospaceAddress
                        value={act.transactionHash}
                        type="hash"
                        truncate={true}
                        linkToExplorer={true}
                      />
                    ) : (
                      <span className="text-cr-muted">Synchronized</span>
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

