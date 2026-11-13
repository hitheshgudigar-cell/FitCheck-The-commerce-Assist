import { Product, StoreAvailability } from './index';

export interface QuestionnaireOption {
  label: string;
  sublabel?: string;
  prompt: string;
  isRecommended?: boolean;
}

export interface QuestionnaireQuestion {
  id: string;
  title: string;
  description?: string;
  options: QuestionnaireOption[];
  inputType?: 'options' | 'measurements' | 'text';
  measurementFields?: Array<{
    id: string;
    label: string;
    placeholder: string;
    unit: string;
  }>;
}

export interface ProductQuestionnaire {
  productId: string;
  productName: string;
  category: string;
  headline: string;
  whyAsk: string;
  questions: QuestionnaireQuestion[];
}

export interface ParsedProductUrlResult {
  platform: 'amazon' | 'flipkart' | 'myntra' | 'ikea' | 'nykaa' | 'ajio' | 'tatacliq' | 'generic';
  platformName: string;
  originalUrl: string;
  extractedTitle: string;
  extractedId?: string;
  matchedProduct: Product | null;
  matchConfidence: 'exact' | 'high' | 'approximate' | 'none';
  localAvailability: StoreAvailability[];
  localPrice?: number;
  onlinePriceEst?: number;
  statusMessage: string;
}

