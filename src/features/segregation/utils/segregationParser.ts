import * as XLSX from 'xlsx';
import {
  CandidateRecord,
  SegregationSection,
  SegregationParsedData,
  SegregationAnalysis,
  PerformerBandDef,
  SectionWiseCategory,
  SegregationGroupStat,
} from '../../../types/segregation';
import { shortGroup } from '../../../lib/utils';

export function parseSegregationSheet(buf: ArrayBuffer): SegregationParsedData {
  const wb = XLSX.read(buf, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });
  if (!rows.length) throw new Error('The spreadsheet has no data rows.');

  const headers = Object.keys(rows[0]);
  const find = (re: RegExp) => headers.find((h) => re.test(h.trim()));

  const hName = find(/^(candidate\s*)?name$/i) || find(/name/i);
  const hId = find(/member\s*id|^id$|roll|reg/i);
  const hGroup = find(/group|batch|class|branch/i);
  const hStatus = find(/^status$/i);
  const hTotal = headers.find((h) => /^total/i.test(h.trim()));
  const hPassed = find(/^passed?$|^result$/i);

  const secRe = /\(\s*(\d+(?:\.\d+)?)\s*M\s*\)/i;
  const secH = headers.filter((h) => h !== hTotal && secRe.test(h));

  if (!hName) throw new Error('Could not find a "Name" column.');
  if (!secH.length) {
    throw new Error(
      'Could not find section columns with marks. Column headers should look like "Coding - Easy (10M)".'
    );
  }

  const sections: SegregationSection[] = secH.map((h) => ({
    key: h,
    name: h.replace(/\s*\(\s*[\d.]+\s*M\s*\)\s*/i, '').trim(),
    max: parseFloat(h.match(secRe)![1]),
    coding: /cod/i.test(h),
  }));

  const sumMax = sections.reduce((t, s) => t + s.max, 0);
  const totalMax = hTotal && secRe.test(hTotal) ? parseFloat(hTotal.match(secRe)![1]) : sumMax;

  const truthy = (v: unknown) => v === true || /^(true|yes|1|pass)/i.test(String(v).trim());
  const numVal = (v: unknown) =>
    typeof v === 'number' ? v : parseFloat(String(v).replace(/[^\d.-]/g, '')) || 0;

  const cands: CandidateRecord[] = rows
    .filter((r) => headers.some((h) => String(r[h]).trim() !== ''))
    .map((r) => {
      const scores = secH.map((h) => numVal(r[h]));
      const total = hTotal ? numVal(r[hTotal]) : scores.reduce((t, x) => t + x, 0);
      const status = hStatus ? String(r[hStatus]).trim() : '';
      const attempted = hStatus ? !/not/i.test(status) : total > 0;
      return {
        id: hId ? String(r[hId]).trim() : '',
        name: String(r[hName]).trim(),
        group: hGroup ? String(r[hGroup]).trim() : '',
        scores,
        total,
        attempted,
        sheetPassed: hPassed ? truthy(r[hPassed]) : null,
      };
    });

  // Infer cutoff from sheet's own Passed column if present
  let cutoff = totalMax * 0.5;
  let inferred = false;
  let sheetCut: number | null = null;

  if (hPassed) {
    const p = cands.filter((c) => c.attempted && c.sheetPassed);
    const f = cands.filter((c) => c.attempted && !c.sheetPassed);
    if (p.length) {
      const lo = Math.min(...p.map((c) => c.total));
      const hi = f.length ? Math.max(...f.map((c) => c.total)) : -1;
      if (hi < lo) {
        sheetCut = lo;
        cutoff = lo;
        inferred = true;
      }
    }
  }

  const adv = Math.round(totalMax * 0.75);
  const avgMin = Math.round(totalMax * 0.3);

  return {
    cands,
    sections,
    totalMax,
    cutoff,
    inferred,
    sheetCut,
    hasGroup: !!hGroup,
    hasId: !!hId,
    cutoffUsed: cutoff,
    adv,
    avgMin,
  };
}

const median = (arr: number[]) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const pctOf = (a: number, b: number) => (b ? (a / b) * 100 : 0);

