import { AnswerPayload, Product, ShopperProfile } from '../types';
import { MOCK_PRODUCTS } from './products';
import { MOCK_STORES } from './stores';

export const SCENARIO_DRESS_M: AnswerPayload = {
  verdict: 'NO',
  headline: 'Size M is snug at the waist (30 in needed vs 28–29.5 in max). Recommend Size L.',
  explanation: 'Size M fits your 36" bust comfortably (range is 35–37"), but your 30" waist exceeds the Size M maximum waist allowance of 29.5". We recommend Size L which accommodates waist 30–33" with ease.',
  checks: [
    {
      attribute: 'Bust / Chest',
      required: '36 in',
      actual: '35–37 in',
      passed: true,
      source_ref: 'doc_clothing_aura_dress · p.2'
    },
    {
      attribute: 'Waist',
      required: '30 in',
      actual: '28–29.5 in',
      passed: false,
      source_ref: 'doc_clothing_aura_dress · p.2'
    },
    {
      attribute: 'Hip',
      required: 'Not specified',
      actual: '37–39 in',
      passed: true,
      source_ref: 'doc_clothing_aura_dress · p.2'
    }
  ],
  citations: [
    {
      doc: 'Aura Silk Floral Wrap Dress Size Chart',
      page: 2,
      snippet: 'Size M: Bust 35–37 in, Waist 28–29.5 in, Hip 37–39 in. Mulberry silk non-stretch woven shell. We advise sizing up if between measurements.'
    }
  ],
  availability: [
    {
      store: 'FitCheck Central - Devaraja Mohalla',
      store_id: 'store_mysuru_devaraja',
      distance_km: 1.2,
      qty: 6,
      pickup_today: true,
      address: '142 Sayyaji Rao Road, Devaraja Mohalla, Mysuru'
    },
    {
      store: 'FitCheck Boutique - Jayalakshmipuram',
      store_id: 'store_mysuru_jayalakshmi',
      distance_km: 2.8,
      qty: 2,
      pickup_today: true,
      address: '45 Kalidasa Road, Jayalakshmipuram, Mysuru'
    }
  ],
  alternatives: [
    {
      product_id: 'prod_clothing_dress_01',
      product_name: 'Aura Silk Floral Wrap Dress (Size L)',
      variant_sku: 'SKU-AURA-DR-L',
      reason: 'Size L fits waist 30–33 in comfortably and is ready for pickup.',
      availability: [
        {
          store: 'FitCheck Central - Devaraja Mohalla',
          store_id: 'store_mysuru_devaraja',
          distance_km: 1.2,
          qty: 3,
          pickup_today: true,
          address: '142 Sayyaji Rao Road, Devaraja Mohalla, Mysuru'
        }
      ]
    }
  ],
  clarifying_question: null,
  confidence: 'high',
  recommended_sku: 'SKU-AURA-DR-L',
  product: MOCK_PRODUCTS.find(p => p.id === 'prod_clothing_dress_01')
};

