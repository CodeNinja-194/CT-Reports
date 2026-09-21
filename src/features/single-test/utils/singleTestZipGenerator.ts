import { SingleTestAnalysis, SingleTestMeta } from '../../../types/singleTest';
import { buildSingleTestPdf } from './singleTestPdfGenerator';
import { createZip, ZipFileInput } from '../../../lib/zip';
import { safeName, downloadBlob, yieldToBrowser } from '../../../lib/utils';

export async function generateSingleTestZip(
  analysis: SingleTestAnalysis,
  meta: SingleTestMeta,
  options: { below?: boolean; notAtt?: boolean; scorecard?: boolean } = {
    below: true,
    notAtt: true,
    scorecard: true,
  },
  onProgress?: (msg: string) => void
): Promise<void> {
  const base = safeName(meta.testName || 'Test');
  const files: ZipFileInput[] = [];

  if (onProgress) onProgress('Building college summary PDF...');
  const collegePdfBytes = await buildSingleTestPdf(analysis, meta, null, options);
  files.push({
    name: `${base}_College_Summary.pdf`,
    data: collegePdfBytes,
  });

  for (let i = 0; i < analysis.groups.length; i++) {
    const g = analysis.groups[i];
    if (onProgress) onProgress(`Building group report ${i + 1} of ${analysis.groups.length}: ${g.label}...`);
    await yieldToBrowser();
    const groupPdfBytes = await buildSingleTestPdf(analysis, meta, g.key, options);
    files.push({
      name: `Groups/${base}_${safeName(g.label)}_Report.pdf`,
      data: groupPdfBytes,
    });
  }

  if (onProgress) onProgress('Compressing reports into ZIP archive...');
  const zipBlob = await createZip(files);
  downloadBlob(zipBlob, `${base}_All_Reports.zip`);
}
