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
    <div className="bg-cr-surface border border-cr-border rounded-lg p-5 transition-all duration-200 hover:border-cr-borderLight hover:bg-cr-surfaceHover/80 group">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs uppercase font-mono tracking-wider text-cr-muted font-medium flex items-center gap-2">
          {Icon && <Icon className="w-3.5 h-3.5 text-cr-secondaryAccent opacity-70 group-hover:opacity-100 transition-opacity" />}
          {title}
        </span>
        {badge && (
          <span
            className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${
              badgeType === 'accent'
                ? 'bg-cr-accent/10 text-cr-accent border-cr-accent/30'
                : badgeType === 'warning'
                ? 'bg-cr-warning/10 text-cr-warning border-cr-warning/30'
                : 'bg-cr-bgSecondary text-cr-muted border-cr-border'
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="font-heading text-3xl font-bold text-cr-text tracking-tight group-hover:text-white transition-colors">
          {value}
        </div>
        {trend && (
          <span
            className={`text-xs font-mono font-medium ${
              trend.isPositive ? 'text-cr-accent' : 'text-cr-critical'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <div className="text-xs text-cr-muted mt-2 font-sans border-t border-cr-border/40 pt-2 flex items-center justify-between">
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
};

