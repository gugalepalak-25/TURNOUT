import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'proposal' | 'explanation' | 'network';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'proposal' }) => {
  let color = 'bg-cr-surface text-cr-muted border-cr-border';

  const s = status.toLowerCase();

  if (s === 'verified' || s === 'succeeded' || s === 'executed' || s === 'active' || s === 'live_rpc') {
    color = 'bg-cr-accent/10 text-cr-accent border-cr-accent/30';
  } else if (s === 'voting' || s === 'inprogress' || s === 'scheduled') {
    color = 'bg-cr-secondaryAccent/10 text-cr-secondaryAccent border-cr-secondaryAccent/30';
  } else if (s === 'ambiguous' || s === 'timelock' || s === 'queued' || s === 'indexed_snapshot') {
    color = 'bg-cr-warning/10 text-cr-warning border-cr-warning/30';
  } else if (s === 'defeated' || s === 'rejected' || s === 'expired' || s === 'failed') {
    color = 'bg-cr-critical/10 text-cr-critical border-cr-critical/30';
  } else if (s === 'notfound' || s === 'unverified') {
    color = 'bg-cr-muted/10 text-cr-muted border-cr-muted/30';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono tracking-wide uppercase border ${color}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
};

