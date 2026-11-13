import { Product } from '../types';
import { MOCK_PRODUCTS } from '../mocks/products';
import { MOCK_STORES } from '../mocks/stores';
import { ParsedProductUrlResult } from '../types/questionnaire';

export interface SampleProductLink {
  label: string;
  platform: 'Amazon' | 'Myntra' | 'Flipkart' | 'IKEA' | 'Nykaa';
  url: string;
  targetProductName: string;
}

export const SAMPLE_PRODUCT_LINKS: SampleProductLink[] = [
  {
    label: 'Amazon · HP 67 Ink Cartridge',
    platform: 'Amazon',
    url: 'https://www.amazon.in/HP-DeskJet-Cartridge-Original-3YM61AE/dp/B0852T8B9S',
    targetProductName: 'Original HP 67 Black Ink Cartridge'
  },
  {
    label: 'Myntra · Aura Silk Floral Wrap Dress',
    platform: 'Myntra',
    url: 'https://www.myntra.com/dresses/aura-apparel/silk-floral-wrap-dress/18293041/buy',
    targetProductName: 'Aura Silk Floral Wrap Dress'
  },
  {
    label: 'Flipkart · ProMount 55" TV Wall Mount',
    platform: 'Flipkart',
    url: 'https://www.flipkart.com/promount-heavy-duty-tilting-tv-wall-mount-55-inch/p/itm7a1b89c',
    targetProductName: 'ProMount Heavy-Duty Tilting TV Wall Mount'
  },
  {
    label: 'IKEA · Nordic Comfort 3-Seater Sofa',
    platform: 'IKEA',
    url: 'https://www.ikea.com/in/en/p/nordic-comfort-fabric-sofa-3-seater-slate-grey-80419284',
    targetProductName: 'Nordic Comfort 3-Seater Fabric Sofa'
  },
  {
    label: 'Nykaa · Crocin Advance Paracetamol 500mg',
    platform: 'Nykaa',
    url: 'https://www.nykaa.com/crocin-advance-paracetamol-500mg-tablets/p/928401',
    targetProductName: 'Crocin Advance Paracetamol 500mg Fast Relief'
  }
];

