import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'navy' | 'outline' | 'slate';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const base = 'inline-flex items-center font-medium rounded-full transition-colors whitespace-nowrap';

  const variants = {
    default: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    success: 'bg-[#E6F6F1] text-[#0E7C66] dark:bg-[#12332B] dark:text-[#3CC3A3] border border-[#0E7C66]/20',
    warning: 'bg-[#FEF8E7] text-[#B8860F] dark:bg-[#302613] dark:text-[#E9B14F] border border-[#B8860F]/20',
    danger: 'bg-[#FDF0ED] text-[#C4472D] dark:bg-[#381912] dark:text-[#F0805F] border border-[#C4472D]/20',
    navy: 'bg-[#1B2A4A]/10 text-[#1B2A4A] dark:bg-[#7FA7DA]/15 dark:text-[#7FA7DA] border border-[#1B2A4A]/20',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    outline: 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
  };

  return (
    <span className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}
