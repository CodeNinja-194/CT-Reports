import { EnrollmentRow } from '../../../types/course';

interface EnrollmentSummaryTableProps {
  enrollment: EnrollmentRow[];
  totals: {
    started: number;
    notStarted: number;
    passwordNotSet: number;
    subTotal: number;
  };
  onFilterGroup?: (group: string) => void;
}

export function EnrollmentSummaryTable({
  enrollment,
  totals,
  onFilterGroup,
}: EnrollmentSummaryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs sm:text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-[#1B2A4A] dark:border-slate-700 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <th className="py-2.5 px-3">Group / Section</th>
            <th className="py-2.5 px-3 text-right">Started ({totals.started})</th>
            <th className="py-2.5 px-3 text-right">Not Started ({totals.notStarted})</th>
            <th className="py-2.5 px-3 text-right">Password Not Set ({totals.passwordNotSet})</th>
            <th className="py-2.5 px-3 text-right">Sub Total ({totals.subTotal})</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {enrollment.map((r) => (
            <tr
              key={r.label}
              className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
            >
              <td className="py-2 px-3">
                <button
                  type="button"
                  onClick={() => onFilterGroup && onFilterGroup(r.label)}
                  className="inline-flex items-center font-serif text-xs font-semibold text-[#1B2A4A] dark:text-[#7FA7DA] bg-[#EAF3F8] dark:bg-[#1E2E44] border border-[#C7DFEA] dark:border-[#2D4566] px-2 py-0.5 rounded hover:underline"
                >
                  {r.label}
                </button>
              </td>
              <td className="py-2 px-3 text-right font-medium text-slate-800 dark:text-slate-200">
                {r.started}
              </td>
              <td className={`py-2 px-3 text-right font-medium ${r.notStarted > 0 ? 'text-[#C4472D] font-semibold' : 'text-slate-500'}`}>
                {r.notStarted}
              </td>
              <td className={`py-2 px-3 text-right font-medium ${r.passwordNotSet > 0 ? 'text-[#B8860F] font-semibold' : 'text-slate-500'}`}>
                {r.passwordNotSet}
              </td>
              <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                {r.subTotal}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-[#1B2A4A] dark:border-slate-700 font-bold bg-slate-50/50 dark:bg-slate-900/40 text-slate-900 dark:text-slate-100">
            <td className="py-2.5 px-3">Total</td>
            <td className="py-2.5 px-3 text-right">{totals.started}</td>
            <td className="py-2.5 px-3 text-right text-[#C4472D]">{totals.notStarted}</td>
            <td className="py-2.5 px-3 text-right text-[#B8860F]">{totals.passwordNotSet}</td>
            <td className="py-2.5 px-3 text-right">{totals.subTotal}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
