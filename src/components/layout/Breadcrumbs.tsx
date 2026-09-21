import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbItem } from '../../types/common';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (href: string) => void;
}

export function Breadcrumbs({ items, onNavigate }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400 mb-4" aria-label="Breadcrumb">
      <button
        onClick={() => onNavigate('/')}
        className="flex items-center hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
      >
        <Home className="w-3.5 h-3.5 mr-1" />
        <span>Home</span>
      </button>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center space-x-1">
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            {isLast || !item.href ? (
              <span className="font-semibold text-[#1B2A4A] dark:text-[#7FA7DA]">
                {item.label}
              </span>
            ) : (
              <button
                onClick={() => item.href && onNavigate(item.href)}
                className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                {item.label}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}
