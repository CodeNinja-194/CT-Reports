import { fmtPct } from '../../../lib/utils';
import { CourseInsightsAggregate } from '../../../types/course';

interface KeyObservationsCardProps {
  insights: CourseInsightsAggregate;
  threshold: number;
}

export function KeyObservationsCard({ insights, threshold }: KeyObservationsCardProps) {
  const {
    strongestSection,
    weakestSection,
    weakestCourse,
    totalAtRisk,
    totalStudents,
    totalPasswordIssues,
    pwBySection,
    sections,
  } = insights;

  const atRiskPct = totalStudents ? ((totalAtRisk / totalStudents) * 100).toFixed(1) : '0';

  return (
    <div className="bg-white dark:bg-[#141E2C] border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm">
      <h3 className="font-serif text-base font-semibold text-[#1B2A4A] dark:text-[#E2E8F0] mb-3">
        Key Observations
      </h3>
      <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed list-disc list-inside">
        {strongestSection && weakestSection && sections.length > 1 && (
          <li>
            <strong>{strongestSection.label}</strong> leads section performance with{' '}
            <span className="font-semibold text-[#0E7C66]">{fmtPct(strongestSection.avgOfAvgs)}</span>{' '}
            average completion, while <strong>{weakestSection.label}</strong> trails at{' '}
            <span className="font-semibold text-[#C4472D]">{fmtPct(weakestSection.avgOfAvgs)}</span> —
            a gap of {fmtPct(strongestSection.avgOfAvgs - weakestSection.avgOfAvgs)}.
          </li>
        )}

        {weakestCourse && (
          <li>
            <strong>{weakestCourse.label}</strong>
            {weakestCourse.code ? ` (${weakestCourse.code})` : ''} has the highest not-started rate in{' '}
            {weakestCourse.branch}, with {(weakestCourse.notStartedRate * 100).toFixed(0)}% of students
            yet to begin course modules.
          </li>
        )}

        <li>
          <strong>{totalAtRisk}</strong> {totalAtRisk === 1 ? 'student' : 'students'} ({atRiskPct}% of
          cohort) have an average completion below the {threshold}% threshold and are flagged for academic follow-up.
        </li>

        {totalPasswordIssues > 0 && (
          <li>
            <strong>{totalPasswordIssues}</strong> {totalPasswordIssues === 1 ? 'student' : 'students'} across{' '}
            {Object.keys(pwBySection).length} {Object.keys(pwBySection).length === 1 ? 'section' : 'sections'}{' '}
            have not established their required CodeTantra account password and have zero recorded course activity.
          </li>
        )}
      </ul>
    </div>
  );
}
