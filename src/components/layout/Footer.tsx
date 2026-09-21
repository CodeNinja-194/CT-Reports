import { GraduationCap } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-[#0A111C]/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Row */}
        <div className="py-8 flex flex-col items-center gap-4 text-center">

          {/* Logo Mark */}
          <div className="flex items-center gap-3">
            <img
              src="/codetantra-logo.png"
              alt="CodeTantra"
              className="h-7 w-auto object-contain dark:hidden"
            />
            <img
              src="/codetantra-logo-dark.png"
              alt="CodeTantra"
              className="h-7 w-auto object-contain hidden dark:block"
            />
            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700"></div>
            <div className="text-left">
              <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm leading-tight tracking-tight">
                Reports Portal
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">
                Trainer Reporting Platform
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-16 h-px bg-slate-200 dark:bg-slate-800" />

          {/* Maintained by */}
          <div className="space-y-1">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Maintained by <span className="text-[#1B2A4A] dark:text-slate-200 font-semibold">Trainers</span> — CodeTantra
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {currentYear} · 100% in-browser processing · No data leaves your device
            </p>
          </div>

          {/* Export formats */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {['PDF', 'HTML', 'Excel', 'ZIP'].map((fmt) => (
              <span
                key={fmt}
                className="px-2 py-0.5 text-[10px] font-medium rounded border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40"
              >
                {fmt}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
