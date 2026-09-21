import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmtPct(n: number): string {
  return `${n.toFixed(1)}%`;
}

export function pct(v: number): string {
  return `${(+v).toFixed(1)}%`;
}

export function num(v: number | string | null | undefined): string {
  if (v === null || v === undefined || v === '') return '-';
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^\d.-]/g, ''));
  return isNaN(n) ? '-' : String(Number(n.toFixed(2)));
}

export function r1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function cmpNat(a: string, b: string): number {
  return String(a || '').localeCompare(String(b || ''), undefined, { numeric: true, sensitivity: 'base' });
}

export function groupLabel(raw: string): string {
  const g = String(raw || '').trim();
  const m = g.match(/^(\d{4}-\d{4})-([A-Za-z]+)-([A-Za-z0-9]+)/);
  if (m) return `${m[2].toUpperCase()}-${m[3].toUpperCase()}`;
  return g.replace(/^\d{4}-\d{4}-/, '') || 'General';
}

export function shortGroup(g: string): string {
  return String(g || '').replace(/^\d{4}-\d{4}-/, '') || '-';
}

export function prettyDate(d: string): string {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function safeName(s: string): string {
  return String(s || '').replace(/[^\w-]+/g, '_').replace(/^_+|_+$/g, '');
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
