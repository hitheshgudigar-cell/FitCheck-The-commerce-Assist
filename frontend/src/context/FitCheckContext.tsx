import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  ShopperProfile,
  Product,
  Store,
  ChatMessage,
  FilterState,
  AnswerPayload,
  Citation,
  StoreAvailability
} from '../types';
import { api } from '../api/client';
import { MOCK_PRODUCTS, MOCK_STORES, DEFAULT_USER_LOCATION, getRankedDiscoveryProducts } from '../mocks';

interface FitCheckContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  retryBackend: () => Promise<boolean>;

  activeTab: 'discovery' | 'product';
  setActiveTab: (tab: 'discovery' | 'product') => void;

  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  profile: ShopperProfile;
  updateProfile: (updates: Partial<ShopperProfile>) => Promise<void>;
  clearProfile: () => void;
  detailsDrawerOpen: boolean;
  setDetailsDrawerOpen: (open: boolean) => void;

  // Products & Stores
  products: Product[];
  selectedProduct: Product;
  setSelectedProduct: (p: Product) => void;
  stores: Store[];
  selectedStoreId: string | null;
  setSelectedStoreId: (id: string | null) => void;

  // Discovery results & filters
  discoveryResults: Product[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;

  // Chat threads
  discoveryMessages: ChatMessage[];
  productMessages: Record<string, ChatMessage[]>;
  isThinking: boolean;
  thinkingStep: string;
  sendMessage: (text: string, explicitProductId?: string) => Promise<void>;
  handleClarifyAnswer: (answer: string, explicitProductId?: string) => Promise<void>;
  resetThread: () => void;

  // Modals & Sheets
  activeCitation: Citation | null;
  setActiveCitation: (c: Citation | null) => void;
  reserveItem: { product: Product; store: StoreAvailability } | null;
  setReserveItem: (item: { product: Product; store: StoreAvailability } | null) => void;
  showHowItWorks: boolean;
  setShowHowItWorks: (show: boolean) => void;
  reportAnswerTarget: { messageId: string; headline: string } | null;
  setReportAnswerTarget: (t: { messageId: string; headline: string } | null) => void;
  mobileMapOpen: boolean;
  setMobileMapOpen: (open: boolean) => void;
}

const FitCheckContext = createContext<FitCheckContextType | null>(null);

