import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, MapPin, Zap } from 'lucide-react';
import { Composer } from '../Chat/Composer';

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onSelectPrompt,
  onSend,
  disabled = false
}) => {
  const examplePrompts = [
    {
      title: 'Black dress, size M, available near me today',
      category: 'Clothing · Size Chart Check',
      badge: 'Discovery'
    },
    {
      title: 'Gluten-free biscuits nearby',
      category: 'Grocery & Health · Ingredient Verification',
      badge: 'Dietary'
    },
    {
      title: 'TV wall mount for a 55 inch TV',
      category: 'Electronics · VESA & Weight Spec',
      badge: 'Hardware'
    },
    {
      title: 'Printer cartridge for HP DeskJet 2331',
      category: 'Electronics · Compatibility Matrix',
      badge: 'Accessories'
    },
    {
      title: 'Sofa that fits through an 80 cm door',
      category: 'Furniture · Doorway & Packaging Spec',
      badge: 'Clearance'
    }
  ];

  return (
    <div className="py-6 sm:py-10 max-w-2xl mx-auto px-4 text-center space-y-6">
      {/* Reassurance pill */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800/80">
        <ShieldCheck size={14} className="text-teal-600 dark:text-teal-400" />
        <span>Authoritative Engineering Specs · Local Mysuru Inventory</span>
      </div>

      {/* Hero Headline */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-ink-900 dark:text-dark-ink font-serif tracking-tight leading-tight">
          Find what fits you, <br className="hidden sm:inline" />
          <span className="text-teal-700 dark:text-teal-400">available near you today</span>
        </h1>
        <p className="mt-2.5 text-xs sm:text-sm text-ink-600 dark:text-dark-inkMuted max-w-lg mx-auto leading-relaxed">
          Ask high-stakes pre-purchase questions. FitCheck verifies size charts, VESA standards, and technical manuals against live stock across 6 Mysuru stores.
        </p>
      </div>

      {/* Large Composer in Empty State */}
      <div className="text-left shadow-lifted rounded-2xl">
        <Composer
          onSend={onSend}
          disabled={disabled}
          placeholder="Try: 'Black dress size M available near me today' or 'TV wall mount 55 inch'..."
          autoFocus={false}
        />
      </div>

      {/* 5 Tappable Example Prompts */}
      <div className="pt-2 text-left space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono font-semibold uppercase tracking-wider text-ink-500 dark:text-dark-inkMuted px-1">
          <span className="flex items-center gap-1.5">
            <Zap size={13} className="text-terracotta-600" />
            <span>Try these demo scenarios</span>
          </span>
          <span>Click to run</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {examplePrompts.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(item.title)}
              className="w-full p-3 sm:p-3.5 rounded-xl border border-stone-200 dark:border-dark-border bg-white dark:bg-dark-card hover:border-teal-500 hover:shadow-soft text-left transition-all group flex items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-stone-100 dark:bg-dark-cardMuted text-ink-600 dark:text-dark-inkMuted">
                    {item.badge}
                  </span>
                  <span className="text-[11px] text-ink-400 dark:text-dark-inkMuted truncate">
                    {item.category}
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-semibold text-ink-900 dark:text-dark-ink group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                  "{item.title}"
                </div>
              </div>

              <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-dark-cardMuted group-hover:bg-teal-700 group-hover:text-white flex items-center justify-center text-ink-500 dark:text-dark-inkMuted shrink-0 transition-colors">
                <ArrowRight size={15} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
