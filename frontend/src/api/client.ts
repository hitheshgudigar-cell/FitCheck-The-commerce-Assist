import { AnswerPayload, Product, Store, ShopperProfile, LocationData } from '../types';
import { getSessionId } from './session';
import {
  MOCK_PRODUCTS,
  MOCK_STORES,
  DEFAULT_USER_LOCATION,
  evaluateMockQuery
} from '../mocks';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class FitCheckApiClient {
  private isDemoMode: boolean = true;
  private demoModeListeners: Array<(isDemo: boolean) => void> = [];
  private currentProfile: ShopperProfile = {
    location: DEFAULT_USER_LOCATION,
    radius_km: 10,
    measurements: {},
    devices: [],
    spaces: {},
    dietary: []
  };

  constructor() {
    this.checkBackendHealth();
  }

  public subscribeToDemoMode(listener: (isDemo: boolean) => void): () => void {
    this.demoModeListeners.push(listener);
    listener(this.isDemoMode);
    return () => {
      this.demoModeListeners = this.demoModeListeners.filter(l => l !== listener);
    };
  }

  public getIsDemoMode(): boolean {
    return this.isDemoMode;
  }

  public setDemoMode(value: boolean) {
    if (this.isDemoMode !== value) {
      this.isDemoMode = value;
      this.demoModeListeners.forEach(listener => listener(this.isDemoMode));
    }
  }

  public async checkBackendHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(`${API_BASE_URL}/api/status`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        this.setDemoMode(false);
        return true;
      }
    } catch {
      // Backend is offline or unreachable
    }
    this.setDemoMode(true);
    return false;
  }

  public async chat(
    message: string,
    productId?: string,
    location?: LocationData,
    radiusKm?: number
  ): Promise<AnswerPayload> {
    const sessionId = getSessionId();

    if (!this.isDemoMode) {
      try {
        const res = await fetch(`${API_BASE_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            message,
            product_id: productId || null,
            location: location || this.currentProfile.location,
            radius_km: radiusKm || this.currentProfile.radius_km
          })
        });

        if (res.ok) {
          const data: AnswerPayload = await res.json();
          return data;
        }
      } catch (err) {
        console.warn('Backend unavailable, falling back to Demo Mode mock engine:', err);
        this.setDemoMode(true);
      }
    }

    // Fallback: evaluate via mock scenarios
    // Add artificial delay (300ms) for realistic feel
    await new Promise(r => setTimeout(r, 300));
    return evaluateMockQuery(message, productId, this.currentProfile);
  }

  public async getProducts(q?: string, category?: string): Promise<Product[]> {
    if (!this.isDemoMode) {
      try {
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (category) params.set('category', category);

        const res = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
        if (res.ok) {
          return await res.json();
        }
      } catch {
        this.setDemoMode(true);
      }
    }

    // Fallback mocks
    let results = [...MOCK_PRODUCTS];
    if (category) {
      results = results.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (q) {
      const qLower = q.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(qLower) ||
        p.brand.toLowerCase().includes(qLower) ||
        p.marketing_copy.toLowerCase().includes(qLower)
      );
    }
    return results;
  }

  public async getProduct(id: string): Promise<Product | null> {
    if (!this.isDemoMode) {
      try {
        const res = await fetch(`${API_BASE_URL}/products/${id}`);
        if (res.ok) {
          return await res.json();
        }
      } catch {
        this.setDemoMode(true);
      }
    }
    return MOCK_PRODUCTS.find(p => p.id === id) || null;
  }

  public async getStores(): Promise<Store[]> {
    if (!this.isDemoMode) {
      try {
        const res = await fetch(`${API_BASE_URL}/stores`);
        if (res.ok) {
          return await res.json();
        }
      } catch {
        this.setDemoMode(true);
      }
    }
    return MOCK_STORES;
  }

  public async getProfile(): Promise<ShopperProfile> {
    const sessionId = getSessionId();
    if (!this.isDemoMode) {
      try {
        const res = await fetch(`${API_BASE_URL}/session/${sessionId}`);
        if (res.ok) {
          const profile = await res.json();
          this.currentProfile = profile;
          return profile;
        }
      } catch {
        this.setDemoMode(true);
      }
    }
    return this.currentProfile;
  }

  public async updateProfile(updates: Partial<ShopperProfile>): Promise<ShopperProfile> {
    const sessionId = getSessionId();
    this.currentProfile = {
      ...this.currentProfile,
      ...updates,
      measurements: { ...this.currentProfile.measurements, ...(updates.measurements || {}) },
      spaces: { ...this.currentProfile.spaces, ...(updates.spaces || {}) },
      devices: updates.devices || this.currentProfile.devices,
      dietary: updates.dietary || this.currentProfile.dietary,
      location: updates.location || this.currentProfile.location,
      radius_km: updates.radius_km !== undefined ? updates.radius_km : this.currentProfile.radius_km,
    };

    if (!this.isDemoMode) {
      try {
        const res = await fetch(`${API_BASE_URL}/session/${sessionId}/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        if (res.ok) {
          return await res.json();
        }
      } catch {
        this.setDemoMode(true);
      }
    }

    return this.currentProfile;
  }

  public clearProfile(): ShopperProfile {
    this.currentProfile = {
      location: DEFAULT_USER_LOCATION,
      radius_km: 10,
      measurements: {},
      devices: [],
      spaces: {},
      dietary: []
    };
    return this.currentProfile;
  }
}

export const api = new FitCheckApiClient();
