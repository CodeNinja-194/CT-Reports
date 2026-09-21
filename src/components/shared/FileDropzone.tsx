import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, X, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface FileDropzoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  acceptedFormats?: string;
  multiple?: boolean;
  title?: string;
  subtitle?: string;
  requiredColumnsHint?: string[];
  busy?: boolean;
  busyText?: string;
  className?: string;
}

export function FileDropzone({
  onFilesSelected,
  acceptedFormats = '.xlsx,.xls,.csv',
  multiple = false,
  title = 'Drop Excel / CSV files here',
  subtitle = 'or click to browse from your device',
  requiredColumnsHint,
  busy = false,
  busyText = 'Reading spreadsheet...',
  className,
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragover' || e.type === 'dragenter') {
      setIsDragOver(true);
    } else if (e.type === 'dragleave') {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div
        onDragOver={handleDrag}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-150 group',
          'bg-white dark:bg-[#141E2C]',
          isDragOver
            ? 'border-[#B8860F] bg-[#B8860F]/5 dark:bg-[#B8860F]/10 scale-[1.005]'
            : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
        )}
      >
        {/* Subtle corner document intake marks */}
        <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-[#B8860F] rounded-tl pointer-events-none" />
        <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-[#B8860F] rounded-tr pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-[#B8860F] rounded-bl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-[#B8860F] rounded-br pointer-events-none" />

        <div className="flex flex-col items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#1B2A4A] dark:text-[#7FA7DA] group-hover:scale-110 transition-transform mb-3">
            <UploadCloud className="w-6 h-6 text-[#1B2A4A] dark:text-[#D9A93A]" />
          </div>

          <h4 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">
            {busy ? busyText : title}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-sm">
            {subtitle}
          </p>

          {requiredColumnsHint && requiredColumnsHint.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-center max-w-lg mt-1">
              {requiredColumnsHint.map((col, idx) => (
                <span
                  key={idx}
                  className="inline-block px-2 py-0.5 text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full"
                >
                  {col}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            <span>Supported: {acceptedFormats.replace(/\./g, ' ').toUpperCase()}</span>
            <span>•</span>
            <span>Local in-browser processing</span>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={acceptedFormats}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
