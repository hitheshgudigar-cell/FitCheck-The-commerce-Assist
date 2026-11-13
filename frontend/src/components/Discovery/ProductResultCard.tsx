import React, { useState } from 'react';
import { Product, Store } from '../../types';
import { VerdictBadge } from '../AnswerCard/VerdictBadge';
import { MapPin, Clock, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

interface ProductResultCardProps {
  product: Product;
  nearestStore?: { store: Store; distance_km: number; stock: number };
  onWhyVerdict: (product: Product) => void;
  onAskAboutProduct: (product: Product) => void;
}

export const ProductResultCard: React.FC<ProductResultCardProps> = ({
  product,
  nearestStore,
  onWhyVerdict,
  onAskAboutProduct
}) => {
  const [imgError, setImgError] = useState(false);

  const verdict = product.fit_verdict?.verdict || 'YES';
  const badgeText = product.fit_verdict?.badgeText || 'Fits you';
  const bestVariant = product.fit_verdict?.bestVariant || product.variants[0]?.name || 'Standard';

  const stock = nearestStore?.stock !== undefined ? nearestStore.stock : 5;
  const distance = nearestStore?.distance_km !== undefined ? nearestStore.distance_km : 1.2;
  const storeName = nearestStore?.store?.name || 'FitCheck Central - Devaraja Mohalla';

  const isLowStock = stock > 0 && stock <= 2;
  const isOutOfStock = stock === 0;

  return (
    <div
      data-testid={`product-result-card-${product.id}`}
      className="p-4 rounded-2xl border border-stone-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-soft hover:shadow-lifted transition-all flex flex-col justify-between group"
    >
      <div>
        {/* Top: Image Placeholder / Preview & Badges */}
        <div className="relative w-full h-44 rounded-xl overflow-hidden bg-stone-100 dark:bg-dark-cardMuted mb-3 flex items-center justify-center">
          {!imgError && product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="text-center p-4">
              <div className="w-10 h-10 mx-auto rounded-full bg-stone-200 dark:bg-dark-border flex items-center justify-center text-ink-500 mb-1">
                <ShieldCheck size={20} />
              </div>
              <span className="text-xs font-mono text-ink-400 dark:text-dark-inkMuted">
                {product.brand}
              </span>
            </div>
          )}

          {/* Fit Badge floating over image */}
          <div className="absolute top-2.5 left-2.5">
            <VerdictBadge verdict={verdict} customText={badgeText} size="sm" />
          </div>

          {/* Pickup Today Tag */}
          <div className="absolute top-2.5 right-2.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/95 dark:bg-dark-card/95 text-terracotta-700 dark:text-terracotta-400 border border-terracotta-200/50 shadow-xs">
              <Clock size={11} />
              Pickup today
            </span>
          </div>

          {/* Price Tag */}
          {product.price && (
            <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-ink-950/80 backdrop-blur-xs text-white font-mono text-xs font-bold shadow-xs">
              ${product.price.toFixed(2)}
            </div>
          )}
        </div>

        {/* Brand & Name */}
        <div className="text-xs font-mono text-ink-500 dark:text-dark-inkMuted uppercase tracking-wider">
          {product.brand}
        </div>
        <h3 className="text-sm sm:text-base font-bold text-ink-900 dark:text-dark-ink font-serif mt-0.5 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors line-clamp-1">
          {product.name}
        </h3>

        {/* Best Size / Variant */}
        <div className="mt-1.5 flex items-center gap-1.5 text-xs">
          <span className="text-ink-500 dark:text-dark-inkMuted">Recommended:</span>
          <span className="font-mono font-bold text-ink-800 dark:text-dark-ink px-1.5 py-0.5 rounded bg-stone-100 dark:bg-dark-cardMuted border border-stone-200 dark:border-dark-border">
            {bestVariant}
          </span>
        </div>

        {/* Nearest Store & Stock Pill */}
        <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-dark-border/60 flex items-center justify-between text-xs flex-wrap gap-1">
          <div className="flex items-center gap-1 text-ink-600 dark:text-dark-inkMuted">
            <MapPin size={13} className="text-teal-700 dark:text-teal-400 shrink-0" />
            <span className="truncate max-w-[150px]">{storeName.replace('FitCheck ', '')}</span>
          </div>

          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium ${
              isOutOfStock
                ? 'bg-stone-100 text-stone-600 dark:bg-dark-cardMuted dark:text-stone-400'
                : isLowStock
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
            }`}
          >
            {isOutOfStock
              ? `Out of stock here (${distance} km)`
              : isLowStock
              ? `Only ${stock} left (${distance} km)`
              : `${stock} in stock (${distance} km)`}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-3.5 pt-2.5 border-t border-stone-100 dark:border-dark-border flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onWhyVerdict(product)}
          className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 hover:underline flex items-center gap-1"
        >
          <HelpCircle size={13} />
          <span>Why this verdict</span>
        </button>

        <button
          type="button"
          onClick={() => onAskAboutProduct(product)}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 transition-colors shadow-xs flex items-center gap-1"
        >
          <span>Ask questions</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};
