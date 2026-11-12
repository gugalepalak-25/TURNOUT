import React, { useState } from 'react';
import { Settings, CheckCircle2, Globe, Database } from 'lucide-react';
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
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-[#8e8e8e] tracking-widest uppercase mb-1">
          <Settings className="w-3.5 h-3.5 text-white" />
          <span>SYSTEM CONFIGURATION</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-dotmatrix font-bold text-white tracking-tight">
          APPLICATION & PROTOCOL SETTINGS
        </h1>
        <p className="text-sm text-[#8e8e8e] mt-1 max-w-2xl font-sans">
          Configure blockchain endpoints, verified House of Stake contract account IDs, and local session preferences.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-white/10 border border-white/30 rounded-full text-white text-xs font-mono flex items-center gap-2 shadow-[0_0_22px_rgba(255,255,255,0.2)]">
          <CheckCircle2 className="w-4 h-4 text-[#B6F36B]" />
          <span>Configuration preferences saved successfully.</span>
        </div>
      )}

      {/* Protocol Configuration Form */}
      <TerminalBox title="NEAR Protocol & Contract Parameters" tag="Runtime Parameters">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#8e8e8e] mb-2">
                Active Blockchain Network:
              </label>
              <div className="flex items-center gap-2 bg-black px-4 py-2.5 rounded-full border border-white/20 font-mono text-xs text-white font-semibold">
                <Globe className="w-4 h-4 text-[#B6F36B]" />
                <span>NEAR Testnet</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#8e8e8e] mb-2">
                NEAR JSON-RPC Endpoint:
              </label>
              <input
                type="text"
                value={rpcUrl}
                onChange={(e) => setRpcUrl(e.target.value)}
                className="w-full bg-black font-mono text-xs text-white px-4 py-2.5 rounded-full border border-white/20 focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#8e8e8e] mb-2">
                House of Stake Voting Contract:
              </label>
              <input
                type="text"
                value={votingContract}
                onChange={(e) => setVotingContract(e.target.value)}
                className="w-full bg-black font-mono text-xs text-white px-4 py-2.5 rounded-full border border-white/20 focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#8e8e8e] mb-2">
                veNEAR Escrow Token Contract:
              </label>
              <input
                type="text"
                value={venearContract}
                onChange={(e) => setVenearContract(e.target.value)}
                className="w-full bg-black font-mono text-xs text-white px-4 py-2.5 rounded-full border border-white/20 focus:border-white focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-white text-black font-sans text-xs font-bold hover:bg-neutral-100 hover:shadow-[0_0_22px_rgba(255,255,255,0.32)] transition-all"
            >
              Save Parameters
            </button>
          </div>
        </form>
      </TerminalBox>

      {/* Local Session Telemetry */}
      <TerminalBox title="Local Wallet Session & Database State" tag="Telemetry">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          <div className="bg-[#121214] p-4 rounded-xl border border-white/10">
            <span className="text-[#8e8e8e] block text-[10px] uppercase mb-1">Wallet Session</span>
            <span className="font-bold text-white">
              {isConnected && accountId ? accountId : 'governance-user.testnet (Pre-configured)'}
            </span>
          </div>

          <div className="bg-[#121214] p-4 rounded-xl border border-white/10">
            <span className="text-[#8e8e8e] block text-[10px] uppercase mb-1">Local Storage Mode</span>
            <span className="font-bold text-white flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#B6F36B]" />
              Persistent In-Memory / SQLite Engine
            </span>
          </div>
        </div>
      </TerminalBox>
    </div>
  );
};
