import { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './features/home/HomePage';
import { GroupWiseCoursePage } from './features/course-report/GroupWiseCoursePage';
import { CourseReportHub } from './features/course-report/CourseReportHub';
import { SingleTestPage } from './features/single-test/SingleTestPage';
import { TestsHub } from './features/single-test/TestsHub';
import { SegregationPage } from './features/segregation/SegregationPage';

export function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderCurrentView = () => {
    switch (currentPath) {
      case '/':
        return <HomePage onNavigate={navigate} />;
      case '/course-report':
        return <CourseReportHub onNavigate={navigate} />;
      case '/course-report/group-wise':
        return <GroupWiseCoursePage onNavigate={navigate} />;
      case '/tests':
        return <TestsHub onNavigate={navigate} />;
      case '/tests/single-test':
        return <SingleTestPage onNavigate={navigate} />;
      case '/tests/segregation':
        return <SegregationPage onNavigate={navigate} />;
      default:
        // Fallback or subpath match
        if (currentPath.startsWith('/course-report')) {
          return <GroupWiseCoursePage onNavigate={navigate} />;
        }
        if (currentPath.startsWith('/tests/single-test')) {
          return <SingleTestPage onNavigate={navigate} />;
        }
        if (currentPath.startsWith('/tests/segregation')) {
          return <SegregationPage onNavigate={navigate} />;
        }
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0D141E] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar currentPath={currentPath} onNavigate={navigate} />
      {currentPath === '/' ? (
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {renderCurrentView()}
        </main>
      ) : (
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {renderCurrentView()}
        </main>
      )}
      <Footer />
    </div>
  );
}

export default App;
