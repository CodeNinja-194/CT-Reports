import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileCheck2, Layers, ArrowRight, CheckCircle2 } from 'lucide-react';

interface TestsHubProps {
  onNavigate: (path: string) => void;
}

export function TestsHub({ onNavigate }: TestsHubProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <Breadcrumbs items={[{ label: 'Tests' }]} onNavigate={onNavigate} />

      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B2A4A] dark:text-[#E2E8F0]">
          Test Intelligence &amp; Performance Reports
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Convert assessment exports into executive summaries, pass-rate analytics, score spreads, and candidate segregation tiers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <Card className="hover:border-[#1B2A4A]/40 transition-all shadow-sm flex flex-col justify-between">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <CardTitle>Single Test Report</CardTitle>
            <CardDescription>
              Convert test exports into a management-ready performance report.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Merged Attempted &amp; Unattempted student tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pass rate, median, score histogram, and group rankings</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Download College Summary, Group Reports &amp; All-in-one ZIP</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate('/tests/single-test')}
              className="w-full text-xs font-semibold"
            >
              Open Single Test
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:border-[#1B2A4A]/40 transition-all shadow-sm flex flex-col justify-between">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2">
              <Layers className="w-5 h-5" />
            </div>
            <CardTitle>Test Segregation Report</CardTitle>
            <CardDescription>
              Organize student assessment results into tiered performance segments.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Sectional marks breakdown (Coding Easy, Medium, Hard, etc.)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Advanced, Good, Average, and Needs Focus categorization</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Interactive section tabs and comprehensive PDF generation</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate('/tests/segregation')}
              className="w-full text-xs font-semibold"
            >
              Open Segregation
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
