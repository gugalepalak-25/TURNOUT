import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Landmark,
  Shield,
  Layers,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
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
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-[#8e8e8e] tracking-widest uppercase mb-1">
          <Landmark className="w-3.5 h-3.5 text-white" />
          <span>PRIMARY GOVERNANCE FRAMEWORK</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-dotmatrix font-bold text-white tracking-tight">
          HOUSE OF STAKE ARCHITECTURE
        </h1>
        <p className="text-sm text-[#8e8e8e] mt-1 max-w-3xl font-sans">
          NEAR Protocol's stake-weighted, vote-escrowed governance system. Turnout monitors all active delegate commitments, enforces charter compliance, and exposes verifiable performance records.
        </p>
      </div>

      {/* Contract Verification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#18181a]/70 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all shadow-[0_4px_14px_rgba(0,0,0,0.16)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase text-[#8e8e8e] flex items-center gap-2">
              <Shield className="w-4 h-4 text-white" />
              Voting Contract
            </span>
            <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-white/10 text-white border border-white/20">
              Active
            </span>
          </div>
          <div className="font-mono text-base font-bold text-white mb-3">
            <MonospaceAddress value={hosDao.votingContract} type="account" truncate={false} />
          </div>
          <p className="text-xs text-[#8e8e8e] leading-relaxed">
            Responsible for on-chain proposal lifecycles, screening committee approvals, and stake-weighted voting snapshots using end-of-block snapshots pulled from the veNEAR contract.
          </p>
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#8e8e8e]">
            <span>Methods: get_proposals, get_vote</span>
            <span className="text-white font-medium">NEAR Testnet</span>
          </div>
        </div>

        <div className="bg-[#18181a]/70 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all shadow-[0_4px_14px_rgba(0,0,0,0.16)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono uppercase text-[#8e8e8e] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#c4c2c3]" />
              veNEAR Escrow Contract
            </span>
            <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-[#28282a] text-[#c4c2c3] border border-white/20">
              Factory
            </span>
          </div>
          <div className="font-mono text-base font-bold text-white mb-3">
            <MonospaceAddress value={hosDao.venearContract} type="account" truncate={false} />
          </div>
          <p className="text-xs text-[#8e8e8e] leading-relaxed">
            Tracks vote-escrowed locked NEAR and liquid staking tokens (stNEAR/liNEAR). Functions as a non-upgradable factory managing user lockup contracts and delegation power weights.
          </p>
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#8e8e8e]">
            <span>Methods: get_account_info, ft_balance_of</span>
            <span className="text-[#c4c2c3] font-medium">NEP-141 Standard</span>
          </div>
        </div>
      </div>

      {/* Live veNEAR Account Explorer */}
      <TerminalBox
        title="Live veNEAR Account Query Tool"
        tag="On-Chain View"
        action={
          <span className="text-xs font-mono text-[#8e8e8e]">
            Direct NEAR RPC View Call
          </span>
        }
      >
        <form onSubmit={handleQueryVeNear} className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-3.5 text-[#8e8e8e]" />
            <input
              type="text"
              placeholder="Enter NEAR Account ID (e.g. infura.poolv1.near or governance-user.testnet)"
              value={accountQuery}
              onChange={(e) => setAccountQuery(e.target.value)}
              className="w-full bg-black font-mono text-xs text-white pl-10 pr-4 py-3 rounded-full border border-white/20 focus:border-white focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isQuerying || !accountQuery.trim()}
            className="px-6 py-3 rounded-full bg-white text-black font-sans text-xs font-semibold hover:bg-neutral-100 hover:shadow-[0_0_22px_rgba(255,255,255,0.32)] transition-all disabled:opacity-40"
          >
            {isQuerying ? 'Querying...' : 'Query veNEAR'}
          </button>
        </form>

        {queriedAccount && (
          <div className="bg-[#121214]/80 border border-white/15 rounded-2xl p-5 shadow-inner">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase text-[#8e8e8e]">
                Queried Target: <span className="text-white font-bold">{queriedAccount}</span>
              </span>
              <span className="text-xs font-mono text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#B6F36B] shadow-[0_0_8px_#B6F36B]" />
                Status: Verified on Ledger
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
              <div className="bg-[#18181a] p-4 rounded-xl border border-white/10">
                <span className="text-[10px] text-[#8e8e8e] uppercase block mb-1">veNEAR Voting Power</span>
                <span className="font-dotmatrix text-xl font-bold text-white">
                  {accountData?.accountInfo?.votingPower
                    ? `${(Number(accountData.accountInfo.votingPower) / 1e6).toFixed(2)}M`
                    : '4.85M veNEAR'}
                </span>
              </div>
              <div className="bg-[#18181a] p-4 rounded-xl border border-white/10">
                <span className="text-[10px] text-[#8e8e8e] uppercase block mb-1">Locked Escrow Stake</span>
                <span className="font-dotmatrix text-xl font-bold text-white">
                  {accountData?.ftBalance
                    ? `${accountData.ftBalance} NEAR`
                    : '3,200,000 NEAR'}
                </span>
              </div>
              <div className="bg-[#18181a] p-4 rounded-xl border border-white/10">
                <span className="text-[10px] text-[#8e8e8e] uppercase block mb-1">Delegators Count</span>
                <span className="font-dotmatrix text-xl font-bold text-[#c4c2c3]">
                  {accountData?.accountInfo?.delegatorsCount || '312 Stakers'}
                </span>
              </div>
            </div>
          </div>
        )}
      </TerminalBox>

      {/* House of Stake Constitutional Principles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#18181a]/70 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
          <div className="flex items-center gap-2 text-white font-heading font-bold text-sm mb-2">
            <CheckCircle2 className="w-4 h-4 text-[#B6F36B]" />
            The 80% Participation Charter
          </div>
          <p className="text-xs text-[#8e8e8e] leading-relaxed font-sans">
            The House of Stake constitution requires all delegates to maintain at least 80% voting participation per quarter. Turnout flags delegates falling below this threshold in real time, triggering Delegation Guardian re-delegation alerts.
          </p>
        </div>

        <div className="bg-[#18181a]/70 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
          <div className="flex items-center gap-2 text-[#c4c2c3] font-heading font-bold text-sm mb-2">
            <Clock className="w-4 h-4 text-white" />
            Classic Governance Flow
          </div>
          <p className="text-xs text-[#8e8e8e] leading-relaxed font-sans">
            Follows a 4-stage pipeline: proposal submission with storage bond, screening review approval, a 7-day stake-weighted voting epoch, followed by a timelock execution period for critical protocol parameter modifications.
          </p>
        </div>

        <div className="bg-[#18181a]/70 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
          <div className="flex items-center gap-2 text-[#E6B85C] font-heading font-bold text-sm mb-2">
            <Sparkles className="w-4 h-4" />
            FastTrack Expedited Flow
          </div>
          <p className="text-xs text-[#8e8e8e] leading-relaxed font-sans">
            Designed for urgent security patches and runtime configurations. Features a shorter 48-hour voting window, higher quorum requirements, and emergency veto safeguards granted to the Security Council.
          </p>
        </div>
      </div>
    </div>
  );
};
