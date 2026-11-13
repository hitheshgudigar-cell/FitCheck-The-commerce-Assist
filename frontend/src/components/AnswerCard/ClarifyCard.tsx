import React, { useState } from 'react';
import { HelpCircle, ArrowRight, Sparkles, Check } from 'lucide-react';

interface ClarifyCardProps {
  question: string;
  options?: string[];
  onAnswer: (answer: string) => void;
}

export const ClarifyCard: React.FC<ClarifyCardProps> = ({
  question,
  options = [],
  onAnswer
}) => {
  const [customInput, setCustomInput] = useState('');
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      onAnswer(customInput.trim());
      setCustomInput('');
    }
  };

  const isMeasurementQuestion =
    question.toLowerCase().includes('bust') ||
    question.toLowerCase().includes('waist') ||
    question.toLowerCase().includes('door') ||
    question.toLowerCase().includes('dimension') ||
    question.toLowerCase().includes('width');

  return (
    <div
      data-testid="clarify-card"
      className="p-4 sm:p-5 rounded-2xl border-2 border-amber-300 dark:border-amber-700/60 bg-amber-50/70 dark:bg-amber-950/20 shadow-soft animate-in fade-in duration-200"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-200/70 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 shrink-0 mt-0.5">
          <HelpCircle size={20} />
        </div>
        <div className="flex-1">
          <div className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider font-bold text-amber-800 dark:text-amber-400">
            <Sparkles size={12} />
            <span>Clarification Needed for Exact Spec Match</span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-ink-900 dark:text-dark-ink font-serif mt-1">
            {question}
          </h3>
          <p className="text-xs text-ink-600 dark:text-dark-inkMuted mt-1">
            Tap a quick reply or enter below. Answers auto-save to your session profile.
          </p>
        </div>
      </div>

      {/* Quick-reply chips */}
      {options && options.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {options.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onAnswer(opt)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-dark-card border border-amber-300 dark:border-amber-700/80 text-ink-800 dark:text-dark-ink hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:border-amber-400 transition-all shadow-2xs active:scale-95"
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* Inline Input Form */}
      <form onSubmit={handleSubmitCustom} className="mt-3.5 flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            placeholder={
              isMeasurementQuestion
                ? `Enter value (e.g. 80 ${unit})`
                : 'Or type your exact model / value...'
            }
            className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 dark:border-dark-border bg-white dark:bg-dark-card text-ink-900 dark:text-dark-ink placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>

        {isMeasurementQuestion && (
          <div className="flex items-center rounded-xl border border-stone-300 dark:border-dark-border bg-stone-100 dark:bg-dark-cardMuted p-0.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => setUnit('cm')}
              className={`px-2 py-1 rounded-lg ${
                unit === 'cm'
                  ? 'bg-white dark:bg-dark-card font-bold shadow-xs'
                  : 'text-ink-500 hover:text-ink-800'
              }`}
            >
              cm
            </button>
            <button
              type="button"
              onClick={() => setUnit('in')}
              className={`px-2 py-1 rounded-lg ${
                unit === 'in'
                  ? 'bg-white dark:bg-dark-card font-bold shadow-xs'
                  : 'text-ink-500 hover:text-ink-800'
              }`}
            >
              in
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={!customInput.trim()}
          className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 transition-colors flex items-center gap-1 shadow-sm"
        >
          <span>Submit</span>
          <ArrowRight size={14} />
        </button>
      </form>
    </div>
  );
};
