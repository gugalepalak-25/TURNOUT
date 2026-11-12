import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 32, showText = true }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Turnout Brand Symbol: Signal Arc & Civic Stake Alignment */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105"
      >
        <rect width="36" height="36" rx="8" fill="#17221C" stroke="#304238" strokeWidth="1.5" />
        {/* Collective voting base */}
        <circle cx="10" cy="25" r="2.2" fill="#66CDAA" />
        <circle cx="18" cy="25" r="2.2" fill="#B6F36B" />
        <circle cx="26" cy="25" r="2.2" fill="#66CDAA" />
        {/* Signal & accountability antenna arc */}
        <path
          d="M10 20V15.5C10 11.91 13.58 9 18 9C22.42 9 26 11.91 26 15.5V20"
          stroke="#B6F36B"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <line x1="18" y1="9" x2="18" y2="18" stroke="#B6F36B" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="18" cy="18" r="2" fill="#B6F36B" />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className="font-heading text-lg font-bold tracking-tight text-cr-text leading-tight">
            TURNOUT<span className="text-cr-accent">.</span>
          </span>
          <span className="text-[9px] uppercase tracking-widest text-cr-muted font-mono -mt-0.5">
            GOVERNANCE LAYER
          </span>
        </div>
      )}
    </div>
  );
};

