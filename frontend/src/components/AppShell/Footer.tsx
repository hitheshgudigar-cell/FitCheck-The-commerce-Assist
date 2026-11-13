import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { useFitCheck } from '../../context/FitCheckContext';

export const Footer: React.FC = () => {
  const { setShowHowItWorks } = useFitCheck();

  return (
    <footer className="mt-auto border-t border-stone-200/80 dark:border-dark-border bg-stone-50/80 dark:bg-dark-card py-4 px-4 text-center text-xs text-ink-500 dark:text-dark-inkMuted">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
          <span className="font-semibold text-ink-700 dark:text-dark-ink">
            All data shown is SAMPLE DATA
          </span>
          <span className="hidden sm:inline">· Mysuru Local Retail Pilot</span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <button
            type="button"
            onClick={() => setShowHowItWorks(true)}
            className="text-teal-700 dark:text-teal-400 hover:underline font-semibold flex items-center gap-1"
          >
            <ShieldCheck size={14} />
            <span>How FitCheck checks answers</span>
          </button>

          <span className="text-ink-400 dark:text-dark-border">|</span>

          <span>Built for trustworthy local retail</span>
        </div>
      </div>
    </footer>
  );
};
