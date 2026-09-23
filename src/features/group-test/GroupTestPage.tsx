import { useCallback, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Download,
  FileSpreadsheet,
  Filter,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { FileDropzone } from '../../components/shared/FileDropzone';
import { EmptyState } from '../../components/shared/EmptyState';
import { StatKpiCard } from '../../components/shared/StatKpiCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { SegregationAnalysis, SegregationParsedData, SegregationSettings } from '../../types/segregation';
import { getSampleSegregationData } from '../segregation/sampleData';
import { analyzeSegregation, parseSegregationSheet } from '../segregation/utils/segregationParser';
import { generateSegregationPdf } from '../segregation/utils/segregationPdfGenerator';
import { num, pct, shortGroup } from '../../lib/utils';

interface GroupTestPageProps {
  onNavigate: (path: string) => void;
}

export function GroupTestPage({ onNavigate }: GroupTestPageProps) {
  const [data, setData] = useState<SegregationParsedData | null>(null);
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [cutoff, setCutoff] = useState(50);
  const [advanced, setAdvanced] = useState(75);
  const [average, setAverage] = useState(30);
  const [settings, setSettings] = useState<SegregationSettings>({
    title: 'Group Test Report',
    test: '',
    org: 'Training & Placement Cell',
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    top: 10,
    sec: true,
    notAtt: true,
  });

  const analysis = useMemo<SegregationAnalysis | null>(() => {
    if (!data) return null;
    return analyzeSegregation(data, cutoff, advanced, average);
  }, [data, cutoff, advanced, average]);

  const loadData = useCallback(async (files: FileList | File[]) => {
    const file = files[0];
    if (!file) return;
    setBusy(true);
    setErrorMsg('');
    try {
      const parsed = parseSegregationSheet(await file.arrayBuffer());
      const name = file.name.replace(/\.[^.]+$/, '').replace(/[_]+/g, ' ').trim();
      setData(parsed);
      setFileName(name);
      setCutoff(parsed.cutoff);
      setAdvanced(parsed.adv);
      setAverage(parsed.avgMin);
      setSettings((previous) => ({ ...previous, test: name }));
    } catch (error: any) {
      setErrorMsg(error.message || 'Could not read that spreadsheet file.');
    } finally {
      setBusy(false);
    }
  }, []);

  const loadSample = () => {
    const sample = getSampleSegregationData();
    setData(sample);
    setFileName('BTech_Campus_Group_Test_2026');
    setCutoff(sample.cutoff);
    setAdvanced(sample.adv);
    setAverage(sample.avgMin);
    setSettings((previous) => ({
      ...previous,
      test: 'Campus Group Assessment 2026',
      org: 'Centre for Career Advancement & Training',
    }));
    setErrorMsg('');
  };

  const clearAll = () => {
    setData(null);
    setFileName('');
    setErrorMsg('');
  };

  const downloadPdf = async () => {
    if (!analysis || !data) return;
    setGeneratingPdf(true);
    try {
      await generateSegregationPdf(analysis, data, settings, fileName);
    } catch (error: any) {
      setErrorMsg(`Failed to generate PDF report: ${error.message}`);
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <Breadcrumbs items={[{ label: 'Tests', href: '/tests' }, { label: 'Group Test' }]} onNavigate={onNavigate} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B2A4A] dark:text-[#E2E8F0]">Group Test Report</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Compare cohorts in one assessment, inspect section performance, and export a complete student-level report.
          </p>
        </div>
        {analysis && (
          <Button variant="primary" size="sm" loading={generatingPdf} onClick={downloadPdf}>
            <Download className="w-4 h-4 text-[#D9A93A]" />
            Download Group Report PDF
          </Button>
        )}
      </div>

      <div className="mt-6 space-y-4">
        <FileDropzone
          onFilesSelected={loadData}
          acceptedFormats=".xlsx,.xls,.csv"
          multiple={false}
          title="Drop the combined group test spreadsheet"
          subtitle="Upload one assessment export containing student names, groups, section marks, and total marks."
          requiredColumnsHint={['Member Id', 'Name', 'Groups', 'Section (XM)', 'Total (100M)']}
          busy={busy}
        />
        {data && (
          <div className="flex flex-wrap items-center gap-2 p-3 bg-white dark:bg-[#141E2C] border border-slate-200 dark:border-slate-800 rounded-lg text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Loaded:</span>
            <span className="font-mono text-[#1B2A4A] dark:text-[#7FA7DA]">{fileName}</span>
            <span className="text-slate-400">{data.cands.length} candidates · {data.sections.length} sections</span>
            <button type="button" onClick={clearAll} className="text-xs text-slate-400 hover:text-red-600 underline ml-auto">Change file</button>
          </div>
        )}
        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {!analysis && (
        <EmptyState
          icon={FileSpreadsheet}
          title="No Group Test Data Yet"
          description="Upload a combined group assessment export to compare cohorts and generate a student-level report."
          onLoadSample={loadSample}
          sampleButtonText="Load Sample Group Test"
        />
      )}

      {analysis && data && (
        <div className="mt-8 space-y-6">
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><Filter className="w-4 h-4 text-[#B8860F]" />Report Settings &amp; Thresholds</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Input label="Report Title" value={settings.title} onChange={(e) => setSettings({ ...settings, title: e.target.value })} />
                <Input label="Test Name" value={settings.test} onChange={(e) => setSettings({ ...settings, test: e.target.value })} />
                <Input label="Prepared By / Organisation" value={settings.org} onChange={(e) => setSettings({ ...settings, org: e.target.value })} />
                <Input label="Report Date" value={settings.date} onChange={(e) => setSettings({ ...settings, date: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Input label="Pass Cut-off (Marks)" type="number" value={cutoff} onChange={(e) => setCutoff(Number(e.target.value) || 0)} />
                <Input label="Advanced from (Marks)" type="number" value={advanced} onChange={(e) => setAdvanced(Number(e.target.value) || 0)} />
                <Input label="Average from (Marks)" type="number" value={average} onChange={(e) => setAverage(Number(e.target.value) || 0)} />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatKpiCard icon={Users} label="Registered" value={analysis.N} sub="candidates" accentColor="#1B2A4A" />
            <StatKpiCard icon={Users} label="Groups" value={analysis.groups.length} sub="cohorts compared" trend="good" />
            <StatKpiCard icon={TrendingUp} label="Average Score" value={num(analysis.avg)} sub={`out of ${analysis.totalMax}`} accentColor="#1B2A4A" />
            <StatKpiCard icon={TrendingUp} label="Pass Rate" value={pct(analysis.passOverall)} sub="of registered" trend={analysis.passOverall < 50 ? 'warn' : 'good'} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Group Performance Comparison</CardTitle>
              <CardDescription>Compare participation, qualification, averages, and highest scores across every group.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead><tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Group</th><th className="py-2.5 px-3 text-right">Registered</th><th className="py-2.5 px-3 text-right">Attempted</th><th className="py-2.5 px-3 text-right">Qualified</th><th className="py-2.5 px-3 text-right">Pass Rate</th><th className="py-2.5 px-3 text-right">Average</th><th className="py-2.5 px-3 text-right">Highest</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{analysis.groups.map((group) => <tr key={group.group} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-2 px-3 font-semibold text-[#1B2A4A] dark:text-[#7FA7DA]">{shortGroup(group.group)}</td><td className="py-2 px-3 text-right">{group.reg}</td><td className="py-2 px-3 text-right">{group.att}</td><td className="py-2 px-3 text-right text-[#0E7C66] font-medium">{group.pass}</td><td className="py-2 px-3 text-right font-mono font-bold text-[#0E7C66]">{pct(group.passPct)}</td><td className="py-2 px-3 text-right font-mono font-bold">{num(group.avg)}</td><td className="py-2 px-3 text-right font-mono">{num(group.max)}</td>
                </tr>)}</tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Section Performance</CardTitle><CardDescription>Average marks and participation by assessment section.</CardDescription></CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse"><thead><tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 uppercase tracking-wider"><th className="py-2.5 px-3">Section</th><th className="py-2.5 px-3 text-right">Max</th><th className="py-2.5 px-3 text-right">Average</th><th className="py-2.5 px-3 text-right">Average %</th><th className="py-2.5 px-3 text-right">Scored &gt; 0</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{analysis.sec.map((section) => <tr key={section.key}><td className="py-2 px-3 font-semibold">{section.name}{section.coding && <Badge variant="navy" className="ml-2">Coding</Badge>}</td><td className="py-2 px-3 text-right">{section.max}</td><td className="py-2 px-3 text-right font-mono font-bold">{num(section.avg)}</td><td className="py-2 px-3 text-right font-mono">{pct(section.avgPct)}</td><td className="py-2 px-3 text-right">{section.pos} ({pct(section.posPct)})</td></tr>)}</tbody></table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Top Performers</CardTitle><CardDescription>The strongest students across the combined assessment.</CardDescription></CardHeader>
            <CardContent className="p-0 overflow-x-auto"><table className="w-full text-left text-xs sm:text-sm border-collapse"><thead><tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 uppercase tracking-wider"><th className="py-2.5 px-3">Rank</th><th className="py-2.5 px-3">Name</th><th className="py-2.5 px-3">Group</th><th className="py-2.5 px-3 text-right">Total</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{analysis.sorted.slice(0, 10).map((candidate, index) => <tr key={`${candidate.id}-${index}`}><td className="py-2 px-3 text-slate-400">{index + 1}</td><td className="py-2 px-3 font-medium">{candidate.name}</td><td className="py-2 px-3 text-slate-500">{shortGroup(candidate.group)}</td><td className="py-2 px-3 text-right font-mono font-bold">{num(candidate.total)} / {analysis.totalMax}</td></tr>)}</tbody></table></CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
