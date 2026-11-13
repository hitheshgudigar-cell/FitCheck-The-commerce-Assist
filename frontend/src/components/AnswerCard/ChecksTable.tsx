import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check, X, HelpCircle, ShieldCheck } from 'lucide-react';
import { CheckResult } from '../../types';

interface ChecksTableProps {
  checks: CheckResult[];
  defaultOpen?: boolean;
}

export const ChecksTable: React.FC<ChecksTableProps> = ({
  checks,
  defaultOpen = true
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (!checks || checks.length === 0) return null;

  const passedCount = checks.filter(c => c.passed === true).length;
  const failedCount = checks.filter(c => c.passed === false).length;
  const unknownCount = checks.filter(c => c.passed === null).length;

  return (
    <div className="mt-4 rounded-xl border border-stone-200 dark:border-dark-border bg-white dark:bg-dark-card overflow-hidden shadow-soft transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-left bg-stone-50/75 dark:bg-dark-cardMuted hover:bg-stone-100/75 dark:hover:bg-dark-border/40 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-teal-700 dark:text-teal-400" />
          <span className="text-xs sm:text-sm font-semibold text-ink-800 dark:text-dark-ink">
            How we checked
          </span>
          <span className="text-xs text-ink-500 dark:text-dark-inkMuted ml-1">
            ({passedCount} passed{failedCount > 0 ? `, ${failedCount} failed` : ''}{unknownCount > 0 ? `, ${unknownCount} unconfirmed` : ''})
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-ink-500 dark:text-dark-inkMuted">
          <span>{isOpen ? 'Hide breakdown' : 'Show specs'}</span>
          {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </button>

      {isOpen && (
        <div className="p-3 sm:p-4 overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-stone-200 dark:border-dark-border text-ink-500 dark:text-dark-inkMuted uppercase tracking-wider text-[11px]">
                <th className="py-2 px-2.5 font-medium">Attribute</th>
                <th className="py-2 px-2.5 font-medium">Needed</th>
                <th className="py-2 px-2.5 font-medium">Product has</th>
                <th className="py-2 px-2.5 font-medium text-center">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-dark-border/50">
              {checks.map((chk, idx) => {
                const isFail = chk.passed === false;
                const isPass = chk.passed === true;
                const isUnknown = chk.passed === null;

                const rowBg = isFail
                  ? 'bg-red-50/70 dark:bg-red-950/30 text-red-900 dark:text-red-200 font-medium'
                  : isUnknown
                  ? 'bg-amber-50/60 dark:bg-amber-950/20'
                  : 'hover:bg-stone-50/50 dark:hover:bg-dark-cardMuted/30';

                return (
                  <tr
                    key={idx}
                    data-testid={`check-row-${idx}`}
                    className={`transition-colors ${rowBg}`}
                  >
                    <td className="py-2.5 px-2.5 font-medium text-ink-900 dark:text-dark-ink">
                      <div>{chk.attribute}</div>
                      {chk.source_ref && (
                        <div className="text-[10px] text-ink-400 dark:text-dark-inkMuted font-mono mt-0.5">
                          ref: {chk.source_ref}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-2.5 font-mono text-xs text-ink-700 dark:text-ink-200">
                      {String(chk.required)}
                    </td>
                    <td className="py-2.5 px-2.5 font-mono text-xs text-ink-700 dark:text-ink-200">
                      {String(chk.actual)}
                    </td>
                    <td className="py-2.5 px-2.5 text-center">
                      {isPass && (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                          <Check size={14} strokeWidth={2.5} />
                        </span>
                      )}
                      {isFail && (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400">
                          <X size={14} strokeWidth={2.5} />
                        </span>
                      )}
                      {isUnknown && (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                          <HelpCircle size={14} strokeWidth={2.5} />
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
