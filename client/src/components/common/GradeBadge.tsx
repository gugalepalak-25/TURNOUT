import React from 'react';
import { PerformanceGrade } from '../../types.js';

interface GradeBadgeProps {
  grade: PerformanceGrade;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const GradeBadge: React.FC<GradeBadgeProps> = ({
  grade,
  size = 'md',
  showLabel = false,
}) => {
  const gradeStyles: Record<
    PerformanceGrade,
    { bg: string; text: string; border: string; label: string }
  > = {
    A: {
      bg: 'bg-[#B6F36B]/10',
      text: 'text-[#B6F36B]',
      border: 'border-[#B6F36B]/40',
      label: 'Exemplary',
    },
    B: {
      bg: 'bg-[#66CDAA]/10',
      text: 'text-[#66CDAA]',
      border: 'border-[#66CDAA]/40',
      label: 'Commendable',
    },
    C: {
      bg: 'bg-[#E6B85C]/10',
      text: 'text-[#E6B85C]',
      border: 'border-[#E6B85C]/40',
      label: 'Adequate',
    },
    D: {
      bg: 'bg-orange-500/10',
      text: 'text-orange-400',
      border: 'border-orange-500/40',
      label: 'At Risk',
    },
    F: {
      bg: 'bg-[#E87979]/10',
      text: 'text-[#E87979]',
      border: 'border-[#E87979]/40',
      label: 'Deficient',
    },
  };

  const current = gradeStyles[grade] || gradeStyles.F;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 font-bold',
    md: 'text-sm px-2.5 py-1 font-bold',
    lg: 'text-lg px-3.5 py-1.5 font-extrabold',
  }[size];

  return (
    <div className="inline-flex items-center gap-1.5 font-mono">
      <span
        className={`inline-flex items-center justify-center rounded border ${current.bg} ${current.text} ${current.border} ${sizeClasses}`}
      >
        {grade}
      </span>
      {showLabel && (
        <span className="text-xs text-cr-muted uppercase tracking-wider font-sans font-medium">
          {current.label}
        </span>
      )}
    </div>
  );
};