export const SCENARIO_HP_CARTRIDGE: AnswerPayload = {
  verdict: 'YES',
  headline: 'Certified compatible with your HP DeskJet 2331 printer',
  explanation: 'The HP 67 black cartridge is officially certified for the HP DeskJet 2300 series. DeskJet 2331 is explicitly enumerated in the manufacturer hardware compatibility table on page 1.',
  checks: [
    {
      attribute: 'Printer Compatibility',
      required: 'HP DeskJet 2331',
      actual: 'HP DeskJet 2331, 2722, 2755, 4155',
      passed: true,
      source_ref: 'doc_elec_hp_cartridge · p.1'
    },
    {
      attribute: 'Form Factor Slot',
      required: 'Black Cartridge Bay',
      actual: 'HP 67 Series Left Carriage Slot',
      passed: true,
      source_ref: 'doc_elec_hp_cartridge · p.3'
    },
    {
      attribute: 'Firmware Security',
      required: 'Standard OEM Handshake',
      actual: 'Genuine HP Dynamic Security Verified',
      passed: true,
      source_ref: 'doc_elec_hp_cartridge · p.4'
    }
  ],
  citations: [
    {
      doc: 'HP DeskJet 2300 Compatibility Guide',
      page: 1,
      snippet: 'Compatible Printer Models: HP DeskJet 2331 All-in-One, HP DeskJet 2722, HP DeskJet 2723, HP DeskJet 2755. Compatible Cartridges: HP 67 Standard Black (3YM56AN), HP 67XL High Yield Black (3YM57AN).'
    }
  ],
  availability: [
    {
      store: 'FitCheck Central - Devaraja Mohalla',
      store_id: 'store_mysuru_devaraja',
      distance_km: 1.2,
      qty: 8,
      pickup_today: true,
      address: '142 Sayyaji Rao Road, Devaraja Mohalla, Mysuru'
    },
    {
      store: 'FitCheck Outlet - Kuvempunagar',
      store_id: 'store_mysuru_kuvempunagar',
      distance_km: 3.1,
      qty: 4,
      pickup_today: true,
      address: '28 Complex Main Road, Kuvempunagar, Mysuru'
    }
  ],
  alternatives: [
    {
      product_id: 'prod_elec_cartridge_01',
      product_name: 'HP 67XL High Yield Black Cartridge',
      variant_sku: 'SKU-HP67-XL',
      reason: 'Prints 240 pages (2x standard yield) for 35% lower cost per page.',
      availability: [
        {
          store: 'FitCheck Central - Devaraja Mohalla',
          store_id: 'store_mysuru_devaraja',
          distance_km: 1.2,
          qty: 4,
          pickup_today: true,
          address: '142 Sayyaji Rao Road, Devaraja Mohalla, Mysuru'
        }
      ]
    }
  ],
  clarifying_question: null,
  confidence: 'high',
  recommended_sku: 'SKU-HP67-STD',
  product: MOCK_PRODUCTS.find(p => p.id === 'prod_elec_cartridge_01')
};

export const SCENARIO_TV_MOUNT: AnswerPayload = {
  verdict: 'NO',
  headline: 'Incompatible: TV VESA pattern (600x400) exceeds mount maximum (400x400 mm)',
  explanation: 'This mount is engineered for displays up to 55" with maximum 400x400 mm VESA spacing. Your 75" TV requires a 600x400 mm bracket and weighs 35 kg, which also exceeds the 30 kg rated capacity.',
  checks: [
    {
      attribute: 'VESA Pattern',
      required: '600x400 mm',
      actual: 'Max 400x400 mm',
      passed: false,
      source_ref: 'doc_elec_tv_mount_promount · p.4'
    },
    {
      attribute: 'Screen Size',
      required: '75 inches',
      actual: '32–55 inches',
      passed: false,
      source_ref: 'doc_elec_tv_mount_promount · p.1'
    },
    {
      attribute: 'Weight Load Limit',
      required: '35 kg',
      actual: 'Max 30 kg',
      passed: false,
      source_ref: 'doc_elec_tv_mount_promount · p.2'
    }
  ],
  citations: [
    {
      doc: 'ProMount Architectural & Installation Manual',
      page: 4,
      snippet: 'VESA Compatibility: 75x75, 100x100, 200x200, 300x300, 400x200, 400x400 mm. Do not exceed maximum weight capacity of 30 kg (66 lbs). Displays larger than 55 inches are strictly not supported.'
    }
  ],
  availability: [
    {
      store: 'FitCheck Central - Devaraja Mohalla',
      store_id: 'store_mysuru_devaraja',
      distance_km: 1.2,
      qty: 7,
      pickup_today: true,
      address: '142 Sayyaji Rao Road, Devaraja Mohalla, Mysuru'
    }
  ],
  alternatives: [
    {
      product_id: 'prod_elec_tv_mount_02',
      product_name: 'UltraSlim Large TV Mount 85"',
      variant_sku: 'SKU-PM-TILT-85',
      reason: 'Supports 55"–85" screens, 600x400 VESA, and holds up to 65 kg safely.',
      availability: [
        {
          store: 'FitCheck Central - Devaraja Mohalla',
          store_id: 'store_mysuru_devaraja',
          distance_km: 1.2,
          qty: 3,
          pickup_today: true,
          address: '142 Sayyaji Rao Road, Devaraja Mohalla, Mysuru'
        }
      ]
    }
  ],
  clarifying_question: null,
  confidence: 'high',
  product: MOCK_PRODUCTS.find(p => p.id === 'prod_elec_tv_mount_01')
};

