import React, { useState, useMemo } from 'react';
import { CourseStudent, CourseColumn } from '../../../types/course';
import { fmtPct } from '../../../lib/utils';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

interface StudentLevelCourseTableProps {
  students: CourseStudent[];
  courses: CourseColumn[];
  threshold: number;
  initialGroupFilter?: string;
}

export function StudentLevelCourseTable({
  students,
  courses,
  threshold,
  initialGroupFilter = '',
}: StudentLevelCourseTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(initialGroupFilter);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'atRisk' | 'started' | 'notStarted'>('all');
  const [sortField, setSortField] = useState<'id' | 'name' | 'group' | 'avg'>('avg');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  const groups = useMemo(() => {
    const set = new Set(students.map((s) => s.sectionLabel || s.groups).filter(Boolean));
    return Array.from(set).sort();
  }, [students]);

  // Filter logic
  const filteredStudents = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return students.filter((st) => {
      // Search
      const matchSearch =
        !q ||
        st.id.toLowerCase().includes(q) ||
        st.name.toLowerCase().includes(q) ||
        st.email.toLowerCase().includes(q);

      // Group
      const groupName = st.sectionLabel || st.groups;
      const matchGroup = !selectedGroup || groupName === selectedGroup;

      // Status
      const isAtRisk = st.avg < threshold;
      const isNotStarted = Object.values(st.courseValues).every((cv) => cv.notStarted);
      const isStarted = !isNotStarted;

      let matchStatus = true;
      if (selectedStatus === 'atRisk') matchStatus = isAtRisk;
      else if (selectedStatus === 'started') matchStatus = isStarted;
      else if (selectedStatus === 'notStarted') matchStatus = isNotStarted;

      return matchSearch && matchGroup && matchStatus;
    });
  }, [students, searchTerm, selectedGroup, selectedStatus, threshold]);

  // Sort logic
  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      let res = 0;
      if (sortField === 'id') res = a.id.localeCompare(b.id, undefined, { numeric: true });
      else if (sortField === 'name') res = a.name.localeCompare(b.name);
      else if (sortField === 'group') res = (a.sectionLabel || a.groups).localeCompare(b.sectionLabel || b.groups);
      else if (sortField === 'avg') res = a.avg - b.avg;
      return sortDir === 'asc' ? res : -res;
    });
  }, [filteredStudents, sortField, sortDir]);

  // Pagination
  const totalPages = Math.ceil(sortedStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedStudents.slice(start, start + pageSize);
  }, [sortedStudents, currentPage, pageSize]);

  const toggleSort = (field: 'id' | 'name' | 'group' | 'avg') => {
    if (sortField === field) {
      setSortDir((p) => (p === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Input
            placeholder="Search by ID or Name..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <Select
          value={selectedGroup}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setSelectedGroup(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Groups ({groups.length})</option>
          {groups.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </Select>

        <Select
          value={selectedStatus}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setSelectedStatus(e.target.value as any);
            setCurrentPage(1);
          }}
        >
          <option value="all">All Progress Statuses</option>
          <option value="started">Started</option>
          <option value="atRisk">At Risk (&lt; {threshold}%)</option>
          <option value="notStarted">Not Started (0%)</option>
        </Select>

        <div className="flex items-center justify-end text-xs text-slate-500 font-medium px-1">
          Showing {sortedStudents.length} of {students.length} students
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-[#141E2C] shadow-sm">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-2.5 px-3 cursor-pointer select-none" onClick={() => toggleSort('id')}>
                <div className="flex items-center gap-1">
                  <span>Member ID</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer select-none" onClick={() => toggleSort('name')}>
                <div className="flex items-center gap-1">
                  <span>Student Name</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer select-none" onClick={() => toggleSort('group')}>
                <div className="flex items-center gap-1">
                  <span>Group</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              {courses.map((c) => (
                <th key={c.key} className="py-2.5 px-3 text-right max-w-[140px] truncate" title={c.label}>
                  {c.code || c.label}
                </th>
              ))}
              <th className="py-2.5 px-3 text-right cursor-pointer select-none" onClick={() => toggleSort('avg')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Average</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan={5 + courses.length} className="py-8 text-center text-slate-400 text-sm">
                  No students match your selected filters.
                </td>
              </tr>
            ) : (
              paginatedStudents.map((st) => {
                const isAtRisk = st.avg < threshold;
                const isNotStarted = Object.values(st.courseValues).every((cv) => cv.notStarted);

                return (
                  <tr key={st.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {st.id}
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-100">
                      <div>{st.name}</div>
                      {st.email && (
                        <div className="text-[11px] text-slate-400 truncate max-w-[180px]">{st.email}</div>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <span className="font-serif text-xs font-medium text-[#1B2A4A] dark:text-[#7FA7DA] bg-[#EAF3F8] dark:bg-[#1E2E44] border border-[#C7DFEA] dark:border-[#2D4566] px-2 py-0.5 rounded">
                        {st.sectionLabel || st.groups}
                      </span>
                    </td>
                    {courses.map((c) => {
                      const cv = st.courseValues[c.key];
                      if (!cv) {
                        return (
                          <td key={c.key} className="py-2 px-3 text-right text-slate-300 dark:text-slate-600 font-mono">
                            —
                          </td>
                        );
                      }
                      return (
                        <td
                          key={c.key}
                          className={`py-2 px-3 text-right font-mono text-xs ${
                            cv.notStarted
                              ? 'text-slate-400'
                              : cv.value >= 70
                              ? 'text-[#0E7C66] font-semibold'
                              : cv.value < threshold
                              ? 'text-[#C4472D]'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {cv.notStarted ? 'Not Started' : fmtPct(cv.value)}
                        </td>
                      );
                    })}
                    <td className="py-2 px-3 text-right font-mono font-bold">
                      <span
                        className={
                          st.avg >= 70
                            ? 'text-[#0E7C66]'
                            : st.avg < threshold
                            ? 'text-[#C4472D]'
                            : 'text-[#B8860F]'
                        }
                      >
                        {fmtPct(st.avg)}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      {isNotStarted ? (
                        <Badge variant="slate" size="sm">
                          Not Started
                        </Badge>
                      ) : isAtRisk ? (
                        <Badge variant="danger" size="sm">
                          At Risk
                        </Badge>
                      ) : (
                        <Badge variant="success" size="sm">
                          Started
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
