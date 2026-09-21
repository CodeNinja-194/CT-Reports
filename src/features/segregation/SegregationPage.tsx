import { useState, useMemo, useCallback } from 'react';
import {
  Layers,
  Award,
  AlertTriangle,
  Download,
  Users,
  TrendingUp,
  FileCheck2,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { FileDropzone } from '../../components/shared/FileDropzone';
import { StatKpiCard } from '../../components/shared/StatKpiCard';
import { EmptyState } from '../../components/shared/EmptyState';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import {
  SegregationParsedData,
  SegregationSettings,
} from '../../types/segregation';
import {
  parseSegregationSheet,
  analyzeSegregation,
} from './utils/segregationParser';
import { generateSegregationPdf } from './utils/segregationPdfGenerator';
import { getSampleSegregationData } from './sampleData';
import { num, pct, shortGroup } from '../../lib/utils';

interface SegregationPageProps {
  onNavigate: (path: string) => void;
}

export function SegregationPage({ onNavigate }: SegregationPageProps) {
  const [data, setData] = useState<SegregationParsedData | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [selectedSecTab, setSelectedSecTab] = useState<number>(0);
  const [generatingPdf, setGeneratingPdf] = useState<boolean>(false);

  // Settings
  const [settings, setSettings] = useState<SegregationSettings>({
    title: 'Assessment Analysis Report',
    test: '',
    org: 'Training & Placement Cell',
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    top: 10,
    sec: true,
    notAtt: true,
  });

  const [cutoffVal, setCutoffVal] = useState<number>(50);
  const [advVal, setAdvVal] = useState<number>(75);
  const [avgVal, setAvgVal] = useState<number>(30);

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    const file = fileList[0];
    if (!file) return;

    setBusy(true);
    setErrorMsg('');
    try {
      const buf = await file.arrayBuffer();
      const parsed = parseSegregationSheet(buf);
      setData(parsed);
      setFileName(file.name.replace(/\.[^.]+$/, '').replace(/[_]+/g, ' ').trim());
      setSettings((prev) => ({
        ...prev,
        test: file.name.replace(/\.[^.]+$/, '').replace(/[_]+/g, ' ').trim(),
      }));
      setCutoffVal(parsed.cutoff);
      setAdvVal(parsed.adv);
      setAvgVal(parsed.avgMin);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Could not read that spreadsheet file.');
    } finally {
      setBusy(false);
    }
  }, []);

  const loadSample = () => {
    const sample = getSampleSegregationData();
    setData(sample);
    setFileName('BTech_Campus_Assessment_2026');
    setSettings((prev) => ({
      ...prev,
      test: 'Comprehensive Full Stack & Data Structures Assessment',
      org: 'Centre for Career Advancement & Training',
    }));
    setCutoffVal(sample.cutoff);
    setAdvVal(sample.adv);
    setAvgVal(sample.avgMin);
    setErrorMsg('');
  };

  const clearAll = () => {
    setData(null);
    setFileName('');
    setErrorMsg('');
  };

  // Analysis computation
  const analysis = useMemo(() => {
    if (!data) return null;
    return analyzeSegregation(data, cutoffVal, advVal, avgVal);
  }, [data, cutoffVal, advVal, avgVal]);

  const handleDownloadPdf = async () => {
    if (!analysis || !data) return;
    setGeneratingPdf(true);
    try {
      await generateSegregationPdf(analysis, data, settings, fileName);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to generate PDF report: ' + err.message);
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: 'Tests', href: '/tests' },
          { label: 'Segregation' },
        ]}
        onNavigate={onNavigate}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B2A4A] dark:text-[#E2E8F0]">
            Test Segregation Report
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Analyze test performance and organize student results into meaningful performance segments, section breakdowns, and academic intervention tiers.
          </p>
        </div>

        {analysis && (
          <Button
            variant="primary"
            size="sm"
            loading={generatingPdf}
            onClick={handleDownloadPdf}
          >
            <Download className="w-4 h-4 text-[#D9A93A]" />
            Download PDF Report
          </Button>
        )}
      </div>

      {/* Upload Zone & Settings (no-print) */}
      <div className="no-print mt-6 space-y-4">
        <FileDropzone
          onFilesSelected={handleFiles}
          acceptedFormats=".xlsx,.xls,.csv"
          multiple={false}
          title="Drop Test Analysis Spreadsheet (.xlsx, .xls, .csv)"
          subtitle="Upload exported assessment sheet with individual section columns (e.g. 'Coding - Easy (10M)') and Total marks."
          requiredColumnsHint={['Member Id', 'Name', 'Groups', 'Section (XM)', 'Total (100M)', 'Passed / Result']}
          busy={busy}
        />

        {data && (
          <div className="flex items-center justify-between p-3 bg-white dark:bg-[#141E2C] border border-slate-200 dark:border-slate-800 rounded-lg text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Loaded:</span>
              <span className="font-mono text-[#1B2A4A] dark:text-[#7FA7DA]">{fileName}</span>
              <span className="text-slate-400">
                · {data.cands.length} candidates · {data.sections.length} scored sections · {data.totalMax} total marks
              </span>
            </div>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-slate-400 hover:text-red-600 underline"
            >
              Change file
            </button>
          </div>
        )}

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
          icon={Layers}
          title="No Analysis Yet"
          description="Upload a test result export with section marks to begin segregation, score distribution analysis, and performer tier categorization."
          onLoadSample={loadSample}
          sampleButtonText="Load Sample Assessment Segregation"
        />
      )}

      {/* Main Workspace */}
      {analysis && data && (
        <div className="mt-8 space-y-6">
          {/* Settings & Threshold Configuration */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#B8860F]" />
                <span>Report Settings &amp; Performance Thresholds</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Input
                  label="Report Title"
                  value={settings.title}
                  onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                />
                <Input
                  label="Test Name"
                  value={settings.test}
                  onChange={(e) => setSettings({ ...settings, test: e.target.value })}
                />
                <Input
                  label="Prepared By / Organisation"
                  value={settings.org}
                  onChange={(e) => setSettings({ ...settings, org: e.target.value })}
                />
                <Input
                  label="Report Date"
                  value={settings.date}
                  onChange={(e) => setSettings({ ...settings, date: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Input
                  label="Pass Cut-off / Good from (Marks)"
                  type="number"
                  step="0.5"
                  value={cutoffVal}
                  onChange={(e) => setCutoffVal(parseFloat(e.target.value) || 0)}
                  hint={`Default: 50% (${(data.totalMax * 0.5).toFixed(1)}M)`}
                />
                <Input
                  label="Advanced from (Marks)"
                  type="number"
                  step="0.5"
                  value={advVal}
                  onChange={(e) => setAdvVal(parseFloat(e.target.value) || 0)}
                  hint={`Default: 75% (${(data.totalMax * 0.75).toFixed(1)}M)`}
                />
                <Input
                  label="Average from (Marks)"
                  type="number"
                  step="0.5"
                  value={avgVal}
                  onChange={(e) => setAvgVal(parseFloat(e.target.value) || 0)}
                  hint={`Default: 30% (${(data.totalMax * 0.3).toFixed(1)}M)`}
                />
                <Input
                  label="Top Performers to List"
                  type="number"
                  min={3}
                  max={50}
                  value={settings.top}
                  onChange={(e) => setSettings({ ...settings, top: parseInt(e.target.value) || 10 })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Report Header Title */}
          <div className="bg-white dark:bg-[#141E2C] border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm">
            <h2 className="font-serif text-2xl font-bold text-[#1B2A4A] dark:text-[#E2E8F0]">
              {settings.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {[settings.test, settings.org, settings.date].filter(Boolean).join('  |  ')}
            </p>
          </div>

          {/* Overview KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatKpiCard
              icon={Users}
              label="Registered"
              value={analysis.N}
              sub="candidates"
              accentColor="#1B2A4A"
            />
            <StatKpiCard
              icon={FileCheck2}
              label="Attempted"
              value={analysis.att}
              sub={`${pct(analysis.attRate)} participation`}
              trend="good"
            />
            <StatKpiCard
              icon={AlertTriangle}
              label="Did Not Attempt"
              value={analysis.notAtt}
              sub={`${pct(100 - analysis.attRate)} absent`}
              trend={analysis.notAtt > 0 ? 'warn' : 'neutral'}
            />
            <StatKpiCard
              icon={Award}
              label="Qualified"
              value={analysis.passN}
              sub={`Cut-off ${num(analysis.cutoff)} marks`}
              trend="good"
            />
            <StatKpiCard
              icon={Award}
              label="Pass Rate"
              value={pct(analysis.passRate)}
              sub="of attempters"
              trend={analysis.passRate < 25 ? 'bad' : 'good'}
            />
            <StatKpiCard
              icon={TrendingUp}
              label="Average Score"
              value={num(analysis.avg)}
              sub={`out of ${analysis.totalMax}`}
              accentColor="#1B2A4A"
            />
            <StatKpiCard
              icon={TrendingUp}
              label="Median Score"
              value={num(analysis.med)}
              sub="middle attempter"
              accentColor="#1B2A4A"
            />
            <StatKpiCard
              icon={Award}
              label="Highest Score"
              value={num(analysis.max)}
              sub={`Lowest: ${num(analysis.min)}`}
              accentColor="#0E7C66"
            />
          </div>

          {/* Key Findings */}
          <Card>
            <CardHeader>
              <CardTitle>Key Findings &amp; Observations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 list-disc list-inside leading-relaxed">
                {analysis.insights.map((text, i) => (
                  <li key={i}>{text}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Score Distribution & Performer Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Score Distribution &amp; Segregation Bands</CardTitle>
              <CardDescription>
                Attempted candidates grouped across 10 score bins with cut-off threshold line
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Stacked performer band bar */}
              <div>
                <div className="flex h-4 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  {analysis.bands.map(
                    (b, i) =>
                      b.n > 0 && (
                        <div
                          key={i}
                          style={{
                            width: `${b.pct}%`,
                            backgroundColor: `rgb(${b.rgb.join(',')})`,
                          }}
                          title={`${b.label}: ${b.n} candidates (${pct(b.pct)})`}
                        />
                      )
                  )}
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2.5">
                  {analysis.bands.map((b, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-sm"
                        style={{ backgroundColor: `rgb(${b.rgb.join(',')})` }}
                      />
                      <span>
                        {b.label}: <strong>{b.n}</strong> ({pct(b.pct)})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performer Bands Summary Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Performer Category</th>
                      <th className="py-2.5 px-3 text-right">Marks Range</th>
                      <th className="py-2.5 px-3 text-right">Candidates</th>
                      <th className="py-2.5 px-3 text-right">% of Attempters</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {analysis.bands.map((b, i) => (
                      <tr key={i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="py-2 px-3 flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                            style={{ backgroundColor: `rgb(${b.rgb.join(',')})` }}
                          />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {b.label}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                          {b.range}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-slate-800 dark:text-slate-100">
                          {b.n}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                          {pct(b.pct)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Section-Wise Performance Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Section-Wise Performance</CardTitle>
              <CardDescription>
                Detailed scoring breakdown per assessment section
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Section</th>
                    <th className="py-2.5 px-3 text-right">Max Marks</th>
                    <th className="py-2.5 px-3 text-right">Average Score</th>
                    <th className="py-2.5 px-3 text-right">Avg %</th>
                    <th className="py-2.5 px-3 text-right">Scored &gt; 0</th>
                    <th className="py-2.5 px-3 text-right">Scored Zero</th>
                    <th className="py-2.5 px-3 text-right">Full Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {analysis.sec.map((s) => (
                    <tr key={s.key} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        {s.name}
                        {s.coding && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono">
                            Coding
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">{s.max}</td>
                      <td className="py-2 px-3 text-right font-bold font-mono text-[#1B2A4A] dark:text-[#7FA7DA]">
                        {num(s.avg)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold">
                        {pct(s.avgPct)}
                      </td>
                      <td className="py-2 px-3 text-right text-[#0E7C66] font-medium">
                        {s.pos} ({pct(s.posPct)})
                      </td>
                      <td className="py-2 px-3 text-right text-[#C4472D] font-medium">
                        {s.zero}
                      </td>
                      <td className="py-2 px-3 text-right text-[#0E7C66] font-medium">
                        {s.full}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Section-Wise Category Tabs */}
          {analysis.secCats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Section-Wise Performer Categories</CardTitle>
                <CardDescription>
                  Candidates categorized on their individual section scores using identical percentage thresholds
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Section selection pills */}
                <div className="flex flex-wrap gap-2">
                  {analysis.secCats.map((sc, i) => (
                    <button
                      key={sc.name}
                      type="button"
                      onClick={() => setSelectedSecTab(i)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                        selectedSecTab === i
                          ? 'bg-[#1B2A4A] text-white dark:bg-[#7FA7DA] dark:text-[#0D141E]'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {sc.name} ({sc.max}M)
                    </button>
                  ))}
                </div>

                {/* Selected section category breakdown */}
                {(() => {
                  const sc = analysis.secCats[selectedSecTab] || analysis.secCats[0];
                  return (
                    <div className="space-y-4 pt-2">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {sc.cats.map((cat, cIdx) => (
                          <div
                            key={cIdx}
                            className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
                            style={{ borderLeft: `3px solid rgb(${cat.rgb.join(',')})` }}
                          >
                            <div className="text-xs text-slate-500 font-semibold">{cat.label}</div>
                            <div className="text-xl font-bold font-serif text-slate-900 dark:text-slate-100 mt-1">
                              {cat.n}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{cat.range}</div>
                          </div>
                        ))}
                      </div>

                      {/* Candidate list for selected section categories */}
                      <div className="space-y-3 pt-2">
                        {sc.cats.map((cat, cIdx) => (
                          <div
                            key={cIdx}
                            className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-[#141E2C]"
                          >
                            <div
                              className="p-3 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200"
                              style={{ borderLeft: `4px solid rgb(${cat.rgb.join(',')})` }}
                            >
                              <span>
                                {sc.name}: {cat.label} Performers ({cat.n})
                              </span>
                              <span className="text-slate-400 font-normal">{cat.range}</span>
                            </div>
                            {cat.list.length === 0 ? (
                              <div className="p-3 text-xs text-slate-400 italic">No candidates in this tier.</div>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                  <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 uppercase">
                                      <th className="py-1 px-2">#</th>
                                      {data.hasId && <th className="py-1 px-2">Member ID</th>}
                                      <th className="py-1 px-2">Candidate Name</th>
                                      {data.hasGroup && <th className="py-1 px-2">Group</th>}
                                      <th className="py-1 px-2 text-right">Score</th>
                                      <th className="py-1 px-2 text-right">% of Section</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                                    {cat.list.slice(0, 20).map((c, i) => (
                                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                        <td className="py-1 px-2 text-slate-400">{i + 1}</td>
                                        {data.hasId && <td className="py-1 px-2 font-mono text-slate-500">{c.id}</td>}
                                        <td className="py-1 px-2 font-medium">{c.name}</td>
                                        {data.hasGroup && (
                                          <td className="py-1 px-2 text-slate-500">{shortGroup(c.group)}</td>
                                        )}
                                        <td className="py-1 px-2 text-right font-bold font-mono text-[#1B2A4A] dark:text-[#7FA7DA]">
                                          {num(c.scores[sc.idx])} / {sc.max}
                                        </td>
                                        <td className="py-1 px-2 text-right font-mono text-slate-500">
                                          {pct((c.scores[sc.idx] / sc.max) * 100)}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {cat.list.length > 20 && (
                                  <div className="p-2 text-center text-[11px] text-slate-400 bg-slate-50/40 dark:bg-slate-800/20">
                                    Showing top 20 of {cat.list.length} candidates in {cat.label} tier.
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* Group-Wise Performance */}
          {data.hasGroup && analysis.groups.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Group-Wise Performance Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Group</th>
                      <th className="py-2.5 px-3 text-right">Registered</th>
                      <th className="py-2.5 px-3 text-right">Attempted</th>
                      <th className="py-2.5 px-3 text-right">Qualified</th>
                      <th className="py-2.5 px-3 text-right">Pass Rate</th>
                      <th className="py-2.5 px-3 text-right">Average Score</th>
                      <th className="py-2.5 px-3 text-right">Highest</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {analysis.groups.map((g) => (
                      <tr key={g.group} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-semibold text-[#1B2A4A] dark:text-[#7FA7DA]">
                          {shortGroup(g.group)}
                        </td>
                        <td className="py-2 px-3 text-right">{g.reg}</td>
                        <td className="py-2 px-3 text-right font-medium">{g.att}</td>
                        <td className="py-2 px-3 text-right font-medium text-[#0E7C66]">{g.pass}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-[#0E7C66]">
                          {pct(g.passPct)}
                        </td>
                        <td className="py-2 px-3 text-right font-bold font-mono">{num(g.avg)}</td>
                        <td className="py-2 px-3 text-right font-mono">{num(g.max)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {/* Top Performers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Top {Math.min(settings.top, analysis.sorted.length)} Performers</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Rank</th>
                    <th className="py-2.5 px-3">Name</th>
                    {data.hasGroup && <th className="py-2.5 px-3">Group</th>}
                    {analysis.sec.map((s) => (
                      <th key={s.key} className="py-2.5 px-3 text-right">
                        {s.name}
                      </th>
                    ))}
                    <th className="py-2.5 px-3 text-right">Total Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {analysis.sorted.slice(0, settings.top).map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-semibold text-slate-400">{i + 1}</td>
                      <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-100">
                        {c.name}
                      </td>
                      {data.hasGroup && (
                        <td className="py-2 px-3 text-slate-500">{shortGroup(c.group)}</td>
                      )}
                      {c.scores.map((sc, scIdx) => (
                        <td key={scIdx} className="py-2 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                          {num(sc)}
                        </td>
                      ))}
                      <td className="py-2 px-3 text-right font-bold font-mono text-[#0E7C66]">
                        {num(c.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
