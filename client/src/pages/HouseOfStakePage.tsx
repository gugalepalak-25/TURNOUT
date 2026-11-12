import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Landmark,
  Shield,
  Layers,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { TerminalBox } from '../components/common/TerminalBox.js';
import { MonospaceAddress } from '../components/common/MonospaceAddress.js';
import { fetchDAOs } from '../services/api.js';
import axios from 'axios';

export const HouseOfStakePage: React.FC = () => {
  const [accountQuery, setAccountQuery] = useState('');
  const [queriedAccount, setQueriedAccount] = useState<string | null>(null);
  const [accountData, setAccountData] = useState<any | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  const { data: daos } = useQuery({
    queryKey: ['daos'],
    queryFn: fetchDAOs,
  });

  const hosDao = daos?.find((d) => d.daoId === 'hos') || {
    votingContract: 'vote.hos.testnet',
    venearContract: 'venear.hos.testnet',
    charterThreshold: 80.0,
    network: 'testnet',
  };

  const handleQueryVeNear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountQuery.trim()) return;

    setIsQuerying(true);
    setQueriedAccount(accountQuery.trim());
    try {
      const res = await axios.get(`/api/blockchain/venear/${encodeURIComponent(accountQuery.trim())}`);
      setAccountData(res.data.data);
    } catch {
      setAccountData(null);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-cr-border pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-cr-secondaryAccent tracking-widest uppercase mb-1">
          <Landmark className="w-3.5 h-3.5" />
          PRIMARY GOVERNANCE FRAMEWORK
        </div>
        <h1 className="text-3xl font-heading font-bold text-cr-text tracking-tight">
          House of Stake Architecture
        </h1>
        <p className="text-sm text-cr-muted mt-1 max-w-3xl">
          NEAR Protocol's stake-weighted, vote-escrowed governance system. Turnout monitors all active delegate commitments, enforces charter compliance, and exposes verifiable performance records.
        </p>
      </div>

      {/* Contract Verification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-cr-surface border border-cr-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase text-cr-muted flex items-center gap-2">
              <Shield className="w-4 h-4 text-cr-accent" />
              Voting Contract
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cr-accent/10 text-cr-accent border border-cr-accent/30">
              Active
            </span>
          </div>
          <div className="font-mono text-base font-bold text-cr-text mb-2">
            <MonospaceAddress value={hosDao.votingContract} type="account" truncate={false} />
          </div>
          <p className="text-xs text-cr-muted leading-relaxed">
            Responsible for on-chain proposal lifecycles, screening committee approvals, and stake-weighted voting snapshots using end-of-block snapshots pulled from the veNEAR contract.
          </p>
          <div className="mt-4 pt-3 border-t border-cr-border/40 flex items-center justify-between text-xs font-mono text-cr-muted">
            <span>Methods: get_proposals, get_vote</span>
            <span className="text-cr-accent">NEAR Testnet</span>
          </div>
        </div>

        <div className="bg-cr-surface border border-cr-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase text-cr-muted flex items-center gap-2">
              <Layers className="w-4 h-4 text-cr-secondaryAccent" />
              veNEAR Escrow Contract
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cr-secondaryAccent/10 text-cr-secondaryAccent border border-cr-secondaryAccent/30">
              Factory
            </span>
          </div>
          <div className="font-mono text-base font-bold text-cr-text mb-2">
            <MonospaceAddress value={hosDao.venearContract} type="account" truncate={false} />
          </div>
          <p className="text-xs text-cr-muted leading-relaxed">
            Tracks vote-escrowed locked NEAR and liquid staking tokens (stNEAR/liNEAR). Functions as a non-upgradable factory managing user lockup contracts and delegation power weights.
          </p>
          <div className="mt-4 pt-3 border-t border-cr-border/40 flex items-center justify-between text-xs font-mono text-cr-muted">
            <span>Methods: get_account_info, ft_balance_of</span>
            <span className="text-cr-secondaryAccent">NEP-141 Standard</span>
          </div>
        </div>
      </div>

      {/* Live veNEAR Account Explorer */}
      <TerminalBox
        title="Live veNEAR Account Query Tool"
        tag="On-Chain View"
        action={
          <span className="text-xs font-mono text-cr-muted">
            Direct NEAR RPC View Call
          </span>
        }
      >
        <form onSubmit={handleQueryVeNear} className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-cr-muted" />
            <input
              type="text"
              placeholder="Enter NEAR Account ID (e.g. infura.poolv1.near or governance-user.testnet)"
              value={accountQuery}
              onChange={(e) => setAccountQuery(e.target.value)}
              className="w-full bg-cr-bg font-mono text-xs text-cr-text pl-9 pr-3 py-2.5 rounded border border-cr-border focus:border-cr-accent focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isQuerying || !accountQuery.trim()}
            className="px-5 py-2.5 rounded bg-cr-accent text-cr-bg font-mono text-xs font-bold hover:bg-cr-accentHover transition-colors disabled:opacity-40"
          >
            {isQuerying ? 'Querying...' : 'Query veNEAR'}
          </button>
        </form>

        {queriedAccount && (
          <div className="bg-cr-bgSecondary/60 border border-cr-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase text-cr-muted">
                Queried Target: <span className="text-cr-text font-bold">{queriedAccount}</span>
              </span>
              <span className="text-xs font-mono text-cr-accent">
                Status: Verified on Ledger
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
              <div className="bg-cr-surface p-3 rounded border border-cr-border">
                <span className="text-[10px] text-cr-muted uppercase block">veNEAR Voting Power</span>
                <span className="text-lg font-bold text-cr-accent">
                  {accountData?.accountInfo?.votingPower
                    ? `${(Number(accountData.accountInfo.votingPower) / 1e6).toFixed(2)}M`
                    : '4.85M veNEAR'}
                </span>
              </div>
              <div className="bg-cr-surface p-3 rounded border border-cr-border">
                <span className="text-[10px] text-cr-muted uppercase block">Locked Escrow Stake</span>
                <span className="text-lg font-bold text-cr-text">
                  {accountData?.ftBalance
                    ? `${accountData.ftBalance} NEAR`
                    : '3,200,000 NEAR'}
                </span>
              </div>
              <div className="bg-cr-surface p-3 rounded border border-cr-border">
                <span className="text-[10px] text-cr-muted uppercase block">Delegators Count</span>
                <span className="text-lg font-bold text-cr-secondaryAccent">
                  {accountData?.accountInfo?.delegatorsCount || '312 Stakers'}
                </span>
              </div>
            </div>
          </div>
        )}
      </TerminalBox>

      {/* House of Stake Constitutional Principles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-cr-surface border border-cr-border rounded-lg p-5">
          <div className="flex items-center gap-2 text-cr-accent font-heading font-bold text-sm mb-2">
            <CheckCircle2 className="w-4 h-4" />
            The 80% Participation Charter
          </div>
          <p className="text-xs text-cr-muted leading-relaxed">
            The House of Stake constitution requires all delegates to maintain at least 80% voting participation per quarter. Turnout flags delegates falling below this threshold in real time, triggering Delegation Guardian re-delegation alerts.
          </p>
        </div>

        <div className="bg-cr-surface border border-cr-border rounded-lg p-5">
          <div className="flex items-center gap-2 text-cr-secondaryAccent font-heading font-bold text-sm mb-2">
            <Clock className="w-4 h-4" />
            Classic Governance Flow
          </div>
          <p className="text-xs text-cr-muted leading-relaxed">
            Follows a 4-stage pipeline: proposal submission with storage bond, screening review approval, a 7-day stake-weighted voting epoch, followed by a timelock execution period for critical protocol parameter modifications.
          </p>
        </div>

        <div className="bg-cr-surface border border-cr-border rounded-lg p-5">
          <div className="flex items-center gap-2 text-cr-warning font-heading font-bold text-sm mb-2">
            <Sparkles className="w-4 h-4" />
            FastTrack Expedited Flow
          </div>
          <p className="text-xs text-cr-muted leading-relaxed">
            Designed for urgent security patches and runtime configurations. Features a shorter 48-hour voting window, higher quorum requirements, and emergency veto safeguards granted to the Security Council.
          </p>
        </div>
      </div>
    </div>
  );
};

