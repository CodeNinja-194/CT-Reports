import { useState, useMemo, useRef, useCallback } from 'react';
import {
  Users,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  KeyRound,
  FileSpreadsheet,
  Download,
  X,
  FileText,
  FileDown,
  Sparkles,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { FileDropzone } from '../../components/shared/FileDropzone';
import { StatKpiCard } from '../../components/shared/StatKpiCard';
import { ProgressBarRow } from '../../components/shared/ProgressBarRow';
import { EmptyState } from '../../components/shared/EmptyState';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { CourseFileParsed, PasswordFileParsed } from '../../types/course';
import {
  parseCourseWorkbook,
  aggregateCourseInsights,
} from './utils/courseParser';
import { generateCourseReportPdf } from './utils/coursePdfGenerator';
import { downloadCourseReportHtml } from './utils/courseHtmlGenerator';
import { exportCourseInsightsExcel } from './utils/courseExcelExport';
import { getSampleCourseData } from './sampleData';
import { EnrollmentSummaryTable } from './components/EnrollmentSummaryTable';
import { KeyObservationsCard } from './components/KeyObservationsCard';
import { StudentLevelCourseTable } from './components/StudentLevelCourseTable';
import { fmtPct } from '../../lib/utils';

interface GroupWiseCoursePageProps {
  onNavigate: (path: string) => void;
}

export function GroupWiseCoursePage({ onNavigate }: GroupWiseCoursePageProps) {
  const [courseFiles, setCourseFiles] = useState<CourseFileParsed[]>([]);
  const [passwordFiles, setPasswordFiles] = useState<PasswordFileParsed[]>([]);
  const [busy, setBusy] = useState(false);
  const [fileErrors, setFileErrors] = useState<string[]>([]);

  // Thresholds
  const [threshold, setThreshold] = useState(40);
  const [avgMax, setAvgMax] = useState(70);
  const [goodMax, setGoodMax] = useState(90);

  // College details
  const [collegeName, setCollegeName] = useState('');
  const [collegeLogo, setCollegeLogo] = useState('');

  // PDF generation states
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState({ done: 0, total: 0 });
  const [pdfError, setPdfError] = useState('');

  // Expandable sections state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const reportRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    setBusy(true);
    const newErrors: string[] = [];
    const newCourse: CourseFileParsed[] = [];
    const newPassword: PasswordFileParsed[] = [];

    for (const file of Array.from(fileList)) {
      if (!/\.xlsx?$/i.test(file.name)) {
        newErrors.push(`"${file.name}": Unsupported format. Only .xlsx and .xls are supported.`);
        continue;
      }
      try {
        const parsed = await parseCourseWorkbook(file);
        if (parsed.kind === 'course') newCourse.push(parsed);
        else newPassword.push(parsed);
      } catch (err: any) {
        newErrors.push(err.message || `Could not read "${file.name}"`);
      }
    }

    setCourseFiles((prev) => {
      const map = new Map(prev.map((f) => [f.fileName, f]));
      newCourse.forEach((f) => map.set(f.fileName, f));
      return Array.from(map.values());
    });

    setPasswordFiles((prev) => {
      const map = new Map(prev.map((f) => [f.fileName, f]));
      newPassword.forEach((f) => map.set(f.fileName, f));
      return Array.from(map.values());
    });

    setFileErrors(newErrors);
    setBusy(false);
  }, []);

  const loadSample = () => {
    const sample = getSampleCourseData();
    setCourseFiles(sample.courseFiles);
    setPasswordFiles(sample.passwordFiles);
    setCollegeName('VNR Vignana Jyothi Institute of Engineering & Technology');
    setFileErrors([]);
  };

  const clearAll = () => {
    setCourseFiles([]);
    setPasswordFiles([]);
    setFileErrors([]);
  };

  const removeCourseFile = (name: string) =>
    setCourseFiles((prev) => prev.filter((f) => f.fileName !== name));

  const removePasswordFile = (name: string) =>
    setPasswordFiles((prev) => prev.filter((f) => f.fileName !== name));

  const handleLogoUpload = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setCollegeLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

  const toggleExpand = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Aggregate insights
  const insights = useMemo(() => {
    return aggregateCourseInsights(courseFiles, passwordFiles, threshold, avgMax, goodMax);
  }, [courseFiles, passwordFiles, threshold, avgMax, goodMax]);

  const allDistinctCourses = useMemo(() => {
    if (!insights) return [];
    const map = new Map();
    insights.sections.forEach((sec) => {
      sec.courses.forEach((c) => {
        if (!map.has(c.key)) map.set(c.key, c);
      });
    });
    return Array.from(map.values());
  }, [insights]);

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setGeneratingPdf(true);
    setPdfError('');
    try {
      await generateCourseReportPdf(reportRef.current, collegeName, setPdfProgress);
    } catch (err: any) {
      console.error(err);
      setPdfError('PDF generation failed in this browser. Please use the standalone HTML download.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleDownloadHtml = () => {
    if (!reportRef.current) return;
    downloadCourseReportHtml(reportRef.current, collegeName, collegeLogo);
  };

  const handleExportExcel = () => {
    if (!insights) return;
    exportCourseInsightsExcel(insights, collegeName);
  };

  const generatedDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: 'Course Report', href: '/course-report' },
          { label: 'Group Wise Course' },
        ]}
        onNavigate={onNavigate}
      />

      {/* Header & Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B2A4A] dark:text-[#E2E8F0]">
            Group Wise Course Report
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Upload course progress exports to generate section-wise academic insights, activation rates, and at-risk student monitoring.
          </p>
        </div>

        {insights && (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportExcel}>
              <FileDown className="w-4 h-4 text-emerald-600" />
              Export Excel
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadHtml}>
              <FileText className="w-4 h-4 text-blue-600" />
              Download HTML
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={generatingPdf}
              onClick={handleDownloadPdf}
            >
              <Download className="w-4 h-4 text-[#D9A93A]" />
              {generatingPdf
                ? `Building PDF (${pdfProgress.done}/${pdfProgress.total})...`
                : 'Download PDF Report'}
            </Button>
          </div>
        )}
      </div>

      {/* Upload Zone & Settings (no-print) */}
      <div className="no-print mt-6 space-y-4">
        <FileDropzone
          onFilesSelected={handleFiles}
          acceptedFormats=".xlsx,.xls"
          multiple={true}
          title="Upload Course Progress or Password-Not-Set Exports"
          subtitle="Drag and drop individual section files or combined multi-section sheets. Sections are read automatically from the 'Groups' column."
          requiredColumnsHint={['Member Id', 'Name', 'Groups', 'Course columns (%)', 'Created Time']}
          busy={busy}
        />

        {/* Uploaded Files Chips */}
        {(courseFiles.length > 0 || passwordFiles.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 p-3 bg-white dark:bg-[#141E2C] border border-slate-200 dark:border-slate-800 rounded-lg text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300 mr-1">
              Uploaded Files ({courseFiles.length + passwordFiles.length}):
            </span>
            {courseFiles.map((f) => (
              <span
                key={f.fileName}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="font-medium">{f.fileName}</span>
                <span className="text-[10px] opacity-75">({f.students.length} students)</span>
                <button
                  type="button"
                  onClick={() => removeCourseFile(f.fileName)}
                  className="hover:text-red-600 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {passwordFiles.map((f) => (
              <span
                key={f.fileName}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="font-medium">{f.fileName}</span>
                <span className="text-[10px] opacity-75">({f.entries.length} no password)</span>
                <button
                  type="button"
                  onClick={() => removePasswordFile(f.fileName)}
                  className="hover:text-red-600 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-slate-400 hover:text-red-600 underline ml-auto"
            >
              Clear all
            </button>
          </div>
        )}

        {/* File Errors Alert */}
        {fileErrors.length > 0 && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-700 dark:text-red-300 space-y-1">
            {fileErrors.map((e, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{e}</span>
              </div>
            ))}
          </div>
        )}

        {/* Letterhead & Config Bar */}
        {insights && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white dark:bg-[#141E2C] border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
            <Input
              label="College / Institution Name"
              placeholder="e.g. Sreenidhi Institute of Science and Technology"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                College Logo (Optional)
              </label>
              <div className="flex items-center gap-2">
                {collegeLogo && (
                  <img
                    src={collegeLogo}
                    alt="Logo preview"
                    className="h-9 w-12 object-contain bg-white border border-slate-200 rounded p-0.5"
                  />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logoInputRef.current?.click()}
                  className="text-xs"
                >
                  {collegeLogo ? 'Change Logo' : 'Upload Logo'}
                </Button>
                {collegeLogo && (
                  <button
                    type="button"
                    onClick={() => setCollegeLogo('')}
                    className="p-1 text-slate-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                  className="hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="At-Risk Cutoff (%)"
                type="number"
                min={0}
                max={100}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value) || 0)}
              />
              <Input
                label="Good Target (%)"
                type="number"
                min={0}
                max={100}
                value={avgMax}
                onChange={(e) => setAvgMax(Number(e.target.value) || 0)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {!insights && (
        <EmptyState
          icon={FileSpreadsheet}
          title="No Course Report Yet"
          description="Upload at least one group-wise course progress report above to begin analyzing section performance, completion averages, and at-risk students."
          onLoadSample={loadSample}
          sampleButtonText="Load Sample B.Tech Cohort Data"
        />
      )}

      {/* Main Report Body (printable) */}
      {insights && (
        <div ref={reportRef} className="cip-page mt-8 space-y-6">
          {/* Letterhead Header Block */}
          <div
            data-pdf-block="true"
            className="flex items-center gap-4 pb-4 border-b-2 border-[#1B2A4A] dark:border-slate-700"
          >
            {collegeLogo && (
              <img
                src={collegeLogo}
                alt="College Logo"
                className="h-14 max-w-[120px] object-contain flex-shrink-0"
              />
            )}
            <div>
              {collegeName.trim() && (
                <div className="font-serif text-sm font-semibold uppercase tracking-wider text-[#B8860F]">
                  {collegeName}
                </div>
              )}
              <h2 className="font-serif text-2xl font-bold text-[#1B2A4A] dark:text-[#E2E8F0]">
                Course Progress Report
                {insights.batches.length > 0 && ` — Batch ${insights.batches.join(', ')}`}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Generated on {generatedDate} · {insights.sections.length} sections ·{' '}
                {insights.totalStudents} students · At-risk cutoff: &lt; {threshold}% completion
              </p>
            </div>
          </div>

          {/* KPI Dashboard */}
          <div
            data-pdf-block="true"
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 cip-card"
          >
            <StatKpiCard
              icon={Users}
              label="Total Students"
              value={insights.totalStudents}
              accentColor="#1B2A4A"
            />
            <StatKpiCard
              icon={GraduationCap}
              label="Sections"
              value={insights.sections.length}
              accentColor="#1B2A4A"
            />
            <StatKpiCard
              icon={TrendingUp}
              label="Overall Avg."
              value={fmtPct(insights.overallAvg)}
              accentColor={insights.overallAvg >= 70 ? '#0E7C66' : '#D9A93A'}
            />
            <StatKpiCard
              icon={TrendingUp}
              label="Started"
              value={insights.enrollmentTotals.started}
              sub={`${((insights.enrollmentTotals.started / (insights.totalStudents || 1)) * 100).toFixed(1)}%`}
              accentColor="#0E7C66"
            />
            <StatKpiCard
              icon={AlertTriangle}
              label="Not Started"
              value={insights.enrollmentTotals.notStarted}
              accentColor="#C4472D"
            />
            <StatKpiCard
              icon={KeyRound}
              label="No Password"
              value={insights.totalPasswordIssues}
              accentColor="#B8860F"
            />
            <StatKpiCard
              icon={AlertTriangle}
              label={`At Risk (<${threshold}%)`}
              value={insights.totalAtRisk}
              sub={`${((insights.totalAtRisk / (insights.totalStudents || 1)) * 100).toFixed(1)}%`}
              accentColor="#C4472D"
            />
          </div>

          {/* Key Observations */}
          <div data-pdf-block="true" className="cip-card">
            <KeyObservationsCard insights={insights} threshold={threshold} />
          </div>

          {/* Enrollment & Activation Summary */}
          <div data-pdf-block="true" className="cip-card">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <CardTitle>Enrollment &amp; Activation Summary</CardTitle>
                  <CardDescription>
                    Started = begun at least one course · Not Started = active account, 0 progress · Password Not Set = account never initialized
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <EnrollmentSummaryTable
                  enrollment={insights.enrollment}
                  totals={insights.enrollmentTotals}
                />
              </CardContent>
            </Card>
          </div>

          {/* Section-Wise Average Progress Chart */}
          <div data-pdf-block="true" className="cip-card">
            <Card>
              <CardHeader>
                <CardTitle>Average Completion by Section</CardTitle>
                <CardDescription>
                  Mean completion percentage across all courses for each section
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProgressBarRow
                  items={insights.sections.map((s) => ({
                    label: s.label,
                    subLabel: `${s.studentCount} students`,
                    value: s.avgOfAvgs,
                  }))}
                  labelWidth="w-36 sm:w-44"
                />
              </CardContent>
            </Card>
          </div>

          {/* Course-Wise Progress per Section */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-[#1B2A4A] dark:text-[#E2E8F0]">
              Course-wise Progress by Section
            </h3>
            {insights.sections.map((sec) => (
              <div key={sec.label} data-pdf-block="true" className="cip-card">
                <Card>
                  <CardHeader className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <span className="font-serif px-2 py-0.5 rounded bg-[#EAF3F8] dark:bg-[#1E2E44] text-[#1B2A4A] dark:text-[#7FA7DA] border border-[#C7DFEA] dark:border-[#2D4566]">
                          {sec.label}
                        </span>
                        <span>({sec.studentCount} Students · Section Avg: {fmtPct(sec.avgOfAvgs)})</span>
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ProgressBarRow
                      items={sec.perCourse.map((c) => ({
                        label: c.label,
                        subLabel: c.code,
                        value: c.avg,
                      }))}
                      labelWidth="w-44 sm:w-60"
                    />
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Section Summary Table */}
          <div data-pdf-block="true" className="cip-card">
            <Card>
              <CardHeader>
                <CardTitle>Section Summary Breakdown</CardTitle>
                <CardDescription>
                  Comparative metrics across all cohort sections
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Section</th>
                      <th className="py-2.5 px-3 text-right">Students</th>
                      <th className="py-2.5 px-3 text-right">Avg. Completion</th>
                      <th className="py-2.5 px-3 text-right">At Risk (&lt; {threshold}%)</th>
                      <th className="py-2.5 px-3 text-right">Passwords Not Set</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {insights.sections.map((s) => (
                      <tr key={s.label} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-semibold text-[#1B2A4A] dark:text-[#7FA7DA]">
                          {s.label}
                        </td>
                        <td className="py-2 px-3 text-right">{s.studentCount}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-800 dark:text-slate-100">
                          {fmtPct(s.avgOfAvgs)}
                        </td>
                        <td className="py-2 px-3 text-right text-[#C4472D] font-medium">
                          {s.atRisk.length}
                        </td>
                        <td className="py-2 px-3 text-right text-[#B8860F] font-medium">
                          {insights.pwBySection[s.label]?.entries.length || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Categorized Student Performance (Collapsible Bands) */}
          <div className="space-y-3">
            <div data-pdf-block="true" className="cip-card">
              <h3 className="font-serif text-lg font-semibold text-[#1B2A4A] dark:text-[#E2E8F0]">
                Student Performance Bands
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All {insights.totalStudents} students grouped into performance tiers
              </p>
            </div>

            {insights.categorizedStudents.map((cat) => {
              const stateKey = `perf-${cat.key}`;
              const isOpen = expandedSections[stateKey] !== false;

              return (
                <div
                  key={cat.key}
                  data-pdf-block="true"
                  className="cip-card bg-white dark:bg-[#141E2C] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm"
                  style={{ borderLeft: `4px solid ${cat.color}` }}
                >
                  <button
                    type="button"
                    onClick={() => toggleExpand(stateKey)}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                      <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                        {cat.title}
                      </span>
                      <span className="text-xs text-slate-400 font-normal">({cat.range})</span>
                    </div>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ color: cat.color, backgroundColor: `${cat.color}15` }}
                    >
                      {cat.students.length} students
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 dark:border-slate-800 p-4">
                      {cat.students.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No students in this band.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-semibold text-slate-500">
                                <th className="py-2 px-2">Member ID</th>
                                <th className="py-2 px-2">Name</th>
                                <th className="py-2 px-2">Group</th>
                                <th className="py-2 px-2 text-right">Avg. Completion</th>
                                {cat.key === 'atRisk' && <th className="py-2 px-2">Courses Not Started</th>}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                              {cat.students.map((st) => (
                                <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                  <td className="py-1.5 px-2 font-mono text-slate-500">{st.id}</td>
                                  <td className="py-1.5 px-2 font-medium">{st.name}</td>
                                  <td className="py-1.5 px-2 text-slate-500">{st.sectionLabel || st.groups}</td>
                                  <td className="py-1.5 px-2 text-right font-bold" style={{ color: cat.color }}>
                                    {fmtPct(st.avg)}
                                  </td>
                                  {cat.key === 'atRisk' && (
                                    <td className="py-1.5 px-2 text-slate-400 truncate max-w-xs">
                                      {st.notStartedCourses?.join(', ') || '—'}
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Passwords Not Set List */}
          {insights.totalPasswordIssues > 0 && (
            <div data-pdf-block="true" className="cip-card space-y-3">
              <h3 className="font-serif text-lg font-semibold text-[#1B2A4A] dark:text-[#E2E8F0]">
                Passwords Not Set ({insights.totalPasswordIssues})
              </h3>
              {Object.entries(insights.pwBySection).map(([label, g]) => {
                const isPwOpen = expandedSections[`pw-${label}`] !== false;
                return (
                  <div
                    key={label}
                    className="bg-white dark:bg-[#141E2C] border border-amber-200 dark:border-amber-900/50 rounded-lg overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleExpand(`pw-${label}`)}
                      className="w-full flex items-center justify-between p-3 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 text-left text-xs font-semibold text-amber-900 dark:text-amber-300"
                    >
                      <div className="flex items-center gap-2">
                        {isPwOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        <span>{label}</span>
                      </div>
                      <span>{g.entries.length} accounts</span>
                    </button>
                    {isPwOpen && (
                      <div className="p-3 border-t border-amber-100 dark:border-amber-900/40 overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-amber-100 dark:border-amber-900/40 text-[10px] text-slate-400 uppercase">
                              <th className="py-1 px-2">Name</th>
                              <th className="py-1 px-2">Email</th>
                              <th className="py-1 px-2">Created Time</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-amber-50 dark:divide-amber-950/30">
                            {g.entries.map((entry, eIdx) => (
                              <tr key={eIdx}>
                                <td className="py-1.5 px-2 font-medium">{entry.name}</td>
                                <td className="py-1.5 px-2 text-slate-500">{entry.email}</td>
                                <td className="py-1.5 px-2 text-slate-400 font-mono text-[11px]">{entry.createdTime}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Student Level Course View (Detailed Filterable Table) */}
          <div data-pdf-block="true" className="cip-card pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Student-Level Progress</CardTitle>
                <CardDescription>
                  Filter, search, and sort every enrolled student across all modules and sections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StudentLevelCourseTable
                  students={insights.allStudentsFlat}
                  courses={allDistinctCourses}
                  threshold={threshold}
                />
              </CardContent>
            </Card>
          </div>

          {/* Report Footer */}
          <div
            data-pdf-block="true"
            className="pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400"
          >
            Compiled from CodeTantra group-wise course and password-status exports · Report generated {generatedDate}
          </div>
        </div>
      )}
    </div>
  );
}
