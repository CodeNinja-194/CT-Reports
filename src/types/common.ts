export type Theme = 'light' | 'dark';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  rowCount?: number;
}
