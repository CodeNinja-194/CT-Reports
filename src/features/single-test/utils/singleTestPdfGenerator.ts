import { PDFDocument, StandardFonts, rgb, PDFPage, PDFFont } from 'pdf-lib';
import {
  SingleTestAnalysis,
  SingleTestMeta,
  SingleTestGroup,
  AttemptedRecord,
  NotAttemptedRecord,
  ScoreBin,
} from '../../../types/singleTest';
import {
  rankStudents,
  generateSingleTestInsights,
} from './singleTestParser';
import { num, pct, r1, prettyDate, safeName, groupLabel, cmpNat } from '../../../lib/utils';

const PW = 595.28;
const PH = 841.89;
const PM = 40;
const CW = PW - PM * 2;

const hex = (h: string) => {
  h = h.replace('#', '');
  return rgb(
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255
  );
};

const clean = (s: unknown) =>
  String(s ?? '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2265/g, '>=')
    .replace(/\u2026/g, '...')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[^\x20-\x7E\u00A0-\u00FF]/g, '?');

const C = {
  navy: '#17233F',
  ink: '#1D2433',
  grey: '#5B6478',
  line: '#D9DEE8',
  light: '#F2F5FA',
  pass: '#0F8B6E',
  fail: '#CF4B3A',
  amber: '#D9A21B',
  accent: '#2F4BD0',
  soft: '#C9D3EE',
};

class ReportBuilder {
  doc!: PDFDocument;
  f!: PDFFont;
  b!: PDFFont;
  runTitle!: string;
  footerLeft!: string;
  pages: PDFPage[] = [];
  page!: PDFPage;
  y: number = 0;

  static async create(runTitle: string, footerLeft: string): Promise<ReportBuilder> {
    const r = new ReportBuilder();
    r.doc = await PDFDocument.create();
    r.f = await r.doc.embedFont(StandardFonts.Helvetica);
    r.b = await r.doc.embedFont(StandardFonts.HelveticaBold);
    r.runTitle = clean(runTitle);
    r.footerLeft = clean(footerLeft);
    r.pages = [];
    r.newPage(true);
    return r;
  }

  newPage(first = false) {
    this.page = this.doc.addPage([PW, PH]);
    this.pages.push(this.page);
    this.y = PH - PM;
    if (!first) {
      this.text(this.runTitle + ' (continued)', PM, PH - 26, { size: 7.5, color: C.grey });
      this.y = PH - PM - 6;
    }
  }

  ensure(h: number) {
    if (this.y - h < PM + 18) this.newPage();
  }

  text(s: string, x: number, y: number, o: { size?: number; font?: PDFFont; align?: string; color?: string } = {}) {
    const size = o.size || 9.5;
    const font = o.font || this.f;
    const cleaned = clean(s);
    const w = font.widthOfTextAtSize(cleaned, size);
    const xx = o.align === 'right' ? x - w : o.align === 'center' ? x - w / 2 : x;
    this.page.drawText(cleaned, { x: xx, y, size, font, color: hex(o.color || C.ink) });
  }

  fit(s: string, size: number, font: PDFFont, maxW: number): string {
    let t = clean(s);
    if (font.widthOfTextAtSize(t, size) <= maxW) return t;
    while (t.length > 1 && font.widthOfTextAtSize(t + '...', size) > maxW) {
      t = t.slice(0, -1);
    }
    return t + '...';
  }

