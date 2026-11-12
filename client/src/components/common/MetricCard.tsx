import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  badge?: string;
  badgeType?: 'default' | 'accent' | 'warning';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  badge,
  badgeType = 'default',
}) => {
  return (
    <div className="bg-[#18181a]/70 backdrop-blur-md border border-white/10 rounded-2xl p-5 transition-all duration-300 hover:border-white/30 hover:bg-[#18181a]/90 hover:shadow-[0_0_22px_rgba(255,255,255,0.12)] group relative overflow-hidden">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs uppercase font-mono tracking-wider text-[#8e8e8e] font-medium flex items-center gap-2">
          {Icon && (
            <div className="w-6 h-6 rounded-full bg-[#28282a] border border-white/15 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
              <Icon className="w-3.5 h-3.5" />
            </div>
          )}
          <span>{title}</span>
        </span>
        {badge && (
          <span
            className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
              badgeType === 'accent'
                ? 'bg-white text-black border-white font-semibold'
                : badgeType === 'warning'
                ? 'bg-[#E6B85C]/20 text-[#E6B85C] border-[#E6B85C]/40'
                : 'bg-[#28282a] text-[#c4c2c3] border-white/20'
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2 my-1">
        <div className="font-dotmatrix text-3xl font-bold text-white tracking-tight group-hover:text-white transition-colors">
          {value}
        </div>
        {trend && (
          <span
            className={`text-xs font-mono font-medium px-2 py-0.5 rounded-full border ${
              trend.isPositive
                ? 'bg-[#B6F36B]/10 text-[#B6F36B] border-[#B6F36B]/30'
                : 'bg-[#E87979]/10 text-[#E87979] border-[#E87979]/30'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <div className="text-xs text-[#8e8e8e] mt-2 font-sans border-t border-white/10 pt-2 flex items-center justify-between">
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
};
