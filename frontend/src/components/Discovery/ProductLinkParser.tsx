import React, { useState } from 'react';
import {
  Link2,
  ExternalLink,
  Store,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { parseProductUrl, SAMPLE_PRODUCT_LINKS, SampleProductLink } from '../../utils/urlParser';
import { ParsedProductUrlResult } from '../../types/questionnaire';
import { Product } from '../../types';

interface ProductLinkParserProps {
  onStartQuestionnaire: (product: Product, initialPrompt?: string) => void;
  disabled?: boolean;
}

export const ProductLinkParser: React.FC<ProductLinkParserProps> = ({
  onStartQuestionnaire,
  disabled = false
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [parseResult, setParseResult] = useState<ParsedProductUrlResult | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleParse = (urlToParse?: string) => {
    const targetUrl = urlToParse || urlInput;
    if (!targetUrl.trim()) return;

    setIsParsing(true);
    // Simulate brief parsing calculation for UX
    setTimeout(() => {
      const result = parseProductUrl(targetUrl);
      setParseResult(result);
      setIsParsing(false);
    }, 180);
  };

  const handleSampleClick = (sample: SampleProductLink) => {
    setUrlInput(sample.url);
    handleParse(sample.url);
  };

  const handleClear = () => {
    setUrlInput('');
    setParseResult(null);
  };

  const getPlatformBadge = (platform: ParsedProductUrlResult['platform'], name: string) => {
    switch (platform) {
      case 'amazon':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#FF9900]/15 text-[#B86B00] dark:text-[#FFB84D] border border-[#FF9900]/30">
            {name}
          </span>
        );
      case 'flipkart':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#2874F0]/15 text-[#1859C9] dark:text-[#6BA4FF] border border-[#2874F0]/30">
            {name}
          </span>
        );
      case 'myntra':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#FF3F6C]/15 text-[#E0174A] dark:text-[#FF668B] border border-[#FF3F6C]/30">
            {name}
          </span>
        );
      case 'ikea':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#0051BA]/15 text-[#0051BA] dark:text-[#6FA8FF] border border-[#0051BA]/30">
            {name}
          </span>
        );
      case 'nykaa':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#FC2779]/15 text-[#D10C59] dark:text-[#FF68A0] border border-[#FC2779]/30">
            {name}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300">
            {name}
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-teal-200/90 dark:border-teal-900/60 bg-gradient-to-br from-teal-50/40 via-white to-amber-50/30 dark:from-dark-card dark:via-dark-cardMuted dark:to-dark-card shadow-soft space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Link2 size={16} />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-serif font-bold text-ink-900 dark:text-dark-ink flex items-center gap-2">
              <span>Find by Online Shopping Link</span>
              <span className="text-[10px] font-sans uppercase font-bold tracking-wider px-2 py-0.5 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 rounded-full border border-teal-200 dark:border-teal-800">
                New Feature
              </span>
            </h3>
            <p className="text-xs text-ink-600 dark:text-dark-inkMuted">
              Browsing Amazon, Flipkart, Myntra, or IKEA? Paste any product URL to find it in Mysuru local shops today.
            </p>
          </div>
        </div>

        {parseResult && (
          <button
            type="button"
            onClick={handleClear}
            className="self-end sm:self-auto text-xs text-ink-500 hover:text-ink-800 dark:hover:text-dark-ink flex items-center gap-1 transition-colors"
          >
            <RotateCcw size={12} />
            <span>Clear Link</span>
          </button>
        )}
      </div>

      {/* Input bar */}
      <div className="flex flex-col sm:flex-row items-stretch gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-ink-400">
            <ExternalLink size={15} />
          </div>
          <input
            type="url"
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleParse()}
            placeholder="Paste Amazon, Flipkart, Myntra, IKEA, or Nykaa product link..."
            disabled={disabled || isParsing}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 dark:border-dark-border bg-white dark:bg-dark-card text-xs text-ink-900 dark:text-dark-ink placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition-all shadow-2xs"
          />
        </div>

        <button
          type="button"
          onClick={() => handleParse()}
          disabled={disabled || isParsing || !urlInput.trim()}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-1.5 shadow-soft shrink-0"
        >
          {isParsing ? (
            <span>Matching stores...</span>
          ) : (
            <>
              <Store size={14} />
              <span>Locate in Local Shops</span>
            </>
          )}
        </button>
      </div>

      {/* 1-Click Sample Links */}
      {!parseResult && (
        <div className="pt-1">
          <div className="flex items-center justify-between text-[11px] text-ink-500 dark:text-dark-inkMuted mb-1.5 font-medium">
            <span>Or try a sample online shopping link:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_PRODUCT_LINKS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSampleClick(sample)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white dark:bg-dark-card border border-stone-200 dark:border-dark-border text-ink-700 dark:text-dark-ink hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 transition-all text-left shadow-2xs flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                <span>{sample.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Parsed Match Result Card */}
      {parseResult && (
        <div className="p-3.5 sm:p-4 rounded-xl border border-teal-300 dark:border-teal-800 bg-white dark:bg-dark-card shadow-soft space-y-3 animate-in fade-in duration-200">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              {getPlatformBadge(parseResult.platform, parseResult.platformName)}
              {parseResult.extractedId && (
                <span className="text-[10px] font-mono text-ink-500 dark:text-dark-inkMuted">
                  ID: {parseResult.extractedId}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 size={13} />
              <span>Local Match Confirmed</span>
            </div>
          </div>

          {/* Matched Product Details */}
          {parseResult.matchedProduct ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-stone-50 dark:bg-dark-cardMuted border border-stone-200 dark:border-dark-border">
              <div className="flex items-center gap-3">
                {parseResult.matchedProduct.image_url ? (
                  <img
                    src={parseResult.matchedProduct.image_url}
                    alt={parseResult.matchedProduct.name}
                    className="w-14 h-14 rounded-lg object-cover border border-stone-200 dark:border-dark-border shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 font-bold">
                    {parseResult.matchedProduct.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="text-[11px] font-mono text-teal-800 dark:text-teal-400 font-bold uppercase">
                    {parseResult.matchedProduct.brand}
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-ink-900 dark:text-dark-ink font-serif leading-snug">
                    {parseResult.matchedProduct.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-ink-600 dark:text-dark-inkMuted">
                    <span className="font-mono font-bold text-ink-900 dark:text-dark-ink">
                      ${parseResult.matchedProduct.price || 49}
                    </span>
                    <span>·</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <Store size={11} />
                      <span>Ready for Pickup Today in Mysuru</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Start Questionnaire Button */}
              <button
                type="button"
                onClick={() => onStartQuestionnaire(parseResult.matchedProduct!)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 transition-all flex items-center justify-center gap-1.5 shadow-soft shrink-0"
              >
                <Sparkles size={13} />
                <span>Start Fit Questionnaire →</span>
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-xs text-amber-900 dark:text-amber-300 flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{parseResult.statusMessage}</span>
            </div>
          )}

          {/* Local Availability Breakdown */}
          {parseResult.localAvailability.length > 0 && (
            <div className="pt-1 border-t border-stone-100 dark:border-dark-border">
              <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-ink-500 mb-1.5">
                Mysuru Stores Stocking This Item:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {parseResult.localAvailability.map(s => (
                  <div
                    key={s.store_id}
                    className="p-2 rounded-lg bg-white dark:bg-dark-card border border-stone-200 dark:border-dark-border flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-ink-900 dark:text-dark-ink truncate">
                        {s.store}
                      </div>
                      <div className="text-[10px] text-ink-500 dark:text-dark-inkMuted">
                        {s.distance_km} km away · {s.address.split(',')[0]}
                      </div>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 shrink-0">
                      {s.qty} in stock
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
