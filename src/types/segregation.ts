export interface SegregationSection {
  key: string;
  name: string;
  max: number;
  coding: boolean;
}

export interface CandidateRecord {
  id: string;
  name: string;
  group: string;
  scores: number[];
  total: number;
  attempted: boolean;
  sheetPassed: boolean | null;
}

export interface SegregationParsedData {
  cands: CandidateRecord[];
  sections: SegregationSection[];
  totalMax: number;
  cutoff: number;
  inferred: boolean;
  sheetCut: number | null;
  hasGroup: boolean;
  hasId: boolean;
  cutoffUsed: number;
  adv: number;
  avgMin: number;
}

export interface PerformerBandDef {
  label: string;
  col: string;
  rgb: [number, number, number];
  range: string;
  list: CandidateRecord[];
  n: number;
  pct: number;
}

export interface SectionAnalysis extends SegregationSection {
  avg: number;
  avgPct: number;
  pos: number;
  posPct: number;
  full: number;
  zero: number;
}

export interface SectionCategoryDef {
  label: string;
  col: string;
  rgb: [number, number, number];
  range: string;
  list: CandidateRecord[];
  n: number;
  pct: number;
}

export interface SectionWiseCategory {
  name: string;
  max: number;
  idx: number;
  cats: SectionCategoryDef[];
}

export interface SegregationGroupStat {
  group: string;
  reg: number;
  att: number;
  pass: number;
  sum: number;
  max: number;
  attPct: number;
  passPct: number;
  avg: number;
}

export interface SegregationAnalysis {
  N: number;
  att: number;
  notAtt: number;
  passN: number;
  cutoff: number;
  totalMax: number;
  avg: number;
  med: number;
  max: number;
  min: number;
  attRate: number;
  passRate: number;
  passOverall: number;
  hist: number[];
  bands: PerformerBandDef[];
  sec: SectionAnalysis[];
  secTh: number[];
  secCats: SectionWiseCategory[];
  groups: SegregationGroupStat[];
  insights: string[];
  A: CandidateRecord[];
  Q: CandidateRecord[];
  sorted: CandidateRecord[];
  notAttempted: CandidateRecord[];
}

export interface SegregationSettings {
  title: string;
  test: string;
  org: string;
  date: string;
  top: number;
  sec: boolean;
  notAtt: boolean;
}
