import React from 'react';
import {
  Compass,
  MapPin,
  Sliders,
  Moon,
  Sun,
  Laptop,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useFitCheck } from '../../context/FitCheckContext';

export const Header: React.FC = () => {
  const {
    isDemoMode,
    retryBackend,
    profile,
    filters,
    setDetailsDrawerOpen,
    theme,
    setTheme,
    resetThread,
    activeTab,
    setActiveTab
  } = useFitCheck();

  // Count active saved details in profile
  const detailsCount =
    (profile.location?.pincode ? 1 : 0) +
    Object.keys(profile.measurements || {}).filter(k => profile.measurements[k]).length +
    (profile.devices?.length || 0) +
    Object.keys(profile.spaces || {}).filter(k => profile.spaces[k]).length +
    (profile.dietary?.length || 0);

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-dark-card/95 backdrop-blur-md border-b border-stone-200/90 dark:border-dark-border shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Left: Logo & Tagline */}
        <div
          onClick={resetThread}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-teal-700 group-hover:bg-teal-800 text-white flex items-center justify-center shadow-xs transition-colors">
            <Compass size={20} className="group-hover:rotate-45 transition-transform duration-subtle" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-lg sm:text-xl font-black tracking-tight text-ink-900 dark:text-dark-ink">
                Fit<span className="text-teal-700 dark:text-teal-400">Check</span>
              </span>
              {/* Demo Mode Badge */}
              {isDemoMode && (
                <span
                  title="Running on local mock data engine (FastAPI offline or demo fallback active)"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700 shadow-2xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>Demo mode</span>
                </span>
              )}
            </div>
            <p className="hidden sm:block text-[11px] text-ink-500 dark:text-dark-inkMuted font-sans">
              Will it fit? Is it nearby?
            </p>
          </div>
        </div>

        {/* Center: Segmented Control Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-stone-100 dark:bg-dark-cardMuted border border-stone-200 dark:border-dark-border text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('discovery')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'discovery'
                ? 'bg-white dark:bg-dark-card text-teal-800 dark:text-teal-300 font-bold shadow-xs'
                : 'text-ink-600 dark:text-dark-inkMuted hover:text-ink-900'
            }`}
          >
            Find nearby
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('product')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'product'
                ? 'bg-white dark:bg-dark-card text-teal-800 dark:text-teal-300 font-bold shadow-xs'
                : 'text-ink-600 dark:text-dark-inkMuted hover:text-ink-900'
            }`}
          >
            Ask about a product
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Location Chip */}
          <button
            type="button"
            onClick={() => setDetailsDrawerOpen(true)}
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border border-stone-200 dark:border-dark-border bg-stone-50 dark:bg-dark-cardMuted hover:bg-stone-100 dark:hover:bg-dark-border text-ink-700 dark:text-dark-ink transition-colors"
            title="Edit location and radius"
          >
            <MapPin size={13} className="text-teal-700 dark:text-teal-400" />
            <span className="font-mono">{profile.location.city} · {filters.radius_km} km</span>
          </button>

          {/* My Details Button */}
          <button
            type="button"
            onClick={() => setDetailsDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-stone-200 dark:border-dark-border bg-white dark:bg-dark-card hover:bg-stone-50 dark:hover:bg-dark-cardMuted text-ink-800 dark:text-dark-ink shadow-2xs transition-colors"
          >
            <Sliders size={14} className="text-teal-700 dark:text-teal-400" />
            <span className="hidden sm:inline">My details</span>
            {detailsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-teal-700 text-white text-[10px] font-mono flex items-center justify-center font-bold">
                {detailsCount}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={cycleTheme}
            className="p-2 rounded-xl border border-stone-200 dark:border-dark-border text-ink-600 dark:text-dark-ink hover:bg-stone-100 dark:hover:bg-dark-cardMuted transition-colors"
            title={`Switch theme (currently ${theme})`}
            aria-label="Toggle color theme"
          >
            {theme === 'light' ? (
              <Sun size={15} />
            ) : theme === 'dark' ? (
              <Moon size={15} />
            ) : (
              <Laptop size={15} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
