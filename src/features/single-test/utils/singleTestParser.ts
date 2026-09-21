import * as XLSX from 'xlsx';
import {
  AttemptedRecord,
  NotAttemptedRecord,
  SingleTestMeta,
  SingleTestAnalysis,
  GroupStats,
  SingleTestGroup,
  PerformanceBand,
  ScoreBin,
} from '../../../types/singleTest';
import { cmpNat, r1, groupLabel } from '../../../lib/utils';

export function parseCsv(text: string): (string | number | null)[][] {
  const rows: (string | number | null)[][] = [];
  let row: (string | number | null)[] = [];
  let cur = '';
  let q = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          q = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      q = true;
    } else if (ch === ',') {
      row.push(cur);
      cur = '';
    } else if (ch === '\n') {
      row.push(cur);
      rows.push(row);
      row = [];
      cur = '';
    } else if (ch !== '\r') {
      cur += ch;
    }
  }
  if (cur !== '' || row.length) {
    row.push(cur);
    rows.push(row);
  }
  return rows.map((r) =>
    r.map((v) => (v === '' ? null : isNaN(Number(v)) ? v : Number(v)))
  );
}

export function metaFromFilename(name: string): Partial<SingleTestMeta> {
  const m = /^\d+_(.+?)_(?:Not ?Attempted|Attempted)_(\d{2})-(\d{2})-(\d{4})/i.exec(name);
  if (!m) return {};
  let core = m[1];
  let batch = '';
  const b = /^(\d{4})-(\d{4})-(.+)$/.exec(core);
  if (b) {
    batch = `${b[1]}-${b[2]}`;
    core = b[3];
  }
  const testName = core
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return { batch, testName, date: `${m[4]}-${m[3]}-${m[2]}` };
}

const findCol = (head: string[], re: RegExp) => head.findIndex((h) => re.test(h));
const cellStr = (v: unknown) => (v === null || v === undefined ? '' : String(v).trim());

export interface IngestResult {
  kind: 'att' | 'na';
  recs: AttemptedRecord[] | NotAttemptedRecord[];
  max?: number | null;
  pass?: number | null;
}

export async function ingestTestFile(file: File): Promise<IngestResult> {
  let rows: (string | number | null)[][];
  if (/\.xlsx?$/i.test(file.name)) {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, blankrows: false });
  } else if (/\.csv$/i.test(file.name)) {
    rows = parseCsv(await file.text());
  } else {
    throw new Error(`"${file.name}" is not an Excel (.xlsx/.xls) or CSV file.`);
  }

  const h = rows.findIndex(
    (r, i) => i < 10 && r && r.some((c) => String(c ?? '').trim().toLowerCase() === 'member id')
  );
  if (h < 0) {
    throw new Error(`"${file.name}" has no "Member Id" column.`);
  }

  const head = rows[h].map((c) => String(c ?? '').trim());
  const body = rows.slice(h + 1).filter((r) => r && r.some((c) => c !== null && c !== ''));

  const iId = findCol(head, /^member id$/i);
  const iName = findCol(head, /^name$/i);
  const iEmail = findCol(head, /^email$/i);
  const iGroup = findCol(head, /^groups?$/i);
  const iTotal = findCol(head, /^total/i);
  const seen = new Set<string>();

  // Attempted file
  if (iTotal >= 0) {
    const iStart = findCol(head, /start time/i);
    const iPassed = findCol(head, /^passed$/i);
    const iStatus = findCol(head, /^status$/i);
    const maxM = /\(\s*(\d+(?:\.\d+)?)\s*M?\s*\)/i.exec(head[iTotal]);

    const recs: AttemptedRecord[] = [];
    let minPassed = Infinity;

    for (const r of body) {
      const id = cellStr(r[iId]);
      if (!id || seen.has(id)) continue;
      seen.add(id);

      const score = Number(r[iTotal]);
      if (isNaN(score)) continue;

      recs.push({
        id,
        name: cellStr(r[iName]),
        email: cellStr(r[iEmail]),
        group: cellStr(r[iGroup]) || 'Unassigned',
        start: cellStr(r[iStart]),
        score,
        status: cellStr(r[iStatus]),
      });

      if (iPassed >= 0 && String(r[iPassed]).toLowerCase() === 'true') {
        minPassed = Math.min(minPassed, score);
      }
    }

    return {
      kind: 'att',
      recs,
      max: maxM ? parseFloat(maxM[1]) : null,
      pass: isFinite(minPassed) ? minPassed : null,
    };
  }

  // Not Attempted file
  const iAct = findCol(head, /last activity$/i);
  const recs: NotAttemptedRecord[] = [];

  for (const r of body) {
    const id = cellStr(r[iId]);
    if (!id || seen.has(id)) continue;
    seen.add(id);

    const act = cellStr(r[iAct]);
    let reason = 'Not attempted';
    if (/^test expired/i.test(act)) reason = 'Test expired';
    else if (/^start test shown/i.test(act)) reason = 'Opened, not started';
    else if (act) reason = act.slice(0, 40);

    recs.push({
      id,
      name: cellStr(r[iName]),
      email: cellStr(r[iEmail]),
      group: cellStr(r[iGroup]) || 'Unassigned',
      reason,
    });
  }

  return { kind: 'na', recs };
}

