import React from 'react';
import { Layers, GitBranch } from 'lucide-react';
import { TerminalBox } from '../components/common/TerminalBox.js';
import { MonospaceAddress } from '../components/common/MonospaceAddress.js';

export const SputnikPage: React.FC = () => {
  const sputnikDAOs = [
    {
      name: 'Developer Governance DAO',
      contractId: 'dev-gov.sputnik-v2.near',
      members: 12,
      proposals: 148,
      status: 'Active',
      purpose: 'Technical grants and core infrastructure engineering reviews.',
    },
    {
      name: 'NEAR Digital Collective (NDC) Grassroots',
      contractId: 'grassroots.sputnik-v2.near',
      members: 24,
      proposals: 320,
      status: 'Active',
      purpose: 'Regional hubs, ecosystem education, and community advocacy initiatives.',
    },
    {
      name: 'Marketing & Ecosystem DAO',
      contractId: 'marketing.sputnik-v2.near',
      members: 8,
      proposals: 94,
      status: 'Active',
      purpose: 'Strategic brand initiatives, event sponsorships, and media partnerships.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-[#8e8e8e] tracking-widest uppercase mb-1">
          <Layers className="w-3.5 h-3.5 text-white" />
          <span>ECOSYSTEM EXPANSION (PHASE 7)</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-dotmatrix font-bold text-white tracking-tight">
          SPUTNIK DAO DIRECTORY
        </h1>
        <p className="text-sm text-[#8e8e8e] mt-1 max-w-3xl font-sans">
          Modular council-governed DAOs on NEAR Protocol. Turnout's architecture is intentionally decoupled so Sputnik policy and multi-sig voting modules plug into the reputation scoring engine without altering House of Stake charter rules.
        </p>
      </div>

      {/* Modular Architecture Callout */}
      <div className="bg-[#18181a]/70 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-[0_4px_14px_rgba(0,0,0,0.16)]">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shrink-0">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-white mb-1">
              Decoupled Adapter Architecture Active
            </h3>
            <p className="text-xs text-[#8e8e8e] leading-relaxed max-w-3xl font-sans">
              Turnout implements an independent <span className="font-mono text-white">SputnikDaoAdapter</span> interface alongside House of Stake. Per protocol guidelines, House of Stake charter requirements (such as the 80% voting threshold and veNEAR stake weighting) are never conflated with Sputnik DAO council-weighted quorum rules.
            </p>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <TerminalBox
        title="Tracked Sputnik DAO Deployments"
        tag="NEAR Mainnet & Testnet"
        action={
          <span className="text-xs font-mono text-[#8e8e8e]">
            Sputnik v2 Factory
          </span>
        }
      >
        <div className="divide-y divide-white/5">
          {sputnikDAOs.map((dao) => (
            <div key={dao.contractId} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <h4 className="font-heading font-bold text-sm text-white">
                    {dao.name}
                  </h4>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
                    {dao.status}
                  </span>
                </div>
                <div className="font-mono text-xs text-[#8e8e8e] mb-1">
                  <MonospaceAddress value={dao.contractId} type="account" truncate={false} />
                </div>
                <p className="text-xs text-[#8e8e8e] max-w-xl font-sans">
                  {dao.purpose}
                </p>
              </div>

              <div className="flex items-center gap-6 text-xs font-mono">
                <div>
                  <span className="text-[#8e8e8e] block text-[10px] uppercase">Council</span>
                  <span className="text-white font-bold">{dao.members} Members</span>
                </div>
                <div>
                  <span className="text-[#8e8e8e] block text-[10px] uppercase">Proposals</span>
                  <span className="text-white font-bold font-dotmatrix text-base">{dao.proposals}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </TerminalBox>
    </div>
  );
};
