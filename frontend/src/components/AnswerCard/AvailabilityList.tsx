import React from 'react';
import { StoreAvailability, Product } from '../../types';
import { MapPin, Navigation, ShoppingBag, Clock } from 'lucide-react';

interface AvailabilityListProps {
  availability: StoreAvailability[];
  product?: Product | null;
  selectedStoreId?: string | null;
  onSelectStore?: (storeId: string) => void;
  onReserve?: (item: { product: Product; store: StoreAvailability }) => void;
}

export const AvailabilityList: React.FC<AvailabilityListProps> = ({
  availability,
  product,
  selectedStoreId,
  onSelectStore,
  onReserve
}) => {
  if (!availability || availability.length === 0) return null;

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-ink-500 dark:text-dark-inkMuted uppercase tracking-wider">
        <span>Available Nearby</span>
        <span>{availability.length} {availability.length === 1 ? 'store' : 'stores'} found</span>
      </div>

      <div className="space-y-2">
        {availability.map((store, idx) => {
          const isSelected = selectedStoreId === store.store_id;
          const isLowStock = store.qty > 0 && store.qty <= 2;
          const isOutOfStock = store.qty === 0;

          return (
            <div
              key={store.store_id || idx}
              data-testid={`availability-item-${store.store_id || idx}`}
              onClick={() => onSelectStore?.(store.store_id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/20 shadow-sm'
                  : 'border-stone-200 dark:border-dark-border bg-white dark:bg-dark-card hover:border-teal-400 dark:hover:border-teal-600'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={15} className="text-teal-700 dark:text-teal-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-bold text-ink-900 dark:text-dark-ink">
                      {store.store}
                    </span>
                  </div>
                  <div className="text-[11px] text-ink-500 dark:text-dark-inkMuted ml-5">
                    {store.address}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap ml-5 sm:ml-0">
                  {/* Stock pill */}
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
                      ? `Out of stock here (${store.distance_km} km)`
                      : isLowStock
                      ? `Only ${store.qty} left (${store.distance_km} km)`
                      : `${store.qty} in stock (${store.distance_km} km)`}
                  </span>

                  {/* Pickup today badge */}
                  {store.pickup_today && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-terracotta-50 text-terracotta-700 dark:bg-terracotta-950/60 dark:text-terracotta-300 border border-terracotta-200/50 dark:border-terracotta-800/50">
                      <Clock size={11} />
                      Pickup today
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-dark-border flex items-center justify-end gap-2 text-xs">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    store.store + ' ' + store.address
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-ink-600 dark:text-dark-inkMuted hover:text-ink-900 dark:hover:text-dark-ink hover:bg-stone-100 dark:hover:bg-dark-cardMuted transition-colors"
                >
                  <Navigation size={13} />
                  <span>Directions</span>
                </a>

                {!isOutOfStock && product && onReserve && (
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      onReserve({ product, store });
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg font-semibold text-white bg-teal-700 hover:bg-teal-800 shadow-xs transition-colors"
                  >
                    <ShoppingBag size={13} />
                    <span>Reserve for pickup</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
