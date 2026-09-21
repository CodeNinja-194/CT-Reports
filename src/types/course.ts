export interface CourseColumn {
  key: string;
  label: string;
  code: string;
}

export interface StudentCourseValue {
  value: number;
  notStarted: boolean;
}

export interface CourseStudent {
  id: string;
  name: string;
  email: string;
  groups: string;
  courseValues: Record<string, StudentCourseValue>;
  avg: number;
  sectionLabel?: string;
  notStartedCourses?: string[];
}

export interface PasswordNotSetEntry {
  name: string;
  email: string;
  groups: string;
  createdTime: string;
}

export interface SectionMeta {
  batch: string;
  branch: string;
  section: string;
  label: string;
}

export interface CourseFileParsed {
  kind: 'course';
  fileName: string;
  meta: SectionMeta;
  courses: CourseColumn[];
  students: CourseStudent[];
}

export interface PasswordFileParsed {
  kind: 'password';
  fileName: string;
  meta: SectionMeta;
  entries: PasswordNotSetEntry[];
}

export type ParsedWorkbook = CourseFileParsed | PasswordFileParsed;

export interface SectionCourseStat extends CourseColumn {
  avg: number;
  notStartedCount: number;
  completeCount: number;
  notStartedRate: number;
}

export interface SectionData {
  batch: string;
  branch: string;
  section: string;
  label: string;
  fileName: string;
  studentCount: number;
  avgOfAvgs: number;
  perCourse: SectionCourseStat[];
  atRisk: CourseStudent[];
  startedCount: number;
  notStartedCount: number;
  students: CourseStudent[];
  courses: CourseColumn[];
}

export interface EnrollmentRow {
  label: string;
  started: number;
  notStarted: number;
  passwordNotSet: number;
  subTotal: number;
}

export interface PerformanceCategory {
  key: 'atRisk' | 'average' | 'good' | 'excellent';
  title: string;
  range: string;
  color: string;
  test: (avg: number) => boolean;
  students: CourseStudent[];
}

export interface CourseInsightsAggregate {
  sections: SectionData[];
  totalStudents: number;
  overallAvg: number;
  totalAtRisk: number;
  pwBySection: Record<string, { meta: SectionMeta; entries: PasswordNotSetEntry[] }>;
  totalPasswordIssues: number;
  branchCharts: Array<{
    branch: string;
    courses: Array<{
      key: string;
      label: string;
      code: string;
      avg: number;
      notStartedRate: number;
      students: number;
    }>;
  }>;
  allStudentsFlat: CourseStudent[];
  categorizedStudents: PerformanceCategory[];
  atRiskAll: CourseStudent[];
  topPerformers: CourseStudent[];
  weakestSection: SectionData | null;
  strongestSection: SectionData | null;
  weakestCourse: { label: string; code: string; notStartedRate: number; branch: string } | null;
  batches: string[];
  enrollment: EnrollmentRow[];
  enrollmentTotals: {
    started: number;
    notStarted: number;
    passwordNotSet: number;
    subTotal: number;
  };
}