export const SCENARIO_SOFA_DOOR: AnswerPayload = {
  verdict: 'CANNOT_CONFIRM',
  headline: 'Cannot confirm: Packaged carton dimensions missing from manufacturer spec',
  explanation: 'The assembled sofa depth is 88 cm (exceeding your 80 cm doorway). The manufacturer manual confirms the legs are detachable (reducing clearance to ~76 cm unboxed), but carton packaging dimensions are omitted from official documentation.',
  checks: [
    {
      attribute: 'Doorway Width',
      required: '80 cm',
      actual: '80 cm (from shopper profile)',
      passed: null,
      source_ref: 'Shopper Profile'
    },
    {
      attribute: 'Assembled Sofa Depth',
      required: '< 80 cm',
      actual: '88 cm',
      passed: false,
      source_ref: 'doc_furn_nordic_sofa · p.2'
    },
    {
      attribute: 'Packaged Box Depth',
      required: '< 80 cm',
      actual: 'Not specified in manufacturer spec',
      passed: null,
      source_ref: 'doc_furn_nordic_sofa · p.5'
    },
    {
      attribute: 'Detachable Legs',
      required: 'Yes',
      actual: 'Yes (reduces clearance to ~76 cm unboxed)',
      passed: true,
      source_ref: 'doc_furn_nordic_sofa · p.3'
    }
  ],
  citations: [
    {
      doc: 'Nordic Living Dimensional Sheet & Assembly Manual',
      page: 2,
      snippet: 'Product Dimensions: Width 210 cm, Depth 88 cm, Height 82 cm. Detachable tapered birch legs (height 12 cm). Box packaging dimensions vary by regional logistics depot.'
    }
  ],
  availability: [
    {
      store: 'FitCheck Central - Devaraja Mohalla',
      store_id: 'store_mysuru_devaraja',
      distance_km: 1.2,
      qty: 2,
      pickup_today: true,
      address: '142 Sayyaji Rao Road, Devaraja Mohalla, Mysuru'
    },
    {
      store: 'FitCheck Outlet - Kuvempunagar',
      store_id: 'store_mysuru_kuvempunagar',
      distance_km: 3.1,
      qty: 1,
      pickup_today: true,
      address: '28 Complex Main Road, Kuvempunagar, Mysuru'
    }
  ],
  alternatives: [],
  clarifying_question: null,
  confidence: 'medium',
  product: MOCK_PRODUCTS.find(p => p.id === 'prod_furniture_01'),
  notice: {
    type: 'info',
    text: 'Store Recommendation: The unboxed sofa will fit through an 80 cm door if rotated diagonally without legs (76 cm clearance required). We recommend requesting white-glove unboxing upon delivery or contacting Devaraja Mohalla store staff to verify depot crate dimensions.'
  }
};

export const SCENARIO_VACUUM_FILTER: AnswerPayload = {
  verdict: 'CANNOT_CONFIRM',
  headline: 'Please specify your Dyson vacuum model number',
  explanation: 'PureAir post-motor filters require a precise twist-and-lock gasket match. Models V11 and V15 use this barrel filter, whereas V7, V8, and V10 utilize a different snap mechanism.',
  checks: [
    {
      attribute: 'Vacuum Model',
      required: 'Exact model needed',
      actual: 'Unspecified',
      passed: null,
      source_ref: 'Shopper Profile'
    },
    {
      attribute: 'Filter Mount Diameter',
      required: 'Model specific',
      actual: '82 mm (V11/V15 collar)',
      passed: null,
      source_ref: 'doc_elec_pureair_dyson · p.1'
    }
  ],
  citations: [
    {
      doc: 'PureAir Replacement Filter Cross-Reference Chart',
      page: 1,
      snippet: 'Part #PA-DY-V11 fits Dyson V11 Absolute, V11 Animal, V11 Torque Drive, V15 Detect, and Outsize series. Not compatible with Dyson V8, V7, or V10 series.'
    }
  ],
  availability: [
    {
      store: 'FitCheck Central - Devaraja Mohalla',
      store_id: 'store_mysuru_devaraja',
      distance_km: 1.2,
      qty: 12,
      pickup_today: true,
      address: '142 Sayyaji Rao Road, Devaraja Mohalla, Mysuru'
    }
  ],
  alternatives: [],
  clarifying_question: 'Which vacuum model do you own?',
  clarifying_options: [
    'Dyson V11 Absolute',
    'Dyson V15 Detect',
    'Dyson V8 Animal',
    'Dyson V10 Cyclone',
    'Dyson Outsize'
  ],
  confidence: 'medium',
  product: MOCK_PRODUCTS.find(p => p.id === 'prod_elec_filter_01')
};

