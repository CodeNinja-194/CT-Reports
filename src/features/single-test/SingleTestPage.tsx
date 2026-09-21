import { useState, useMemo, useCallback } from 'react';
import {
  FileCheck2,
  Users,
  TrendingUp,
  Award,
  AlertTriangle,
  Download,
  Archive,
  FileText,
  X,
  Sparkles,
} from 'lucide-react';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { FileDropzone } from '../../components/shared/FileDropzone';
import { StatKpiCard } from '../../components/shared/StatKpiCard';
import { HistogramChart } from '../../components/shared/HistogramChart';
import { EmptyState } from '../../components/shared/EmptyState';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import {
  AttemptedRecord,
  NotAttemptedRecord,
  SingleTestMeta,
} from '../../types/singleTest';
import {
  ingestTestFile,
  analyzeSingleTest,
  metaFromFilename,
  generateSingleTestInsights,
} from './utils/singleTestParser';
import { buildSingleTestPdf } from './utils/singleTestPdfGenerator';
import { generateSingleTestZip } from './utils/singleTestZipGenerator';
import { getSampleSingleTestData } from './sampleData';
import { TestDetailsPanel } from './components/TestDetailsPanel';
import { GroupPerformanceTable } from './components/GroupPerformanceTable';
import { SingleTestStudentTable } from './components/SingleTestStudentTable';
import { num, pct, safeName, downloadBlob } from '../../lib/utils';

interface SingleTestPageProps {
  onNavigate: (path: string) => void;
}