export const FitCheckProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState<boolean>(api.getIsDemoMode());
  const [activeTab, setActiveTab] = useState<'discovery' | 'product'>('discovery');
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>('light');

  const [profile, setProfile] = useState<ShopperProfile>({
    location: DEFAULT_USER_LOCATION,
    radius_km: 10,
    measurements: {},
    devices: [],
    spaces: {},
    dietary: []
  });
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product>(MOCK_PRODUCTS[0]);
  const [stores, setStores] = useState<Store[]>(MOCK_STORES);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    radius_km: 10,
    pickup_today: false,
    in_stock_only: false,
    sort_by: 'best_fit'
  });

  const [discoveryResults, setDiscoveryResults] = useState<Product[]>([]);
  const [discoveryMessages, setDiscoveryMessages] = useState<ChatMessage[]>([]);
  const [productMessages, setProductMessages] = useState<Record<string, ChatMessage[]>>({});

  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState('Understanding your question...');

  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [reserveItem, setReserveItem] = useState<{ product: Product; store: StoreAvailability } | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [reportAnswerTarget, setReportAnswerTarget] = useState<{ messageId: string; headline: string } | null>(null);
  const [mobileMapOpen, setMobileMapOpen] = useState(false);

  // Initialize theme
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Subscribe to API client demo mode changes
  useEffect(() => {
    return api.subscribeToDemoMode(mode => {
      setIsDemoMode(mode);
    });
  }, []);

  // Load initial products and stores
  useEffect(() => {
    async function loadData() {
      const p = await api.getProducts();
      if (p && p.length > 0) {
        setProducts(p);
        setSelectedProduct(p[0]);
      }
      const s = await api.getStores();
      if (s && s.length > 0) {
        setStores(s);
      }
    }
    loadData();
  }, []);

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
  };

  const toggleDemoMode = () => {
    api.setDemoMode(!isDemoMode);
  };

  const retryBackend = async (): Promise<boolean> => {
    return await api.checkBackendHealth();
  };

  const updateProfile = async (updates: Partial<ShopperProfile>) => {
    const updated = await api.updateProfile(updates);
    setProfile(updated);
  };

  const clearProfile = () => {
    const cleared = api.clearProfile();
    setProfile(cleared);
  };

  const resetThread = () => {
    if (activeTab === 'discovery') {
      setDiscoveryMessages([]);
      setDiscoveryResults([]);
    } else {
      setProductMessages(prev => ({
        ...prev,
        [selectedProduct.id]: []
      }));
    }
  };

  const runThinkingPipeline = async (): Promise<void> => {
    setIsThinking(true);
    setThinkingStep('Understanding your question...');
    await new Promise(r => setTimeout(r, 180));
    setThinkingStep('Checking authoritative spec sheets...');
    await new Promise(r => setTimeout(r, 220));
    setThinkingStep('Checking nearby store inventory...');
    await new Promise(r => setTimeout(r, 160));
  };

  const sendMessage = async (text: string, explicitProductId?: string) => {
    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const targetProductId = explicitProductId || (activeTab === 'product' ? selectedProduct.id : undefined);

    if (activeTab === 'discovery') {
      setDiscoveryMessages(prev => [...prev, userMsg]);
    } else if (targetProductId) {
      setProductMessages(prev => ({
        ...prev,
        [targetProductId]: [...(prev[targetProductId] || []), userMsg]
      }));
    }

    try {
      await runThinkingPipeline();

      const answer = await api.chat(
        text,
        targetProductId,
        profile.location,
        filters.radius_km
      );

      const assistantMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        sender: 'assistant',
        payload: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      if (activeTab === 'discovery') {
        setDiscoveryMessages(prev => [...prev, assistantMsg]);
        const ranked = getRankedDiscoveryProducts(text, profile);
        setDiscoveryResults(ranked);
      } else if (targetProductId) {
        setProductMessages(prev => ({
          ...prev,
          [targetProductId]: [...(prev[targetProductId] || []), assistantMsg]
        }));
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, we encountered a temporary glitch verifying that item with the local stores. Please tap retry below.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      if (activeTab === 'discovery') {
        setDiscoveryMessages(prev => [...prev, errorMsg]);
      } else if (targetProductId) {
        setProductMessages(prev => ({
          ...prev,
          [targetProductId]: [...(prev[targetProductId] || []), errorMsg]
        }));
      }
    } finally {
      setIsThinking(false);
    }
  };

  const handleClarifyAnswer = async (answer: string, explicitProductId?: string) => {
    // If the clarifying question is about a vacuum or device, auto-save to shopper profile
    const answerLower = answer.toLowerCase();
    if (answerLower.includes('dyson') || answerLower.includes('shark')) {
      const existingDevices = profile.devices || [];
      const updatedDevices = [...existingDevices.filter(d => d.type !== 'vacuum'), { type: 'vacuum', model: answer }];
      await updateProfile({ devices: updatedDevices });
    }

    // Submit clarification response
    await sendMessage(`I have a ${answer}`, explicitProductId);
  };

  return (
    <FitCheckContext.Provider
      value={{
        isDemoMode,
        toggleDemoMode,
        retryBackend,
        activeTab,
        setActiveTab,
        theme,
        setTheme,
        profile,
        updateProfile,
        clearProfile,
        detailsDrawerOpen,
        setDetailsDrawerOpen,
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
        resetThread,
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
      }}
    >
      {children}
    </FitCheckContext.Provider>
  );
};

export const useFitCheck = (): FitCheckContextType => {
  const context = useContext(FitCheckContext);
  if (!context) {
    throw new Error('useFitCheck must be used within a FitCheckProvider');
  }
  return context;
};
