import { useEffect, useRef, useState } from 'react';
import {
  BookOpenCheck,
  ChartNoAxesCombined,
  UsersRound,
  FileBarChart,
  Upload,
  ScanSearch,
  ChartSpline,
  FileOutput,
  GraduationCap,
  ClipboardCheck,
  Users,
  BookOpen,
  FileCheck2,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  FileText,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

/* ─── tiny animation hook ─── */
function useFadeInOnScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ─── section wrapper with fade-up ─── */
function FadeSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useFadeInOnScroll();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── mini mock dashboard preview ─── */
function DashboardPreview() {
  const groups = [
    { name: 'CSE-A', progress: 82, students: 48, atRisk: 3 },
    { name: 'CSE-B', progress: 67, students: 51, atRisk: 7 },
    { name: 'ECE-A', progress: 74, students: 44, atRisk: 5 },
    { name: 'MECH-A', progress: 55, students: 39, atRisk: 11 },
  ];
  return (
    <div className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#141E2C] shadow-lg overflow-hidden text-[11px] font-sans select-none">
      {/* Mini Topbar */}
      <div className="bg-[#1B2A4A] dark:bg-[#0D1829] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[#D9A93A]/20 border border-[#D9A93A]/40 flex items-center justify-center">
            <GraduationCap className="w-3 h-3 text-[#D9A93A]" />
          </div>
          <span className="text-white font-semibold text-[11px]">Group Wise Course Report</span>
        </div>
        <span className="text-slate-400 text-[10px]">Sample Data</span>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-px bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        {[
          { label: 'Enrolled', value: '182', color: 'text-slate-700 dark:text-slate-200' },
          { label: 'Started', value: '141', color: 'text-[#0E7C66]' },
          { label: 'At Risk', value: '26', color: 'text-[#B8860F]' },
          { label: 'Not Started', value: '15', color: 'text-[#C4472D]' },
        ].map((k) => (
          <div key={k.label} className="bg-white dark:bg-[#141E2C] px-3 py-2.5 text-center">
            <div className={`font-bold text-base ${k.color}`}>{k.value}</div>
            <div className="text-slate-400 text-[9px] mt-0.5 uppercase tracking-wide">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Group Table */}
      <div className="px-3 py-2.5">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Group-Wise Progress</div>
        <div className="space-y-2">
          {groups.map((g) => (
            <div key={g.name} className="flex items-center gap-2">
              <span className="w-14 text-slate-600 dark:text-slate-300 font-medium shrink-0">{g.name}</span>
              <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${g.progress}%`,
                    background: g.progress >= 75 ? '#0E7C66' : g.progress >= 60 ? '#B8860F' : '#C4472D',
                  }}
                />
              </div>
              <span className="w-7 text-right font-semibold text-slate-700 dark:text-slate-200">{g.progress}%</span>
              {g.atRisk > 5 && (
                <span className="text-[9px] bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                  {g.atRisk} at risk
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0E1622] flex items-center justify-between">
        <span className="text-slate-400 text-[9px]">↑ Sample / demo data — not real student data</span>
        <div className="flex gap-1.5">
          {['PDF', 'HTML', 'Excel'].map((f) => (
            <span key={f} className="px-1.5 py-0.5 text-[9px] bg-[#1B2A4A]/10 dark:bg-[#7FA7DA]/10 text-[#1B2A4A] dark:text-[#7FA7DA] rounded border border-[#1B2A4A]/20 dark:border-[#7FA7DA]/20 font-medium">
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── mini test report preview ─── */
function TestReportPreview() {
  const bars = [2, 5, 8, 14, 18, 22, 19, 12, 6, 3];
  const passIdx = 5;
  const max = Math.max(...bars);
  return (
    <div className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#141E2C] shadow-lg overflow-hidden text-[11px] select-none">
      <div className="bg-[#1B2A4A] dark:bg-[#0D1829] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="w-3.5 h-3.5 text-[#D9A93A]" />
          <span className="text-white font-semibold text-[11px]">Single Test Report</span>
        </div>
        <span className="text-slate-400 text-[10px]">Sample Data</span>
      </div>
      <div className="grid grid-cols-3 gap-px bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        {[
          { label: 'Attempted', value: '109' },
          { label: 'Avg Score', value: '61.4' },
          { label: 'Pass Rate', value: '73%' },
        ].map((k) => (
          <div key={k.label} className="bg-white dark:bg-[#141E2C] px-3 py-2.5 text-center">
            <div className="font-bold text-base text-slate-800 dark:text-slate-100">{k.value}</div>
            <div className="text-slate-400 text-[9px] mt-0.5 uppercase tracking-wide">{k.label}</div>
          </div>
        ))}
      </div>
      <div className="px-3 pt-2.5 pb-1">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Score Distribution</div>
        <div className="flex items-end gap-0.5 h-14">
          {bars.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
              <div
                className="w-full rounded-t"
                style={{
                  height: `${(v / max) * 100}%`,
                  background: i >= passIdx ? '#0E7C66' : '#e2e8f0',
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[8px] text-slate-400 mt-0.5">
          <span>0</span><span>Pass →</span><span>100</span>
        </div>
      </div>
      <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0E1622] flex items-center justify-between">
        <span className="text-slate-400 text-[9px]">↑ Sample data</span>
        <div className="flex gap-1.5">
          {['PDF', 'ZIP'].map((f) => (
            <span key={f} className="px-1.5 py-0.5 text-[9px] bg-[#0E7C66]/10 text-[#0E7C66] rounded border border-[#0E7C66]/20 font-medium">{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── segregation preview ─── */
function SegregationPreview() {
  const cats = [
    { label: 'Advanced', pct: 18, color: '#0E7C66', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-400' },
    { label: 'Good', pct: 34, color: '#1B2A4A', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-400' },
    { label: 'Average', pct: 31, color: '#B8860F', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-400' },
    { label: 'Needs Focus', pct: 17, color: '#C4472D', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-700 dark:text-red-400' },
  ];
  return (
    <div className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#141E2C] shadow-lg overflow-hidden text-[11px] select-none">
      <div className="bg-[#1B2A4A] dark:bg-[#0D1829] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-[#D9A93A]" />
          <span className="text-white font-semibold text-[11px]">Test Segregation Report</span>
        </div>
        <span className="text-slate-400 text-[10px]">Sample Data</span>
      </div>
      <div className="p-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Performance Categories (109 students)</div>
        <div className="space-y-1.5">
          {cats.map((c) => (
            <div key={c.label} className="flex items-center gap-2">
              <span className={`w-20 text-[10px] font-semibold shrink-0 ${c.text}`}>{c.label}</span>
              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: c.color }} />
              </div>
              <span className="w-8 text-right text-slate-600 dark:text-slate-300 font-medium">{c.pct}%</span>
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {cats.map((c) => (
            <div key={c.label} className={`rounded border px-2 py-1.5 text-center ${c.bg} ${c.border}`}>
              <div className={`font-bold text-sm ${c.text}`}>{Math.round(c.pct * 1.09)}</div>
              <div className={`text-[8px] ${c.text} opacity-75`}>{c.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0E1622] flex items-center justify-between">
        <span className="text-slate-400 text-[9px]">↑ Sample data</span>
        <span className="px-1.5 py-0.5 text-[9px] bg-[#1B2A4A]/10 dark:bg-[#7FA7DA]/10 text-[#1B2A4A] dark:text-[#7FA7DA] rounded border border-[#1B2A4A]/20 dark:border-[#7FA7DA]/20 font-medium">PDF Report</span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────── */
export function HomePage({ onNavigate }: HomePageProps) {
  /* ─── HERO ─── */
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  /* ─── Workflow Steps ─── */
  const workflowSteps = [
    { n: '01', title: 'Upload', desc: 'Upload the Excel export generated from your academic or training management system.', Icon: Upload },
    { n: '02', title: 'Analyze', desc: 'The platform processes students, groups, courses, scores and participation data instantly.', Icon: ScanSearch },
    { n: '03', title: 'Understand', desc: 'Use KPIs, tables, charts and student-level filters to identify important academic patterns.', Icon: ChartSpline },
    { n: '04', title: 'Report', desc: 'Generate professional reports shareable with Team Leads, coordinators, and management.', Icon: FileOutput },
  ];

  /* ─── Capabilities ─── */
  const capabilities = [
    {
      Icon: BookOpenCheck,
      title: 'Track Course Progress',
      desc: 'Understand group-wise course progress, student activation, started courses, incomplete progress and students requiring attention.',
      route: '/course-report/group-wise',
      accent: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-50 dark:bg-blue-950/40',
    },
    {
      Icon: ChartNoAxesCombined,
      title: 'Analyze Test Performance',
      desc: 'Generate clear test reports with participation, average scores, pass rates, score distributions and group-wise performance.',
      route: '/tests/single-test',
      accent: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      Icon: UsersRound,
      title: 'Segregate Student Performance',
      desc: 'Organize students based on test performance and identify meaningful performance categories for trainer follow-up.',
      route: '/tests/segregation',
      accent: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-50 dark:bg-purple-950/40',
    },
    {
      Icon: FileBarChart,
      title: 'Generate Management Reports',
      desc: 'Convert raw trainer data into structured PDF, HTML and downloadable reports suitable for academic reviews.',
      route: '/tests/single-test',
      accent: 'text-amber-600 dark:text-amber-500',
      iconBg: 'bg-amber-50 dark:bg-amber-950/40',
    },
  ];

  /* ─── Reporting Modules ─── */
  const modules = [
    {
      Icon: GraduationCap,
      title: 'Group Wise Course',
      category: 'COURSE REPORT',
      cat_color: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
      desc: 'Analyze student course progress across groups, sections and individual students.',
      features: ['Group-wise progress', 'Course-wise analysis', 'Student-level progress', 'Started / Not Started', 'Password status', 'At-risk students', 'PDF / HTML reporting'],
      cta: 'Open Course Report',
      route: '/course-report/group-wise',
      accent: '#3b82f6',
    },
    {
      Icon: ClipboardCheck,
      title: 'Single Test',
      category: 'TEST REPORT',
      cat_color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
      desc: 'Convert a single test result into a complete academic performance report.',
      features: ['Attempted / Not Attempted', 'Average score', 'Median score', 'Pass rate', 'Score distribution', 'Group-wise performance', 'Student scorecards', 'PDF / ZIP reports'],
      cta: 'Open Single Test',
      route: '/tests/single-test',
      accent: '#10b981',
    },
    {
      Icon: Users,
      title: 'Segregation',
      category: 'TEST ANALYSIS',
      cat_color: 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900',
      desc: 'Analyze student scores and organize performance into meaningful categories.',
      features: ['Score analysis', 'Performance categories', 'Student-level segregation', 'Group analysis', 'Threshold-based classification', 'Report generation'],
      cta: 'Open Segregation',
      route: '/tests/segregation',
      accent: '#a855f7',
    },
  ];

  /* ─── Trainer Insights ─── */
  const insights = [
    {
      Icon: AlertTriangle,
      title: 'Who needs attention?',
      desc: 'Identify students with low course progress, unsuccessful test performance or missing participation.',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
    {
      Icon: UsersRound,
      title: 'Which groups need follow-up?',
      desc: 'Compare group-wise participation, progress and academic performance using actual uploaded data.',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      Icon: TrendingUp,
      title: 'How is the batch performing?',
      desc: 'Quickly understand average performance, pass rates, participation and course completion.',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      Icon: FileText,
      title: 'What should be reported?',
      desc: 'Move from raw Excel exports to structured reports suitable for trainer and management reviews.',
      color: 'text-[#1B2A4A] dark:text-[#7FA7DA]',
      bg: 'bg-slate-50 dark:bg-slate-800/40',
    },
  ];

  /* ─── Management Points ─── */
  const mgmtPoints = [
    'Consistent reporting structure across all batches',
    'Student-level drill-down capability',
    'Group-wise academic visibility',
    'Course progress monitoring & activation tracking',
    'Test performance analysis with score distributions',
    'Exportable management-ready reports (PDF, ZIP, Excel)',
    'Reduced manual report preparation time',
  ];

  /* ─── Quick Actions ─── */
  const quickActions = [
    { label: 'Group Wise Course', desc: 'Analyze course progress', route: '/course-report/group-wise', Icon: BookOpen, accent: 'border-blue-200 dark:border-blue-900 hover:border-blue-400 dark:hover:border-blue-600 bg-blue-50/50 dark:bg-blue-950/20', iconColor: 'text-blue-600 dark:text-blue-400', iconBg: 'bg-blue-100 dark:bg-blue-950/60' },
    { label: 'Single Test', desc: 'Analyze one test result', route: '/tests/single-test', Icon: FileCheck2, accent: 'border-emerald-200 dark:border-emerald-900 hover:border-emerald-400 dark:hover:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20', iconColor: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-100 dark:bg-emerald-950/60' },
    { label: 'Segregation', desc: 'Analyze performance groups', route: '/tests/segregation', Icon: UsersRound, accent: 'border-purple-200 dark:border-purple-900 hover:border-purple-400 dark:hover:border-purple-600 bg-purple-50/50 dark:bg-purple-950/20', iconColor: 'text-purple-600 dark:text-purple-400', iconBg: 'bg-purple-100 dark:bg-purple-950/60' },
  ];

  return (
    <div className="space-y-0">

      {/* ═══════════════════════════════════════════════
          1. HERO
      ═══════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-12 pb-16 overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #f8fafc 0%, #eef2f8 40%, #f0f9f4 100%)' }}
      >
        {/* dark mode bg */}
        <div className="absolute inset-0 hidden dark:block" style={{ background: 'linear-gradient(160deg, #0D141E 0%, #0f1a2e 60%, #0a1a14 100%)' }} />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(#1B2A4A 1px, transparent 1px), linear-gradient(90deg, #1B2A4A 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        />

        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-center">

            {/* Left: Copy */}
            <div
              className="space-y-6"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(24px)',
                transition: 'opacity 0.6s ease, transform 0.6s ease',
              }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wider uppercase border bg-white/80 dark:bg-white/5 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 shadow-sm">
                <GraduationCap className="w-3.5 h-3.5 text-[#D9A93A]" />
                CodeTantra Trainers · Reporting & Academic Intelligence
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-[2.6rem] font-bold text-[#1B2A4A] dark:text-white leading-[1.15] tracking-tight">
                  Turn Student Data Into<br />
                  <span className="text-[#0E7C66] dark:text-[#3dd6a8]">Clear Academic Insights.</span>
                </h1>
                <p className="text-base text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                  A unified reporting workspace for CodeTantra trainers to analyze course progress, test performance, student participation, and group-wise academic outcomes.
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
                  Upload your existing reports, understand student performance, and generate professional reports — without spending hours preparing them manually.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => onNavigate('/course-report/group-wise')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1B2A4A] dark:bg-[#1E3460] text-white text-sm font-semibold hover:bg-[#243660] dark:hover:bg-[#24407a] transition-colors shadow-sm"
                >
                  Open Course Reports
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('/tests/single-test')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-white dark:hover:bg-slate-800 transition-colors bg-white/60 dark:bg-transparent"
                >
                  Explore Test Reports
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-5 pt-2 border-t border-slate-200 dark:border-slate-800">
                {[
                  { Icon: ShieldCheck, label: '100% In-Browser — No data uploads' },
                  { Icon: CheckCircle2, label: 'PDF · HTML · Excel · ZIP exports' },
                ].map(({ Icon: Ic, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Ic className="w-3.5 h-3.5 text-[#0E7C66]" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Dashboard Preview */}
            <div
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? 'translateY(0)' : 'translateY(32px)',
                transition: 'opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s',
              }}
            >
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          2. TRAINER WORKFLOW
      ═══════════════════════════════════════════════ */}
      <FadeSection className="py-14 border-t border-slate-200 dark:border-slate-800">
        <div className="space-y-3 mb-10">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-[#0E7C66]">TRAINER WORKFLOW</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] dark:text-slate-100">From Excel Export to Management-Ready Report</h2>
        </div>

        {/* Desktop horizontal / Mobile vertical timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 lg:gap-0 relative">
          {/* Connector line (desktop only) */}
          <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-slate-200 dark:bg-slate-700" />

          {workflowSteps.map((step, i) => (
            <FadeSection key={step.n} delay={i * 90} className="relative px-4 py-5">
              <div className="flex lg:flex-col items-start lg:items-center gap-4 lg:gap-3 lg:text-center">
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-white dark:bg-[#141E2C] border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
                    <step.Icon className="w-6 h-6 text-[#1B2A4A] dark:text-[#7FA7DA]" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#D9A93A] text-[9px] font-bold text-white flex items-center justify-center">{i + 1}</span>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{step.n}</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-1">{step.title}</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
              {i < workflowSteps.length - 1 && (
                <div className="lg:hidden absolute bottom-0 left-6 w-px h-5 bg-slate-200 dark:bg-slate-700" />
              )}
            </FadeSection>
          ))}
        </div>
      </FadeSection>

      {/* ═══════════════════════════════════════════════
          3. CAPABILITIES
      ═══════════════════════════════════════════════ */}
      <FadeSection className="py-14 border-t border-slate-200 dark:border-slate-800">
        <div className="space-y-3 mb-8">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-[#0E7C66]">BUILT AROUND THE TRAINER WORKFLOW</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] dark:text-slate-100">Everything a Trainer Needs for Daily Reporting</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">Bring course tracking, test analysis, student performance and report generation into one focused workspace.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {capabilities.map((cap, i) => (
            <FadeSection key={cap.title} delay={i * 70}>
              <button
                onClick={() => onNavigate(cap.route)}
                className="group w-full text-left p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141E2C] hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-200 flex items-start gap-4"
              >
                <div className={`flex-shrink-0 w-11 h-11 rounded-lg ${cap.iconBg} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  <cap.Icon className={`w-5 h-5 ${cap.accent}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-1 flex items-center gap-1.5">
                    {cap.title}
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 -translate-x-1 group-hover:translate-x-0 transition-all" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{cap.desc}</p>
                </div>
              </button>
            </FadeSection>
          ))}
        </div>
      </FadeSection>

      {/* ═══════════════════════════════════════════════
          4. REPORTING SUITE
      ═══════════════════════════════════════════════ */}
      <FadeSection className="py-14 border-t border-slate-200 dark:border-slate-800">
        <div className="space-y-3 mb-8">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-[#0E7C66]">REPORTING SUITE</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] dark:text-slate-100">One Workspace. Multiple Trainer Reports.</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl">Access the reporting modules trainers use most frequently.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modules.map((mod, i) => (
            <FadeSection key={mod.title} delay={i * 80}>
              <div className="h-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141E2C] overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200">
                <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${mod.cat_color}`}>{mod.category}</span>
                    <div className="w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                      <mod.Icon className="w-4.5 h-4.5 text-slate-500 dark:text-slate-400" style={{ width: '18px', height: '18px' }} />
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-1">{mod.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{mod.desc}</p>
                </div>

                <div className="px-5 py-4 flex-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Includes</div>
                  <ul className="space-y-1.5">
                    {mod.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <CheckCircle className="w-3 h-3 text-[#0E7C66] shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                  <button
                    onClick={() => onNavigate(mod.route)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-[#1B2A4A] dark:bg-[#1E3460] text-white text-xs font-semibold hover:bg-[#243660] dark:hover:bg-[#24407a] transition-colors"
                  >
                    {mod.cta}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </FadeSection>
          ))}
        </div>
      </FadeSection>

      {/* ═══════════════════════════════════════════════
          5. REPORT PREVIEWS
      ═══════════════════════════════════════════════ */}
      <FadeSection className="py-14 border-t border-slate-200 dark:border-slate-800">
        <div className="space-y-3 mb-8">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-[#0E7C66]">REPORT PREVIEWS</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] dark:text-slate-100">See What Each Report Looks Like</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">All previews below use sample data. Upload your own Excel to generate real reports.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FadeSection delay={0}><TestReportPreview /></FadeSection>
          <FadeSection delay={80}><DashboardPreview /></FadeSection>
          <FadeSection delay={160}><SegregationPreview /></FadeSection>
        </div>
      </FadeSection>

      {/* ═══════════════════════════════════════════════
          6. TRAINER INSIGHTS
      ═══════════════════════════════════════════════ */}
      <FadeSection className="py-14 border-t border-slate-200 dark:border-slate-800">
        <div className="space-y-3 mb-8">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-[#0E7C66]">WHAT TRAINERS CAN UNDERSTAND</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] dark:text-slate-100">From Raw Data to Actionable Trainer Insights</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {insights.map((ins, i) => (
            <FadeSection key={ins.title} delay={i * 70}>
              <div className="flex items-start gap-4 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141E2C] hover:shadow-sm transition-shadow">
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${ins.bg} flex items-center justify-center`}>
                  <ins.Icon className={`w-5 h-5 ${ins.color}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-1">{ins.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{ins.desc}</p>
                </div>
              </div>
            </FadeSection>
          ))}
        </div>
      </FadeSection>

      {/* ═══════════════════════════════════════════════
          7. MANAGEMENT VISIBILITY
      ═══════════════════════════════════════════════ */}
      <FadeSection className="py-14 border-t border-slate-200 dark:border-slate-800">
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-5">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-widest text-[#0E7C66] mb-3">MANAGEMENT VIEW</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] dark:text-slate-100 leading-tight">
                Designed for Trainer Operations.<br />
                <span className="text-slate-600 dark:text-slate-300 font-medium text-xl">Ready for Management Reviews.</span>
              </h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              The platform helps trainers maintain consistent reporting while giving Team Leads and management a clear view of academic performance.
            </p>
            <ul className="space-y-2.5">
              {mgmtPoints.map((pt) => (
                <li key={pt} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-[#0E7C66] mt-0.5 shrink-0" />
                  {pt}
                </li>
              ))}
            </ul>
          </div>

          {/* Management report preview panel */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#141E2C] overflow-hidden shadow-md">
            <div className="bg-[#1B2A4A] px-5 py-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#D9A93A]" />
              <span className="text-white text-sm font-semibold">Management Report Summary</span>
              <span className="ml-auto text-[10px] text-slate-400">Sample Data</span>
            </div>

            {[
              { section: 'Overview', items: ['Total Enrolled: 182 students across 4 groups', 'Started: 141 (77.5%) | Not Started: 15 (8.2%)', 'At Risk (&lt;60% progress): 26 students'] },
              { section: 'Group Performance', items: ['CSE-A: 82% avg progress — On track', 'CSE-B: 67% avg progress — Monitor required', 'MECH-A: 55% avg progress — Needs follow-up'] },
              { section: 'Attention List', items: ['26 students below threshold in 3 groups', 'Password not set: 6 students (CSE-B, MECH-A)', '5 students with 0% progress — escalate'] },
            ].map((block) => (
              <div key={block.section} className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">{block.section}</div>
                <ul className="space-y-1">
                  {block.items.map((item) => (
                    <li key={item} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#1B2A4A]/30 dark:bg-slate-600 shrink-0" />
                      <span dangerouslySetInnerHTML={{ __html: item }} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="px-5 py-3 bg-slate-50 dark:bg-[#0E1622] flex items-center justify-between">
              <span className="text-[9px] text-slate-400">↑ Sample / demo data</span>
              <span className="text-[10px] font-semibold text-[#0E7C66]">Exportable as PDF</span>
            </div>
          </div>
        </div>
      </FadeSection>

      {/* ═══════════════════════════════════════════════
          8. QUICK ACTIONS
      ═══════════════════════════════════════════════ */}
      <FadeSection className="py-14 border-t border-slate-200 dark:border-slate-800">
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A4A] dark:text-slate-100">Start a Report</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Choose the report you need and begin with your existing Excel or CSV data.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {quickActions.map((action, i) => (
            <FadeSection key={action.label} delay={i * 80}>
              <button
                onClick={() => onNavigate(action.route)}
                className={`group w-full text-left p-5 rounded-xl border transition-all duration-200 hover:shadow-md ${action.accent}`}
              >
                <div className={`w-10 h-10 rounded-lg ${action.iconBg} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                  <action.Icon className={`w-5 h-5 ${action.iconColor}`} />
                </div>
                <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-1 flex items-center gap-1">
                  {action.label}
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-70 -translate-x-1 group-hover:translate-x-0 transition-all" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{action.desc}</p>
              </button>
            </FadeSection>
          ))}
        </div>
      </FadeSection>

    </div>
  );
}
