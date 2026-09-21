import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileSpreadsheet, ArrowRight, CheckCircle2 } from 'lucide-react';

interface CourseReportHubProps {
  onNavigate: (path: string) => void;
}

export function CourseReportHub({ onNavigate }: CourseReportHubProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <Breadcrumbs items={[{ label: 'Course Report' }]} onNavigate={onNavigate} />

      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B2A4A] dark:text-[#E2E8F0]">
          Course Intelligence Reports
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Comprehensive student course progress monitoring, multi-section cohorts, and password activation audits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <Card className="hover:border-[#1B2A4A]/40 transition-all shadow-sm">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <CardTitle>Group Wise Course Report</CardTitle>
            <CardDescription>
              Analyze student course progress across groups, sections and course modules.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Supports multiple section files or single combined sheet</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Automatic detection of Started, Not Started &amp; Password Not Set</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>At-risk student threshold customization with exports</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate('/course-report/group-wise')}
              className="w-full text-xs font-semibold"
            >
              Open Group Wise Course
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
