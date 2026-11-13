import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
  ShieldCheck,
  Check,
  Tag,
  BookOpen,
  Shirt,
  Cpu,
  Armchair,
  Pill,
  Footprints,
  Wrench,
  Search,
  Sparkles
} from 'lucide-react';
import { Product, Variant } from '../../types';
import { PRODUCT_CATEGORIES } from '../../types/categories';

interface ProductPanelProps {
  products: Product[];
  selectedProduct: Product;
  onSelectProduct: (p: Product) => void;
  selectedVariant?: string;
  onSelectVariant?: (sku: string) => void;
}

export const ProductPanel: React.FC<ProductPanelProps> = ({
  products,
  selectedProduct,
  onSelectProduct,
  selectedVariant,
  onSelectVariant
}) => {
  const [sellerCopyOpen, setSellerCopyOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(selectedProduct.category || 'clothing');

  const activeSku = selectedVariant || selectedProduct.variants[0]?.sku;

  // Filter products by the chosen product type
  const productsInType = products.filter(p => p.category === selectedCategory);

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'clothing':
        return <Shirt size={15} />;
      case 'electronics_accessory':
        return <Cpu size={15} />;
      case 'furniture':
        return <Armchair size={15} />;
      case 'grocery_pharmacy':
        return <Pill size={15} />;
      case 'footwear':
        return <Footprints size={15} />;
      case 'hardware':
        return <Wrench size={15} />;
      default:
        return <Tag size={15} />;
    }
  };

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    const firstInCat = products.find(p => p.category === catId);
    if (firstInCat) {
      setImgError(false);
      onSelectProduct(firstInCat);
    }
  };

  const activeCategoryInfo = PRODUCT_CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <div
      data-testid="product-panel"
      className="p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-soft space-y-4"
    >
      {/* 1. Step 1: Select Product Type / Category */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono uppercase tracking-wider text-teal-800 dark:text-teal-300 font-bold flex items-center gap-1.5">
            <Sparkles size={13} className="text-teal-700 dark:text-teal-400" />
            <span>Step 1: Select Product Type</span>
          </label>
          <span className="text-[10px] text-ink-500 font-mono">6 types</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {PRODUCT_CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`p-2 rounded-xl text-xs font-semibold border text-left flex items-center gap-2 transition-all ${
                  isSelected
                    ? 'border-teal-700 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 shadow-xs'
                    : 'border-stone-200 dark:border-dark-border bg-stone-50/60 dark:bg-dark-cardMuted text-ink-700 dark:text-dark-ink hover:border-stone-300'
                }`}
              >
                <div
                  className={`p-1 rounded-lg ${
                    isSelected
                      ? 'bg-teal-700 text-white'
                      : 'bg-stone-200/60 dark:bg-dark-border text-ink-600 dark:text-dark-inkMuted'
                  }`}
                >
                  {getCategoryIcon(cat.id)}
                </div>
                <span className="text-[11px] font-medium truncate">{cat.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Step 2: Specify the Actual Product */}
      <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="product-select" className="text-[11px] font-mono uppercase tracking-wider text-amber-900 dark:text-amber-300 font-bold flex items-center gap-1.5">
            <Search size={13} className="text-amber-700 dark:text-amber-400" />
            <span>Step 2: Specify the Actual Product</span>
          </label>
          <span className="text-[10px] font-mono text-amber-800/80 dark:text-amber-400">
            {productsInType.length} available
          </span>
        </div>

        <p className="text-[11px] text-ink-600 dark:text-dark-inkMuted leading-tight">
          {activeCategoryInfo?.hint || 'Specify the exact product or model you want to inspect:'}
        </p>

        <select
          id="product-select"
          value={selectedProduct.id}
          onChange={e => {
            const found = products.find(p => p.id === e.target.value);
            if (found) {
              setImgError(false);
              onSelectProduct(found);
            }
          }}
          className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-stone-300 dark:border-dark-border bg-white dark:bg-dark-card text-ink-900 dark:text-dark-ink focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer shadow-xs"
        >
          {productsInType.map(p => (
            <option key={p.id} value={p.id}>
              {p.brand} — {p.name} (${p.price?.toFixed(2) || '0.00'})
            </option>
          ))}
        </select>
      </div>

      {/* 3. Product Preview & Specs Sheet */}
      <div className="space-y-3 pt-1 border-t border-stone-100 dark:border-dark-border">
        {/* Product Image Placeholder / Photo */}
        <div className="relative w-full h-44 rounded-xl overflow-hidden bg-stone-100 dark:bg-dark-cardMuted flex items-center justify-center">
          {!imgError && selectedProduct.image_url ? (
            <img
              src={selectedProduct.image_url}
              alt={selectedProduct.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center p-4">
              <ShieldCheck size={36} className="mx-auto text-teal-700/60 dark:text-teal-400/60 mb-2" />
              <span className="text-xs font-mono text-ink-500 dark:text-dark-inkMuted">
                {selectedProduct.brand} Spec Sheet
              </span>
            </div>
          )}

          {selectedProduct.price && (
            <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-xl bg-ink-950/80 backdrop-blur-xs text-white font-mono text-xs font-bold shadow-sm">
              ${selectedProduct.price.toFixed(2)}
            </div>
          )}
        </div>

        {/* Name and Brand */}
        <div>
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
            {selectedProduct.brand} · {activeCategoryInfo?.name || selectedProduct.category}
          </div>
          <h2 className="text-base sm:text-lg font-bold text-ink-900 dark:text-dark-ink font-serif mt-0.5 leading-snug">
            {selectedProduct.name}
          </h2>
        </div>

        {/* Variant Selector with per-variant stock dots */}
        <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-dark-border">
          <div className="text-xs font-semibold text-ink-700 dark:text-dark-ink flex items-center justify-between">
            <span>Sizes / Variants:</span>
            <span className="text-[10px] font-mono text-ink-500 dark:text-dark-inkMuted">
              ● In Stock &nbsp;○ Out
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {selectedProduct.variants.map(variant => {
              const isSelected = activeSku === variant.sku;
              const inStock = variant.in_stock !== false;
              const qty = variant.qty ?? (inStock ? 5 : 0);

              return (
                <button
                  key={variant.sku}
                  type="button"
                  onClick={() => onSelectVariant?.(variant.sku)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                    isSelected
                      ? 'border-teal-700 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 shadow-xs font-bold'
                      : 'border-stone-200 dark:border-dark-border bg-stone-50/60 dark:bg-dark-cardMuted text-ink-800 dark:text-dark-ink hover:border-stone-300'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      inStock
                        ? qty <= 2
                          ? 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]'
                          : 'bg-emerald-600 shadow-[0_0_6px_rgba(22,163,74,0.6)]'
                        : 'bg-stone-300 dark:bg-stone-600'
                    }`}
                    title={inStock ? `${qty} in stock nearby` : 'Out of stock nearby'}
                  />
                  <span>{variant.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Collapsed Seller Description */}
        <div className="rounded-xl border border-stone-200 dark:border-dark-border overflow-hidden">
          <button
            type="button"
            onClick={() => setSellerCopyOpen(!sellerCopyOpen)}
            className="w-full px-3 py-2 flex items-center justify-between text-left bg-stone-50/80 dark:bg-dark-cardMuted hover:bg-stone-100/80 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-ink-800 dark:text-dark-ink">
                Seller Description
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Not used as evidence
              </span>
            </div>
            {sellerCopyOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {sellerCopyOpen && (
            <div className="p-3 bg-white dark:bg-dark-card text-xs text-ink-600 dark:text-dark-inkMuted leading-relaxed space-y-1.5 border-t border-stone-100 dark:border-dark-border">
              <p className="italic">"{selectedProduct.marketing_copy}"</p>
              <div className="text-[10px] text-amber-700 dark:text-amber-400 flex items-start gap-1 pt-1">
                <AlertCircle size={12} className="shrink-0 mt-0.5" />
                <span>
                  FitCheck policy: Marketing copy is considered subjective claims. Fit decisions rely strictly on authoritative documents.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Authoritative Documents Used */}
        <div className="space-y-1.5 pt-1 border-t border-stone-100 dark:border-dark-border">
          <div className="flex items-center justify-between text-xs font-semibold text-ink-800 dark:text-dark-ink">
            <span className="flex items-center gap-1.5 font-mono uppercase tracking-wider text-[10px] text-teal-800 dark:text-teal-300">
              <BookOpen size={13} className="text-teal-700 dark:text-teal-400" />
              Authoritative Documents Used
            </span>
            <span className="text-[10px] font-mono text-ink-500 dark:text-dark-inkMuted">
              {selectedProduct.doc_details?.length || 1} docs
            </span>
          </div>

          <div className="space-y-1">
            {selectedProduct.doc_details && selectedProduct.doc_details.length > 0 ? (
              selectedProduct.doc_details.map(doc => (
                <div
                  key={doc.id}
                  className="p-2 rounded-lg border border-stone-200 dark:border-dark-border bg-stone-50/50 dark:bg-dark-cardMuted/50 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FileText size={14} className="text-teal-700 dark:text-teal-400 shrink-0" />
                    <div className="truncate">
                      <span className="font-semibold text-ink-900 dark:text-dark-ink text-xs">{doc.name}</span>
                      <div className="text-[9px] text-ink-400 dark:text-dark-inkMuted font-mono">
                        {doc.type.replace('_', ' ')} · verified PDF
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] font-medium text-ink-600 dark:text-dark-inkMuted px-1.5 py-0.5 rounded bg-white dark:bg-dark-card border border-stone-200 dark:border-dark-border shrink-0 ml-1.5">
                    {doc.pages} p
                  </span>
                </div>
              ))
            ) : (
              <div className="p-2 rounded-lg border border-stone-200 dark:border-dark-border bg-stone-50/50 dark:bg-dark-cardMuted/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <FileText size={14} className="text-teal-700 dark:text-teal-400" />
                  <span className="font-semibold text-ink-900 dark:text-dark-ink text-xs">
                    {selectedProduct.docs[0] || 'Technical Specifications Sheet'}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-ink-500">4 p</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
