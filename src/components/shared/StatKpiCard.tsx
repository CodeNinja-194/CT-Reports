import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface StatKpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  accentColor?: string;
  trend?: 'good' | 'bad' | 'neutral' | 'warn';
  onClick?: () => void;
  className?: string;
}

export function StatKpiCard({
  icon: Icon,
  label,
  value,
  sub,
  accentColor = '#1B2A4A',
  trend,
  onClick,
  className,
}: StatKpiCardProps) {
  const trendClasses = {
    good: 'border-l-[#0E7C66]',
    bad: 'border-l-[#C4472D]',
    warn: 'border-l-[#D9A21B]',
    neutral: 'border-l-slate-300 dark:border-l-slate-700',
  };

  return (
    <div
      onClick={onClick}
      style={{ borderLeftColor: trend ? undefined : accentColor }}
      className={cn(
        'bg-white dark:bg-[#141E2C] border border-slate-200 dark:border-slate-800 rounded-lg p-4 sm:p-5 shadow-sm transition-all duration-150',
        'border-l-4 flex flex-col justify-between min-w-[150px]',
        trend && trendClasses[trend],
        onClick && 'cursor-pointer hover:shadow-md hover:translate-y-[-1px]',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 text-slate-500 dark:text-slate-400">
        <span className="text-xs font-semibold tracking-wider uppercase">{label}</span>
        <div className="p-1.5 rounded bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="mt-3">
        <div className="font-serif text-2xl sm:text-3xl font-bold text-[#1B2A4A] dark:text-[#E2E8F0] tracking-tight">
          {value}
        </div>
        {sub && (
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}
