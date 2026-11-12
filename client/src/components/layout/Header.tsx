import React, { useState } from 'react';
import { Menu, Wallet, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';
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
      <header className="h-16 bg-cr-bgSecondary/90 backdrop-blur-md border-b border-cr-border px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 text-cr-muted hover:text-white rounded-md bg-cr-surface border border-cr-border"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase text-cr-muted tracking-wider hidden sm:inline">
              SYS-STATUS:
            </span>
            {/* Blockchain sync indicator */}
            <div
              className={`inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs font-mono border ${
                isLive
                  ? 'bg-cr-accent/10 text-cr-accent border-cr-accent/30'
                  : 'bg-cr-secondaryAccent/10 text-cr-secondaryAccent border-cr-secondaryAccent/30'
              }`}
              title={
                isLive
                  ? 'Connected directly to NEAR RPC'
                  : 'RPC network offline/isolated; served by verified indexed snapshot'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isLive ? 'bg-cr-accent animate-pulse-subtle' : 'bg-cr-secondaryAccent'
                }`}
              />
              <span className="font-semibold tracking-wide">
                {isLive ? 'LIVE RPC' : 'INDEXED SNAPSHOT'}
              </span>
              <span className="text-cr-muted text-[10px] hidden md:inline">
                | Block #{blockchainStatus?.lastSyncBlock || 174829103}
              </span>
            </div>
          </div>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-3">
          {/* Network tag */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-cr-surface border border-cr-border text-xs font-mono text-cr-muted">
            <Cpu className="w-3.5 h-3.5 text-cr-accent" />
            <span>NEAR TESTNET</span>
          </div>

          {/* Wallet Connection */}
          {isConnected && accountId ? (
            <div className="flex items-center gap-2">
              <MonospaceAddress value={accountId} type="account" linkToExplorer={true} />
              <button
                onClick={disconnect}
                className="text-xs font-mono text-cr-muted hover:text-cr-critical px-2 py-1 rounded border border-cr-border hover:border-cr-critical/40 transition-colors"
                title="Disconnect wallet"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowWalletModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-mono font-semibold bg-cr-accent text-cr-bg hover:bg-cr-accentHover transition-colors shadow-sm"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </header>

      {/* Wallet Connection Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-cr-surface border border-cr-border rounded-lg max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-cr-border mb-5">
              <div className="flex items-center gap-2.5">
                <Wallet className="w-5 h-5 text-cr-accent" />
                <h3 className="font-heading font-bold text-lg text-cr-text">Connect NEAR Wallet</h3>
              </div>
              <button
                onClick={() => setShowWalletModal(false)}
                className="text-cr-muted hover:text-white text-sm font-mono"
              >
                [ESC]
              </button>
            </div>

            <p className="text-xs text-cr-muted mb-4 leading-relaxed">
              Connect your NEAR testnet account to sign scorecard submissions, guard delegated stake, and interact with on-chain governance proposals.
            </p>

            <div className="space-y-3 mb-5">
              {/* Preset Testnet Delegator */}
              <button
                onClick={() => handleConnect('governance-user.testnet')}
                className="w-full p-3.5 rounded bg-cr-bgSecondary border border-cr-border hover:border-cr-accent flex items-center justify-between group transition-all"
              >
                <div className="text-left">
                  <div className="font-mono text-xs font-semibold text-cr-text group-hover:text-cr-accent">
                    governance-user.testnet
                  </div>
                  <div className="text-[11px] text-cr-muted font-sans">
                    Pre-configured Testnet Delegator Account
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-cr-accent opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              {/* Preset Testnet Oracle Publisher */}
              <button
                onClick={() => handleConnect('turnout-oracle.testnet')}
                className="w-full p-3.5 rounded bg-cr-bgSecondary border border-cr-border hover:border-cr-accent flex items-center justify-between group transition-all"
              >
                <div className="text-left">
                  <div className="font-mono text-xs font-semibold text-cr-text group-hover:text-cr-accent">
                    turnout-oracle.testnet
                  </div>
                  <div className="text-[11px] text-cr-muted font-sans">
                    Authorized Scorecard Publisher Oracle
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-cr-accent opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>

            {/* Custom Account Input */}
            <div className="border-t border-cr-border pt-4">
              <label className="block text-xs font-mono uppercase text-cr-muted mb-1.5">
                Or Connect Custom Testnet ID:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="your-account.testnet"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="flex-1 bg-cr-bg text-cr-text font-mono text-xs px-3 py-2 rounded border border-cr-border focus:border-cr-accent focus:outline-none"
                />
                <button
                  onClick={() => customInput.trim() && handleConnect(customInput.trim())}
                  disabled={!customInput.trim()}
                  className="px-3.5 py-2 rounded bg-cr-accent text-cr-bg text-xs font-mono font-bold hover:bg-cr-accentHover disabled:opacity-40"
                >
                  Connect
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-cr-border flex items-center gap-2 text-[11px] text-cr-muted">
              <ShieldAlert className="w-3.5 h-3.5 text-cr-secondaryAccent shrink-0" />
              <span>Turnout never requests or stores private keys or seed phrases.</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

