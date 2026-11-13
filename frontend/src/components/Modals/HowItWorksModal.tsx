import React from 'react';
import { X, ShieldCheck, CheckCircle2, FileText, Store, Sparkles, Scale } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="how-it-works-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-dark-card border border-stone-200 dark:border-dark-border shadow-lifted overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-dark-border bg-stone-50/75 dark:bg-dark-cardMuted">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400">
              <Scale size={20} />
            </div>
            <div>
              <h2 id="how-it-works-title" className="text-base sm:text-lg font-bold text-ink-900 dark:text-dark-ink font-serif">
                How FitCheck Checks Answers
              </h2>
              <p className="text-xs text-ink-500 dark:text-dark-inkMuted">
                Deterministic code verification grounded in authoritative documents
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink-400 hover:text-ink-700 dark:hover:text-dark-ink rounded-lg hover:bg-stone-100 dark:hover:bg-dark-border transition-colors"
            aria-label="Close how it works modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs sm:text-sm text-ink-700 dark:text-ink-200">
          <div className="p-3.5 rounded-xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800/40 space-y-1">
            <div className="font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider">
              <ShieldCheck size={15} />
              <span>Not a Generic AI Chatbot</span>
            </div>
            <p className="text-xs text-teal-800 dark:text-teal-300 leading-relaxed">
              Standard LLMs often hallucinate or guess fit based on marketing descriptions. FitCheck separates marketing copy from verified technical facts and uses deterministic code rules to guarantee mathematical accuracy.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-ink-900 dark:text-dark-ink font-serif text-sm">
              Our 4 Grounding Principles:
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-xl border border-stone-200 dark:border-dark-border">
                <div className="p-1.5 rounded-lg bg-stone-100 dark:bg-dark-cardMuted text-teal-700 shrink-0">
                  <FileText size={16} />
                </div>
                <div>
                  <strong className="text-ink-900 dark:text-dark-ink">1. Authoritative Source Documents Only:</strong>
                  <p className="text-ink-500 dark:text-dark-inkMuted mt-0.5">
                    We index verified PDF spec sheets, CAD drawings, official size charts, and manufacturer packaging facts. Seller descriptions are explicitly quarantined and never used as evidence.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl border border-stone-200 dark:border-dark-border">
                <div className="p-1.5 rounded-lg bg-stone-100 dark:bg-dark-cardMuted text-teal-700 shrink-0">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <strong className="text-ink-900 dark:text-dark-ink">2. Deterministic Code Rules:</strong>
                  <p className="text-ink-500 dark:text-dark-inkMuted mt-0.5">
                    Numerical tolerance checks, VESA hole alignments, and garment stretch allowances are evaluated by strict unit tests and boundary comparison rules—not subjective prose.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl border border-stone-200 dark:border-dark-border">
                <div className="p-1.5 rounded-lg bg-stone-100 dark:bg-dark-cardMuted text-teal-700 shrink-0">
                  <Store size={16} />
                </div>
                <div>
                  <strong className="text-ink-900 dark:text-dark-ink">3. Three-State Veracity Verdicts:</strong>
                  <p className="text-ink-500 dark:text-dark-inkMuted mt-0.5">
                    Every answer is strictly <strong>YES</strong>, <strong>NO</strong>, or <strong>CANNOT CONFIRM</strong>. If a critical dimension is missing from manufacturer documentation (like sofa crate packaging), we state it plainly and ask for clarification.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl border border-stone-200 dark:border-dark-border">
                <div className="p-1.5 rounded-lg bg-stone-100 dark:bg-dark-cardMuted text-teal-700 shrink-0">
                  <Sparkles size={16} />
                </div>
                <div>
                  <strong className="text-ink-900 dark:text-dark-ink">4. Real-Time Store Inventory:</strong>
                  <p className="text-ink-500 dark:text-dark-inkMuted mt-0.5">
                    A verdict is only useful if you can purchase the item. We instantly query stock levels across local retail stores and offer 2-hour free pickup reservation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-stone-100 dark:border-dark-border bg-stone-50/50 dark:bg-dark-cardMuted flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 transition-colors shadow-xs"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
