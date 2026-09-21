import React from 'react';
import { fmtPct } from '../../lib/utils';

export interface ProgressBarItem {
  label: string;
  value: number;
  subLabel?: string;
  color?: string;
  onViewStudents?: () => void;
}

interface ProgressBarRowProps {
  items: ProgressBarItem[];
  labelWidth?: string;
  showTicks?: boolean;
}

export function ProgressBarRow({ items, labelWidth = 'w-48 sm:w-64', showTicks = true }: ProgressBarRowProps) {
  const getBarColor = (val: number, customColor?: string) => {
    if (customColor) return customColor;
    if (val >= 70) return '#0E7C66'; // Green
    if (val >= 40) return '#D9A93A'; // Gold
    return '#C4472D'; // Rust red
  };

  return (
    <div className="w-full space-y-3.5">
      {showTicks && (
        <div className="flex items-center text-[10px] text-slate-400 font-mono pl-48 sm:pl-64 pr-16 select-none">
          <div className="flex-1 flex justify-between relative px-0.5">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {items.map((item, idx) => {
        const color = getBarColor(item.value, item.color);
        const safeWidth = Math.max(1, Math.min(100, item.value));

        return (
          <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm">
            {/* Label */}
            <div className={`flex-shrink-0 ${labelWidth} text-right pr-2 font-medium text-slate-700 dark:text-slate-200 truncate`}>
              <span title={item.label}>{item.label}</span>
              {item.subLabel && (
                <span className="block text-[11px] text-slate-400 font-normal truncate">
                  {item.subLabel}
                </span>
              )}
            </div>

            {/* Bar Container */}
            <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-3.5 relative overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${safeWidth}%`,
                  backgroundColor: color,
                }}
              />
            </div>

            {/* Value & Action */}
            <div className="flex-shrink-0 w-16 text-right font-semibold font-mono text-slate-800 dark:text-slate-100">
              {fmtPct(item.value)}
            </div>

            {item.onViewStudents && (
              <button
                onClick={item.onViewStudents}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0"
              >
                View
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
