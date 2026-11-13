import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Store,
  HelpCircle,
  ArrowRight,
  Sliders
} from 'lucide-react';
import { Product } from '../../types';
import { getQuestionnaireForProduct } from '../../mocks/questionnaires';
import { QuestionnaireOption } from '../../types/questionnaire';

interface ProductQuestionnaireModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitQuestion: (prompt: string, product: Product) => void;
}

export const ProductQuestionnaireModal: React.FC<ProductQuestionnaireModalProps> = ({
  product,
  isOpen,
  onClose,
  onSubmitQuestion
}) => {
  if (!isOpen || !product) return null;

  const questionnaire = getQuestionnaireForProduct(product.id);
  const [selectedOption, setSelectedOption] = useState<QuestionnaireOption | null>(
    questionnaire?.questions[0]?.options.find(o => o.isRecommended) ||
    questionnaire?.questions[0]?.options[0] ||
    null
  );
  const [customInput, setCustomInput] = useState('');
  const [measurementValues, setMeasurementValues] = useState<Record<string, string>>({});

  const handleOptionSelect = (option: QuestionnaireOption) => {
    setSelectedOption(option);
  };

  const handleMeasurementChange = (fieldId: string, val: string) => {
    setMeasurementValues(prev => ({ ...prev, [fieldId]: val }));
  };

  const handleSubmit = () => {
    let finalPrompt = '';

    // If custom measurements were entered
    const enteredFields = Object.entries(measurementValues).filter(([_, v]) => v.trim());
    if (enteredFields.length > 0) {
      const summary = enteredFields.map(([k, v]) => `${k} ${v}`).join(', ');
      finalPrompt = `My measurements are ${summary}. Will ${product.name} fit me?`;
    } else if (customInput.trim()) {
      finalPrompt = customInput.trim();
    } else if (selectedOption) {
      finalPrompt = selectedOption.prompt;
    } else {
      finalPrompt = `Will ${product.name} fit me?`;
    }

    onSubmitQuestion(finalPrompt, product);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-dark-card border border-stone-200 dark:border-dark-border shadow-lifted overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-100 dark:border-dark-border bg-stone-50/70 dark:bg-dark-cardMuted">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0">
              <Sparkles size={14} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                Pre-Purchase Questionnaire
              </span>
              <h3 className="text-sm sm:text-base font-bold text-ink-900 dark:text-dark-ink font-serif leading-tight">
                {questionnaire?.headline || `Fit Verification for ${product.name}`}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 dark:hover:text-dark-ink hover:bg-stone-200/50 dark:hover:bg-dark-border transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Product summary strip */}
        <div className="p-4 bg-teal-50/40 dark:bg-teal-950/20 border-b border-teal-100 dark:border-teal-900/40 flex items-center gap-3">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-12 h-12 rounded-lg object-cover border border-stone-200 dark:border-dark-border shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-teal-200 text-teal-800 flex items-center justify-center font-bold">
              {product.name.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-mono uppercase font-bold text-teal-800 dark:text-teal-400">
              {product.brand} · {product.category.replace('_', ' ')}
            </div>
            <div className="text-xs sm:text-sm font-bold text-ink-900 dark:text-dark-ink truncate">
              {product.name}
            </div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
              <Store size={11} />
              <span>In stock at Central Devaraja Mohalla (1.2 km away)</span>
            </div>
          </div>
        </div>

        {/* Content & Questions */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Why We Ask Reassurance */}
          <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 text-xs text-ink-700 dark:text-dark-inkMuted leading-relaxed flex items-start gap-2">
            <ShieldCheck size={16} className="text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-ink-900 dark:text-dark-ink">Why we ask: </span>
              {questionnaire?.whyAsk ||
                'We cross-reference your exact measurements or setup against official engineering tolerances to guarantee it fits before you visit the store.'}
            </div>
          </div>

          {/* Questionnaire Options */}
          {questionnaire?.questions.map(q => (
            <div key={q.id} className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-800 dark:text-dark-ink font-mono">
                {q.title}
              </label>

              {/* 1-Tap Option Pills */}
              <div className="space-y-2">
                {q.options.map((opt, idx) => {
                  const isSelected = selectedOption?.prompt === opt.prompt;

                  return (
                    <div
                      key={idx}
                      onClick={() => handleOptionSelect(opt)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-teal-700 bg-teal-50/80 dark:bg-teal-950/40 shadow-xs ring-1 ring-teal-700'
                          : 'border-stone-200 dark:border-dark-border bg-white dark:bg-dark-card hover:border-teal-400 hover:bg-stone-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-xs sm:text-sm text-ink-900 dark:text-dark-ink flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'border-teal-700 bg-teal-700 text-white'
                                : 'border-stone-300 dark:border-dark-border'
                            }`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span>{opt.label}</span>
                        </div>
                        {opt.isRecommended && (
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 shrink-0">
                            Recommended test
                          </span>
                        )}
                      </div>
                      {opt.sublabel && (
                        <p className="mt-1 pl-6 text-[11px] text-ink-500 dark:text-dark-inkMuted">
                          {opt.sublabel}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Optional Custom Measurement Inputs if applicable */}
              {q.measurementFields && (
                <div className="pt-2 border-t border-stone-100 dark:border-dark-border mt-3">
                  <div className="text-[11px] font-semibold text-ink-600 dark:text-dark-inkMuted mb-2 flex items-center gap-1.5">
                    <Sliders size={13} className="text-teal-700" />
                    <span>Or enter your exact measurements:</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {q.measurementFields.map(f => (
                      <div key={f.id}>
                        <label className="block text-[10px] font-mono text-ink-500 mb-0.5">
                          {f.label} ({f.unit})
                        </label>
                        <input
                          type="text"
                          placeholder={f.placeholder}
                          value={measurementValues[f.id] || ''}
                          onChange={e => handleMeasurementChange(f.id, e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-dark-border bg-stone-50 dark:bg-dark-cardMuted text-xs font-mono text-ink-900 dark:text-dark-ink focus:outline-none focus:ring-1 focus:ring-teal-700"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Or Custom Question Input */}
          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-semibold text-ink-700 dark:text-dark-inkMuted">
              Or type a specific question about this product:
            </label>
            <input
              type="text"
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              placeholder="e.g. Will this work with my specific setup or size?"
              className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-dark-border bg-white dark:bg-dark-card text-xs text-ink-900 dark:text-dark-ink placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-100 dark:border-dark-border bg-stone-50/70 dark:bg-dark-cardMuted flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-ink-600 dark:text-dark-inkMuted hover:bg-stone-200/50 dark:hover:bg-dark-border transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 transition-all flex items-center gap-1.5 shadow-soft"
          >
            <ShieldCheck size={14} />
            <span>Verify Fit & Stock Now →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