export function analyzeSegregation(
  data: SegregationParsedData,
  cutoff: number,
  adv: number,
  avgMin: number
): SegregationAnalysis {
  const { cands, sections, totalMax } = data;
  const A = cands.filter((c) => c.attempted);
  const Q = A.filter((c) => c.total >= cutoff).sort((x, y) => y.total - x.total);
  const totals = A.map((c) => c.total);

  const N = cands.length;
  const att = A.length;
  const notAtt = N - att;
  const passN = Q.length;
  const avg = totals.length ? totals.reduce((t, x) => t + x, 0) / totals.length : 0;
  const med = median(totals);
  const max = totals.length ? Math.max(...totals) : 0;
  const min = totals.length ? Math.min(...totals) : 0;

  const attRate = pctOf(att, N);
  const passRate = pctOf(passN, att);
  const passOverall = pctOf(passN, N);

  // Histogram (10 bins on % of max)
  const hist = Array(10).fill(0);
  A.forEach((c) => {
    hist[Math.min(9, Math.floor(pctOf(c.total, totalMax) / 10))]++;
  });

  // Performer Categories
  const defs: PerformerBandDef[] = [
    { label: 'Advanced', col: '--b1', rgb: [14, 124, 102], range: `${adv} marks and above`, list: [], n: 0, pct: 0 },
    { label: 'Good', col: '--b2', rgb: [86, 169, 143], range: `${cutoff} to under ${adv} marks`, list: [], n: 0, pct: 0 },
    { label: 'Average', col: '--b3', rgb: [233, 177, 79], range: `${avgMin} to under ${cutoff} marks`, list: [], n: 0, pct: 0 },
    { label: 'Needs focus', col: '--b5', rgb: [196, 71, 45], range: `under ${avgMin} marks`, list: [], n: 0, pct: 0 },
  ];

  const sorted = [...A].sort((x, y) => y.total - x.total);
  sorted.forEach((c) => {
    const idx = c.total >= adv ? 0 : c.total >= cutoff ? 1 : c.total >= avgMin ? 2 : 3;
    defs[idx].list.push(c);
  });

  const bands = defs.map((x) => ({
    ...x,
    n: x.list.length,
    pct: pctOf(x.list.length, att),
  }));

  // Section-wise performance
  const sec = sections.map((s, i) => {
    const v = A.map((c) => c.scores[i]);
    const secAvg = v.length ? v.reduce((t, x) => t + x, 0) / v.length : 0;
    const pos = v.filter((x) => x > 0).length;
    return {
      ...s,
      avg: secAvg,
      avgPct: pctOf(secAvg, s.max),
      pos,
      posPct: pctOf(pos, att),
      full: v.filter((x) => x >= s.max).length,
      zero: v.filter((x) => x === 0).length,
    };
  });

  // Section-wise categories
  const tp = [adv / totalMax, cutoff / totalMax, avgMin / totalMax];
  const secCats: SectionWiseCategory[] = sec.map((s, i) => {
    const t = tp.map((p) => p * s.max - 1e-9);
    const cats = bands.map((b) => ({
      label: b.label,
      col: b.col,
      rgb: b.rgb,
      range: '',
      list: [] as CandidateRecord[],
      n: 0,
      pct: 0,
    }));

    [...A]
      .sort((x, y) => y.scores[i] - x.scores[i] || y.total - x.total)
      .forEach((c) => {
        const v = c.scores[i];
        const cIdx = v >= t[0] ? 0 : v >= t[1] ? 1 : v >= t[2] ? 2 : 3;
        cats[cIdx].list.push(c);
      });

    const r = [
      `${(tp[0] * s.max).toFixed(1)} marks and above`,
      `${(tp[1] * s.max).toFixed(1)} to under ${(tp[0] * s.max).toFixed(1)} marks`,
      `${(tp[2] * s.max).toFixed(1)} to under ${(tp[1] * s.max).toFixed(1)} marks`,
      `under ${(tp[2] * s.max).toFixed(1)} marks`,
    ];

    cats.forEach((c, k) => {
      c.range = r[k];
      c.n = c.list.length;
      c.pct = pctOf(c.n, att);
    });

    return { name: s.name, max: s.max, idx: i, cats };
  });

  // Group stats
  const gm = new Map<string, { group: string; reg: number; att: number; pass: number; sum: number; max: number }>();
  cands.forEach((c) => {
    const g = c.group || '-';
    if (!gm.has(g)) gm.set(g, { group: g, reg: 0, att: 0, pass: 0, sum: 0, max: 0 });
    const o = gm.get(g)!;
    o.reg++;
    if (c.attempted) {
      o.att++;
      o.sum += c.total;
      o.max = Math.max(o.max, c.total);
      if (c.total >= cutoff) o.pass++;
    }
  });

  const groups: SegregationGroupStat[] = [...gm.values()]
    .sort((x, y) => x.group.localeCompare(y.group, undefined, { numeric: true }))
    .map((g) => ({
      ...g,
      attPct: pctOf(g.att, g.reg),
      passPct: pctOf(g.pass, g.att),
      avg: g.att ? g.sum / g.att : 0,
    }));

  const insightsList = generateSegregationInsights({
    N,
    att,
    notAtt,
    passN,
    cutoff,
    totalMax,
    avg,
    med,
    max,
    min,
    attRate,
    passRate,
    passOverall,
    bands,
    sec,
    groups,
    A,
  });

  return {
    N,
    att,
    notAtt,
    passN,
    cutoff,
    totalMax,
    avg,
    med,
    max,
    min,
    attRate,
    passRate,
    passOverall,
    hist,
    bands,
    sec,
    secTh: tp,
    secCats,
    groups,
    insights: insightsList,
    A,
    Q,
    sorted,
    notAttempted: cands.filter((c) => !c.attempted),
  };
}

