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
      bg: 'bg-white/10',
      text: 'text-white',
      border: 'border-white/40 shadow-[0_0_12px_rgba(255,255,255,0.25)]',
      label: 'Exemplary',
    },
    B: {
      bg: 'bg-[#B6F36B]/10',
      text: 'text-[#B6F36B]',
      border: 'border-[#B6F36B]/40',
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
    sm: 'text-xs px-2 py-0.5 font-bold',
    md: 'text-sm px-3 py-1 font-bold',
    lg: 'text-lg px-4 py-1.5 font-extrabold',
  }[size];

  return (
    <div className="inline-flex items-center gap-2">
      <span
        className={`inline-flex items-center justify-center rounded-full border ${current.bg} ${current.text} ${current.border} ${sizeClasses} font-dotmatrix`}
      >
        {grade}
      </span>
      {showLabel && (
        <span className="text-xs text-[#8e8e8e] uppercase tracking-wider font-sans font-medium">
          {current.label}
        </span>
      )}
    </div>
  );
};
