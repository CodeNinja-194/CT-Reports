import { downloadBlob, safeName } from '../../../lib/utils';

export function downloadCourseReportHtml(
  reportElement: HTMLElement,
  collegeName: string,
  collegeLogo?: string
): void {
  const contentHTML = reportElement.outerHTML;
  const cleanCollege = collegeName.trim();
  const escapedCollege = cleanCollege
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const docTitle = cleanCollege ? `${escapedCollege} — Course Progress Report` : 'Course Progress Report';

  const faviconHref =
    collegeLogo ||
    'data:image/svg+xml,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="18" fill="#1B2A4A"/><text x="50" y="66" font-size="58" text-anchor="middle">🎓</text></svg>`
      );

  const doc = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<link rel="icon" href="${faviconHref}" />
<title>${docTitle}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; }
  body { font-family: 'Inter', -apple-system, sans-serif; background: #FAF7F0; margin: 0; padding: 28px; color: #17233F; }
  table.cip-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  table.cip-table th { text-align: left; font-weight: 600; color: #6B6656; font-size: 11px;
    letter-spacing: 0.4px; text-transform: uppercase; padding: 8px 10px; border-bottom: 2px solid #1B2A4A; }
  table.cip-table td { padding: 8px 10px; border-bottom: 1px solid #E7E0D0; }
  table.cip-table tr:last-child td { border-bottom: none; }
  .print-bar { position: sticky; top: 0; display: flex; justify-content: flex-end; padding: 10px 0 18px; background: #FAF7F0; z-index: 10; }
  .print-btn { background: #D9A93A; color: #1B2A4A; font-weight: 600; font-size: 14px; border: none;
    padding: 10px 20px; border-radius: 4px; cursor: pointer; font-family: 'Inter', sans-serif; }
  .cip-card, .cip-chart-card { break-inside: avoid; -webkit-column-break-inside: avoid; page-break-inside: avoid; }
  table.cip-table tr { break-inside: avoid; page-break-inside: avoid; }
  @media print {
    .print-bar { display: none; }
    .print-bar-hint { display: none; }
    body { padding: 0; background: #fff; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
  }
</style>
</head>
<body>
  <div class="print-bar"><button class="print-btn" onclick="window.print()">Print / Save as PDF</button></div>
  <div style="font-size: 12px; color: #6B6656; text-align: right; margin-top: -8px; margin-bottom: 16px;" class="print-bar-hint">
    Tip: in the print dialog — turn <strong>"Background graphics"</strong> ON and <strong>"Headers and footers"</strong> OFF.
  </div>
  ${contentHTML}
</body>
</html>`;

  const blob = new Blob([doc], { type: 'text/html' });
  const slug = safeName(collegeName || 'Course');
  downloadBlob(blob, `${slug}_Course_Progress_Report.html`);
}
