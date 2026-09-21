import React from 'react';
import { ScoreBin } from '../../types/singleTest';
import { num } from '../../lib/utils';

export interface HistogramChartProps {
  bins: ScoreBin[];
  passMark: number;
  totalMax?: number;
  title?: string;
  subtitle?: string;
}

export function HistogramChart({
  bins,
  passMark,
  totalMax,
  title = 'How scores are spread',
  subtitle = 'Number of students at each score. Green bars are at or above the pass mark.',
}: HistogramChartProps) {
  if (!bins || bins.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-slate-400">
        No score distribution data available.
      </div>
    );
  }

  const W = 720;
  const H = 240;
  const padL = 12;
  const padR = 12;
  const top = 32;
  const bottom = 26;

  const maxCount = Math.max(1, ...bins.map((b) => b.count));
  const bw = (W - padL - padR) / bins.length;
  const ch = H - top - bottom;

  const passIndex = bins.findIndex((b) => b.lo >= passMark);
  const passLineX = passIndex >= 0 ? padL + passIndex * bw : -1;

  return (
    <div className="w-full">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      )}

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto min-w-[540px] select-none"
          role="img"
          aria-label="Score distribution of students"
        >
          {/* Grid lines and Bars */}
          {bins.map((b, i) => {
            const h = Math.max(b.count ? 3 : 0, (b.count / maxCount) * ch);
            const x = padL + i * bw + 3;
            const y = H - bottom - h;
            const isPass = b.lo >= passMark;
            const fill = isPass ? '#0E7C66' : '#C4472D';

            return (
              <g key={i} className="group cursor-pointer">
                <title>{`${b.label} marks: ${b.count} students`}</title>
                <rect
                  x={x}
                  y={y}
                  width={Math.max(1, bw - 6)}
                  height={h}
                  rx={2.5}
                  fill={fill}
                  className="transition-opacity duration-150 hover:opacity-85"
                />
                {b.count > 0 && (
                  <text
                    x={x + (bw - 6) / 2}
                    y={y - 5}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={600}
                    className="fill-slate-800 dark:fill-slate-100"
                  >
                    {b.count}
                  </text>
                )}
                <text
                  x={x + (bw - 6) / 2}
                  y={H - 8}
                  textAnchor="middle"
                  fontSize={10}
                  className="fill-slate-500 dark:fill-slate-400"
                >
                  {b.label}
                </text>
              </g>
            );
          })}

          {/* Pass mark dashed line */}
          {passLineX > 0 && (
            <g>
              <line
                x1={passLineX}
                x2={passLineX}
                y1={14}
                y2={H - bottom}
                stroke="#1B2A4A"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                className="dark:stroke-[#7FA7DA]"
              />
              <text
                x={Math.min(passLineX + 5, W - 90)}
                y={22}
                fontSize={11}
                fontWeight={600}
                className="fill-[#1B2A4A] dark:fill-[#7FA7DA]"
              >
                Pass mark {num(passMark)}
              </text>
            </g>
          )}

          {/* Base horizontal axis */}
          <line
            x1={padL}
            x2={W - padR}
            y1={H - bottom}
            y2={H - bottom}
            stroke="#CBD5E1"
            strokeWidth={1}
            className="dark:stroke-slate-700"
          />
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#0E7C66]" />
            <span>Passed (≥ {num(passMark)})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#C4472D]" />
            <span>Below pass (&lt; {num(passMark)})</span>
          </div>
        </div>
        <div>
          <span>Total Max Marks: <strong>{totalMax ? num(totalMax) : '-'}</strong></span>
        </div>
      </div>
    </div>
  );
}
