import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  Shirt,
  Cpu,
  Armchair,
  Pill,
  Footprints,
  Wrench,
  HelpCircle,
  Tag
} from 'lucide-react';
import { Composer } from '../Chat/Composer';
import { PRODUCT_CATEGORIES, ProductCategoryInfo } from '../../types/categories';

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
  const [selectedType, setSelectedType] = useState<ProductCategoryInfo | null>(null);

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'clothing':
        return <Shirt size={16} />;
      case 'electronics_accessory':
        return <Cpu size={16} />;
      case 'furniture':
        return <Armchair size={16} />;
      case 'grocery_pharmacy':
        return <Pill size={16} />;
      case 'footwear':
        return <Footprints size={16} />;
      case 'hardware':
        return <Wrench size={16} />;
      default:
        return <Tag size={16} />;
    }
  };

  return (
    <div className="py-4 sm:py-8 max-w-2xl mx-auto px-2 sm:px-4 text-center space-y-6 animate-in fade-in duration-200">
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
        <p className="mt-2 text-xs sm:text-sm text-ink-600 dark:text-dark-inkMuted max-w-lg mx-auto leading-relaxed">
          Select the product type you are searching for, then specify the exact product or model to check size, compatibility, and nearby store stock.
        </p>
      </div>

      {/* STEP 1: Product Types Selection */}
      <div className="text-left space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono font-semibold uppercase tracking-wider text-ink-500 dark:text-dark-inkMuted px-1">
          <span className="flex items-center gap-1.5 text-teal-800 dark:text-teal-300 font-bold">
            <Sparkles size={13} className="text-teal-700 dark:text-teal-400" />
            <span>Step 1: Choose Product Type</span>
          </span>
          <span className="text-[11px] font-sans font-normal text-ink-400">
            {selectedType ? `Selected: ${selectedType.name}` : 'Tap a category to start'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PRODUCT_CATEGORIES.map(cat => {
            const isSelected = selectedType?.id === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedType(cat)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-teal-700 bg-teal-50 dark:bg-teal-950/40 shadow-sm ring-1 ring-teal-700'
                    : 'border-stone-200 dark:border-dark-border bg-white dark:bg-dark-card hover:border-teal-400 hover:shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-teal-700 text-white'
                        : 'bg-stone-100 dark:bg-dark-cardMuted text-ink-600 dark:text-dark-inkMuted'
                    }`}
                  >
                    {getCategoryIcon(cat.id)}
                  </div>
                  <span className="text-xs font-bold text-ink-900 dark:text-dark-ink truncate">
                    {cat.name.split(' ')[0]}
                  </span>
                </div>
                <p className="text-[10px] text-ink-500 dark:text-dark-inkMuted line-clamp-1">
                  {cat.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 2: Instruction to specify actual product */}
      <div className="text-left space-y-2 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
            <Search size={14} className="text-amber-700 dark:text-amber-400" />
            <span>Step 2: Specify the Actual Product</span>
          </div>
          {selectedType && (
            <button
              type="button"
              onClick={() => setSelectedType(null)}
              className="text-[10px] text-amber-800 dark:text-amber-400 hover:underline"
            >
              Show all types
            </button>
          )}
        </div>

        <p className="text-xs text-ink-700 dark:text-ink-200 leading-relaxed font-medium">
          {selectedType
            ? `Tell us the specific ${selectedType.name.toLowerCase()} item (brand, model, size, or part number):`
            : "Specify the actual product you're finding, or tap a sample below:"}
        </p>

        {/* Dynamic Suggested Queries for the selected type */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {(selectedType ? selectedType.examples : [
            'Black dress, size M, available near me today',
            'Gluten-free biscuits nearby',
            'TV wall mount for a 55 inch TV',
            'Printer cartridge for HP DeskJet 2331',
            'Sofa that fits through an 80 cm door'
          ]).map((ex, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(ex)}
              className="px-2.5 py-1 rounded-xl text-xs font-medium bg-white dark:bg-dark-card border border-amber-300/80 dark:border-amber-800 text-ink-800 dark:text-dark-ink hover:bg-amber-100 hover:border-amber-400 transition-all shadow-2xs text-left"
            >
              "{ex}"
            </button>
          ))}
        </div>
      </div>

      {/* Composer */}
      <div className="text-left shadow-lifted rounded-2xl">
        <Composer
          onSend={onSend}
          disabled={disabled}
          placeholder={
            selectedType
              ? `Specify actual ${selectedType.name.toLowerCase()} item (e.g. ${selectedType.examples[0]})...`
              : "Specify the actual product you're finding (e.g. 'Black dress size M', 'HP 2331 cartridge')..."
          }
          autoFocus={false}
        />
      </div>
    </div>
  );
};
