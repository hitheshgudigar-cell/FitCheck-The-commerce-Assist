export type VerdictType = 'YES' | 'NO' | 'CANNOT_CONFIRM';
export type ConfidenceType = 'high' | 'medium' | 'low';

export interface CheckResult {
  attribute: string;
  required: string | number | boolean | any;
  actual: string | number | boolean | any;
  passed: boolean | null; // true = pass, false = fail/conflict, null = missing/cannot confirm
  source_ref?: string;
}

export interface Citation {
  doc: string;
  page: number;
  snippet: string;
}

export interface StoreAvailability {
  store: string;
  store_id: string;
  distance_km: number;
  qty: number;
  pickup_today: boolean;
  address: string;
}

export interface Alternative {
  product_id?: string;
  product_name: string;
  variant_sku?: string;
  reason: string;
  availability: StoreAvailability[];
}

export interface Variant {
  sku: string;
  name: string;
  attributes?: Record<string, any>;
  in_stock?: boolean;
  qty?: number;
}

export interface ProductDocInfo {
  id: string;
  name: string;
  type: 'size_chart' | 'spec_sheet' | 'manual' | 'label_facts';
  pages: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price?: number;
  image_url?: string;
  variants: Variant[];
  attributes: Record<string, any>;
  docs: string[];
  doc_details?: ProductDocInfo[];
  marketing_copy: string;
  fit_verdict?: {
    verdict: VerdictType;
    badgeText: string;
    bestVariant?: string;
  };
}

export interface AnswerPayload {
  verdict: VerdictType;
  headline: string;
  explanation: string;
  checks: CheckResult[];
  citations: Citation[];
  availability: StoreAvailability[];
  alternatives: Alternative[];
  clarifying_question: string | null;
  clarifying_options?: string[];
  confidence: ConfidenceType;
  recommended_sku?: string | null;
  product?: Product | null;
  notice?: {
    type: 'medical' | 'warning' | 'info';
    text: string;
  };
}

export interface Store {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  pickup_today: boolean;
  open_hours: string;
}

export interface LocationData {
  lat?: number;
  lng?: number;
  pincode?: string;
  city: string;
}

export interface ShopperProfile {
  location: LocationData;
  radius_km: number;
  measurements: Record<string, number>; // e.g. chest, waist, hip, height, foot_length_cm
  devices: Array<{ type: string; model: string }>; // e.g. [{"type": "printer", "model": "HP DeskJet 2331"}]
  spaces: Record<string, number>; // door_width_cm, room_width_cm, ceiling_height_cm
  dietary: string[]; // ["gluten-free", "vegan", "nut allergy"]
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text?: string;
  payload?: AnswerPayload;
  timestamp: string;
  isLoading?: boolean;
  loadingStep?: string;
}

export interface FilterState {
  radius_km: number;
  pickup_today: boolean;
  in_stock_only: boolean;
  sort_by: 'best_fit' | 'nearest' | 'price';
}