export function bandDefs(max: number, pass: number): PerformanceBand[] {
  const ex = Math.ceil(max * 0.9);
  const gd = Math.max(Math.ceil(max * 0.75), pass);

  return [
    { key: 'ex', label: `Excellent (${ex}-${max})`, test: (s) => s >= ex, color: '#0B6E58', count: 0 },
    { key: 'gd', label: `Good (${gd}-${ex - 1})`, test: (s) => s >= gd && s < ex, color: '#4BB596', count: 0 },
    { key: 'ok', label: `Satisfactory (${pass}-${Math.max(gd - 1, pass)})`, test: (s) => s >= pass && s < gd, color: '#D9A21B', count: 0 },
    { key: 'lo', label: `Below pass (0-${Math.max(0, Math.ceil(pass) - 1)})`, test: (s) => s < pass, color: '#CF4B3A', count: 0 },
  ];
}

export function makeBins(scores: number[], max: number): ScoreBin[] {
  const M = Math.floor(max);
  const size = M <= 30 ? 1 : Math.ceil((M + 1) / 20);
  const bins: ScoreBin[] = [];

  for (let lo = 0; lo <= M; lo += size) {
    const hi = Math.min(lo + size - 1, M);
    bins.push({
      lo,
      hi,
      label: lo === hi ? String(lo) : `${lo}-${hi}`,
      count: 0,
    });
  }

  scores.forEach((s) => {
    const i = Math.min(bins.length - 1, Math.max(0, Math.floor(s / size)));
    bins[i].count++;
  });

  return bins;
}

export function calculateStats(
  att: AttemptedRecord[],
  na: NotAttemptedRecord[],
  max: number,
  pass: number
): GroupStats {
  const n = att.length;
  const scores = att.map((a) => a.score).sort((a, b) => a - b);
  const sum = scores.reduce((s, x) => s + x, 0);
  const avg = n ? sum / n : 0;
  const median = n ? (n % 2 ? scores[(n - 1) / 2] : (scores[n / 2 - 1] + scores[n / 2]) / 2) : 0;
  const passCount = scores.filter((s) => s >= pass).length;
  const full = scores.filter((s) => s >= max).length;

  const reasons: Record<string, number> = {};
  na.forEach((x) => {
    reasons[x.reason] = (reasons[x.reason] || 0) + 1;
  });

  const registered = n + na.length;
  const bands = bandDefs(max, pass).map((b) => ({
    ...b,
    count: scores.filter(b.test).length,
  }));

  return {
    n,
    registered,
    notAtt: na.length,
    part: registered ? (n / registered) * 100 : 0,
    avg,
    avgPct: max ? (avg / max) * 100 : 0,
    median,
    hi: n ? scores[n - 1] : 0,
    lo: n ? scores[0] : 0,
    passCount,
    below: n - passCount,
    passRate: n ? (passCount / n) * 100 : 0,
    full,
    fullPct: n ? (full / n) * 100 : 0,
    bins: makeBins(scores, max),
    bands,
    reasons,
  };
}

