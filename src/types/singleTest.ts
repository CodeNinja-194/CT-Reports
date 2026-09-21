export interface AttemptedRecord {
  id: string;
  name: string;
  email: string;
  group: string;
  start: string;
  score: number;
  status: string;
  rank?: number;
}

export interface NotAttemptedRecord {
  id: string;
  name: string;
  email: string;
  group: string;
  reason: string;
}

export interface SingleTestMeta {
  college: string;
  testName: string;
  batch: string;
  date: string;
  max: number;
  pass: number;
  preparedBy: string;
}

export interface ScoreBin {
  lo: number;
  hi: number;
  label: string;
  count: number;
}

export interface PerformanceBand {
  key: string;
  label: string;
  color: string;
  count: number;
  test: (score: number) => boolean;
}

export interface GroupStats {
  n: number;
  registered: number;
  notAtt: number;
  part: number;
  avg: number;
  avgPct: number;
  median: number;
  hi: number;
  lo: number;
  passCount: number;
  below: number;
  passRate: number;
  full: number;
  fullPct: number;
  bins: ScoreBin[];
  bands: PerformanceBand[];
  reasons: Record<string, number>;
}

export interface SingleTestGroup {
  key: string;
  label: string;
  att: AttemptedRecord[];
  na: NotAttemptedRecord[];
  st: GroupStats;
  rank?: number;
}

export interface SingleTestAnalysis {
  all: GroupStats;
  groups: SingleTestGroup[];
  nRanked: number;
  hasNA: boolean;
}

export interface SingleTestSortState {
  key: string;
  dir: 1 | -1;
}

export interface SingleTestFilterState {
  q: string;
  group: string;
  status: 'all' | 'Passed' | 'Below pass' | 'Not attempted';
  limit: number;
}
