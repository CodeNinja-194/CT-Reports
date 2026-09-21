import React from 'react';
import { LucideIcon, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onLoadSample?: () => void;
  sampleButtonText?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  onLoadSample,
  sampleButtonText = 'Load Sample Cohort Data',
  children,
}: EmptyStateProps) {
  return (
    <div className="max-w-xl mx-auto my-12 text-center px-4">
      <div className="bg-white dark:bg-[#141E2C] border border-slate-200 dark:border-slate-800 rounded-xl p-8 sm:p-10 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-[#B8860F]/30 flex items-center justify-center mx-auto mb-4 text-[#1B2A4A] dark:text-[#D9A93A]">
          <Icon className="w-7 h-7 text-[#1B2A4A] dark:text-[#D9A93A]" />
        </div>

        <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {title}
        </h3>

        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed mb-6">
          {description}
        </p>

        {children}

        {onLoadSample && (
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80">
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
              Want to see this report without uploading files right now?
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadSample}
              className="border-[#B8860F]/40 text-[#B8860F] hover:bg-[#B8860F]/10 dark:text-[#D9A93A]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D9A93A]" />
              {sampleButtonText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
