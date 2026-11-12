import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'proposal' | 'explanation' | 'network';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'proposal' }) => {
  let color = 'bg-[#28282a] text-[#8e8e8e] border-white/10';

  const s = status.toLowerCase();

  if (s === 'verified' || s === 'succeeded' || s === 'executed' || s === 'active' || s === 'live_rpc') {
    color = 'bg-white/10 text-white border-white/30 shadow-[0_0_10px_rgba(255,255,255,0.15)]';
  } else if (s === 'voting' || s === 'inprogress' || s === 'scheduled') {
    color = 'bg-[#B6F36B]/10 text-[#B6F36B] border-[#B6F36B]/30';
  } else if (s === 'ambiguous' || s === 'timelock' || s === 'queued' || s === 'indexed_snapshot') {
    color = 'bg-[#E6B85C]/10 text-[#E6B85C] border-[#E6B85C]/30';
  } else if (s === 'defeated' || s === 'rejected' || s === 'expired' || s === 'failed') {
    color = 'bg-[#E87979]/10 text-[#E87979] border-[#E87979]/30';
  } else if (s === 'notfound' || s === 'unverified') {
    color = 'bg-[#28282a] text-[#8e8e8e] border-white/15';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono tracking-wide uppercase border backdrop-blur-sm ${color}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-90 shadow-[0_0_6px_currentColor]" />
      {status}
    </span>
  );
};