export function analyzeSingleTest(
  att: AttemptedRecord[],
  na: NotAttemptedRecord[],
  max: number,
  pass: number,
  hasNA: boolean
): SingleTestAnalysis {
  const keys = [...new Set([...att.map((a) => a.group), ...na.map((a) => a.group)])].sort(cmpNat);

  const groups: SingleTestGroup[] = keys.map((key) => {
    const grpAtt = att.filter((a) => a.group === key);
    const grpNa = na.filter((a) => a.group === key);
    return {
      key,
      label: groupLabel(key),
      att: grpAtt,
      na: grpNa,
      st: calculateStats(grpAtt, grpNa, max, pass),
    };
  });

  const ranked = groups.filter((g) => g.st.n > 0).sort((a, b) => b.st.avg - a.st.avg);
  ranked.forEach((g, i) => {
    g.rank = i + 1;
  });

  return {
    all: calculateStats(att, na, max, pass),
    groups,
    nRanked: ranked.length,
    hasNA,
  };
}

export function rankStudents(list: AttemptedRecord[]): AttemptedRecord[] {
  const s = [...list].sort((a, b) => b.score - a.score || cmpNat(a.name, b.name));
  let rank = 0;
  let prev: number | null = null;
  s.forEach((x, i) => {
    if (x.score !== prev) {
      rank = i + 1;
      prev = x.score;
    }
    x.rank = rank;
  });
  return s;
}

export function generateSingleTestInsights(analysis: SingleTestAnalysis, max: number, pass: number): string[] {
  const s = analysis.all;
  const out: string[] = [];

  if (analysis.hasNA) {
    out.push(
      `${s.n} of ${s.registered} registered students (${s.part.toFixed(1)}%) attempted the test. ${s.notAtt} did not attempt.`
    );
  } else {
    out.push(`${s.n} students attempted the test.`);
  }

  out.push(
    `The average score is ${s.avg.toFixed(1)}/${max} (${s.avgPct.toFixed(1)}%) with a median of ${s.median.toFixed(1)}. ${s.passRate.toFixed(1)}% of students who attempted (${s.passCount}) cleared the pass mark of ${pass}.`
  );

  if (s.full > 0) {
    out.push(
      `${s.full} ${s.full === 1 ? 'student' : 'students'} (${s.fullPct.toFixed(1)}% of attempts) scored full marks. ${s.below} scored below the pass mark.`
    );
  } else {
    out.push(`No student scored full marks. ${s.below} scored below the pass mark.`);
  }

  const gs = analysis.groups.filter((g) => g.st.n >= 5);
  if (gs.length > 1) {
    const byAvg = [...gs].sort((a, b) => b.st.avg - a.st.avg);
    const hi = byAvg[0];
    const lo = byAvg[byAvg.length - 1];
    out.push(
      `${hi.label} has the highest average (${hi.st.avg.toFixed(1)}/${max}). ${lo.label} has the lowest (${lo.st.avg.toFixed(1)}/${max}).`
    );

    const weak = gs
      .filter((g) => g.st.passRate < s.passRate - 5)
      .sort((a, b) => a.st.passRate - b.st.passRate)
      .slice(0, 5);
    if (weak.length) {
      out.push(
        `Groups with a pass rate more than 5 points below cohort average: ${weak
          .map((g) => `${g.label} (${g.st.passRate.toFixed(1)}%)`)
          .join(', ')}.`
      );
    }
  }

  return out;
}
