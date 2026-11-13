import React from 'react';
import { SlidersHorizontal, Clock, CheckCircle2, ArrowUpDown } from 'lucide-react';
import { FilterState } from '../../types';

interface FilterBarProps {
  filters: FilterState;
  onChange: React.Dispatch<React.SetStateAction<FilterState>>;
  resultCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  resultCount
}) => {
  return (
    <div className="p-3 sm:p-3.5 rounded-2xl border border-stone-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-soft space-y-3">
      <div className="flex items-center justify-between text-xs text-ink-500 dark:text-dark-inkMuted flex-wrap gap-2">
        <div className="flex items-center gap-1.5 font-semibold text-ink-800 dark:text-dark-ink uppercase tracking-wider text-[11px] font-mono">
          <SlidersHorizontal size={14} className="text-teal-700 dark:text-teal-400" />
          <span>Filters & Local Radius</span>
        </div>
        <div className="text-[11px] font-mono text-ink-600 dark:text-dark-inkMuted">
          Showing <strong>{resultCount}</strong> ranked results
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Radius Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-ink-600 dark:text-dark-inkMuted">
            <span>Search Radius</span>
            <span className="font-mono font-bold text-teal-700 dark:text-teal-400">{filters.radius_km} km</span>
          </div>
          <input
            type="range"
            min={1}
            max={25}
            step={1}
            value={filters.radius_km}
            onChange={e =>
              onChange(prev => ({ ...prev, radius_km: Number(e.target.value) }))
            }
            aria-label="Search radius in kilometers"
            className="w-full accent-teal-700 dark:accent-teal-500 cursor-pointer h-1.5 bg-stone-200 dark:bg-dark-cardMuted rounded-lg"
          />
        </div>

        {/* Pickup Today Toggle */}
        <button
          type="button"
          onClick={() =>
            onChange(prev => ({ ...prev, pickup_today: !prev.pickup_today }))
          }
          className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-colors ${
            filters.pickup_today
              ? 'bg-terracotta-50 border-terracotta-300 text-terracotta-800 dark:bg-terracotta-950/40 dark:border-terracotta-700 dark:text-terracotta-300 font-semibold'
              : 'border-stone-200 dark:border-dark-border text-ink-600 dark:text-dark-inkMuted hover:bg-stone-50 dark:hover:bg-dark-cardMuted'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Clock size={14} />
            <span>Pickup today</span>
          </span>
          <span className="text-[10px] font-mono uppercase">
            {filters.pickup_today ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* In Stock Only Toggle */}
        <button
          type="button"
          onClick={() =>
            onChange(prev => ({ ...prev, in_stock_only: !prev.in_stock_only }))
          }
          className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-colors ${
            filters.in_stock_only
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-300 font-semibold'
              : 'border-stone-200 dark:border-dark-border text-ink-600 dark:text-dark-inkMuted hover:bg-stone-50 dark:hover:bg-dark-cardMuted'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} />
            <span>In stock only</span>
          </span>
          <span className="text-[10px] font-mono uppercase">
            {filters.in_stock_only ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Sort Select */}
        <div className="flex items-center rounded-xl border border-stone-200 dark:border-dark-border bg-stone-50 dark:bg-dark-cardMuted px-2 py-1">
          <ArrowUpDown size={13} className="text-ink-400 mr-1.5 shrink-0" />
          <select
            value={filters.sort_by}
            onChange={e =>
              onChange(prev => ({
                ...prev,
                sort_by: e.target.value as FilterState['sort_by']
              }))
            }
            aria-label="Sort results by"
            className="w-full bg-transparent text-xs text-ink-800 dark:text-dark-ink font-medium focus:outline-none cursor-pointer"
          >
            <option value="best_fit">Sort: Best fit</option>
            <option value="nearest">Sort: Nearest store</option>
            <option value="price">Sort: Price low to high</option>
          </select>
        </div>
      </div>
    </div>
  );
};