function generateSegregationInsights(data: {
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
  bands: PerformerBandDef[];
  sec: any[];
  groups: SegregationGroupStat[];
  A: CandidateRecord[];
}): string[] {
  const o: string[] = [];
  const { N, att, notAtt, passN, cutoff, totalMax, avg, med, max, min, attRate, passRate, passOverall, bands, sec, groups, A } = data;

  o.push(`${att} of ${N} registered candidates (${attRate.toFixed(1)}%) attempted the test; ${notAtt} did not appear.`);
  o.push(
    `${passN} candidates qualified at the cut-off of ${cutoff.toFixed(1)} marks. That is ${passRate.toFixed(1)}% of those who attempted and ${passOverall.toFixed(1)}% of all registered candidates.`
  );
  o.push(`The average score was ${avg.toFixed(1)} out of ${totalMax} (median ${med.toFixed(1)}). Scores ranged from ${min} to ${max}.`);

  if (att) {
    const ad = bands[0];
    const nf = bands[3];
    o.push(`${ad.n} candidates (${ad.pct.toFixed(1)}%) are Advanced performers (${ad.range}). ${nf.n} candidates (${nf.pct.toFixed(1)}%) need focus (${nf.range}).`);
  }

  if (sec.length > 1) {
    const s = [...sec].sort((x, y) => y.avgPct - x.avgPct);
    const best = s[0];
    const worst = s[s.length - 1];
    o.push(`${best.name} was the strongest section (${best.avgPct.toFixed(1)}% average). ${worst.name} was the weakest (${worst.avgPct.toFixed(1)}% average).`);
  }

  const cod = sec.filter((s) => s.coding);
  const non = sec.filter((s) => !s.coding);
  if (cod.length && att) {
    const zeroAll = A.filter((c) => sec.every((s, i) => !s.coding || c.scores[i] === 0)).length;
    o.push(`${zeroAll} of ${att} attempters (${pctOf(zeroAll, att).toFixed(1)}%) scored zero in every coding section.`);
    const hardest = [...cod].sort((x, y) => y.max - x.max)[0];
    o.push(`Only ${hardest.pos} candidate${hardest.pos === 1 ? '' : 's'} (${hardest.posPct.toFixed(1)}%) scored any marks in ${hardest.name}, and ${hardest.full} scored full marks.`);
    if (non.length) {
      const cp = pctOf(
        cod.reduce((t, s) => t + s.avg, 0),
        cod.reduce((t, s) => t + s.max, 0)
      );
      const np = pctOf(
        non.reduce((t, s) => t + s.avg, 0),
        non.reduce((t, s) => t + s.max, 0)
      );
      if (np - cp > 15) {
        o.push(`Candidates performed significantly better in non-coding sections (${np.toFixed(1)}% of marks on average) than in coding (${cp.toFixed(1)}%).`);
      }
    }
  }

  const g = groups.filter((x) => x.att >= 10);
  if (g.length > 1) {
    const s = [...g].sort((x, y) => y.passPct - x.passPct);
    o.push(
      `Among groups with at least 10 attempters, ${shortGroup(s[0].group)} had the highest pass rate (${s[0].passPct.toFixed(1)}%) and ${shortGroup(s[s.length - 1].group)} the lowest (${s[s.length - 1].passPct.toFixed(1)}%).`
    );
  }

  const none = groups.filter((x) => x.att >= 5 && x.pass === 0).map((x) => shortGroup(x.group));
  if (none.length) {
    o.push(`No candidate qualified from: ${none.join(', ')}.`);
  }

  if (sec.length > 2) {
    const w = [...sec]
      .sort((x, y) => x.avgPct - y.avgPct)
      .slice(0, 2)
      .map((s) => s.name);
    o.push(`Suggested academic intervention focus: ${w.join(' and ')}, the two lowest-scoring assessment sections.`);
  }

  return o;
}
