import React, { useState } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  Flag,
  HelpCircle,
  ShieldCheck,
  Info,
  AlertTriangle,
  HeartPulse
} from 'lucide-react';
import { AnswerPayload, Product, Citation, StoreAvailability, Alternative } from '../../types';
import { VerdictBadge } from './VerdictBadge';
import { ChecksTable } from './ChecksTable';
import { CitationChip } from './CitationChip';
import { AvailabilityList } from './AvailabilityList';
import { AlternativesStrip } from './AlternativesStrip';
import { ClarifyCard } from './ClarifyCard';

interface AnswerCardProps {
  messageId: string;
  payload: AnswerPayload;
  selectedStoreId?: string | null;
  onSelectStore?: (storeId: string) => void;
  onSelectCitation: (citation: Citation) => void;
  onReserve: (item: { product: Product; store: StoreAvailability }) => void;
  onSelectAlternative: (alt: Alternative) => void;
  onClarifyAnswer: (answer: string) => void;
  onReportWrongAnswer: (target: { messageId: string; headline: string }) => void;
}

export const AnswerCard: React.FC<AnswerCardProps> = ({
  messageId,
  payload,
  selectedStoreId,
  onSelectStore,
  onSelectCitation,
  onReserve,
  onSelectAlternative,
  onClarifyAnswer,
  onReportWrongAnswer
}) => {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [showConfidenceTooltip, setShowConfidenceTooltip] = useState(false);

  // If clarifying question is set, render ClarifyCard
  if (payload.clarifying_question) {
    return (
      <ClarifyCard
        question={payload.clarifying_question}
        options={payload.clarifying_options}
        onAnswer={onClarifyAnswer}
      />
    );
  }

  const confidenceBadge = {
    high: {
      text: 'High confidence',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      description: 'Grounded in unambiguous manufacturer technical specifications and live inventory stock count.'
    },
    medium: {
      text: 'Medium confidence',
      bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      description: 'Partial specification match or clearance estimated from standard dimensions.'
    },
    low: {
      text: 'Low confidence',
      bg: 'bg-stone-100 dark:bg-dark-cardMuted text-ink-600 dark:text-dark-inkMuted border-stone-200 dark:border-dark-border',
      description: 'Key dimensions or model specifications omitted in official documentation.'
    }
  }[payload.confidence || 'high'];

  return (
    <article
      data-testid="answer-card"
      className="p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-soft space-y-4 animate-in fade-in duration-200"
    >
      {/* 1. Verdict badge + Confidence Indicator */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <VerdictBadge verdict={payload.verdict} />

        <div className="relative">
          <button
            type="button"
            onMouseEnter={() => setShowConfidenceTooltip(true)}
            onMouseLeave={() => setShowConfidenceTooltip(false)}
            onClick={() => setShowConfidenceTooltip(!showConfidenceTooltip)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono border ${confidenceBadge.bg} transition-colors`}
            aria-label="Confidence score explanation"
          >
            <ShieldCheck size={12} />
            <span>{confidenceBadge.text}</span>
          </button>

          {showConfidenceTooltip && (
            <div className="absolute right-0 top-full mt-1.5 w-60 p-2.5 rounded-xl bg-ink-900 text-white text-[11px] shadow-lifted z-30 font-sans animate-in fade-in duration-150">
              {confidenceBadge.description}
            </div>
          )}
        </div>
      </div>

      {/* 2. Headline & Plain-Language Explanation */}
      <div>
        <h3 className="text-base sm:text-lg font-bold text-ink-900 dark:text-dark-ink font-serif tracking-tight leading-snug">
          {payload.headline}
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-ink-700 dark:text-ink-200 leading-relaxed">
          {payload.explanation}
        </p>
      </div>

      {/* Notice box if applicable (Medical, Info, Warning) */}
      {payload.notice && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
            payload.notice.type === 'medical'
              ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200'
              : payload.notice.type === 'warning'
              ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200'
              : 'bg-teal-50/80 dark:bg-teal-950/30 border-teal-200 dark:border-teal-900/50 text-teal-900 dark:text-teal-200'
          }`}
        >
          {payload.notice.type === 'medical' ? (
            <HeartPulse size={16} className="text-rose-600 shrink-0 mt-0.5" />
          ) : payload.notice.type === 'warning' ? (
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <Info size={16} className="text-teal-600 shrink-0 mt-0.5" />
          )}
          <div className="leading-relaxed">
            {payload.notice.text}
          </div>
        </div>
      )}

      {/* 3. "How we checked" table */}
      {payload.checks && payload.checks.length > 0 && (
        <ChecksTable checks={payload.checks} />
      )}

      {/* 4. Citation chips */}
      {payload.citations && payload.citations.length > 0 && (
        <div className="pt-2">
          <div className="text-[11px] font-mono text-ink-500 dark:text-dark-inkMuted mb-1.5 uppercase tracking-wider font-semibold">
            Primary Documentation Citations
          </div>
          <div className="flex flex-wrap gap-2">
            {payload.citations.map((cite, idx) => (
              <CitationChip
                key={idx}
                citation={cite}
                onClick={onSelectCitation}
              />
            ))}
          </div>
        </div>
      )}

      {/* 5. Availability list */}
      {payload.availability && payload.availability.length > 0 && (
        <AvailabilityList
          availability={payload.availability}
          product={payload.product}
          selectedStoreId={selectedStoreId}
          onSelectStore={onSelectStore}
          onReserve={onReserve}
        />
      )}

      {/* 6. Alternatives strip */}
      {payload.alternatives && payload.alternatives.length > 0 && (
        <AlternativesStrip
          alternatives={payload.alternatives}
          onSelectAlternative={onSelectAlternative}
        />
      )}

      {/* 7. Footer: Feedback & Report wrong answer */}
      <div className="pt-3 border-t border-stone-100 dark:border-dark-border flex items-center justify-between text-xs text-ink-500 dark:text-dark-inkMuted flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px]">Was this accurate?</span>
          <button
            type="button"
            onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
            className={`p-1.5 rounded-lg border transition-colors ${
              feedback === 'up'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400'
                : 'border-stone-200 dark:border-dark-border hover:bg-stone-100 dark:hover:bg-dark-cardMuted text-ink-500'
            }`}
            title="Accurate verdict"
          >
            <ThumbsUp size={13} />
          </button>
          <button
            type="button"
            onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
            className={`p-1.5 rounded-lg border transition-colors ${
              feedback === 'down'
                ? 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950/60 dark:text-red-400'
                : 'border-stone-200 dark:border-dark-border hover:bg-stone-100 dark:hover:bg-dark-cardMuted text-ink-500'
            }`}
            title="Inaccurate verdict"
          >
            <ThumbsDown size={13} />
          </button>
        </div>

        <button
          type="button"
          onClick={() =>
            onReportWrongAnswer({
              messageId,
              headline: payload.headline
            })
          }
          className="inline-flex items-center gap-1 text-[11px] text-ink-500 hover:text-terracotta-700 dark:hover:text-terracotta-400 hover:underline transition-colors"
        >
          <Flag size={12} />
          <span>Report wrong answer</span>
        </button>
      </div>
    </article>
  );
};
