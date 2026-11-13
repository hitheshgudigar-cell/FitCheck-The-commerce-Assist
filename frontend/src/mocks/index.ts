import { AnswerPayload, Product, ShopperProfile } from '../types';
import { MOCK_PRODUCTS } from './products';
import { MOCK_STORES, DEFAULT_USER_LOCATION } from './stores';
import {
  SCENARIO_DRESS_M,
  SCENARIO_HP_CARTRIDGE,
  SCENARIO_TV_MOUNT,
  SCENARIO_SOFA_DOOR,
  SCENARIO_VACUUM_FILTER,
  SCENARIO_DISCOVERY_BLACK_DRESS,
  SCENARIO_PHARMACY
} from './scenarios';

export {
  MOCK_PRODUCTS,
  MOCK_STORES,
  DEFAULT_USER_LOCATION,
  SCENARIO_DRESS_M,
  SCENARIO_HP_CARTRIDGE,
  SCENARIO_TV_MOUNT,
  SCENARIO_SOFA_DOOR,
  SCENARIO_VACUUM_FILTER,
  SCENARIO_DISCOVERY_BLACK_DRESS,
  SCENARIO_PHARMACY
};

export function getRankedDiscoveryProducts(query: string, profile?: ShopperProfile): Product[] {
  const q = query.toLowerCase();

  if (q.includes('dress') || q.includes('black')) {
    return [
      {
        ...MOCK_PRODUCTS.find(p => p.id === 'prod_clothing_dress_02')!,
        fit_verdict: { verdict: 'YES', badgeText: 'Fits you', bestVariant: 'Size M' }
      },
      {
        ...MOCK_PRODUCTS.find(p => p.id === 'prod_clothing_dress_04')!,
        fit_verdict: { verdict: 'YES', badgeText: 'Fits you', bestVariant: 'Size M' }
      },
      {
        ...MOCK_PRODUCTS.find(p => p.id === 'prod_clothing_dress_01')!,
        fit_verdict: { verdict: 'NO', badgeText: 'Snug at waist', bestVariant: 'Size L' }
      },
      {
        ...MOCK_PRODUCTS.find(p => p.id === 'prod_clothing_dress_03')!,
        fit_verdict: { verdict: 'YES', badgeText: 'Fits you', bestVariant: 'Size M' }
      }
    ];
  }

  if (q.includes('biscuit') || q.includes('gluten') || q.includes('cookie')) {
    return [
      {
        ...MOCK_PRODUCTS.find(p => p.id === 'prod_pharm_paracetamol')!,
        fit_verdict: { verdict: 'YES', badgeText: 'Gluten-free verified' }
      },
      {
        ...MOCK_PRODUCTS.find(p => p.id === 'prod_groc_cookies')!,
        fit_verdict: { verdict: 'NO', badgeText: 'Contains spelt/wheat' }
      }
    ];
  }

  if (q.includes('mount') || q.includes('tv')) {
    return [
      {
        ...MOCK_PRODUCTS.find(p => p.id === 'prod_elec_tv_mount_01')!,
        fit_verdict: { verdict: 'YES', badgeText: 'Fits up to 55" TVs' }
      },
      {
        ...MOCK_PRODUCTS.find(p => p.id === 'prod_elec_tv_mount_02')!,
        fit_verdict: { verdict: 'YES', badgeText: 'Fits 55"–85" TVs' }
      }
    ];
  }

  if (q.includes('cartridge') || q.includes('deskjet') || q.includes('hp')) {
    return [
      {
        ...MOCK_PRODUCTS.find(p => p.id === 'prod_elec_cartridge_01')!,
        fit_verdict: { verdict: 'YES', badgeText: 'Verified compatible' }
      }
    ];
  }

  if (q.includes('sofa') || q.includes('couch') || q.includes('door')) {
    return [
      {
        ...MOCK_PRODUCTS.find(p => p.id === 'prod_furniture_01')!,
        fit_verdict: { verdict: 'CANNOT_CONFIRM', badgeText: "Can't confirm carton depth" }
      }
    ];
  }

  // Default: return all products
  return MOCK_PRODUCTS.slice(0, 6);
}

