import React from 'react';
import { Loader2, Search, FileText, Store } from 'lucide-react';

interface ThinkingProgressProps {
  currentStep: string;
}

export const ThinkingProgress: React.FC<ThinkingProgressProps> = ({ currentStep }) => {
  const steps = [
    { title: 'Understanding your question', icon: Search },
    { title: 'Checking authoritative spec sheets', icon: FileText },
    { title: 'Checking nearby store inventory', icon: Store }
  ];

  const getStepIndex = () => {
    if (currentStep.toLowerCase().includes('spec') || currentStep.toLowerCase().includes('sheet')) return 1;
    if (currentStep.toLowerCase().includes('stock') || currentStep.toLowerCase().includes('store')) return 2;
    return 0;
  };

  const activeIdx = getStepIndex();

  return (
    <div
      role="status"
      aria-live="polite"
      className="p-4 rounded-2xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/50 dark:bg-teal-950/20 shadow-soft space-y-3 animate-in fade-in duration-200"
    >
      <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 text-xs font-semibold uppercase tracking-wider font-mono">
        <Loader2 size={15} className="animate-spin text-teal-700 dark:text-teal-400" />
        <span>Evaluating authoritative evidence...</span>
      </div>

      <div className="space-y-2">
        {steps.map((st, idx) => {
          const StepIcon = st.icon;
          const isDone = idx < activeIdx;
          const isCurrent = idx === activeIdx;

          return (
            <div
              key={idx}
              className={`flex items-center gap-2.5 text-xs transition-colors ${
                isDone
                  ? 'text-teal-800 dark:text-teal-300 font-medium'
                  : isCurrent
                  ? 'text-teal-700 dark:text-teal-400 font-bold animate-pulse'
                  : 'text-ink-400 dark:text-dark-inkMuted opacity-50'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  isDone
                    ? 'bg-teal-700 text-white'
                    : isCurrent
                    ? 'bg-teal-100 dark:bg-teal-900/80 text-teal-800 border border-teal-500'
                    : 'bg-stone-200 dark:bg-dark-cardMuted text-ink-500'
                }`}
              >
                {isDone ? '✓' : idx + 1}
              </div>
              <span>{st.title}</span>
            </div>
          );
        })}
      </div>

      {/* Subtle skeleton bar */}
      <div className="pt-1">
        <div className="h-1.5 w-full bg-teal-100 dark:bg-teal-950 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-600 transition-all duration-300 ease-out"
            style={{ width: `${((activeIdx + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-soft space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-6 w-32 bg-stone-200 dark:bg-dark-cardMuted rounded-full" />
        <div className="h-4 w-20 bg-stone-200 dark:bg-dark-cardMuted rounded-md" />
      </div>
      <div className="h-5 w-3/4 bg-stone-200 dark:bg-dark-cardMuted rounded-md" />
      <div className="space-y-2">
        <div className="h-3.5 w-full bg-stone-200 dark:bg-dark-cardMuted rounded-md" />
        <div className="h-3.5 w-5/6 bg-stone-200 dark:bg-dark-cardMuted rounded-md" />
      </div>
      <div className="h-20 w-full bg-stone-100 dark:bg-dark-cardMuted/50 rounded-xl" />
    </div>
  );
};
