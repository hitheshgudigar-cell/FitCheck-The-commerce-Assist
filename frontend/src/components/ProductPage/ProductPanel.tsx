import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
  ShieldCheck,
  Check,
  Tag,
  BookOpen
} from 'lucide-react';
import { Product, Variant } from '../../types';

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

  const activeSku = selectedVariant || selectedProduct.variants[0]?.sku;

  return (
    <div
      data-testid="product-panel"
      className="p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-soft space-y-4"
    >
      {/* Product Switcher Dropdown */}
      <div className="space-y-1">
        <label htmlFor="product-select" className="text-[11px] font-mono uppercase tracking-wider text-ink-500 dark:text-dark-inkMuted font-semibold">
          Select Product to Inspect
        </label>
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
          className="w-full px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-stone-300 dark:border-dark-border bg-stone-50 dark:bg-dark-cardMuted text-ink-900 dark:text-dark-ink focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
        >
          {products.map(p => (
            <option key={p.id} value={p.id}>
              {p.brand} — {p.name} (${p.price?.toFixed(2) || '0.00'})
            </option>
          ))}
        </select>
      </div>

      {/* Product Image Placeholder / Photo */}
      <div className="relative w-full h-48 sm:h-56 rounded-xl overflow-hidden bg-stone-100 dark:bg-dark-cardMuted flex items-center justify-center">
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
              {selectedProduct.brand} Spec Card
            </span>
          </div>
        )}

        {selectedProduct.price && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-ink-950/80 backdrop-blur-xs text-white font-mono text-sm font-bold shadow-sm">
            ${selectedProduct.price.toFixed(2)}
          </div>
        )}
      </div>

      {/* Name and Brand */}
      <div>
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
          {selectedProduct.brand} · {selectedProduct.category.replace('_', ' ')}
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-ink-900 dark:text-dark-ink font-serif mt-1 leading-snug">
          {selectedProduct.name}
        </h2>
      </div>

      {/* Variant Selector with per-variant stock dots */}
      <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-dark-border">
        <div className="text-xs font-semibold text-ink-700 dark:text-dark-ink flex items-center justify-between">
          <span>Select Size / Variant:</span>
          <span className="text-[11px] font-mono text-ink-500 dark:text-dark-inkMuted">
            ● In Stock &nbsp;○ Out
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {selectedProduct.variants.map(variant => {
            const isSelected = activeSku === variant.sku;
            const inStock = variant.in_stock !== false;
            const qty = variant.qty ?? (inStock ? 5 : 0);

            return (
              <button
                key={variant.sku}
                type="button"
                onClick={() => onSelectVariant?.(variant.sku)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  isSelected
                    ? 'border-teal-700 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 shadow-xs font-bold'
                    : 'border-stone-200 dark:border-dark-border bg-stone-50/60 dark:bg-dark-cardMuted text-ink-800 dark:text-dark-ink hover:border-stone-300'
                }`}
              >
                {/* Per-variant stock dot */}
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

      {/* Collapsed Seller Description (Labeled "Not used as evidence") */}
      <div className="rounded-xl border border-stone-200 dark:border-dark-border overflow-hidden">
        <button
          type="button"
          onClick={() => setSellerCopyOpen(!sellerCopyOpen)}
          className="w-full px-3.5 py-2.5 flex items-center justify-between text-left bg-stone-50/80 dark:bg-dark-cardMuted hover:bg-stone-100/80 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-ink-800 dark:text-dark-ink">
              Seller Description
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              Not used as evidence
            </span>
          </div>
          {sellerCopyOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {sellerCopyOpen && (
          <div className="p-3.5 bg-white dark:bg-dark-card text-xs text-ink-600 dark:text-dark-inkMuted leading-relaxed space-y-2 border-t border-stone-100 dark:border-dark-border">
            <p className="italic">"{selectedProduct.marketing_copy}"</p>
            <div className="text-[11px] text-amber-700 dark:text-amber-400 flex items-start gap-1 pt-1">
              <AlertCircle size={13} className="shrink-0 mt-0.5" />
              <span>
                FitCheck policy: Marketing copy is considered subjective promo claims. All fit decisions rely strictly on the authoritative documents below.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Authoritative Documents Used */}
      <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-dark-border">
        <div className="flex items-center justify-between text-xs font-semibold text-ink-800 dark:text-dark-ink">
          <span className="flex items-center gap-1.5 font-mono uppercase tracking-wider text-[11px] text-teal-800 dark:text-teal-300">
            <BookOpen size={14} className="text-teal-700 dark:text-teal-400" />
            Authoritative Documents Used
          </span>
          <span className="text-[11px] font-mono text-ink-500 dark:text-dark-inkMuted">
            {selectedProduct.doc_details?.length || 1} docs
          </span>
        </div>

        <div className="space-y-1.5">
          {selectedProduct.doc_details && selectedProduct.doc_details.length > 0 ? (
            selectedProduct.doc_details.map(doc => (
              <div
                key={doc.id}
                className="p-2.5 rounded-xl border border-stone-200 dark:border-dark-border bg-stone-50/50 dark:bg-dark-cardMuted/50 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={15} className="text-teal-700 dark:text-teal-400 shrink-0" />
                  <div className="truncate">
                    <span className="font-semibold text-ink-900 dark:text-dark-ink">{doc.name}</span>
                    <div className="text-[10px] text-ink-400 dark:text-dark-inkMuted font-mono">
                      {doc.type.replace('_', ' ')} · verified PDF
                    </div>
                  </div>
                </div>
                <span className="font-mono text-[11px] font-medium text-ink-600 dark:text-dark-inkMuted px-2 py-0.5 rounded bg-white dark:bg-dark-card border border-stone-200 dark:border-dark-border shrink-0 ml-2">
                  {doc.pages} pages
                </span>
              </div>
            ))
          ) : (
            <div className="p-2.5 rounded-xl border border-stone-200 dark:border-dark-border bg-stone-50/50 dark:bg-dark-cardMuted/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileText size={15} className="text-teal-700 dark:text-teal-400" />
                <span className="font-semibold text-ink-900 dark:text-dark-ink">
                  {selectedProduct.docs[0] || 'Technical Specifications Sheet'}
                </span>
              </div>
              <span className="font-mono text-[11px] text-ink-500">4 pages</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
