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
  Tag,
  Store,
  Layers
} from 'lucide-react';
import { Composer } from '../Chat/Composer';
import { PRODUCT_CATEGORIES, ProductCategoryInfo } from '../../types/categories';
import { Product } from '../../types';
import { ProductLinkParser } from './ProductLinkParser';
import { ProductCatalogGrid } from './ProductCatalogGrid';

interface EmptyStateProps {
  products: Product[];
  onSelectPrompt: (prompt: string, product?: Product) => void;
  onSend: (message: string) => void;
  onStartQuestionnaire: (product: Product, prompt?: string) => void;
  disabled?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  products,
  onSelectPrompt,
  onSend,
  onStartQuestionnaire,
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
    <div className="py-2 sm:py-6 max-w-3xl mx-auto px-1 sm:px-3 text-center space-y-6 animate-in fade-in duration-200">
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
        <p className="mt-2 text-xs sm:text-sm text-ink-600 dark:text-dark-inkMuted max-w-xl mx-auto leading-relaxed">
          Paste a product link from Amazon, Flipkart, or Myntra to check local store availability, or choose a product below to start its fit questionnaire.
        </p>
      </div>

      {/* FEATURE 1: Online Shopping Link Parser */}
      <div className="text-left">
        <ProductLinkParser
          onStartQuestionnaire={product => onStartQuestionnaire(product)}
          disabled={disabled}
        />
      </div>

      {/* Search & Prompt Specification */}
      <div className="text-left space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-ink-700 dark:text-dark-ink px-1">
          <span className="flex items-center gap-1.5 text-teal-800 dark:text-teal-300">
            <Search size={14} className="text-teal-700 dark:text-teal-400" />
            <span>Search or Ask About Any Item</span>
          </span>
          <span className="text-[11px] font-sans font-normal text-ink-500">
            {selectedType ? `Category: ${selectedType.name}` : 'or tap a sample query'}
          </span>
        </div>

        {/* Quick query chips */}
        <div className="flex flex-wrap gap-1.5">
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
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-stone-50 dark:bg-dark-card border border-stone-200 dark:border-dark-border text-ink-800 dark:text-dark-ink hover:bg-teal-50 hover:border-teal-400 hover:text-teal-900 transition-all shadow-2xs text-left"
            >
              "{ex}"
            </button>
          ))}
        </div>

        {/* Composer */}
        <div className="shadow-lifted rounded-2xl">
          <Composer
            onSend={onSend}
            disabled={disabled}
            placeholder={
              selectedType
                ? `Specify actual ${selectedType.name.toLowerCase()} item (e.g. ${selectedType.examples[0]})...`
                : "Ask about fit, compatibility, or paste an online link (e.g. 'HP 2331 cartridge')..."
            }
            autoFocus={false}
          />
        </div>
      </div>

      {/* FEATURE 2: Local Products List + Questionnaire Flow */}
      <div className="pt-4 border-t border-stone-200 dark:border-dark-border text-left">
        <ProductCatalogGrid
          products={products}
          onSelectProduct={prod => onStartQuestionnaire(prod)}
        />
      </div>
    </div>
  );
};
