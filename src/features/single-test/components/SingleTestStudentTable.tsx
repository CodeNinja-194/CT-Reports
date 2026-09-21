import { useState, useMemo } from 'react';
import { AttemptedRecord, NotAttemptedRecord } from '../../../types/singleTest';
import { num, groupLabel, cmpNat } from '../../../lib/utils';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Search } from 'lucide-react';

interface SingleTestStudentTableProps {
  att: AttemptedRecord[];
  na: NotAttemptedRecord[];
  max: number;
  pass: number;
  selectedGroupFilter?: string;
}

interface StudentRowItem {
  id: string;
  name: string;
  group: string;
  score: number | null;
  status: 'Passed' | 'Below pass' | 'Not attempted';
}

export function SingleTestStudentTable({
  att,
  na,
  max,
  pass,
  selectedGroupFilter = '',
}: SingleTestStudentTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(selectedGroupFilter);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'Passed' | 'Below pass' | 'Not attempted'>('all');
  const [limit, setLimit] = useState(50);

  // Combine rows
  const allRows: StudentRowItem[] = useMemo(() => {
    const list: StudentRowItem[] = att.map((a) => ({
      id: a.id,
      name: a.name,
      group: a.group,
      score: a.score,
      status: a.score >= pass ? 'Passed' : 'Below pass',
    }));

    na.forEach((a) => {
      list.push({
        id: a.id,
        name: a.name,
        group: a.group,
        score: null,
        status: 'Not attempted',
      });
    });

    return list.sort((a, b) => cmpNat(a.group, b.group) || cmpNat(a.name, b.name));
  }, [att, na, pass]);

  // Unique groups list
  const groups = useMemo(() => {
    const set = new Set(allRows.map((r) => r.group).filter(Boolean));
    return Array.from(set).sort(cmpNat);
  }, [allRows]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return allRows.filter((r) => {
      const matchSearch = !q || r.id.toLowerCase().includes(q) || r.name.toLowerCase().includes(q);
      const matchGroup = !selectedGroup || r.group === selectedGroup;
      const matchStatus = selectedStatus === 'all' || r.status === selectedStatus;
      return matchSearch && matchGroup && matchStatus;
    });
  }, [allRows, searchTerm, selectedGroup, selectedStatus]);

  const visibleRows = useMemo(() => {
    return filteredRows.slice(0, limit);
  }, [filteredRows, limit]);

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Input
            placeholder="Search by student name or member ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <Select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
        >
          <option value="">All Groups ({groups.length})</option>
          {groups.map((g) => (
            <option key={g} value={g}>
              {groupLabel(g)}
            </option>
          ))}
        </Select>

        <Select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as any)}
        >
          <option value="all">All Results</option>
          <option value="Passed">Passed (≥ {pass})</option>
          <option value="Below pass">Below Pass (&lt; {pass})</option>
          {na.length > 0 && <option value="Not attempted">Not Attempted</option>}
        </Select>
      </div>

      <div className="text-xs text-slate-500 font-medium">
        Showing {visibleRows.length} of {filteredRows.length} students match filters.
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#141E2C] shadow-sm">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-2.5 px-3">Member ID</th>
              <th className="py-2.5 px-3">Student Name</th>
              <th className="py-2.5 px-3">Group</th>
              <th className="py-2.5 px-3 text-right">Score</th>
              <th className="py-2.5 px-3 text-center">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                  No students match your query.
                </td>
              </tr>
            ) : (
              visibleRows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2 px-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                    {r.id}
                  </td>
                  <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-100">
                    {r.name}
                  </td>
                  <td className="py-2 px-3">
                    <span className="font-serif text-xs font-medium text-[#1B2A4A] dark:text-[#7FA7DA] bg-[#EAF3F8] dark:bg-[#1E2E44] border border-[#C7DFEA] dark:border-[#2D4566] px-2 py-0.5 rounded">
                      {groupLabel(r.group)}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold">
                    {r.score === null ? (
                      <span className="text-slate-400 font-normal">—</span>
                    ) : (
                      <span
                        className={
                          r.score >= pass ? 'text-[#0E7C66]' : 'text-[#C4472D]'
                        }
                      >
                        {num(r.score)}/{num(max)}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {r.status === 'Passed' ? (
                      <Badge variant="success" size="sm">
                        Passed
                      </Badge>
                    ) : r.status === 'Below pass' ? (
                      <Badge variant="danger" size="sm">
                        Below Pass
                      </Badge>
                    ) : (
                      <Badge variant="slate" size="sm">
                        Not Attempted
                      </Badge>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Load More Button */}
      {filteredRows.length > limit && (
        <div className="text-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLimit((prev) => prev + 100)}
          >
            Load More Students (+100)
          </Button>
        </div>
      )}
    </div>
  );
}
