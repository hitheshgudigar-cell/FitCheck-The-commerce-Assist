import React, { useState } from 'react';
import { X, CheckCircle2, Clock, MapPin, PackageCheck, Copy, Check } from 'lucide-react';
import { Product, StoreAvailability } from '../../types';

interface ReserveModalProps {
  item: { product: Product; store: StoreAvailability } | null;
  onClose: () => void;
}

export const ReserveModal: React.FC<ReserveModalProps> = ({ item, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!item) return null;

  const reservationCode = `FC-${Math.floor(100000 + Math.random() * 900000)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reservationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reserve-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-dark-card border border-stone-200 dark:border-dark-border shadow-lifted overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-dark-border bg-stone-50/75 dark:bg-dark-cardMuted">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400">
              <PackageCheck size={18} />
            </div>
            <div>
              <h3 id="reserve-modal-title" className="text-sm font-bold text-ink-900 dark:text-dark-ink font-serif">
                Reserve for Same-Day Pickup
              </h3>
              <p className="text-xs text-ink-500 dark:text-dark-inkMuted">
                Held for 2 hours at no charge
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink-400 hover:text-ink-700 dark:hover:text-dark-ink rounded-lg hover:bg-stone-100 dark:hover:bg-dark-border transition-colors"
            aria-label="Close reservation modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {!confirmed ? (
            <>
              <div className="p-3 rounded-xl bg-warm-50 dark:bg-dark-bg border border-stone-200 dark:border-dark-border space-y-1.5">
                <div className="text-xs text-ink-500 dark:text-dark-inkMuted uppercase tracking-wider font-semibold">
                  Product
                </div>
                <div className="text-sm font-bold text-ink-900 dark:text-dark-ink">
                  {item.product.name}
                </div>
                {item.product.brand && (
                  <div className="text-xs text-ink-600 dark:text-dark-inkMuted">
                    Brand: {item.product.brand}
                  </div>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2 text-ink-700 dark:text-dark-ink">
                  <MapPin size={16} className="text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">{item.store.store}</span>
                    <p className="text-ink-500 dark:text-dark-inkMuted mt-0.5">{item.store.address}</p>
                    <p className="text-teal-700 dark:text-teal-400 font-mono mt-0.5 font-medium">
                      Distance: {item.store.distance_km} km · In Stock: {item.store.qty} units
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-ink-700 dark:text-dark-ink">
                  <Clock size={16} className="text-terracotta-600 dark:text-terracotta-400 shrink-0" />
                  <span>Ready for pickup within <strong>15 minutes</strong></span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmed(true)}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm text-white bg-teal-700 hover:bg-teal-800 shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  Confirm Free Reservation
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-3 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 size={28} />
              </div>

              <div>
                <h4 className="text-base font-bold text-ink-900 dark:text-dark-ink font-serif">
                  Reservation Confirmed!
                </h4>
                <p className="text-xs text-ink-500 dark:text-dark-inkMuted mt-1">
                  Present this code at the pickup counter in {item.store.store}.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-dark-cardMuted border border-stone-200 dark:border-dark-border rounded-xl">
                <span className="font-mono text-base font-bold text-ink-900 dark:text-dark-ink tracking-wider">
                  {reservationCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1 hover:bg-stone-200 dark:hover:bg-dark-border rounded text-ink-500 hover:text-ink-800 dark:hover:text-dark-ink transition-colors"
                  title="Copy Code"
                >
                  {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                </button>
              </div>

              <div className="text-[11px] text-ink-400 dark:text-dark-inkMuted pt-2">
                Valid today until 9:00 PM · SMS notification sent to your profile number
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full mt-2 py-2 px-4 rounded-xl font-semibold text-xs text-ink-700 dark:text-dark-ink bg-stone-100 hover:bg-stone-200 dark:bg-dark-border dark:hover:bg-dark-border/80 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
