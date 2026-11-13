import React, { useState } from 'react';
import { useFitCheck } from '../../context/FitCheckContext';
import { Header } from './Header';
import { Footer } from './Footer';
import { EmptyState } from '../Discovery/EmptyState';
import { FilterBar } from '../Discovery/FilterBar';
import { ProductResultCard } from '../Discovery/ProductResultCard';
import { ProductPanel } from '../ProductPage/ProductPanel';
import { SuggestedChips } from '../ProductPage/SuggestedChips';
import { ChatThread } from '../Chat/ChatThread';
import { Composer } from '../Chat/Composer';
import { MapPanel } from '../Map/MapPanel';
import { DetailsDrawer } from '../Details/DetailsDrawer';
import { CitationSheet } from '../AnswerCard/CitationSheet';
import { ReserveModal } from '../AnswerCard/ReserveModal';
import { HowItWorksModal } from '../Modals/HowItWorksModal';
import { ReportWrongAnswerModal } from '../Modals/ReportWrongAnswerModal';
import { MapPin, Sliders, Sparkles, X, ChevronRight, Store as StoreIcon, ShieldCheck } from 'lucide-react';
import { Product, Alternative } from '../../types';

export const AppShell: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    products,
    selectedProduct,
    setSelectedProduct,
    stores,
    selectedStoreId,
    setSelectedStoreId,
    discoveryResults,
    filters,
    setFilters,
    discoveryMessages,
    productMessages,
    isThinking,
    thinkingStep,
    sendMessage,
    handleClarifyAnswer,
    profile,
    updateProfile,
    clearProfile,
    detailsDrawerOpen,
    setDetailsDrawerOpen,
    activeCitation,
    setActiveCitation,
    reserveItem,
    setReserveItem,
    showHowItWorks,
    setShowHowItWorks,
    reportAnswerTarget,
    setReportAnswerTarget,
    mobileMapOpen,
    setMobileMapOpen
  } = useFitCheck();

  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(undefined);
  const currentProductMessages = productMessages[selectedProduct.id] || [];

  const handleSelectAlternative = (alt: Alternative) => {
    if (alt.product_id) {
      const match = products.find(p => p.id === alt.product_id);
      if (match) {
        setSelectedProduct(match);
        setActiveTab('product');
      }
    }
    sendMessage(`Tell me more about ${alt.product_name}`);
  };

  const handleWhyVerdict = (product: Product) => {
    setSelectedProduct(product);
    setActiveTab('product');
    sendMessage(`Why this verdict for ${product.name}?`, product.id);
  };

  const handleAskAboutProduct = (product: Product) => {
    setSelectedProduct(product);
    setActiveTab('product');
  };

  // Filtered discovery products
  let displayResults = discoveryResults.length > 0 ? discoveryResults : products.slice(0, 4);

  // Apply filters
  if (filters.in_stock_only) {
    displayResults = displayResults.filter(p => p.variants.some(v => v.in_stock !== false));
  }
  if (filters.sort_by === 'price') {
    displayResults = [...displayResults].sort((a, b) => (a.price || 0) - (b.price || 0));
  }

  return (
    <div className="min-h-screen flex flex-col bg-warm-50 dark:bg-dark-bg text-ink-800 dark:text-dark-ink">
      {/* 1. Header Navigation */}
      <Header />

      {/* 2. Main Content Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6">
        {activeTab === 'discovery' ? (
          /* ================= DISCOVERY MODE ================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Desktop Left: Profile Quick Card & Guidelines (3 cols on lg) */}
            <aside className="hidden lg:block lg:col-span-3 space-y-4">
              <div className="p-4 rounded-2xl border border-stone-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-soft space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-ink-900 dark:text-dark-ink font-mono">
                    <Sliders size={14} className="text-teal-700 dark:text-teal-400" />
                    <span>My Session Specs</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDetailsDrawerOpen(true)}
                    className="text-xs text-teal-700 dark:text-teal-400 hover:underline font-semibold"
                  >
                    Edit
                  </button>
                </div>

                <div className="text-xs space-y-2 text-ink-600 dark:text-dark-inkMuted">
                  <div className="flex justify-between py-1 border-b border-stone-100 dark:border-dark-border">
                    <span>Location:</span>
                    <span className="font-mono font-medium text-ink-900 dark:text-dark-ink">
                      {profile.location.city} ({filters.radius_km} km)
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100 dark:border-dark-border">
                    <span>Measurements:</span>
                    <span className="font-mono font-medium text-ink-900 dark:text-dark-ink">
                      {Object.keys(profile.measurements || {}).length > 0
                        ? `${Object.keys(profile.measurements).length} saved`
                        : 'None yet'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-100 dark:border-dark-border">
                    <span>Hardware:</span>
                    <span className="font-mono font-medium text-ink-900 dark:text-dark-ink">
                      {profile.devices?.length || 0} devices
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDetailsDrawerOpen(true)}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition-colors"
                >
                  Configure My Fit Details
                </button>
              </div>

              {/* Authoritative Specs Guarantee Box */}
              <div className="p-4 rounded-2xl border border-stone-200 dark:border-dark-border bg-stone-50/70 dark:bg-dark-card shadow-2xs space-y-2 text-xs">
                <div className="font-bold text-teal-800 dark:text-teal-400 flex items-center gap-1.5 font-serif text-sm">
                  <ShieldCheck size={16} />
                  <span>Grounding Guarantee</span>
                </div>
                <p className="text-ink-600 dark:text-dark-inkMuted leading-relaxed">
                  FitCheck answers are verified directly against technical spec sheets, CAD dimensions, and live inventory across 6 Mysuru locations.
                </p>
              </div>
            </aside>

            {/* Center: Empty State or Chat Thread + Composer (5 cols on lg) */}
            <section className="lg:col-span-5 space-y-4">
              {discoveryMessages.length === 0 ? (
                <EmptyState
                  onSelectPrompt={p => sendMessage(p)}
                  onSend={msg => sendMessage(msg)}
                  disabled={isThinking}
                />
              ) : (
                <div className="flex flex-col space-y-4">
                  <ChatThread
                    messages={discoveryMessages}
                    isThinking={isThinking}
                    thinkingStep={thinkingStep}
                    selectedStoreId={selectedStoreId}
                    onSelectStore={setSelectedStoreId}
                    onSelectCitation={setActiveCitation}
                    onReserve={setReserveItem}
                    onSelectAlternative={handleSelectAlternative}
                    onClarifyAnswer={handleClarifyAnswer}
                    onReportWrongAnswer={setReportAnswerTarget}
                  />

                  {/* Sticky or inline Composer */}
                  <div className="sticky bottom-2 z-20 pt-2">
                    <Composer
                      onSend={msg => sendMessage(msg)}
                      disabled={isThinking}
                      placeholder="Ask another question about fit, size, or nearby availability..."
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Right: Ranked Results & Map (4 cols on lg) */}
            <aside className="lg:col-span-4 space-y-4">
              {/* Filter Bar */}
              <FilterBar
                filters={filters}
                onChange={setFilters}
                resultCount={displayResults.length}
              />

              {/* Ranked Product Result Cards */}
              <div className="space-y-3">
                {displayResults.map(prod => (
                  <ProductResultCard
                    key={prod.id}
                    product={prod}
                    onWhyVerdict={handleWhyVerdict}
                    onAskAboutProduct={handleAskAboutProduct}
                  />
                ))}
              </div>

              {/* Map Panel for Desktop */}
              <div className="h-80 w-full hidden md:block">
                <MapPanel
                  stores={stores}
                  userLocation={profile.location}
                  radiusKm={filters.radius_km}
                  selectedStoreId={selectedStoreId}
                  onSelectStore={setSelectedStoreId}
                />
              </div>
            </aside>
          </div>
        ) : (
          /* ================= PRODUCT-PAGE MODE ================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left: ProductPanel (4 cols on lg) */}
            <aside className="lg:col-span-4">
              <ProductPanel
                products={products}
                selectedProduct={selectedProduct}
                onSelectProduct={setSelectedProduct}
                selectedVariant={selectedVariant}
                onSelectVariant={setSelectedVariant}
              />
            </aside>

            {/* Center: Chat about Product with Suggested Question Chips (5 cols on lg) */}
            <section className="lg:col-span-5 space-y-4">
              <div className="p-4 rounded-2xl border border-stone-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-soft">
                <SuggestedChips
                  product={selectedProduct}
                  onSelectChip={q => sendMessage(q, selectedProduct.id)}
                />
              </div>

              <ChatThread
                messages={currentProductMessages}
                isThinking={isThinking}
                thinkingStep={thinkingStep}
                selectedStoreId={selectedStoreId}
                onSelectStore={setSelectedStoreId}
                onSelectCitation={setActiveCitation}
                onReserve={setReserveItem}
                onSelectAlternative={handleSelectAlternative}
                onClarifyAnswer={handleClarifyAnswer}
                onReportWrongAnswer={setReportAnswerTarget}
              />

              <div className="sticky bottom-2 z-20 pt-2">
                <Composer
                  onSend={msg => sendMessage(msg, selectedProduct.id)}
                  disabled={isThinking}
                  placeholder={`Ask a spec question about ${selectedProduct.name}...`}
                />
              </div>
            </section>

            {/* Right: Map & Store Network (3 cols on lg) */}
            <aside className="hidden lg:block lg:col-span-3 space-y-4">
              <div className="h-96 w-full">
                <MapPanel
                  stores={stores}
                  userLocation={profile.location}
                  radiusKm={filters.radius_km}
                  selectedStoreId={selectedStoreId}
                  onSelectStore={setSelectedStoreId}
                  selectedProduct={selectedProduct}
                />
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* Floating Action Button for Mobile Map (Visible on mobile/small tablet) */}
      <div className="md:hidden fixed bottom-18 right-4 z-30">
        <button
          type="button"
          onClick={() => setMobileMapOpen(true)}
          className="px-4 py-2.5 rounded-full bg-teal-700 hover:bg-teal-800 text-white shadow-lifted flex items-center gap-2 text-xs font-semibold"
        >
          <MapPin size={16} />
          <span>Stores Map</span>
        </button>
      </div>

      {/* Mobile Map Bottom Sheet Modal */}
      {mobileMapOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-ink-950/50 backdrop-blur-xs animate-in fade-in"
        >
          <div className="w-full h-[80vh] bg-white dark:bg-dark-card rounded-t-3xl shadow-lifted flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-250">
            <div className="p-4 border-b border-stone-200 dark:border-dark-border flex items-center justify-between bg-stone-50 dark:bg-dark-cardMuted">
              <span className="font-bold text-sm text-ink-900 dark:text-dark-ink font-serif flex items-center gap-2">
                <MapPin size={16} className="text-teal-700" />
                <span>Mysuru Stores Map</span>
              </span>
              <button
                type="button"
                onClick={() => setMobileMapOpen(false)}
                className="p-1 rounded-lg text-ink-500 hover:bg-stone-200"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1">
              <MapPanel
                stores={stores}
                userLocation={profile.location}
                radiusKm={filters.radius_km}
                selectedStoreId={selectedStoreId}
                onSelectStore={id => {
                  setSelectedStoreId(id);
                  setMobileMapOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Global Drawers & Modals */}
      <DetailsDrawer
        isOpen={detailsDrawerOpen}
        onClose={() => setDetailsDrawerOpen(false)}
        profile={profile}
        onUpdateProfile={updateProfile}
        onClearProfile={clearProfile}
      />

      <CitationSheet
        citation={activeCitation}
        onClose={() => setActiveCitation(null)}
      />

      <ReserveModal
        item={reserveItem}
        onClose={() => setReserveItem(null)}
      />

      <HowItWorksModal
        isOpen={showHowItWorks}
        onClose={() => setShowHowItWorks(false)}
      />

      <ReportWrongAnswerModal
        target={reportAnswerTarget}
        onClose={() => setReportAnswerTarget(null)}
      />

      {/* 4. Footer */}
      <Footer />
    </div>
  );
};
