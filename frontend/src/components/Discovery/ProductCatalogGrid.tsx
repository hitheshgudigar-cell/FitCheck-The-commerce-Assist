import React, { useState } from 'react';
import {
  Sparkles,
  Store,
  ShieldCheck,
  ArrowRight,
  Shirt,
  Cpu,
  Armchair,
  Pill,
  Footprints,
  Wrench,
  CheckCircle2
} from 'lucide-react';
import { Product } from '../../types';

interface ProductCatalogGridProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAskAboutProduct?: (product: Product) => void;
}

export const ProductCatalogGrid: React.FC<ProductCatalogGridProps> = ({
  products,
  onSelectProduct,
  onAskAboutProduct
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Products', count: products.length },
    { id: 'clothing', label: 'Clothing', count: products.filter(p => p.category === 'clothing').length },
    { id: 'electronics_accessory', label: 'Electronics', count: products.filter(p => p.category === 'electronics_accessory').length },
    { id: 'furniture', label: 'Furniture', count: products.filter(p => p.category === 'furniture').length },
    { id: 'footwear', label: 'Footwear', count: products.filter(p => p.category === 'footwear').length },
    { id: 'grocery_pharmacy', label: 'Pharmacy & Food', count: products.filter(p => p.category === 'grocery_pharmacy').length },
    { id: 'hardware', label: 'Hardware', count: products.filter(p => p.category === 'hardware').length }
  ];

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'clothing':
        return <Shirt size={12} />;
      case 'electronics_accessory':
        return <Cpu size={12} />;
      case 'furniture':
        return <Armchair size={12} />;
      case 'footwear':
        return <Footprints size={12} />;
      case 'grocery_pharmacy':
        return <Pill size={12} />;
      case 'hardware':
        return <Wrench size={12} />;
      default:
        return <Sparkles size={12} />;
    }
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
            <Sparkles size={14} className="text-teal-700 dark:text-teal-400" />
            <span>Products in Local Mysuru Shops</span>
          </div>
          <p className="text-xs text-ink-600 dark:text-dark-inkMuted mt-0.5">
            Select any product below to start its pre-purchase fit & compatibility questionnaire:
          </p>
        </div>

        <span className="text-[11px] font-mono text-ink-500 dark:text-dark-inkMuted self-start sm:self-auto">
          Showing {filteredProducts.length} local items
        </span>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
        {categories.map(cat => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-teal-700 text-white shadow-xs font-semibold'
                  : 'bg-white dark:bg-dark-card border border-stone-200 dark:border-dark-border text-ink-700 dark:text-dark-ink hover:border-teal-400 hover:bg-teal-50/30'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isSelected
                    ? 'bg-teal-800 text-teal-100'
                    : 'bg-stone-100 dark:bg-dark-cardMuted text-ink-500'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredProducts.map(prod => {
          const totalStock = prod.variants.reduce((sum, v) => sum + (v.qty || 0), 0);
          const hasStock = totalStock > 0;

          return (
            <div
              key={prod.id}
              onClick={() => onSelectProduct(prod)}
              className="p-3.5 rounded-2xl border border-stone-200 dark:border-dark-border bg-white dark:bg-dark-card hover:border-teal-600 dark:hover:border-teal-500 hover:shadow-soft cursor-pointer transition-all flex flex-col justify-between group text-left"
            >
              <div className="space-y-2.5">
                {/* Thumbnail & Category Badge */}
                <div className="relative h-32 rounded-xl overflow-hidden bg-gradient-to-br from-stone-100 via-stone-50 to-teal-50/40 dark:from-dark-cardMuted dark:to-dark-card border border-stone-200 dark:border-dark-border flex items-center justify-center">
                  {prod.image_url && (
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      onError={e => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                  )}

                  {/* Fallback Icon behind/under image */}
                  <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none">
                    <div className="w-10 h-10 rounded-xl bg-teal-100/80 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center justify-center font-bold font-serif text-base">
                      {prod.name.charAt(0)}
                    </div>
                  </div>

                  {/* Category Pill Over Image */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-ink-950/75 text-white backdrop-blur-xs">
                      {getCategoryIcon(prod.category)}
                      <span className="capitalize">{prod.category.split('_')[0]}</span>
                    </span>
                  </div>

                  {/* Price Tag */}
                  <div className="absolute bottom-2 right-2 z-10">
                    <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-white/95 dark:bg-dark-card/95 text-ink-900 dark:text-dark-ink shadow-2xs border border-stone-200/60 dark:border-dark-border">
                      ${prod.price || 49}
                    </span>
                  </div>
                </div>

                {/* Brand & Name */}
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400">
                    {prod.brand}
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-ink-900 dark:text-dark-ink font-serif group-hover:text-teal-800 dark:group-hover:text-teal-300 transition-colors line-clamp-1">
                    {prod.name}
                  </h4>
                  <p className="text-[11px] text-ink-500 dark:text-dark-inkMuted line-clamp-2 mt-0.5 leading-relaxed">
                    {prod.marketing_copy}
                  </p>
                </div>
              </div>

              {/* Stock and Questionnaire Action */}
              <div className="pt-3 mt-2 border-t border-stone-100 dark:border-dark-border space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold font-mono">
                    <Store size={11} />
                    <span>{hasStock ? `${totalStock} in stock nearby` : '4 in stock nearby'}</span>
                  </span>
                  <span className="text-[10px] text-ink-400 font-mono">
                    Mysuru · 1.2 km
                  </span>
                </div>

                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    onSelectProduct(prod);
                  }}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold text-teal-900 dark:text-teal-200 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 group-hover:bg-teal-700 group-hover:text-white transition-all flex items-center justify-center gap-1.5 shadow-2xs whitespace-nowrap"
                >
                  <Sparkles size={12} />
                  <span>Start Fit Questionnaire →</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
