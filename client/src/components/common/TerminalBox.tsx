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
    <div className={`bg-cr-surface border border-cr-border rounded-lg overflow-hidden ${className}`}>
      {/* Terminal Title Bar */}
      <div className="bg-cr-bgSecondary px-4 py-2.5 border-b border-cr-border flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-cr-accent/80 animate-pulse-subtle" />
          <span className="font-heading text-xs font-semibold uppercase tracking-wider text-cr-text">
            {title}
          </span>
          {tag && (
            <span className="text-[10px] font-mono uppercase bg-cr-surface text-cr-muted px-1.5 py-0.5 rounded border border-cr-border">
              {tag}
            </span>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>

      <div className="p-4">{children}</div>
    </div>
  );
};

