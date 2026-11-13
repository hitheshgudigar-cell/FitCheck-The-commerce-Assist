import React from 'react';
import { X, FileText, CheckCircle, ExternalLink, Shield } from 'lucide-react';
import { Citation } from '../../types';

interface CitationSheetProps {
  citation: Citation | null;
  onClose: () => void;
}

export const CitationSheet: React.FC<CitationSheetProps> = ({ citation, onClose }) => {
  if (!citation) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="citation-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-dark-card border border-stone-200 dark:border-dark-border shadow-lifted overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-dark-border bg-stone-50/75 dark:bg-dark-cardMuted">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400">
              <FileText size={18} />
            </div>
            <div>
              <h3 id="citation-title" className="text-sm font-bold text-ink-900 dark:text-dark-ink font-serif">
                Authoritative Citation
              </h3>
              <p className="text-xs text-ink-500 dark:text-dark-inkMuted font-mono">
                {citation.doc} · Page {citation.page}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink-400 hover:text-ink-700 dark:hover:text-dark-ink rounded-lg hover:bg-stone-100 dark:hover:bg-dark-border transition-colors"
            aria-label="Close citation details"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-ink-400 dark:text-dark-inkMuted mb-1.5">
              Source Document Excerpt (Page {citation.page})
            </div>
            <div className="p-3.5 rounded-xl bg-warm-50 dark:bg-dark-bg border border-warm-200 dark:border-dark-border font-mono text-xs text-ink-800 dark:text-dark-ink leading-relaxed">
              <span className="bg-amber-100 dark:bg-amber-950/60 dark:text-amber-200 px-1 py-0.5 rounded font-semibold text-ink-900">
                "{citation.snippet}"
              </span>
            </div>
          </div>

          {/* Evidence Guarantee */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300">
            <Shield size={16} className="shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <span className="font-semibold">FitCheck Grounding Guarantee:</span> This specification is extracted directly from the verified manufacturer documentation. Marketing fluff and unverified seller claims are completely excluded from evidence calculation.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-100 dark:border-dark-border bg-stone-50/50 dark:bg-dark-cardMuted flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
