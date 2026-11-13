import React, { useState } from 'react';
import { X, Flag, CheckCircle2 } from 'lucide-react';

interface ReportWrongAnswerModalProps {
  target: { messageId: string; headline: string } | null;
  onClose: () => void;
}

export const ReportWrongAnswerModal: React.FC<ReportWrongAnswerModalProps> = ({
  target,
  onClose
}) => {
  const [reason, setReason] = useState('Incorrect size or measurement interpretation');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!target) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save report to local log
    const reportEntry = {
      messageId: target.messageId,
      headline: target.headline,
      reason,
      details,
      timestamp: new Date().toISOString()
    };
    try {
      const existing = JSON.parse(localStorage.getItem('fitcheck_user_reports') || '[]');
      existing.push(reportEntry);
      localStorage.setItem('fitcheck_user_reports', JSON.stringify(existing));
    } catch {
      // In-memory fallback
      console.log('User report submitted:', reportEntry);
    }

    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
    }, 1800);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-dark-card border border-stone-200 dark:border-dark-border shadow-lifted overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-dark-border bg-stone-50/75 dark:bg-dark-cardMuted">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400">
              <Flag size={18} />
            </div>
            <div>
              <h3 id="report-modal-title" className="text-sm font-bold text-ink-900 dark:text-dark-ink font-serif">
                Report Inaccurate Answer
              </h3>
              <p className="text-xs text-ink-500 dark:text-dark-inkMuted">
                Helps improve authoritative spec parser rules
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink-400 hover:text-ink-700 dark:hover:text-dark-ink rounded-lg hover:bg-stone-100 dark:hover:bg-dark-border transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="p-5">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-dark-cardMuted border border-stone-200 dark:border-dark-border">
                <span className="text-[10px] uppercase font-mono text-ink-400 dark:text-dark-inkMuted block">
                  Reported Verdict
                </span>
                <span className="font-semibold text-ink-800 dark:text-dark-ink text-xs line-clamp-1 mt-0.5">
                  "{target.headline}"
                </span>
              </div>

              <div>
                <label className="block font-semibold text-ink-700 dark:text-dark-ink mb-1">
                  What was incorrect?
                </label>
                <select
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-dark-border bg-white dark:bg-dark-cardMuted text-ink-900 dark:text-dark-ink font-medium focus:outline-none focus:ring-1 focus:ring-teal-600"
                >
                  <option value="Incorrect size or measurement interpretation">
                    Incorrect size or measurement interpretation
                  </option>
                  <option value="Incompatible hardware or device model">
                    Incompatible hardware or device model
                  </option>
                  <option value="Store inventory was out of stock">
                    Store inventory was out of stock
                  </option>
                  <option value="Confusing or missing document citation">
                    Confusing or missing document citation
                  </option>
                  <option value="Other specification mismatch">
                    Other specification mismatch
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-ink-700 dark:text-dark-ink mb-1">
                  Optional details or correct specification
                </label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  placeholder="e.g. My waist is 30 inches, but dress Size M maximum is 29.5 inches..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-dark-border bg-white dark:bg-dark-cardMuted text-ink-900 dark:text-dark-ink placeholder:text-ink-400 resize-none focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl font-semibold text-ink-600 dark:text-dark-inkMuted hover:bg-stone-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-semibold text-white bg-terracotta-700 hover:bg-terracotta-800 transition-colors shadow-xs"
                >
                  Submit Report
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4 space-y-2">
              <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="font-bold text-sm text-ink-900 dark:text-dark-ink font-serif">
                Feedback Logged
              </h4>
              <p className="text-xs text-ink-500 dark:text-dark-inkMuted">
                Thank you! Your feedback has been recorded in the local log to refine rule benchmarks.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
