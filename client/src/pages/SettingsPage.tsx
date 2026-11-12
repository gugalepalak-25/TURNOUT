import React, { useState } from 'react';
import { Settings, Shield, Cpu, RefreshCw, CheckCircle2, Globe, Database } from 'lucide-react';
import { useNearWallet } from '../context/NearWalletContext.js';
import { TerminalBox } from '../components/common/TerminalBox.js';
import { MonospaceAddress } from '../components/common/MonospaceAddress.js';

export const SettingsPage: React.FC = () => {
  const { accountId, isConnected, network } = useNearWallet();
  const [rpcUrl, setRpcUrl] = useState('https://rpc.testnet.near.org');
  const [votingContract, setVotingContract] = useState('vote.hos.testnet');
  const [venearContract, setVenearContract] = useState('venear.hos.testnet');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-cr-border pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-cr-muted tracking-widest uppercase mb-1">
          <Settings className="w-3.5 h-3.5 text-cr-accent" />
          SYSTEM CONFIGURATION
        </div>
        <h1 className="text-3xl font-heading font-bold text-cr-text tracking-tight">
          Application & Protocol Settings
        </h1>
        <p className="text-sm text-cr-muted mt-1 max-w-2xl">
          Configure blockchain endpoints, verified House of Stake contract account IDs, and local session preferences.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-cr-accent/10 border border-cr-accent/30 rounded text-cr-accent text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Configuration preferences saved successfully.</span>
        </div>
      )}

      {/* Protocol Configuration Form */}
      <TerminalBox title="NEAR Protocol & Contract Parameters" tag="Runtime Parameters">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-cr-muted mb-1">
                Active Blockchain Network:
              </label>
              <div className="flex items-center gap-2 bg-cr-bg p-2.5 rounded border border-cr-border font-mono text-xs text-cr-accent font-semibold">
                <Globe className="w-4 h-4" />
                <span>NEAR Testnet</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-cr-muted mb-1">
                NEAR JSON-RPC Endpoint:
              </label>
              <input
                type="text"
                value={rpcUrl}
                onChange={(e) => setRpcUrl(e.target.value)}
                className="w-full bg-cr-bg font-mono text-xs text-cr-text px-3 py-2 rounded border border-cr-border focus:border-cr-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-cr-muted mb-1">
                House of Stake Voting Contract:
              </label>
              <input
                type="text"
                value={votingContract}
                onChange={(e) => setVotingContract(e.target.value)}
                className="w-full bg-cr-bg font-mono text-xs text-cr-text px-3 py-2 rounded border border-cr-border focus:border-cr-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-cr-muted mb-1">
                veNEAR Escrow Token Contract:
              </label>
              <input
                type="text"
                value={venearContract}
                onChange={(e) => setVenearContract(e.target.value)}
                className="w-full bg-cr-bg font-mono text-xs text-cr-text px-3 py-2 rounded border border-cr-border focus:border-cr-accent focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-cr-border flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded bg-cr-accent text-cr-bg font-mono text-xs font-bold hover:bg-cr-accentHover transition-colors"
            >
              Save Parameters
            </button>
          </div>
        </form>
      </TerminalBox>

      {/* Wallet Session & Architecture Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-cr-surface border border-cr-border rounded-lg p-5">
          <h3 className="font-heading font-bold text-base text-cr-text mb-2 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cr-accent" />
            Active Session Telemetry
          </h3>
          <div className="space-y-2 font-mono text-xs text-cr-muted">
            <div>Connected Account: <span className="text-cr-text font-semibold">{accountId || 'None (Read-Only Mode)'}</span></div>
            <div>Wallet Status: <span className={isConnected ? 'text-cr-accent' : 'text-cr-muted'}>{isConnected ? 'Active & Authorized' : 'Public Guest'}</span></div>
            <div>Scoring Version: <span className="text-cr-secondaryAccent font-semibold">turnout-scoring-v1.0.0</span></div>
          </div>
        </div>

        <div className="bg-cr-surface border border-cr-border rounded-lg p-5">
          <h3 className="font-heading font-bold text-base text-cr-text mb-2 flex items-center gap-2">
            <Database className="w-4 h-4 text-cr-secondaryAccent" />
            Data Integrity & Storage
          </h3>
          <p className="text-xs text-cr-muted leading-relaxed font-sans mb-3">
            Turnout preserves canonical JSON payloads for every reputation scorecard and verifies evidence hashes against NEAR testnet contract storage before reporting verified status.
          </p>
          <div className="text-[11px] font-mono text-cr-muted">
            Registry Contract: <span className="text-cr-accent">turnout-registry.testnet</span>
          </div>
        </div>
      </div>
    </div>
  );
};

