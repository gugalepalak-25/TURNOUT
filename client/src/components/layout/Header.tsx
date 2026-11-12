import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Wallet, CheckCircle2, ShieldAlert, Cpu, ArrowUpRight } from 'lucide-react';
import { useNearWallet } from '../../context/NearWalletContext.js';
import { MonospaceAddress } from '../common/MonospaceAddress.js';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  blockchainStatus?: {
    connected: boolean;
    mode: 'LIVE_RPC' | 'INDEXED_SNAPSHOT';
    lastSyncBlock: number;
    lastSyncTime: string;
    network: string;
  };
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu, blockchainStatus }) => {
  const { accountId, isConnected, connect, disconnect } = useNearWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const handleConnect = async (account?: string) => {
    await connect(account);
    setShowWalletModal(false);
  };

  const isLive = blockchainStatus?.mode === 'LIVE_RPC';

  return (
    <>
      <header className="h-20 bg-black/40 backdrop-blur-xl border-b border-white/10 px-6 flex items-center justify-between sticky top-0 z-30 transition-all">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 text-[#8e8e8e] hover:text-white rounded-full bg-[#28282a] border border-white/20 transition-all"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Telemetry pill */}
          <div className="flex items-center gap-2">
            <div
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-mono bg-[#28282a]/80 border border-white/20 shadow-[0_4px_14px_rgba(0,0,0,0.16)] backdrop-blur-md"
              title={
                isLive
                  ? 'Connected directly to NEAR RPC'
                  : 'RPC network offline/isolated; served by verified indexed snapshot'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isLive ? 'bg-[#B6F36B] shadow-[0_0_8px_#B6F36B] animate-pulse-subtle' : 'bg-[#c4c2c3]'
                }`}
              />
              <span className="font-semibold tracking-wide text-white">
                {isLive ? 'LIVE RPC' : 'INDEXED LEDGER'}
              </span>
              <span className="text-[#8e8e8e] text-[11px] hidden md:inline">
                | Block #{blockchainStatus?.lastSyncBlock || 174829103}
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Controls: White Pills and Dark Pills */}
        <div className="flex items-center gap-3">
          {/* Network tag in dark pill */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#28282a] border border-white/20 text-xs font-mono text-[#c4c2c3] shadow-[0_4px_14px_rgba(0,0,0,0.16)]">
            <Cpu className="w-3.5 h-3.5 text-[#B6F36B]" />
            <span className="text-white font-medium">NEAR TESTNET</span>
          </div>

          {/* Quick link to Landing / Portal */}
          <Link
            to="/"
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-sans text-[#c8c8c8] hover:text-white bg-[#28282a] hover:bg-[#323234] border border-white/20 transition-all shadow-[0_4px_14px_rgba(0,0,0,0.16)] hover:-translate-y-0.5"
          >
            <span>Landing</span>
            <ArrowUpRight className="w-3 h-3 text-[#8e8e8e]" />
          </Link>

          {/* Wallet Connection */}
          {isConnected && accountId ? (
            <div className="flex items-center gap-2">
              <div className="bg-[#28282a] border border-white/20 rounded-full px-3 py-1 flex items-center shadow-[0_4px_14px_rgba(0,0,0,0.16)]">
                <MonospaceAddress value={accountId} type="account" linkToExplorer={true} />
              </div>
              <button
                onClick={disconnect}
                className="text-xs font-mono text-[#8e8e8e] hover:text-[#E87979] px-3 py-1.5 rounded-full bg-[#28282a] hover:bg-[#323234] border border-white/20 hover:border-[#E87979]/40 transition-all"
                title="Disconnect wallet"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowWalletModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-sans font-semibold bg-white text-[#111111] hover:bg-neutral-100 hover:shadow-[0_0_22px_rgba(255,255,255,0.32)] shadow-[0_4px_14px_rgba(0,0,0,0.16)] transition-all hover:-translate-y-0.5"
            >
              <Wallet className="w-3.5 h-3.5 text-[#111111]" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </header>

      {/* Wallet Connection Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181a] border border-white/20 rounded-2xl max-w-md w-full p-6 shadow-2xl relative shadow-white-glow">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black">
                  <Wallet className="w-4 h-4" />
                </div>
                <h3 className="font-heading font-bold text-lg text-white">Connect NEAR Wallet</h3>
              </div>
              <button
                onClick={() => setShowWalletModal(false)}
                className="text-[#8e8e8e] hover:text-white text-xs font-mono px-2 py-1 rounded-full bg-[#28282a] border border-white/10"
              >
                [ESC]
              </button>
            </div>

            <p className="text-xs text-[#8e8e8e] mb-4 leading-relaxed">
              Connect your NEAR testnet account to sign scorecard submissions, guard delegated stake, and interact with on-chain governance proposals.
            </p>

            <div className="space-y-3 mb-5">
              {/* Preset Testnet Delegator */}
              <button
                onClick={() => handleConnect('governance-user.testnet')}
                className="w-full p-3.5 rounded-xl bg-[#28282a] border border-white/15 hover:border-white hover:bg-[#323234] flex items-center justify-between group transition-all"
              >
                <div className="text-left">
                  <div className="font-mono text-xs font-semibold text-white group-hover:text-[#B6F36B] transition-colors">
                    governance-user.testnet
                  </div>
                  <div className="text-[11px] text-[#8e8e8e] font-sans">
                    Pre-configured Testnet Delegator Account
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-[#B6F36B] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              {/* Preset Testnet Oracle Publisher */}
              <button
                onClick={() => handleConnect('turnout-oracle.testnet')}
                className="w-full p-3.5 rounded-xl bg-[#28282a] border border-white/15 hover:border-white hover:bg-[#323234] flex items-center justify-between group transition-all"
              >
                <div className="text-left">
                  <div className="font-mono text-xs font-semibold text-white group-hover:text-[#B6F36B] transition-colors">
                    turnout-oracle.testnet
                  </div>
                  <div className="text-[11px] text-[#8e8e8e] font-sans">
                    Authorized Scorecard Publisher Oracle
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-[#B6F36B] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>

            {/* Custom Account Input */}
            <div className="border-t border-white/10 pt-4">
              <label className="block text-xs font-mono uppercase text-[#8e8e8e] mb-2">
                Or Connect Custom Testnet ID:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="your-account.testnet"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="flex-1 bg-black text-white font-mono text-xs px-3.5 py-2.5 rounded-full border border-white/20 focus:border-white focus:outline-none"
                />
                <button
                  onClick={() => customInput.trim() && handleConnect(customInput.trim())}
                  disabled={!customInput.trim()}
                  className="px-5 py-2.5 rounded-full bg-white text-black text-xs font-sans font-bold hover:bg-neutral-200 disabled:opacity-40 transition-all"
                >
                  Connect
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-[11px] text-[#8e8e8e]">
              <ShieldAlert className="w-3.5 h-3.5 text-[#c4c2c3] shrink-0" />
              <span>Turnout never requests or stores private keys or seed phrases.</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
