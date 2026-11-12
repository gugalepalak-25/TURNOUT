import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 42, showText = true }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Circular white logo button matching the exact theme spec */}
      <div
        className="relative shrink-0 rounded-full bg-white flex items-center justify-center transition-transform duration-300 hover:scale-105 shadow-[0_4px_14px_rgba(0,0,0,0.16)]"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <img
          src="/assets/logo.webp"
          alt=""
          width="52"
          height="52"
          className="w-[72%] h-[72%] object-contain block select-none pointer-events-none"
          onError={(e) => {
            // Fallback if image path has issue
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        {/* Crisp vector fallback symbol if image is unavailable */}
        <svg
          className="w-[72%] h-[72%] absolute inset-0 m-auto pointer-events-none"
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 22V15C9 10 13 6 18 6C23 6 27 10 27 15V22"
            stroke="#111111"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="18" cy="18" r="3" fill="#111111" />
          <circle cx="10" cy="27" r="2.5" fill="#111111" />
          <circle cx="18" cy="27" r="2.5" fill="#111111" />
          <circle cx="26" cy="27" r="2.5" fill="#111111" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-dotmatrix text-lg font-bold tracking-tight text-white leading-tight">
            TURNOUT<span className="text-[#B6F36B]">.</span>
          </span>
          <span className="text-[9px] uppercase tracking-widest text-[#8e8e8e] font-mono -mt-0.5">
            GOVERNANCE LAYER
          </span>
        </div>
      )}
    </div>
  );
};
