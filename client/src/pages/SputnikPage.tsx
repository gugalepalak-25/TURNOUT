import React from 'react';
import { Layers, ShieldCheck, GitBranch, ExternalLink, ArrowRight } from 'lucide-react';
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
      <div className="border-b border-cr-border pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-cr-muted tracking-widest uppercase mb-1">
          <Layers className="w-3.5 h-3.5 text-cr-secondaryAccent" />
          ECOSYSTEM EXPANSION (PHASE 7)
        </div>
        <h1 className="text-3xl font-heading font-bold text-cr-text tracking-tight">
          Sputnik DAO Directory
        </h1>
        <p className="text-sm text-cr-muted mt-1 max-w-3xl">
          Modular council-governed DAOs on NEAR Protocol. Turnout's architecture is intentionally decoupled so Sputnik policy and multi-sig voting modules plug into the reputation scoring engine without altering House of Stake charter rules.
        </p>
      </div>

      {/* Modular Architecture Callout */}
      <div className="bg-cr-surface border border-cr-borderLight/40 rounded-lg p-5">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-cr-secondaryAccent/10 text-cr-secondaryAccent shrink-0">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-cr-text mb-1">
              Decoupled Adapter Architecture Active
            </h3>
            <p className="text-xs text-cr-muted leading-relaxed max-w-3xl">
              Turnout implements an independent <span className="font-mono text-cr-secondaryAccent">SputnikDaoAdapter</span> interface alongside House of Stake. Per protocol guidelines, House of Stake charter requirements (such as the 80% voting threshold and veNEAR stake weighting) are never conflated with Sputnik DAO council-weighted quorum rules.
            </p>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <TerminalBox
        title="Tracked Sputnik DAO Deployments"
        tag="NEAR Mainnet & Testnet"
        action={
          <span className="text-xs font-mono text-cr-muted">
            Sputnik v2 Factory
          </span>
        }
      >
        <div className="divide-y divide-cr-border/40">
          {sputnikDAOs.map((dao) => (
            <div key={dao.contractId} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <h4 className="font-heading font-bold text-sm text-cr-text">
                    {dao.name}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cr-bgSecondary text-cr-muted border border-cr-border">
                    {dao.status}
                  </span>
                </div>
                <div className="font-mono text-xs text-cr-muted mb-1">
                  <MonospaceAddress value={dao.contractId} type="account" truncate={false} />
                </div>
                <p className="text-xs text-cr-muted max-w-xl font-sans">
                  {dao.purpose}
                </p>
              </div>

              <div className="flex items-center gap-6 text-xs font-mono">
                <div>
                  <span className="text-cr-muted block text-[10px] uppercase">Council</span>
                  <span className="text-cr-text font-bold">{dao.members} Members</span>
                </div>
                <div>
                  <span className="text-cr-muted block text-[10px] uppercase">Proposals</span>
                  <span className="text-cr-secondaryAccent font-bold">{dao.proposals}</span>
                </div>
                <a
                  href={`https://testnet.nearblocks.io/address/${dao.contractId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded bg-cr-surface border border-cr-border hover:border-cr-secondaryAccent text-cr-text hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>Explorer</span>
                  <ExternalLink className="w-3 h-3 text-cr-secondaryAccent" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </TerminalBox>
    </div>
  );
};

