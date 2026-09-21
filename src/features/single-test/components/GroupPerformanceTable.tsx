import { useState, useMemo } from 'react';
import { SingleTestGroup } from '../../../types/singleTest';
import { num, pct, cmpNat } from '../../../lib/utils';
import { ArrowUpDown } from 'lucide-react';

interface GroupPerformanceTableProps {
  groups: SingleTestGroup[];
  hasNA: boolean;
  onSelectGroup?: (groupKey: string) => void;
}

type SortKey = 'label' | 'registered' | 'n' | 'notAtt' | 'part' | 'avg' | 'passRate' | 'full' | 'below';

export function GroupPerformanceTable({
  groups,
  hasNA,
  onSelectGroup,
}: GroupPerformanceTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('avg');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const sortedGroups = useMemo(() => {
    return [...groups].sort((a, b) => {
      let res = 0;
      if (sortKey === 'label') res = cmpNat(a.label, b.label);
      else if (sortKey === 'registered') res = a.st.registered - b.st.registered;
      else if (sortKey === 'n') res = a.st.n - b.st.n;
      else if (sortKey === 'notAtt') res = a.st.notAtt - b.st.notAtt;
      else if (sortKey === 'part') res = a.st.part - b.st.part;
      else if (sortKey === 'avg') res = a.st.avg - b.st.avg;
      else if (sortKey === 'passRate') res = a.st.passRate - b.st.passRate;
      else if (sortKey === 'full') res = a.st.full - b.st.full;
      else if (sortKey === 'below') res = a.st.below - b.st.below;
      return sortDir === 'asc' ? res : -res;
    });
  }, [groups, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((p) => (p === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs sm:text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-[#1B2A4A] dark:border-slate-700 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <th className="py-2.5 px-3 cursor-pointer select-none" onClick={() => toggleSort('label')}>
              <div className="flex items-center gap-1">
                <span>Group</span>
                <ArrowUpDown className="w-3 h-3 opacity-60" />
              </div>
            </th>
            {hasNA && (
              <th className="py-2.5 px-3 text-right cursor-pointer select-none" onClick={() => toggleSort('registered')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Registered</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
            )}
            <th className="py-2.5 px-3 text-right cursor-pointer select-none" onClick={() => toggleSort('n')}>
              <div className="flex items-center justify-end gap-1">
                <span>Attempted</span>
                <ArrowUpDown className="w-3 h-3 opacity-60" />
              </div>
            </th>
            {hasNA && (
              <th className="py-2.5 px-3 text-right cursor-pointer select-none" onClick={() => toggleSort('notAtt')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Not Attempted</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
            )}
            {hasNA && (
              <th className="py-2.5 px-3 text-right cursor-pointer select-none min-w-[130px]" onClick={() => toggleSort('part')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Participation</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
            )}
            <th className="py-2.5 px-3 text-right cursor-pointer select-none" onClick={() => toggleSort('avg')}>
              <div className="flex items-center justify-end gap-1">
                <span>Average</span>
                <ArrowUpDown className="w-3 h-3 opacity-60" />
              </div>
            </th>
            <th className="py-2.5 px-3 text-right cursor-pointer select-none" onClick={() => toggleSort('passRate')}>
              <div className="flex items-center justify-end gap-1">
                <span>Pass Rate</span>
                <ArrowUpDown className="w-3 h-3 opacity-60" />
              </div>
            </th>
            <th className="py-2.5 px-3 text-right cursor-pointer select-none" onClick={() => toggleSort('full')}>
              <div className="flex items-center justify-end gap-1">
                <span>Full Marks</span>
                <ArrowUpDown className="w-3 h-3 opacity-60" />
              </div>
            </th>
            <th className="py-2.5 px-3 text-right cursor-pointer select-none" onClick={() => toggleSort('below')}>
              <div className="flex items-center justify-end gap-1">
                <span>Below Pass</span>
                <ArrowUpDown className="w-3 h-3 opacity-60" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {sortedGroups.map((g) => (
            <tr
              key={g.key}
              className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
            >
              <td className="py-2 px-3">
                <button
                  type="button"
                  onClick={() => onSelectGroup && onSelectGroup(g.key)}
                  className="font-serif font-semibold text-[#1B2A4A] dark:text-[#7FA7DA] hover:underline"
                >
                  {g.label}
                </button>
              </td>
              {hasNA && (
                <td className="py-2 px-3 text-right font-medium text-slate-700 dark:text-slate-300">
                  {g.st.registered}
                </td>
              )}
              <td className="py-2 px-3 text-right font-medium text-slate-800 dark:text-slate-200">
                {g.st.n}
              </td>
              {hasNA && (
                <td className={`py-2 px-3 text-right font-medium ${g.st.notAtt > 0 ? 'text-[#D9A21B]' : 'text-slate-400'}`}>
                  {g.st.notAtt}
                </td>
              )}
              {hasNA && (
                <td className="py-2 px-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-mono text-xs font-semibold">{pct(g.st.part)}</span>
                    <div className="w-12 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#2F4BD0] h-full rounded-full"
                        style={{ width: `${Math.min(100, g.st.part)}%` }}
                      />
                    </div>
                  </div>
                </td>
              )}
              <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-slate-100 font-mono">
                {num(g.st.avg)}
              </td>
              <td className="py-2 px-3 text-right font-semibold font-mono text-[#0E7C66]">
                {pct(g.st.passRate)}
              </td>
              <td className="py-2 px-3 text-right font-medium text-slate-700 dark:text-slate-300">
                {g.st.full}
              </td>
              <td className={`py-2 px-3 text-right font-medium ${g.st.below > 0 ? 'text-[#C4472D] font-semibold' : 'text-slate-400'}`}>
                {g.st.below}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
