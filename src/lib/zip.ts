import JSZip from 'jszip';

export interface ZipFileInput {
  name: string;
  data: Uint8Array | Blob | string;
}

export async function createZip(files: ZipFileInput[]): Promise<Blob> {
  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.name, file.data);
  }
  return await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}
