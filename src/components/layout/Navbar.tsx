import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../lib/theme';
import {
  GraduationCap,
  ChevronDown,
  Menu,
  X,
  Sun,
  Moon,
  FileSpreadsheet,
  FileCheck2,
  Users,
  Layers,
  ArrowRight
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function Navbar({ currentPath, onNavigate }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [courseOpen, setCourseOpen] = useState(false);
  const [testsOpen, setTestsOpen] = useState(false);

  const courseDropdownRef = useRef<HTMLDivElement>(null);
  const testsDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(event.target as Node)) {
        setCourseOpen(false);
      }
      if (testsDropdownRef.current && !testsDropdownRef.current.contains(event.target as Node)) {
        setTestsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNav = (path: string) => {
    onNavigate(path);
    setCourseOpen(false);
    setTestsOpen(false);
    setMobileOpen(false);
  };

  const isCourseActive = currentPath.startsWith('/course-report');
  const isTestsActive = currentPath.startsWith('/tests');

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#111A27]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => handleNav('/')}>
            <div className="flex items-center">
              <img
                src="/codetantra-logo.png"
                alt="CodeTantra"
                className="h-8 md:h-9 w-auto object-contain dark:hidden"
              />
              <img
                src="/codetantra-logo-dark.png"
                alt="CodeTantra"
                className="h-8 md:h-9 w-auto object-contain hidden dark:block"
              />
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-base text-slate-800 dark:text-slate-100 tracking-tight">
                Reports
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] uppercase font-semibold tracking-wider bg-[#B8860F]/10 text-[#B8860F] border border-[#B8860F]/30 rounded">
                Portal
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {/* Home */}
            <button
              onClick={() => handleNav('/')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPath === '/'
                  ? 'bg-slate-100 dark:bg-slate-800 text-[#1B2A4A] dark:text-[#7FA7DA] font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              Home
            </button>

            {/* Course Report Dropdown */}
            <div className="relative" ref={courseDropdownRef}>
              <button
                onClick={() => {
                  setCourseOpen(!courseOpen);
                  setTestsOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isCourseActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-[#1B2A4A] dark:text-[#7FA7DA] font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>Course Report</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${courseOpen ? 'rotate-180' : ''}`} />
              </button>

              {courseOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-xl bg-white dark:bg-[#152031] border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={() => handleNav('/course-report/group-wise')}
                    className={`w-full text-left p-2.5 rounded-lg flex items-start gap-3 transition-colors ${
                      currentPath === '/course-report/group-wise'
                        ? 'bg-slate-100 dark:bg-slate-800/80 text-[#1B2A4A] dark:text-[#7FA7DA]'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div className="p-2 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 mt-0.5">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold flex items-center gap-1">
                        Group Wise Course
                        <ArrowRight className="w-3 h-3 opacity-60" />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        Multi-section progress, password activation &amp; at-risk analysis
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleNav('/course-report')}
                    className="w-full text-left px-3 py-2 mt-1 rounded-md text-xs font-medium text-slate-500 hover:text-[#1B2A4A] dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    View Course Reports Hub →
                  </button>
                </div>
              )}
            </div>

            {/* Tests Dropdown */}
            <div className="relative" ref={testsDropdownRef}>
              <button
                onClick={() => {
                  setTestsOpen(!testsOpen);
                  setCourseOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isTestsActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-[#1B2A4A] dark:text-[#7FA7DA] font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>Tests</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${testsOpen ? 'rotate-180' : ''}`} />
              </button>

              {testsOpen && (
                <div className="absolute left-0 mt-2 w-80 rounded-xl bg-white dark:bg-[#152031] border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={() => handleNav('/tests/single-test')}
                    className={`w-full text-left p-2.5 rounded-lg flex items-start gap-3 transition-colors ${
                      currentPath === '/tests/single-test'
                        ? 'bg-slate-100 dark:bg-slate-800/80 text-[#1B2A4A] dark:text-[#7FA7DA]'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div className="p-2 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 mt-0.5">
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold flex items-center gap-1">
                        Single Test
                        <ArrowRight className="w-3 h-3 opacity-60" />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        Attempted &amp; unattempted merge, pass rate &amp; ZIP exports
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNav('/tests/segregation')}
                    className={`w-full text-left p-2.5 rounded-lg flex items-start gap-3 transition-colors ${
                      currentPath === '/tests/segregation'
                        ? 'bg-slate-100 dark:bg-slate-800/80 text-[#1B2A4A] dark:text-[#7FA7DA]'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div className="p-2 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 mt-0.5">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold flex items-center gap-1">
                        Segregation
                        <ArrowRight className="w-3 h-3 opacity-60" />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        Section marks, performer bands (Advanced, Good, Average, Focus)
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleNav('/tests')}
                    className="w-full text-left px-3 py-2 mt-1 rounded-md text-xs font-medium text-slate-500 hover:text-[#1B2A4A] dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    View Tests Hub →
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Right Controls: Theme Toggle & Mobile Menu */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[#D9A93A]" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Hamburger Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111A27] px-4 pt-2 pb-6 space-y-3">
          <button
            onClick={() => handleNav('/')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
              currentPath === '/'
                ? 'bg-slate-100 dark:bg-slate-800 text-[#1B2A4A] dark:text-[#7FA7DA] font-semibold'
                : 'text-slate-700 dark:text-slate-200'
            }`}
          >
            Home
          </button>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Course Reports
            </p>
            <button
              onClick={() => handleNav('/course-report/group-wise')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${
                currentPath === '/course-report/group-wise'
                  ? 'bg-slate-100 dark:bg-slate-800 text-[#1B2A4A] dark:text-[#7FA7DA] font-semibold'
                  : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              <span>Group Wise Course</span>
              <FileSpreadsheet className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Test Reports
            </p>
            <button
              onClick={() => handleNav('/tests/single-test')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${
                currentPath === '/tests/single-test'
                  ? 'bg-slate-100 dark:bg-slate-800 text-[#1B2A4A] dark:text-[#7FA7DA] font-semibold'
                  : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              <span>Single Test</span>
              <FileCheck2 className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={() => handleNav('/tests/segregation')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between mt-1 ${
                currentPath === '/tests/segregation'
                  ? 'bg-slate-100 dark:bg-slate-800 text-[#1B2A4A] dark:text-[#7FA7DA] font-semibold'
                  : 'text-slate-700 dark:text-slate-200'
              }`}
            >
              <span>Segregation</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