export function evaluateMockQuery(
  message: string,
  explicitProductId?: string,
  profile?: ShopperProfile
): AnswerPayload {
  const q = message.toLowerCase().trim();

  // 1. Dress scenario: "bust 36, waist 30, will the M fit?"
  if (
    (q.includes('bust') && q.includes('36') && q.includes('waist') && q.includes('30')) ||
    (explicitProductId === 'prod_clothing_dress_01' && (q.includes('fit') || q.includes('size m')))
  ) {
    return SCENARIO_DRESS_M;
  }

  // 2. HP Cartridge scenario: "Does this cartridge work with my HP DeskJet 2331?"
  if (
    (q.includes('cartridge') && (q.includes('2331') || q.includes('deskjet') || q.includes('hp'))) ||
    (explicitProductId === 'prod_elec_cartridge_01' && (q.includes('compatible') || q.includes('work') || q.includes('2331')))
  ) {
    return SCENARIO_HP_CARTRIDGE;
  }

  // 3. TV mount scenario: wrong VESA or 75 inch
  if (
    (q.includes('tv') && (q.includes('600x400') || q.includes('75 inch') || q.includes('wrong vesa') || q.includes('mount'))) ||
    (explicitProductId === 'prod_elec_tv_mount_01' && (q.includes('600x400') || q.includes('75')))
  ) {
    // If specifically asking about 55 inch TV with 200x200 VESA:
    if (q.includes('55 inch') && !q.includes('75') && !q.includes('600x400')) {
      return {
        verdict: 'YES',
        headline: 'Fully compatible with your 55" TV (VESA 200x200 mm)',
        explanation: 'ProMount supports screen sizes from 32" to 55" and VESA bolt patterns up to 400x400 mm with a 30 kg weight limit. Your 55" TV fits securely within all certified limits.',
        checks: [
          { attribute: 'Screen Size', required: '55 in', actual: '32–55 in', passed: true, source_ref: 'doc_elec_tv_mount_promount · p.1' },
          { attribute: 'VESA Spacing', required: '200x200 mm', actual: 'Up to 400x400 mm', passed: true, source_ref: 'doc_elec_tv_mount_promount · p.4' },
          { attribute: 'Weight Limit', required: '20 kg', actual: 'Max 30 kg', passed: true, source_ref: 'doc_elec_tv_mount_promount · p.2' }
        ],
        citations: [
          { doc: 'ProMount Architectural & Installation Manual', page: 1, snippet: 'Tested up to 400x400 VESA and 30 kg load capacity. Safe for 55" screens.' }
        ],
        availability: SCENARIO_TV_MOUNT.availability,
        alternatives: [],
        clarifying_question: null,
        confidence: 'high',
        product: MOCK_PRODUCTS.find(p => p.id === 'prod_elec_tv_mount_01')
      };
    }
    return SCENARIO_TV_MOUNT;
  }

  // 4. Sofa scenario: 80 cm door or missing packaged dimensions
  if (
    q.includes('sofa') || q.includes('couch') ||
    (explicitProductId === 'prod_furniture_01' && (q.includes('door') || q.includes('fit') || q.includes('80 cm')))
  ) {
    return SCENARIO_SOFA_DOOR;
  }

  // 5. Vacuum filter scenario
  if (
    q.includes('dyson') ||
    (q.includes('filter') && q.includes('vacuum')) ||
    (explicitProductId === 'prod_elec_filter_01' && (q.includes('fit') || q.includes('work') || q.includes('compatible') || q.includes('dyson')))
  ) {
    // Check if clarifying response provided
    if (q.includes('v11') || q.includes('v15') || q.includes('outsize')) {
      return {
        verdict: 'YES',
        headline: `Confirmed compatible with ${q.includes('v11') ? 'Dyson V11' : 'Dyson V15 Detect'}`,
        explanation: 'The PureAir post-motor HEPA filter features the exact locking tabs and silicone seal specified for the Dyson V11 and V15 series.',
        checks: [
          { attribute: 'Vacuum Model', required: 'Dyson V11 / V15', actual: 'Exact match', passed: true, source_ref: 'doc_elec_pureair_dyson · p.1' },
          { attribute: 'HEPA Seal', required: 'H13 Airtight Gasket', actual: 'Tested H13 Airtight', passed: true, source_ref: 'doc_elec_pureair_dyson · p.2' }
        ],
        citations: [
          { doc: 'PureAir Replacement Filter Cross-Reference Chart', page: 1, snippet: 'Part #PA-DY-V11 fully certified for Dyson V11, V15 Detect, and Outsize series.' }
        ],
        availability: SCENARIO_VACUUM_FILTER.availability,
        alternatives: [],
        clarifying_question: null,
        confidence: 'high',
        product: MOCK_PRODUCTS.find(p => p.id === 'prod_elec_filter_01')
      };
    }
    if (q.includes('v8') || q.includes('v7') || q.includes('v10')) {
      return {
        verdict: 'NO',
        headline: 'Not compatible with Dyson V8 / V7 / V10',
        explanation: 'Dyson V8 uses a different motor housing and thinner filter collar. PureAir #PA-DY-V11 will not seat into the motor latch of a V8 vacuum.',
        checks: [
          { attribute: 'Collar Diameter', required: '64 mm (V8)', actual: '82 mm (V11/V15)', passed: false, source_ref: 'doc_elec_pureair_dyson · p.1' },
          { attribute: 'Mount Geometry', required: 'V8 bayonet', actual: 'V11 twist-lock', passed: false, source_ref: 'doc_elec_pureair_dyson · p.1' }
        ],
        citations: [
          { doc: 'PureAir Replacement Filter Cross-Reference Chart', page: 1, snippet: 'Not compatible with Dyson V8, V7, or V10 series.' }
        ],
        availability: SCENARIO_VACUUM_FILTER.availability,
        alternatives: [],
        clarifying_question: null,
        confidence: 'high',
        product: MOCK_PRODUCTS.find(p => p.id === 'prod_elec_filter_01')
      };
    }
    return SCENARIO_VACUUM_FILTER;
  }

  // 6. Discovery scenario: "black dress size M near me today"
  if (q.includes('black dress') || (q.includes('dress') && q.includes('size m'))) {
    return SCENARIO_DISCOVERY_BLACK_DRESS;
  }

  // 7. Pharmacy scenario: "Gluten-free biscuits nearby" or "Crocin Advance gluten-free"
  if (
    q.includes('crocin') || q.includes('paracetamol') ||
    q.includes('gluten-free biscuits') || q.includes('gluten-free pain reliever') ||
    (explicitProductId === 'prod_pharm_paracetamol' && q.includes('gluten'))
  ) {
    return SCENARIO_PHARMACY;
  }

  // Generic fallback query with intelligent parsing
  const matchingProduct = explicitProductId
    ? MOCK_PRODUCTS.find(p => p.id === explicitProductId)
    : MOCK_PRODUCTS[0];

  return {
    verdict: 'YES',
    headline: `Verified specifications for ${matchingProduct?.name || 'this item'}`,
    explanation: `We cross-referenced your query with the authoritative document (${matchingProduct?.docs[0] || 'Manufacturer spec sheet'}) and verified nearby inventory in Mysuru.`,
    checks: [
      { attribute: 'Specifications', required: 'User criteria', actual: 'Matches standard parameters', passed: true, source_ref: matchingProduct?.docs[0] },
      { attribute: 'Local Stock', required: 'Nearby Store', actual: 'In stock at Central store', passed: true, source_ref: 'FitCheck Live Inventory' }
    ],
    citations: [
      { doc: `${matchingProduct?.name || 'Product'} Authoritative Spec Sheet`, page: 1, snippet: matchingProduct?.marketing_copy || 'Official product specifications.' }
    ],
    availability: SCENARIO_DRESS_M.availability,
    alternatives: [],
    clarifying_question: null,
    confidence: 'medium',
    product: matchingProduct
  };
}
