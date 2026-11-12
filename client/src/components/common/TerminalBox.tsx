import React, { ReactNode } from 'react';

interface TerminalBoxProps {
  title: string;
  tag?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const TerminalBox: React.FC<TerminalBoxProps> = ({
  title,
  tag,
  action,
  children,
  className = '',
}) => {
  return (
    <div className={`bg-[#18181a]/70 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-[0_4px_14px_rgba(0,0,0,0.16)] transition-all hover:border-white/20 ${className}`}>
      {/* Terminal Title Bar */}
      <div className="bg-[#121214]/90 px-5 py-3.5 border-b border-white/10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_white] animate-pulse-subtle" />
          <span className="font-heading text-xs font-semibold uppercase tracking-wider text-white">
            {title}
          </span>
          {tag && (
            <span className="text-[10px] font-mono uppercase bg-[#28282a] text-[#c4c2c3] px-2.5 py-0.5 rounded-full border border-white/20">
              {tag}
            </span>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>

      <div className="p-5">{children}</div>
    </div>
  );
};
