import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { yieldToBrowser, safeName } from '../../../lib/utils';

export interface PdfProgress {
  done: number;
  total: number;
}

export async function generateCourseReportPdf(
  reportElement: HTMLElement,
  collegeName: string,
  onProgress?: (progress: PdfProgress) => void
): Promise<void> {
  const pageWidthMm = 210; // A4
  const pageHeightMm = 297;
  const marginMm = 10;
  const usableWidthMm = pageWidthMm - marginMm * 2;
  const usableHeightMm = pageHeightMm - marginMm * 2;
  const gapMm = 4;

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  let cursorY = marginMm;
  let firstBlock = true;

  const blocks = Array.from(
    reportElement.querySelectorAll<HTMLElement>('[data-pdf-block="true"]')
  ).filter((el) => el.offsetHeight > 0);

  if (onProgress) onProgress({ done: 0, total: blocks.length });
  await yieldToBrowser();

  for (let i = 0; i < blocks.length; i++) {
    const el = blocks[i];
    const canvas = await html2canvas(el, {
      scale: 1.5,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
    });

    const pxPerMm = canvas.width / usableWidthMm;
    const usableHeightPx = usableHeightMm * pxPerMm;
    const totalHeightPx = canvas.height;
    let renderedPx = 0;

    while (renderedPx < totalHeightPx) {
      const sliceHeightPx = Math.min(usableHeightPx, totalHeightPx - renderedPx);
      const sliceHeightMm = sliceHeightPx / pxPerMm;

      // New page if slice does not fit
      if (!firstBlock && cursorY + sliceHeightMm > pageHeightMm - marginMm && cursorY > marginMm) {
        pdf.addPage();
        cursorY = marginMm;
      }
      if (renderedPx > 0 && cursorY !== marginMm) {
        pdf.addPage();
        cursorY = marginMm;
      }

      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceHeightPx;
      const ctx = sliceCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(
          canvas,
          0,
          renderedPx,
          canvas.width,
          sliceHeightPx,
          0,
          0,
          canvas.width,
          sliceHeightPx
        );
      }
      const sliceData = sliceCanvas.toDataURL('image/png');
      pdf.addImage(sliceData, 'PNG', marginMm, cursorY, usableWidthMm, sliceHeightMm);

      cursorY += sliceHeightMm;
      renderedPx += sliceHeightPx;
      firstBlock = false;
    }
    cursorY += gapMm;

    if (onProgress) onProgress({ done: i + 1, total: blocks.length });
    await yieldToBrowser();
  }

  const slug = safeName(collegeName || 'Course');
  pdf.save(`${slug}_Course_Progress_Report.pdf`);
}
