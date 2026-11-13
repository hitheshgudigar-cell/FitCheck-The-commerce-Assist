import React from 'react';
import { Alternative } from '../../types';
import { ArrowRight, Sparkles, MapPin } from 'lucide-react';

interface AlternativesStripProps {
  alternatives: Alternative[];
  onSelectAlternative: (alt: Alternative) => void;
}

export const AlternativesStrip: React.FC<AlternativesStripProps> = ({
  alternatives,
  onSelectAlternative
}) => {
  if (!alternatives || alternatives.length === 0) return null;

  return (
    <div className="mt-4 pt-3 border-t border-stone-200 dark:border-dark-border">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-terracotta-700 dark:text-terracotta-400 uppercase tracking-wider mb-2">
        <Sparkles size={14} />
        <span>Better Alternative Recommended</span>
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
        {alternatives.map((alt, idx) => {
          const firstStore = alt.availability && alt.availability[0];

          return (
            <div
              key={idx}
              className="min-w-[260px] sm:min-w-[280px] p-3 rounded-xl border border-terracotta-200/80 dark:border-terracotta-900/40 bg-terracotta-50/40 dark:bg-terracotta-950/20 flex flex-col justify-between"
            >
              <div>
                <div className="font-bold text-xs sm:text-sm text-ink-900 dark:text-dark-ink font-serif">
                  {alt.product_name}
                </div>
                <div className="text-xs text-ink-600 dark:text-dark-inkMuted mt-1">
                  {alt.reason}
                </div>

                {firstStore && (
                  <div className="flex items-center gap-1 text-[11px] text-terracotta-800 dark:text-terracotta-300 font-mono mt-2">
                    <MapPin size={12} className="shrink-0" />
                    <span>
                      {firstStore.qty} in stock at {firstStore.store.replace('FitCheck ', '')} ({firstStore.distance_km} km)
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-terracotta-200/60 dark:border-terracotta-900/30 flex justify-end">
                <button
                  type="button"
                  onClick={() => onSelectAlternative(alt)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-terracotta-700 hover:bg-terracotta-800 transition-colors shadow-xs"
                >
                  <span>Check this instead</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