export function SingleTestPage({ onNavigate }: SingleTestPageProps) {
  const [attRecords, setAttRecords] = useState<AttemptedRecord[]>([]);
  const [naRecords, setNaRecords] = useState<NotAttemptedRecord[]>([]);
  const [attFile, setAttFile] = useState<{ name: string; count: number } | null>(null);
  const [naFile, setNaFile] = useState<{ name: string; count: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [busy, setBusy] = useState(false);

  // Settings
  const [meta, setMeta] = useState<SingleTestMeta>({
    college: '',
    testName: '',
    batch: '',
    date: new Date().toISOString().split('T')[0],
    max: 100,
    pass: 50,
    preparedBy: '',
  });

  // Export options
  const [opts, setOpts] = useState({
    below: true,
    notAtt: true,
    scorecard: true,
  });

  // Export statuses
  const [exportStatus, setExportStatus] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [selectedGroupPdf, setSelectedGroupPdf] = useState<string>('');

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    setBusy(true);
    setErrorMsg('');
    const msgs: string[] = [];

    for (const file of Array.from(fileList)) {
      try {
        const res = await ingestTestFile(file);
        if (res.kind === 'att') {
          const recs = res.recs as AttemptedRecord[];
          setAttRecords(recs);
          setAttFile({ name: file.name, count: recs.length });
          setMeta((prev) => ({
            ...prev,
            max: res.max ?? prev.max,
            pass: res.pass ?? Math.ceil((res.max ?? prev.max) * 0.5),
          }));
        } else {
          const recs = res.recs as NotAttemptedRecord[];
          setNaRecords(recs);
          setNaFile({ name: file.name, count: recs.length });
        }

        const fm = metaFromFilename(file.name);
        setMeta((prev) => ({
          ...prev,
          batch: fm.batch || prev.batch,
          testName: fm.testName || prev.testName,
          date: fm.date || prev.date,
        }));
      } catch (err: any) {
        msgs.push(err.message || String(err));
      }
    }

    if (msgs.length) {
      setErrorMsg(msgs.join(' '));
    }
    setBusy(false);
  }, []);

  const loadSample = () => {
    const sample = getSampleSingleTestData();
    setAttRecords(sample.att);
    setNaRecords(sample.na);
    setAttFile({ name: '2024-2028_DSA_Attempted_15-09-2026.xlsx', count: sample.att.length });
    setNaFile({ name: '2024-2028_DSA_NotAttempted_15-09-2026.xlsx', count: sample.na.length });
    setMeta(sample.meta);
    setErrorMsg('');
  };

  const clearAll = () => {
    setAttRecords([]);
    setNaRecords([]);
    setAttFile(null);
    setNaFile(null);
    setErrorMsg('');
  };

  // Analysis computation
  const analysis = useMemo(() => {
    if (!attRecords.length) return null;
    return analyzeSingleTest(attRecords, naRecords, meta.max, meta.pass, !!naFile);
  }, [attRecords, naRecords, meta.max, meta.pass, naFile]);

  // Insights computation
  const insights = useMemo(() => {
    if (!analysis) return [];
    return generateSingleTestInsights(analysis, meta.max, meta.pass);
  }, [analysis, meta.max, meta.pass]);

  // Export handlers
  const handleDownloadCollegeSummary = async () => {
    if (!analysis) return;
    setIsExporting(true);
    setExportStatus('Building college summary PDF...');
    try {
      const pdfBytes = await buildSingleTestPdf(analysis, meta, null, opts);
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const base = safeName(meta.testName || 'Test');
      downloadBlob(blob, `${base}_College_Summary.pdf`);
      setExportStatus('College summary downloaded.');
    } catch (err: any) {
      console.error(err);
      setExportStatus('Failed to generate PDF: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadGroupReport = async () => {
    if (!analysis) return;
    const groupKey = selectedGroupPdf || analysis.groups[0]?.key;
    if (!groupKey) return;
    const grp = analysis.groups.find((g) => g.key === groupKey);
    if (!grp) return;

    setIsExporting(true);
    setExportStatus(`Building ${grp.label} PDF report...`);
    try {
      const pdfBytes = await buildSingleTestPdf(analysis, meta, groupKey, opts);
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const base = safeName(meta.testName || 'Test');
      downloadBlob(blob, `${base}_${safeName(grp.label)}_Report.pdf`);
      setExportStatus(`${grp.label} report downloaded.`);
    } catch (err: any) {
      console.error(err);
      setExportStatus('Failed to generate group PDF: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadZip = async () => {
    if (!analysis) return;
    setIsExporting(true);
    try {
      await generateSingleTestZip(analysis, meta, opts, setExportStatus);
      setExportStatus('All reports downloaded as ZIP.');
    } catch (err: any) {
      console.error(err);
      setExportStatus('Failed to build ZIP: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Tests', href: '/tests' },
          { label: 'Single Test' },
        ]}
        onNavigate={onNavigate}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B2A4A] dark:text-[#E2E8F0]">
            Single Test Report
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Convert test exports into a management-ready performance report with score distribution, pass rates, group comparisons, and student-level details.
          </p>
        </div>

        {analysis && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              loading={isExporting}
              onClick={handleDownloadCollegeSummary}
            >
              <FileText className="w-4 h-4 text-blue-600" />
              College Summary (PDF)
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={isExporting}
              onClick={handleDownloadZip}
            >
              <Archive className="w-4 h-4 text-[#D9A93A]" />
              All Reports (ZIP)
            </Button>
          </div>
        )}
      </div>

      {/* Upload Zone & Settings (no-print) */}
      <div className="no-print mt-6 space-y-4">
        <FileDropzone
          onFilesSelected={handleFiles}
          acceptedFormats=".xlsx,.xls,.csv"
          multiple={true}
          title="Drop Test Files: Attempted and Not Attempted"
          subtitle="Add the Attempted file (required) and optional Not Attempted file from the same test."
          requiredColumnsHint={['Member Id', 'Name', 'Groups', 'Total (XX M)', 'Passed', 'Start Time']}
          busy={busy}
        />

        {/* Uploaded File Chips */}
        {(attFile || naFile) && (
          <div className="flex flex-wrap items-center gap-2 p-3 bg-white dark:bg-[#141E2C] border border-slate-200 dark:border-slate-800 rounded-lg text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300 mr-1">
              Loaded Files:
            </span>
            {attFile && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-medium">Attempted: {attFile.name}</span>
                <span className="text-[10px] opacity-75">({attFile.count} rows)</span>
              </span>
            )}
            {naFile && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                <Users className="w-3.5 h-3.5 text-amber-600" />
                <span className="font-medium">Not Attempted: {naFile.name}</span>
                <span className="text-[10px] opacity-75">({naFile.count} rows)</span>
              </span>
            )}
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-slate-400 hover:text-red-600 underline ml-auto"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Empty State */}
      {!analysis && (
        <EmptyState
          icon={FileCheck2}
          title="No Test Data Yet"
          description="Upload the attempted student export (and optional not-attempted export) to generate the comprehensive single test performance report."
          onLoadSample={loadSample}
          sampleButtonText="Load Sample Test Results"
        />
      )}

      {/* Main Workspace Layout */}
      {analysis && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Settings & Export Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Report Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <TestDetailsPanel meta={meta} onChange={setMeta} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Report Downloads</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={opts.below}
                      onChange={(e) => setOpts({ ...opts, below: e.target.checked })}
                      className="rounded text-[#1B2A4A]"
                    />
                    <span>List students below pass mark</span>
                  </label>
                  {analysis.hasNA && (
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={opts.notAtt}
                        onChange={(e) => setOpts({ ...opts, notAtt: e.target.checked })}
                        className="rounded text-[#1B2A4A]"
                      />
                      <span>List unattempted candidates</span>
                    </label>
                  )}
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={opts.scorecard}
                      onChange={(e) => setOpts({ ...opts, scorecard: e.target.checked })}
                      className="rounded text-[#1B2A4A]"
                    />
                    <span>Include complete student scorecard</span>
                  </label>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs"
                    loading={isExporting}
                    onClick={handleDownloadCollegeSummary}
                  >
                    College Summary PDF
                  </Button>

                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                      Individual Group Report
                    </label>
                    <Select
                      value={selectedGroupPdf}
                      onChange={(e) => setSelectedGroupPdf(e.target.value)}
                      className="text-xs h-8 mb-2"
                    >
                      {analysis.groups.map((g) => (
                        <option key={g.key} value={g.key}>
                          {g.label} ({g.st.n} attempted)
                        </option>
                      ))}
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      loading={isExporting}
                      onClick={handleDownloadGroupReport}
                    >
                      Download Group PDF
                    </Button>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full text-xs mt-2"
                    loading={isExporting}
                    onClick={handleDownloadZip}
                  >
                    <Archive className="w-3.5 h-3.5 mr-1" />
                    Download All (ZIP)
                  </Button>
                </div>

                {exportStatus && (
                  <p className="text-[11px] text-slate-500 text-center italic">{exportStatus}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Main Analytics Section */}
          <div className="lg:col-span-3 space-y-6">
            {/* Title & Metadata Banner */}
            <div className="bg-white dark:bg-[#141E2C] border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1B2A4A] dark:text-[#E2E8F0]">
                {meta.testName || 'Assessment'} Report
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {[meta.college, meta.batch && `Batch ${meta.batch}`, meta.date && `Date: ${meta.date}`]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>

            {/* KPI Dashboard */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {analysis.hasNA && (
                <StatKpiCard
                  icon={Users}
                  label="Registered"
                  value={analysis.all.registered}
                  sub={`${analysis.groups.length} groups`}
                  accentColor="#1B2A4A"
                />
              )}
              <StatKpiCard
                icon={FileCheck2}
                label="Attempted"
                value={analysis.all.n}
                sub={analysis.hasNA ? `${pct(analysis.all.part)} participation` : `${analysis.groups.length} groups`}
                trend="good"
              />
              {analysis.hasNA && (
                <StatKpiCard
                  icon={AlertTriangle}
                  label="Not Attempted"
                  value={analysis.all.notAtt}
                  sub={analysis.all.registered ? `${pct(100 - analysis.all.part)} of registered` : ''}
                  trend={analysis.all.notAtt > 0 ? 'warn' : 'neutral'}
                />
              )}
              <StatKpiCard
                icon={TrendingUp}
                label="Average Score"
                value={`${num(analysis.all.avg)}/${meta.max}`}
                sub={`${pct(analysis.all.avgPct)} average`}
                accentColor="#1B2A4A"
              />
              <StatKpiCard
                icon={TrendingUp}
                label="Median Score"
                value={num(analysis.all.median)}
                sub={`Range ${num(analysis.all.lo)} to ${num(analysis.all.hi)}`}
                accentColor="#1B2A4A"
              />
              <StatKpiCard
                icon={Award}
                label="Pass Rate"
                value={pct(analysis.all.passRate)}
                sub={`${analysis.all.passCount} cleared pass mark (${meta.pass})`}
                trend="good"
              />
              <StatKpiCard
                icon={Award}
                label="Full Marks"
                value={analysis.all.full}
                sub={`${pct(analysis.all.fullPct)} of attempts`}
                accentColor="#0E7C66"
              />
              <StatKpiCard
                icon={AlertTriangle}
                label="Below Pass"
                value={analysis.all.below}
                sub={`${pct(100 - analysis.all.passRate)} of attempts`}
                trend={analysis.all.below > 0 ? 'bad' : 'neutral'}
              />
            </div>

            {/* Score Distribution Hero */}
            <Card>
              <CardHeader>
                <CardTitle>Score Spread &amp; Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <HistogramChart
                  bins={analysis.all.bins}
                  passMark={meta.pass}
                  totalMax={meta.max}
                />

                {/* Performance Bands Stacked Bar */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex h-3.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {analysis.all.bands.map(
                      (b) =>
                        b.count > 0 && (
                          <div
                            key={b.key}
                            style={{
                              width: `${(b.count / (analysis.all.n || 1)) * 100}%`,
                              backgroundColor: b.color,
                            }}
                            title={`${b.label}: ${b.count} students`}
                          />
                        )
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2.5">
                    {analysis.all.bands.map((b) => (
                      <div key={b.key} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: b.color }} />
                        <span>
                          {b.label}: <strong>{b.count}</strong> ({pct((b.count / (analysis.all.n || 1)) * 100)})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Key Analytical Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 list-disc list-inside">
                  {insights.map((ins, i) => (
                    <li key={i}>{ins}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Group-Wise Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle>Group-Wise Performance</CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Click on any group name to filter or generate that group's report
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <GroupPerformanceTable
                  groups={analysis.groups}
                  hasNA={analysis.hasNA}
                  onSelectGroup={(key) => setSelectedGroupPdf(key)}
                />
              </CardContent>
            </Card>

            {/* Student Table */}
            <Card>
              <CardHeader>
                <CardTitle>Student Performance Records</CardTitle>
              </CardHeader>
              <CardContent>
                <SingleTestStudentTable
                  att={attRecords}
                  na={naRecords}
                  max={meta.max}
                  pass={meta.pass}
                  selectedGroupFilter={selectedGroupPdf}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