export function parseProductUrl(rawUrl: string): ParsedProductUrlResult {
  const urlTrimmed = rawUrl.trim();
  let urlObj: URL | null = null;
  try {
    urlObj = new URL(urlTrimmed.startsWith('http') ? urlTrimmed : `https://${urlTrimmed}`);
  } catch {
    // If not a standard URL, treat string content for keyword matching
  }

  const hostname = urlObj ? urlObj.hostname.toLowerCase() : '';
  const pathname = urlObj ? urlObj.pathname.toLowerCase() : urlTrimmed.toLowerCase();
  const searchParams = urlObj ? urlObj.search.toLowerCase() : '';
  const combined = `${hostname} ${pathname} ${searchParams}`.toLowerCase();

  let platform: ParsedProductUrlResult['platform'] = 'generic';
  let platformName = 'Online Store';

  if (hostname.includes('amazon') || combined.includes('amazon') || hostname.includes('amzn')) {
    platform = 'amazon';
    platformName = 'Amazon.in';
  } else if (hostname.includes('flipkart') || combined.includes('flipkart')) {
    platform = 'flipkart';
    platformName = 'Flipkart';
  } else if (hostname.includes('myntra') || combined.includes('myntra')) {
    platform = 'myntra';
    platformName = 'Myntra';
  } else if (hostname.includes('ikea') || combined.includes('ikea')) {
    platform = 'ikea';
    platformName = 'IKEA India';
  } else if (hostname.includes('nykaa') || combined.includes('nykaa')) {
    platform = 'nykaa';
    platformName = 'Nykaa';
  } else if (hostname.includes('ajio') || combined.includes('ajio')) {
    platform = 'ajio';
    platformName = 'Ajio';
  } else if (hostname.includes('tatacliq') || combined.includes('tatacliq')) {
    platform = 'tatacliq';
    platformName = 'Tata CLiQ';
  }

  // Extract ASIN or ID if present
  let extractedId: string | undefined = undefined;
  const asinMatch = pathname.match(/\/dp\/([a-z0-9]{10})/i) || pathname.match(/\/gp\/product\/([a-z0-9]{10})/i);
  if (asinMatch) {
    extractedId = asinMatch[1].toUpperCase();
  } else {
    const idMatch = pathname.match(/\/p\/([a-z0-9]+)/i);
    if (idMatch) extractedId = idMatch[1];
  }

  // Extract slug / readable title from path
  const pathParts = pathname.split('/').filter(p => p.length > 2 && p !== 'dp' && p !== 'p' && p !== 'buy' && p !== 'in' && p !== 'en');
  const slugCandidates = pathParts.filter(p => !p.match(/^[0-9]+$/));
  const rawTitle = slugCandidates.length > 0 ? slugCandidates[slugCandidates.length - 1] : pathParts[0] || 'Unknown Product';
  const extractedTitle = rawTitle.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  // Match to MOCK_PRODUCTS
  let matchedProduct: Product | null = null;
  let matchConfidence: ParsedProductUrlResult['matchConfidence'] = 'none';

  // HP Cartridge matching
  if (combined.includes('cartridge') || combined.includes('3ym61ae') || combined.includes('hp-67') || combined.includes('deskjet') || combined.includes('b0852t8b9s')) {
    matchedProduct = MOCK_PRODUCTS.find(p => p.id === 'prod_elec_cartridge_01') || null;
    matchConfidence = 'exact';
  }
  // Aura Silk Dress matching
  else if (combined.includes('silk') || combined.includes('wrap-dress') || combined.includes('aura') || combined.includes('18293041')) {
    matchedProduct = MOCK_PRODUCTS.find(p => p.id === 'prod_clothing_dress_01') || null;
    matchConfidence = 'exact';
  }
  // Urban Midi Dress matching
  else if (combined.includes('midi') || combined.includes('black-dress') || combined.includes('urban-elegance')) {
    matchedProduct = MOCK_PRODUCTS.find(p => p.id === 'prod_clothing_dress_02') || null;
    matchConfidence = 'exact';
  }
  // TV Mount matching
  else if (combined.includes('tv-mount') || combined.includes('wall-mount') || combined.includes('promount') || combined.includes('vesa')) {
    if (combined.includes('85') || combined.includes('ultraslim')) {
      matchedProduct = MOCK_PRODUCTS.find(p => p.id === 'prod_elec_tv_mount_02') || null;
    } else {
      matchedProduct = MOCK_PRODUCTS.find(p => p.id === 'prod_elec_tv_mount_01') || null;
    }
    matchConfidence = 'exact';
  }
  // Nordic Sofa matching
  else if (combined.includes('sofa') || combined.includes('couch') || combined.includes('nordic') || combined.includes('80419284')) {
    matchedProduct = MOCK_PRODUCTS.find(p => p.id === 'prod_furniture_01') || null;
    matchConfidence = 'exact';
  }
  // Dyson Vacuum Filter matching
  else if (combined.includes('dyson') || combined.includes('v11') || combined.includes('hepa') || combined.includes('pureair')) {
    matchedProduct = MOCK_PRODUCTS.find(p => p.id === 'prod_elec_filter_01') || null;
    matchConfidence = 'exact';
  }
  // Crocin Paracetamol matching
  else if (combined.includes('crocin') || combined.includes('paracetamol') || combined.includes('advance') || combined.includes('928401')) {
    matchedProduct = MOCK_PRODUCTS.find(p => p.id === 'prod_pharm_paracetamol') || null;
    matchConfidence = 'exact';
  }
  // Running Shoes matching
  else if (combined.includes('shoe') || combined.includes('running') || combined.includes('sprintpro') || combined.includes('sneaker')) {
    matchedProduct = MOCK_PRODUCTS.find(p => p.id === 'prod_footwear_01') || null;
    matchConfidence = 'high';
  }
  // Spelt Cookies matching
  else if (combined.includes('cookie') || combined.includes('biscuit') || combined.includes('spelt') || combined.includes('honey-crunch')) {
    matchedProduct = MOCK_PRODUCTS.find(p => p.id === 'prod_groc_cookies') || null;
    matchConfidence = 'exact';
  }
  // Anchor Bolt matching
  else if (combined.includes('anchor') || combined.includes('bolt') || combined.includes('fastener') || combined.includes('m8')) {
    matchedProduct = MOCK_PRODUCTS.find(p => p.id === 'prod_hw_anchor_01') || null;
    matchConfidence = 'exact';
  } else {
    // Keyword fallback
    const terms = pathname.split(/[\/\-_]/).filter(t => t.length > 3);
    for (const term of terms) {
      const candidate = MOCK_PRODUCTS.find(p =>
        p.name.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
      );
      if (candidate) {
        matchedProduct = candidate;
        matchConfidence = 'approximate';
        break;
      }
    }
  }

  // Build local store availability list for the matched product
  const localAvailability = matchedProduct ? [
    {
      store: 'FitCheck Central - Devaraja Mohalla',
      store_id: 'store_mysuru_devaraja',
      distance_km: 1.2,
      qty: matchedProduct.variants.reduce((sum, v) => sum + (v.qty || 0), 0) > 0 ? 6 : 0,
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
  ] : [];

  let statusMessage = '';
  if (matchedProduct) {
    statusMessage = `Found in Mysuru! In stock at ${localAvailability.length} nearby stores for pickup today.`;
  } else {
    statusMessage = `Could not find an exact local match for "${extractedTitle}", but you can ask about similar products.`;
  }

  return {
    platform,
    platformName,
    originalUrl: urlTrimmed,
    extractedTitle,
    extractedId,
    matchedProduct,
    matchConfidence,
    localAvailability,
    localPrice: matchedProduct?.price,
    onlinePriceEst: matchedProduct?.price ? Math.round(matchedProduct.price * 1.05 * 100) / 100 : undefined,
    statusMessage
  };
}

