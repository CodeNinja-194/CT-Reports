import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  SegregationAnalysis,
  SegregationParsedData,
  SegregationSettings,
} from '../../../types/segregation';
import { safeName, shortGroup } from '../../../lib/utils';

// Extend jsPDF interface to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

const NAVY = [31, 58, 95];
const INK = [15, 27, 45];
const MUTED = [90, 104, 122];
const LIGHT = [244, 246, 249];
const LINE = [213, 219, 227];
const PASS = [14, 124, 102];
const FAIL = [196, 71, 45];

const pt = (s: unknown) =>
  String(s ?? '')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2265/g, '>=')
    .replace(/[^\x20-\x7E\u00A0-\u00FF]/g, '?');

export async function generateSegregationPdf(
  analysis: SegregationAnalysis,
  data: SegregationParsedData,
  settings: SegregationSettings,
  fileName: string
): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const a = analysis;
  const m = settings;
  const d = data;
  const W = 210;
  const H = 297;
  const M = 14;
  const CW = 182;
  let y = 0;

  const ensure = (h: number) => {
    if (y + h > H - 18) {
      doc.addPage();
      y = M + 2;
    }
  };

  const h2 = (t: string) => {
    ensure(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.text(pt(t), M, y);
    y += 2;
    doc.setDrawColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.setLineWidth(0.5);
    doc.line(M, y, M + CW, y);
    y += 7;
  };

  const tbl = (opts: any) => {
    doc.autoTable({
      margin: { left: M, right: M, bottom: 18 },
      theme: 'striped',
      styles: { fontSize: 8.5, cellPadding: 1.8, textColor: INK, lineColor: LINE },
      headStyles: { fillColor: NAVY, textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: LIGHT },
      startY: y,
      ...opts,
    });
    y = doc.lastAutoTable.finalY + 8;
  };

  // Cover band
  doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
  doc.rect(0, 0, W, 46, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(21);
  doc.text(pt(m.title), M, 20, { maxWidth: CW });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(pt(m.test || fileName), M, 29, { maxWidth: CW });
  doc.setFontSize(9.5);
  doc.setTextColor(210, 220, 235);
  doc.text(pt([m.org, m.date].filter(Boolean).join('   |   ')), M, 38, { maxWidth: CW });
  y = 56;

  // Summary KPIs
  h2('Summary');
  const K = [
    ['Registered', a.N, 'candidates'],
    ['Attempted', a.att, a.attRate.toFixed(1) + '% of registered'],
    ['Did not attempt', a.notAtt, (100 - a.attRate).toFixed(1) + '%'],
    ['Qualified', a.passN, 'cut-off ' + a.cutoff.toFixed(1) + ' marks'],
    ['Pass rate', a.passRate.toFixed(1) + '%', 'of attempters'],
    ['Average score', a.avg.toFixed(1), 'out of ' + a.totalMax],
    ['Median score', a.med.toFixed(1), 'middle attempter'],
    ['Highest score', a.max.toFixed(1), 'lowest ' + a.min.toFixed(1)],
  ];
  const kw = (CW - 3 * 4) / 4;
  const kh = 22;
  K.forEach((k, i) => {
    const x = M + (i % 4) * (kw + 4);
    const yy = y + Math.floor(i / 4) * (kh + 4);
    doc.setFillColor(LIGHT[0], LIGHT[1], LIGHT[2]);
    doc.setDrawColor(LINE[0], LINE[1], LINE[2]);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, yy, kw, kh, 1.5, 1.5, 'FD');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text(pt(k[0]), x + 3, yy + 5.5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    if (i === 3) doc.setTextColor(PASS[0], PASS[1], PASS[2]);
    else doc.setTextColor(INK[0], INK[1], INK[2]);
    doc.text(pt(String(k[1])), x + 3, yy + 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text(pt(String(k[2])), x + 3, yy + 19.3);
  });
  y += 2 * kh + 4 + 10;

  // Key findings
  h2('Key findings');
  doc.setFontSize(10);
  a.insights.forEach((t) => {
    const lines = doc.splitTextToSize(pt(t), CW - 6);
    ensure(lines.length * 4.8 + 3);
    doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
    doc.circle(M + 1.3, y - 1.2, 0.8, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(INK[0], INK[1], INK[2]);
    doc.text(lines, M + 5, y);
    y += lines.length * 4.8 + 2;
  });

  // Score distribution page
  doc.addPage();
  y = M + 2;
  h2('Score distribution');
  ensure(80);

  const cx0 = M + 4;
  const cw = CW - 8;
  const top = y + 8;
  const chH = 48;
  const chartBaseY = top + chH;
  const bw = cw / 10;
  const mx = Math.max(...a.hist, 1);
  const cutPct = (a.cutoff / a.totalMax) * 100;

  a.hist.forEach((n, i) => {
    const hh = (n / mx) * chH;
    const x = cx0 + i * bw + bw * 0.14;
    if (i * 10 >= cutPct) doc.setFillColor(PASS[0], PASS[1], PASS[2]);
    else doc.setFillColor(160, 180, 205);
    if (hh > 0) doc.roundedRect(x, chartBaseY - hh, bw * 0.72, hh, 0.8, 0.8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(INK[0], INK[1], INK[2]);
    doc.text(String(n), x + bw * 0.36, chartBaseY - hh - 1.5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text(
      `${((i * 10 * a.totalMax) / 100).toFixed(0)}-${(((i + 1) * 10 * a.totalMax) / 100).toFixed(0)}`,
      x + bw * 0.36,
      chartBaseY + 4.5,
      { align: 'center' }
    );
  });

  doc.setDrawColor(LINE[0], LINE[1], LINE[2]);
  doc.setLineWidth(0.3);
  doc.line(cx0, chartBaseY, cx0 + cw, chartBaseY);

  const cxl = cx0 + (cutPct / 100) * cw;
  doc.setDrawColor(FAIL[0], FAIL[1], FAIL[2]);
  doc.setLineWidth(0.5);
  doc.setLineDashPattern([1.6, 1.4], 0);
  doc.line(cxl, top - 4, cxl, chartBaseY);
  doc.setLineDashPattern([], 0);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(FAIL[0], FAIL[1], FAIL[2]);
  doc.text('Cut-off ' + a.cutoff.toFixed(1), Math.min(cxl + 1.5, M + CW - 20), top - 2);

  y = chartBaseY + 17;

  // Bands stacked bar
  let bx = M;
  doc.setLineWidth(0.2);
  a.bands.forEach((b) => {
    const w = (CW * b.pct) / 100;
    if (w > 0) {
      doc.setFillColor(b.rgb[0], b.rgb[1], b.rgb[2]);
      doc.rect(bx, y, w, 7, 'F');
      if (w > 8) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(String(b.n), bx + w / 2, y + 4.7, { align: 'center' });
      }
      bx += w;
    }
  });
  y += 11;

  // Performer category table
  tbl({
    head: [['Performer category', 'Marks range', 'Candidates', '% of attempters']],
    body: a.bands.map((b) => [b.label, b.range, b.n, b.pct.toFixed(1) + '%']),
    columnStyles: {
      0: { cellPadding: { top: 1.8, bottom: 1.8, right: 1.8, left: 7 } },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
    },
    headStyles: { fillColor: NAVY, textColor: 255, halign: 'right' },
    didParseCell: (hookData: any) => {
      if (hookData.section === 'head' && hookData.column.index === 0) {
        hookData.cell.styles.halign = 'left';
      }
    },
    didDrawCell: (hookData: any) => {
      if (hookData.section === 'body' && hookData.column.index === 0) {
        const band = a.bands[hookData.row.index];
        if (band) {
          doc.setFillColor(band.rgb[0], band.rgb[1], band.rgb[2]);
          doc.rect(hookData.cell.x + 1.2, hookData.cell.y + hookData.cell.height / 2 - 1.3, 2.6, 2.6, 'F');
        }
      }
    },
  });

  // Section-wise performance
  h2('Section-wise performance');
  ensure(a.sec.length * 9 + 10);
  a.sec.forEach((s) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(INK[0], INK[1], INK[2]);
    doc.text(pt(s.name), M, y + 3.6, { maxWidth: 50 });
    doc.setFillColor(LIGHT[0], LIGHT[1], LIGHT[2]);
    doc.setDrawColor(LINE[0], LINE[1], LINE[2]);
    doc.setLineWidth(0.2);
    doc.roundedRect(M + 52, y, 78, 4.6, 1.2, 1.2, 'FD');
    doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]);
    if (s.avgPct > 0) {
      doc.roundedRect(M + 52, y, Math.max(2, (78 * Math.min(100, s.avgPct)) / 100), 4.6, 1.2, 1.2, 'F');
    }
    doc.setFontSize(8.5);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text(`${s.avg.toFixed(1)} / ${s.max}  (${s.avgPct.toFixed(1)}%)`, M + CW, y + 3.6, { align: 'right' });
    y += 9;
  });
  y += 2;

  tbl({
    head: [['Section', 'Max marks', 'Average', 'Scored above 0', 'Scored zero', 'Full marks']],
    body: a.sec.map((s) => [pt(s.name), s.max, s.avg.toFixed(1), `${s.pos} (${s.posPct.toFixed(1)}%)`, s.zero, s.full]),
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' } },
    didParseCell: (dataHook: any) => {
      if (dataHook.section === 'head' && dataHook.column.index > 0) dataHook.cell.styles.halign = 'right';
    },
  });

  // Group-wise performance
  if (d.hasGroup && a.groups.length > 1) {
    h2('Group-wise performance');
    tbl({
      head: [['Group', 'Registered', 'Attempted', 'Attempt %', 'Qualified', 'Pass rate', 'Average', 'Highest']],
      body: a.groups.map((g) => [
        pt(shortGroup(g.group)),
        g.reg,
        g.att,
        g.attPct.toFixed(1) + '%',
        g.pass,
        g.passPct.toFixed(1) + '%',
        g.avg.toFixed(1),
        g.max.toFixed(1),
      ]),
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' }, 6: { halign: 'right' }, 7: { halign: 'right' } },
    });
  }

  // Top performers
  const topN = a.sorted.slice(0, m.top);
  h2(`Top ${topN.length} performers`);
  const secShort = (s: any) => pt(s.name);
  tbl({
    head: [['#', 'Name', ...(d.hasGroup ? ['Group'] : []), ...a.sec.map(secShort), 'Total']],
    body: topN.map((c, i) => [
      i + 1,
      pt(c.name),
      ...(d.hasGroup ? [pt(shortGroup(c.group))] : []),
      ...c.scores.map((sc) => sc.toFixed(1)),
      c.total.toFixed(1),
    ]),
    styles: { fontSize: 7.5, cellPadding: 1.5, textColor: INK, lineColor: LINE },
    columnStyles: {
      0: { cellWidth: 7 },
      1: { cellWidth: d.hasGroup ? 34 : 40 },
      [a.sec.length + (d.hasGroup ? 3 : 2)]: { fontStyle: 'bold', halign: 'right' },
    },
  });

  // Performers by category
  doc.addPage();
  y = M + 2;
  h2('Performers by category');
  const fn = 2 + (d.hasId ? 1 : 0) + (d.hasGroup ? 1 : 0);

  a.bands.forEach((b) => {
    ensure(34);
    doc.setFillColor(b.rgb[0], b.rgb[1], b.rgb[2]);
    doc.rect(M, y - 3.3, 3.4, 3.4, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(INK[0], INK[1], INK[2]);
    doc.text(pt(`${b.label} performers (${b.n})`), M + 6, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text(pt(b.range), M + CW, y, { align: 'right' });
    y += 4;

    if (!b.list.length) {
      doc.setFontSize(9);
      doc.text('No candidates in this category.', M, y + 3);
      y += 12;
      return;
    }

    const cs: any = { 0: { cellWidth: 8 } };
    if (d.hasId) cs[1] = { cellWidth: 17 };
    cs[1 + (d.hasId ? 1 : 0)] = { cellWidth: 34 };
    cs[fn + a.sec.length] = { fontStyle: 'bold' };

    tbl({
      head: [['#', ...(d.hasId ? ['Member ID'] : []), 'Name', ...(d.hasGroup ? ['Group'] : []), ...a.sec.map(secShort), 'Total']],
      body: b.list.map((c, i) => [
        i + 1,
        ...(d.hasId ? [c.id] : []),
        pt(c.name),
        ...(d.hasGroup ? [pt(shortGroup(c.group))] : []),
        ...c.scores.map((s) => s.toFixed(1)),
        c.total.toFixed(1),
      ]),
      styles: { fontSize: 7.2, cellPadding: 1.3, textColor: INK, lineColor: LINE },
      columnStyles: cs,
    });
  });

  // Section-wise categories
  if (a.secCats.length) {
    doc.addPage();
    y = M + 2;
    h2('Section-wise performer categories');
    tbl({
      head: [['Section', 'Max marks', ...a.bands.map((b) => b.label)]],
      body: a.secCats.map((x) => [pt(x.name), x.max, ...x.cats.map((c) => `${c.n} (${c.pct.toFixed(1)}%)`)]),
    });

    a.secCats.forEach((section) => {
      h2(`${section.name}: student details`);
      section.cats.forEach((category) => {
        ensure(18);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(category.rgb[0], category.rgb[1], category.rgb[2]);
        doc.text(pt(`${category.label} (${category.n})`), M, y);
        y += 4;

        if (!category.list.length) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
          doc.text('No candidates in this category.', M, y);
          y += 10;
          return;
        }

        tbl({
          head: [['#', ...(d.hasId ? ['Member ID'] : []), 'Name', ...(d.hasGroup ? ['Group'] : []), 'Score', '% of section']],
          body: category.list.map((c, i) => [
            i + 1,
            ...(d.hasId ? [pt(c.id)] : []),
            pt(c.name),
            ...(d.hasGroup ? [pt(shortGroup(c.group))] : []),
            `${c.scores[section.idx].toFixed(1)} / ${section.max}`,
            `${((c.scores[section.idx] / section.max) * 100).toFixed(1)}%`,
          ]),
          styles: { fontSize: 7.5, cellPadding: 1.5, textColor: INK, lineColor: LINE },
          columnStyles: {
            0: { cellWidth: 8 },
            [1 + (d.hasId ? 1 : 0) + (d.hasGroup ? 1 : 0)]: { halign: 'right' },
            [2 + (d.hasId ? 1 : 0) + (d.hasGroup ? 1 : 0)]: { halign: 'right' },
          },
        });
      });
    });
  }

  // Appendix: unattempted candidates
  if (m.notAtt && a.notAttempted.length) {
    doc.addPage();
    y = M + 2;
    h2(`Appendix: Candidates who did not attempt (${a.notAttempted.length})`);
    tbl({
      head: [['#', ...(d.hasId ? ['Member ID'] : []), 'Name', ...(d.hasGroup ? ['Group'] : [])]],
      body: a.notAttempted.map((c, i) => [i + 1, ...(d.hasId ? [c.id] : []), pt(c.name), ...(d.hasGroup ? [pt(shortGroup(c.group))] : [])]),
    });
  }

  // Footers
  const numPages = doc.getNumberOfPages();
  for (let i = 1; i <= numPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(LINE[0], LINE[1], LINE[2]);
    doc.setLineWidth(0.2);
    doc.line(M, H - 13, M + CW, H - 13);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text(pt([m.title, m.test].filter(Boolean).join(' - ')), M, H - 8, { maxWidth: 150 });
    doc.text(`Page ${i} of ${numPages}`, M + CW, H - 8, { align: 'right' });
  }

  const base = safeName(m.test || fileName || 'Test');
  doc.save(`${base}_Segregation_Analysis_Report.pdf`);
}