export const SCENARIO_DISCOVERY_BLACK_DRESS: AnswerPayload = {
  verdict: 'YES',
  headline: 'Found 4 black dresses near you today in Size M',
  explanation: 'We checked size charts against Size M (approx. bust 35–37", waist 29–31") and verified live stock across Mysuru stores. 3 dresses are verified to fit comfortably, while 1 is snug at the waist.',
  checks: [
    {
      attribute: 'Size Match',
      required: 'Size M',
      actual: '4 matching dresses in inventory',
      passed: true,
      source_ref: 'Multiple manufacturer size charts'
    },
    {
      attribute: 'Local Stock',
      required: 'Within 5 km',
      actual: 'In stock at Devaraja Mohalla, Jayalakshmipuram & Kuvempunagar',
      passed: true,
      source_ref: 'FitCheck Live Inventory'
    }
  ],
  citations: [
    {
      doc: 'FitCheck Regional Inventory Index',
      page: 1,
      snippet: '4 SKUs identified with active stock in Mysuru retail locations. 3 verified compatible with standard Size M body metrics.'
    }
  ],
  availability: [
    {
      store: 'FitCheck Central - Devaraja Mohalla',
      store_id: 'store_mysuru_devaraja',
      distance_km: 1.2,
      qty: 11,
      pickup_today: true,
      address: '142 Sayyaji Rao Road, Devaraja Mohalla, Mysuru'
    },
    {
      store: 'FitCheck Boutique - Jayalakshmipuram',
      store_id: 'store_mysuru_jayalakshmi',
      distance_km: 2.8,
      qty: 6,
      pickup_today: true,
      address: '45 Kalidasa Road, Jayalakshmipuram, Mysuru'
    }
  ],
  alternatives: [],
  clarifying_question: null,
  confidence: 'high'
};

export const SCENARIO_PHARMACY: AnswerPayload = {
  verdict: 'YES',
  headline: 'Crocin Advance 500mg is certified gluten-free & lactose-free',
  explanation: 'Verified from manufacturer packaging facts and the official patient information leaflet: Crocin Advance uses an Optizorb formulation with purified microcrystalline cellulose, containing zero wheat, gluten, or dairy derivatives.',
  checks: [
    {
      attribute: 'Gluten / Wheat Content',
      required: 'Gluten-Free',
      actual: 'Gluten-Free (0 ppm detected, no wheat starch)',
      passed: true,
      source_ref: 'doc_pharm_crocin_leaf · p.1'
    },
    {
      attribute: 'Lactose / Dairy',
      required: 'Lactose-Free',
      actual: 'Lactose-Free excipient matrix',
      passed: true,
      source_ref: 'doc_pharm_crocin_leaf · p.2'
    },
    {
      attribute: 'Active Ingredient',
      required: 'Pain reliever / fever reducer',
      actual: 'Paracetamol 500 mg Optizorb',
      passed: true,
      source_ref: 'doc_pharm_crocin_leaf · p.1'
    }
  ],
  citations: [
    {
      doc: 'Crocin Advance Packaging Facts & Patient Leaflet',
      page: 1,
      snippet: 'Composition: Each film-coated tablet contains Paracetamol I.P. 500 mg. Excipients q.s. Does not contain gluten, wheat starch, lactose, or animal-derived gelatin.'
    }
  ],
  availability: [
    {
      store: 'FitCheck Central - Devaraja Mohalla',
      store_id: 'store_mysuru_devaraja',
      distance_km: 1.2,
      qty: 45,
      pickup_today: true,
      address: '142 Sayyaji Rao Road, Devaraja Mohalla, Mysuru'
    },
    {
      store: 'FitCheck Studio - Gokulam',
      store_id: 'store_mysuru_gokulam',
      distance_km: 4.0,
      qty: 20,
      pickup_today: true,
      address: '8 Temple Road, 3rd Stage, Gokulam, Mysuru'
    }
  ],
  alternatives: [],
  clarifying_question: null,
  confidence: 'high',
  product: MOCK_PRODUCTS.find(p => p.id === 'prod_pharm_paracetamol'),
  notice: {
    type: 'medical',
    text: 'Medical Advice Disclaimer / Health Notice: FitCheck evaluates only manufacturer-disclosed packaging facts and label declarations. We do not provide medical diagnosis or therapeutic counsel. Please consult a qualified doctor or registered pharmacist before taking any medication.'
  }
};
