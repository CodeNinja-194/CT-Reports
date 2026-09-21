import * as XLSX from 'xlsx';
import { CourseInsightsAggregate } from '../../../types/course';
import { safeName } from '../../../lib/utils';

export function exportCourseInsightsExcel(
  insights: CourseInsightsAggregate,
  collegeName: string
): void {
  const wb = XLSX.utils.book_new();

  // 1. Enrollment Summary Sheet
  const enrollmentData = insights.enrollment.map((r) => ({
    Section: r.label,
    Started: r.started,
    'Not Started': r.notStarted,
    'Password Not Set': r.passwordNotSet,
    'Sub Total': r.subTotal,
  }));
  enrollmentData.push({
    Section: 'Total',
    Started: insights.enrollmentTotals.started,
    'Not Started': insights.enrollmentTotals.notStarted,
    'Password Not Set': insights.enrollmentTotals.passwordNotSet,
    'Sub Total': insights.enrollmentTotals.subTotal,
  });
  const wsEnrollment = XLSX.utils.json_to_sheet(enrollmentData);
  XLSX.utils.book_append_sheet(wb, wsEnrollment, 'Enrollment Summary');

  // 2. Section Summary Sheet
  const sectionData = insights.sections.map((s) => ({
    Section: s.label,
    Students: s.studentCount,
    'Avg Completion %': Number(s.avgOfAvgs.toFixed(2)),
    'At Risk Count': s.atRisk.length,
    'Passwords Not Set': insights.pwBySection[s.label]?.entries.length || 0,
  }));
  const wsSections = XLSX.utils.json_to_sheet(sectionData);
  XLSX.utils.book_append_sheet(wb, wsSections, 'Section Summary');

  // 3. All Students Sheet
  const allStudents = insights.allStudentsFlat.map((st) => {
    const row: Record<string, string | number> = {
      'Member ID': st.id,
      Name: st.name,
      Email: st.email,
      Group: st.sectionLabel || st.groups,
      'Average %': Number(st.avg.toFixed(2)),
    };
    Object.entries(st.courseValues).forEach(([courseName, cv]) => {
      row[courseName] = cv.notStarted ? 'Not Started' : Number(cv.value.toFixed(1));
    });
    return row;
  });
  const wsStudents = XLSX.utils.json_to_sheet(allStudents);
  XLSX.utils.book_append_sheet(wb, wsStudents, 'Student Progress');

  const slug = safeName(collegeName || 'Course');
  XLSX.writeFile(wb, `${slug}_Course_Report_Data.xlsx`);
}