  wrap(s: string, size: number, font: PDFFont, maxW: number): string[] {
    const words = clean(s).split(' ');
    const lines: string[] = [];
    let cur = '';
    for (const w of words) {
      const t = cur ? cur + ' ' + w : w;
      if (font.widthOfTextAtSize(t, size) > maxW && cur) {
        lines.push(cur);
        cur = w;
      } else {
        cur = t;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  }

  rect(x: number, y: number, w: number, h: number, fill?: string) {
    this.page.drawRectangle({
      x,
      y,
      width: w,
      height: h,
      color: fill ? hex(fill) : undefined,
    });
  }

  line(x1: number, y1: number, x2: number, y2: number, color: string, th = 0.6, dash?: number[]) {
    this.page.drawLine({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      thickness: th,
      color: hex(color),
      dashArray: dash,
    });
  }

  header(band: { kicker: string; title: string; sub: string }) {
    const h = 104;
    this.rect(0, PH - h, PW, h, C.navy);
    this.text(band.kicker, PM, PH - 32, { size: 10, color: C.soft });
    const lines = this.wrap(band.title, 20, this.b, CW).slice(0, 2);
    lines.forEach((l, i) =>
      this.text(l, PM, PH - 56 - i * 24, { size: 20, font: this.b, color: '#FFFFFF' })
    );
    this.text(band.sub, PM, PH - h + 14, { size: 9, color: C.soft });
    this.y = PH - h - 18;
  }

  heading(t: string, note?: string, keep?: number) {
    this.ensure(keep || 50);
    this.y -= 6;
    this.text(t, PM, this.y - 12, { size: 12.5, font: this.b, color: C.navy });
    this.y -= 18;
    this.line(PM, this.y, PM + CW, this.y, C.line);
    this.y -= 8;
    if (note) {
      this.wrap(note, 8.5, this.f, CW).forEach((l) => {
        this.text(l, PM, this.y - 9, { size: 8.5, color: C.grey });
        this.y -= 11;
      });
      this.y -= 3;
    }
  }

  bullets(list: string[]) {
    list.forEach((t) => {
      const lines = this.wrap(t, 9.5, this.f, CW - 16);
      this.ensure(lines.length * 13 + 5);
      this.page.drawCircle({ x: PM + 3, y: this.y - 6, size: 1.7, color: hex(C.navy) });
      lines.forEach((l, i) => this.text(l, PM + 14, this.y - 9 - i * 13, { size: 9.5 }));
      this.y -= lines.length * 13 + 4;
    });
    this.y -= 2;
  }

  kpis(items: Array<{ label: string; value: string | number; sub?: string; color?: string }>) {
    const cols = 4;
    const gap = 10;
    const w = (CW - gap * (cols - 1)) / cols;
    const h = 56;
    for (let i = 0; i < items.length; i += cols) {
      this.ensure(h + 10);
      items.slice(i, i + cols).forEach((it, j) => {
        const x = PM + j * (w + gap);
        const y = this.y - h;
        this.rect(x, y, w, h, C.light);
        this.rect(x, y, 3, h, it.color || C.navy);
        this.text(it.label, x + 12, y + h - 15, { size: 8.5, color: C.grey });
        this.text(String(it.value), x + 12, y + h - 36, { size: 18, font: this.b });
        if (it.sub) this.text(this.fit(it.sub, 7.5, this.f, w - 16), x + 12, y + 7, { size: 7.5, color: C.grey });
      });
      this.y -= h + 10;
    }
  }

  histogram(bins: ScoreBin[], pass: number) {
    const h = 150;
    const lab = 16;
    const top = 22;
    this.ensure(h + 40);
    const x0 = PM;
    const bw = CW / bins.length;
    const base = this.y - h + lab;
    const ch = h - lab - top;
    const mc = Math.max(1, ...bins.map((b) => b.count));

    bins.forEach((b, i) => {
      const bh = Math.max(b.count ? 1.5 : 0, (b.count / mc) * ch);
      const x = x0 + i * bw + 2;
      if (bh) this.rect(x, base, bw - 4, bh, b.lo >= pass ? C.pass : C.fail);
      if (b.count) {
        this.text(String(b.count), x + (bw - 4) / 2, base + bh + 3, { size: 7, align: 'center', color: C.ink });
      }
      this.text(b.label, x + (bw - 4) / 2, base - 10, { size: 7, align: 'center', color: C.grey });
    });

    this.line(x0, base, x0 + CW, base, C.line, 0.8);
    const pi = bins.findIndex((b) => b.lo >= pass);
    if (pi > 0) {
      const lx = x0 + pi * bw;
      this.line(lx, base, lx, base + ch + 14, C.navy, 0.8, [3, 2]);
      this.text('Pass mark ' + num(pass), lx + 4, base + ch + 8, { size: 7.5, font: this.b, color: C.navy });
    }
    this.y -= h + 4;
    this.rect(PM, this.y - 8, 8, 8, C.pass);
    this.text('At or above pass mark', PM + 12, this.y - 7, { size: 8, color: C.grey });
    this.rect(PM + 120, this.y - 8, 8, 8, C.fail);
    this.text('Below pass mark', PM + 132, this.y - 7, { size: 8, color: C.grey });
    this.text('Students per score', PM + CW, this.y - 7, { size: 8, color: C.grey, align: 'right' });
    this.y -= 18;
  }

  table(
    cols: Array<{ label: string; w: number; align?: string; bar?: boolean }>,
    rows: any[][],
    o: { fs?: number; rh?: number; style?: (row: any[], i: number) => any } = {}
  ) {
    const fs = o.fs || 8.5;
    const rh = o.rh || 15;
    const total = cols.reduce((s, c) => s + c.w, 0);
    const xs: number[] = [];
    let acc = PM;
    cols.forEach((c) => {
      xs.push(acc);
      acc += c.w;
    });

    const drawHead = () => {
      this.rect(PM, this.y - rh - 2, total, rh + 2, C.navy);
      cols.forEach((c, j) => {
        const pad = 5;
        const tx = c.align === 'right' ? xs[j] + c.w - pad : xs[j] + pad;
        this.text(c.label, tx, this.y - rh + 2.5, {
          size: 7.8,
          font: this.b,
          color: '#FFFFFF',
          align: c.align === 'right' ? 'right' : 'left',
        });
      });
      this.y -= rh + 2;
    };

    this.ensure(rh * 3 + 4);
    drawHead();

    rows.forEach((row, i) => {
      if (this.y - rh < PM + 18) {
        this.newPage();
        drawHead();
      }
      const y = this.y - rh;
      const st = o.style ? o.style(row, i) : {};
      if (st.fill) this.rect(PM, y, total, rh, st.fill);
      else if (i % 2) this.rect(PM, y, total, rh, '#F6F8FC');

      cols.forEach((c, j) => {
        const pad = 5;
        const cell = row[j];
        const cs = (st.cells && st.cells[j]) || {};
        const font = st.bold || cs.bold ? this.b : this.f;
        const color = cs.color || st.color || C.ink;

        if (c.bar) {
          const bx = xs[j] + pad;
          const bwid = c.w - pad * 2 - 34;
          this.rect(bx, y + 5, bwid, 5, '#E4E8F2');
          this.rect(bx, y + 5, bwid * Math.max(0, Math.min(1, cell.frac)), 5, C.accent);
          this.text(cell.text, xs[j] + c.w - pad, y + (rh - fs) / 2 + 1.5, {
            size: fs,
            font,
            color,
            align: 'right',
          });
        } else {
          const t = this.fit(String(cell ?? ''), fs, font, c.w - pad * 2);
          this.text(t, c.align === 'right' ? xs[j] + c.w - pad : xs[j] + pad, y + (rh - fs) / 2 + 1.5, {
            size: fs,
            font,
            color,
            align: c.align === 'right' ? 'right' : 'left',
          });
        }
      });
      this.y -= rh;
    });

    this.line(PM, this.y, PM + total, this.y, C.line);
    this.y -= 8;
  }

  finish(title: string) {
    const n = this.pages.length;
    this.pages.forEach((p, i) => {
      p.drawLine({
        start: { x: PM, y: 34 },
        end: { x: PM + CW, y: 34 },
        thickness: 0.5,
        color: hex(C.line),
      });
      p.drawText(this.fit(this.footerLeft, 7.5, this.f, CW - 70), {
        x: PM,
        y: 22,
        size: 7.5,
        font: this.f,
        color: hex(C.grey),
      });
      const t = `Page ${i + 1} of ${n}`;
      p.drawText(t, {
        x: PM + CW - this.f.widthOfTextAtSize(t, 7.5),
        y: 22,
        size: 7.5,
        font: this.f,
        color: hex(C.grey),
      });
    });
    this.doc.setTitle(clean(title));
  }
}

export async function buildSingleTestPdf(
  analysis: SingleTestAnalysis,
  meta: SingleTestMeta,
  groupKey: string | null = null,
  options: { below?: boolean; notAtt?: boolean; scorecard?: boolean } = {
    below: true,
    notAtt: true,
    scorecard: true,
  }
): Promise<Uint8Array> {
  const { max, pass } = meta;
  const g: SingleTestGroup | undefined = groupKey ? analysis.groups.find((x) => x.key === groupKey) : undefined;
  const s = g ? g.st : analysis.all;
  const attList: AttemptedRecord[] = g ? g.att : analysis.groups.flatMap((grp) => grp.att);
  const naList: NotAttemptedRecord[] = g ? g.na : analysis.groups.flatMap((grp) => grp.na);

  const testName = meta.testName || 'Test';
  const scopeName = g ? `Group ${g.label}` : 'All groups';
  const title = `${testName} - ${g ? g.label + ' ' : ''}Performance Report`;
  const generated = new Date();
  const gen = generated.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const footer = [testName, scopeName, meta.preparedBy && `Prepared by ${meta.preparedBy}`, `Generated ${gen}`]
    .filter(Boolean)
    .join('  |  ');

  const R = await ReportBuilder.create(title, footer);
  R.header({
    kicker: meta.college || (meta.batch ? `Batch ${meta.batch}` : 'Training Report'),
    title: `${testName} - Performance Report`,
    sub: [scopeName, meta.batch && `Batch ${meta.batch}`, meta.date && `Test date ${prettyDate(meta.date)}`]
      .filter(Boolean)
      .join('   |   '),
  });

  // KPIs
  const kpis = [];
  if (analysis.hasNA) {
    kpis.push({ label: 'Registered', value: s.registered, sub: g ? '' : `${analysis.groups.length} groups` });
    kpis.push({ label: 'Attempted', value: s.n, sub: pct(s.part) + ' participation', color: C.pass });
    kpis.push({
      label: 'Not attempted',
      value: s.notAtt,
      sub: s.registered ? pct(100 - s.part) + ' of registered' : '',
      color: s.notAtt ? C.amber : C.navy,
    });
  } else {
    kpis.push({ label: 'Attempted', value: s.n, sub: g ? '' : `${analysis.groups.length} groups` });
  }
  kpis.push({ label: 'Average score', value: `${num(s.avg)}/${max}`, sub: pct(s.avgPct) });
  kpis.push({ label: 'Median score', value: num(s.median), sub: `Range ${num(s.lo)} to ${num(s.hi)}` });
  kpis.push({ label: 'Pass rate', value: pct(s.passRate), sub: `${s.passCount} at or above ${num(pass)}`, color: C.pass });
  kpis.push({ label: 'Full marks', value: s.full, sub: pct(s.fullPct) + ' of attempts' });
  kpis.push({
    label: 'Below pass mark',
    value: s.below,
    sub: pct(100 - s.passRate) + ' of attempts',
    color: s.below ? C.fail : C.navy,
  });
  R.kpis(kpis);

  // Key Insights
  R.heading('Key insights');
  R.bullets(generateSingleTestInsights(analysis, max, pass));

  // Score Distribution
  R.heading('How scores are spread', `Marks are out of ${max}. Pass mark is ${num(pass)}.`);
  if (s.n) {
    R.histogram(s.bins, pass);
  }

  // Group-Wise Performance Table (College summary only)
  if (!g && analysis.groups.length > 1) {
    R.heading(
      'Group-wise performance',
      `Ranked by average score. Below = students under pass mark. Full = scored ${num(max)}/${num(max)}.`,
      130
    );
    const ranked = [...analysis.groups].sort((a, b) => (b.st.n ? b.st.avg : -1) - (a.st.n ? a.st.avg : -1));
    const cols: Array<{ label: string; w: number; align?: string; bar?: boolean }> = [
      { label: '#', w: 24 },
      { label: 'Group', w: analysis.hasNA ? 100 : 170 },
    ];
    if (analysis.hasNA) cols.push({ label: 'Regd.', w: 42, align: 'right' });
    cols.push({ label: 'Attempted', w: 52, align: 'right' });
    if (analysis.hasNA) {
      cols.push({ label: 'Not att.', w: 46, align: 'right' });
      cols.push({ label: 'Participation', w: 84, align: 'right', bar: true });
    }
    cols.push(
      { label: 'Avg', w: 40, align: 'right' },
      { label: 'Pass %', w: 46, align: 'right' },
      { label: 'Full mks', w: 46, align: 'right' },
      { label: 'Below', w: 37, align: 'right' }
    );

    const rows = ranked.map((x) => {
      const r: any[] = [x.rank || '-', x.label];
      if (analysis.hasNA) r.push(String(x.st.registered));
      r.push(String(x.st.n));
      if (analysis.hasNA) {
        r.push(String(x.st.notAtt));
        r.push({ text: pct(x.st.part), frac: x.st.part / 100 });
      }
      r.push(x.st.n ? num(x.st.avg) : '-', x.st.n ? pct(x.st.passRate) : '-', String(x.st.full), String(x.st.below));
      return r;
    });

    const tot: any[] = ['', 'All groups'];
    if (analysis.hasNA) tot.push(String(s.registered));
    tot.push(String(s.n));
    if (analysis.hasNA) {
      tot.push(String(s.notAtt));
      tot.push({ text: pct(s.part), frac: s.part / 100 });
    }
    tot.push(num(s.avg), pct(s.passRate), String(s.full), String(s.below));
    rows.push(tot);

    R.table(cols, rows, {
      style: (_row, i) => (i === rows.length - 1 ? { bold: true, fill: '#E6EBF7' } : {}),
    });
  }

  // Group comparative differences if single group report
  if (g) {
    R.heading(`How ${g.label} compares with cohort`, '', 110);
    const o = analysis.all;
    const d = (a: number, b: number, suffix: string) => {
      const x = r1(a - b);
      return (x >= 0 ? '+' : '-') + Math.abs(x).toFixed(1) + suffix;
    };
    const cmp = [];
    if (analysis.hasNA) cmp.push(['Participation', pct(s.part), pct(o.part), d(s.part, o.part, ' pts')]);
    cmp.push(['Average score (out of ' + num(max) + ')', num(s.avg), num(o.avg), d(s.avg, o.avg, '')]);
    cmp.push(['Pass rate', pct(s.passRate), pct(o.passRate), d(s.passRate, o.passRate, ' pts')]);
    cmp.push(['Full marks (share of attempts)', pct(s.fullPct), pct(o.fullPct), d(s.fullPct, o.fullPct, ' pts')]);
    R.table(
      [
        { label: 'Measure', w: 235 },
        { label: g.label, w: 90, align: 'right' },
        { label: 'All groups', w: 90, align: 'right' },
        { label: 'Difference', w: 100, align: 'right' },
      ],
      cmp,
      {
        rh: 17,
        style: (row) => {
          const neg = row[3].startsWith('-') && row[3] !== '-0.0' && !/^-0\.0/.test(row[3]);
          return { cells: { 3: { color: neg ? C.fail : C.pass, bold: true } } };
        },
      }
    );
  }

  const gName = (x: { group: string }) => groupLabel(x.group);

  // Students below pass mark
  if (options.below) {
    const list = attList
      .filter((a) => a.score < pass)
      .sort((a, b) => cmpNat(a.group, b.group) || a.score - b.score || cmpNat(a.name, b.name));
    R.heading(`Students below the pass mark (${list.length})`, `Scored under ${num(pass)} out of ${num(max)}.`, 100);
    if (!list.length) {
      R.bullets(['Every student who attempted the test cleared the pass mark.']);
    } else if (g) {
      R.table(
        [
          { label: '#', w: 30 },
          { label: 'Member ID', w: 100 },
          { label: 'Name', w: 285 },
          { label: 'Score', w: 100, align: 'right' },
        ],
        list.map((a, i) => [i + 1, a.id, a.name, `${num(a.score)}/${num(max)}`])
      );
    } else {
      R.table(
        [
          { label: '#', w: 30 },
          { label: 'Member ID', w: 90 },
          { label: 'Name', w: 205 },
          { label: 'Group', w: 110 },
          { label: 'Score', w: 80, align: 'right' },
        ],
        list.map((a, i) => [i + 1, a.id, a.name, gName(a), `${num(a.score)}/${num(max)}`])
      );
    }
  }

  // Not Attempted appendix
  if (options.notAtt && analysis.hasNA) {
    const list = [...naList].sort((a, b) => cmpNat(a.group, b.group) || cmpNat(a.name, b.name));
    R.heading(`Students who did not attempt (${list.length})`, 'Attendance & activity log.', 100);
    if (!list.length) {
      R.bullets(['Every registered student attempted the test.']);
    } else if (g) {
      R.table(
        [
          { label: '#', w: 30 },
          { label: 'Member ID', w: 100 },
          { label: 'Name', w: 260 },
          { label: 'Status / Last Activity', w: 125 },
        ],
        list.map((a, i) => [i + 1, a.id, a.name, a.reason])
      );
    } else {
      R.table(
        [
          { label: '#', w: 30 },
          { label: 'Member ID', w: 90 },
          { label: 'Name', w: 195 },
          { label: 'Group', w: 100 },
          { label: 'Status / Last Activity', w: 100 },
        ],
        list.map((a, i) => [i + 1, a.id, a.name, gName(a), a.reason])
      );
    }
  }

  // Scorecard
  if (options.scorecard && attList.length) {
    const resStyle = (ci: number) => (row: any[]) =>
      row[ci] === 'Below pass' ? { cells: { [ci]: { color: C.fail, bold: true } } } : {};

    if (g) {
      const list = rankStudents(attList);
      R.heading(`Scorecard: ${g.label} (${list.length} students)`, 'Sorted by score, highest first.', 100);
      R.table(
        [
          { label: 'S.No', w: 40 },
          { label: 'Member ID', w: 100 },
          { label: 'Name', w: 245 },
          { label: 'Score', w: 65, align: 'right' },
          { label: 'Result', w: 65 },
        ],
        list.map((a, i) => [
          i + 1,
          a.id,
          a.name,
          `${num(a.score)}/${num(max)}`,
          a.score >= pass ? 'Pass' : 'Below pass',
        ]),
        { style: resStyle(4) }
      );
    } else {
      const list: AttemptedRecord[] = [];
      analysis.groups.forEach((x) => rankStudents(x.att).forEach((a) => list.push(a)));
      R.heading(`Complete Scorecard (${list.length} students)`, 'Grouped and sorted by score, highest first.', 100);
      R.table(
        [
          { label: 'S.No', w: 34 },
          { label: 'Member ID', w: 88 },
          { label: 'Name', w: 200 },
          { label: 'Group', w: 85 },
          { label: 'Score', w: 55, align: 'right' },
          { label: 'Result', w: 53 },
        ],
        list.map((a, i) => [
          i + 1,
          a.id,
          a.name,
          gName(a),
          `${num(a.score)}/${num(max)}`,
          a.score >= pass ? 'Pass' : 'Below pass',
        ]),
        { style: resStyle(5) }
      );
    }
  }

  R.finish(title);
  return await R.doc.save();
}
