import { Product } from '../types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod_clothing_dress_01",
    name: "Aura Silk Floral Wrap Dress",
    brand: "Aura Apparel",
    category: "clothing",
    price: 78,
    image_url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80",
    variants: [
      { sku: "SKU-AURA-DR-S", name: "Size S", in_stock: true, qty: 4 },
      { sku: "SKU-AURA-DR-M", name: "Size M", in_stock: true, qty: 6 },
      { sku: "SKU-AURA-DR-L", name: "Size L", in_stock: true, qty: 3 },
      { sku: "SKU-AURA-DR-XL", name: "Size XL", in_stock: false, qty: 0 }
    ],
    attributes: {
      size_chart: {
        S: { chest: [32, 34], waist: [26, 28], hip: [34, 36] },
        M: { chest: [35, 37], waist: [28, 29.5], hip: [37, 39] },
        L: { chest: [38, 40], waist: [30, 33], hip: [40, 42] },
        XL: { chest: [41, 43], waist: [34, 37], hip: [43, 46] }
      },
      unit: "inches",
      fit_type: "regular_wrap",
      source_doc: "doc_clothing_aura_dress (Page 2)"
    },
    docs: ["doc_clothing_aura_dress"],
    doc_details: [
      { id: "doc_clothing_aura_dress", name: "Aura Garment Size & Fit Spec Sheet", type: "size_chart", pages: 3 },
      { id: "doc_clothing_aura_care", name: "Mulberry Silk Care & Maintenance Guide", type: "manual", pages: 2 }
    ],
    marketing_copy: "Exquisite mulberry silk floral wrap dress designed for elegant evening soirees and garden brunches. Flowing silhouette with an adjustable self-tie belt."
  },
  {
    id: "prod_clothing_dress_02",
    name: "Urban Elegance Black Midi Dress",
    brand: "Urban Elegance",
    category: "clothing",
    price: 65,
    image_url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80",
    variants: [
      { sku: "SKU-UE-MIDI-S", name: "Size S", in_stock: true, qty: 2 },
      { sku: "SKU-UE-MIDI-M", name: "Size M", in_stock: true, qty: 5 },
      { sku: "SKU-UE-MIDI-L", name: "Size L", in_stock: true, qty: 4 }
    ],
    attributes: {
      size_chart: {
        S: { chest: [32, 34], waist: [26, 28], hip: [34, 37] },
        M: { chest: [35, 37], waist: [29, 31], hip: [38, 40] },
        L: { chest: [38, 41], waist: [32, 35], hip: [41, 44] }
      },
      unit: "inches",
      fit_type: "bodycon_stretch",
      source_doc: "doc_clothing_urban_midi (Page 1)"
    },
    docs: ["doc_clothing_urban_midi"],
    doc_details: [
      { id: "doc_clothing_urban_midi", name: "Urban Elegance Size & Stretch Guide", type: "size_chart", pages: 2 }
    ],
    marketing_copy: "A timeless black midi dress tailored from medium-weight stretch crepe that contours comfortably to your natural silhouette."
  },
  {
    id: "prod_elec_cartridge_01",
    name: "Original HP 67 Black Ink Cartridge",
    brand: "HP",
    category: "electronics_accessory",
    price: 21.99,
    image_url: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=600&q=80",
    variants: [
      { sku: "SKU-HP67-STD", name: "Standard 67 (120 pages)", in_stock: true, qty: 8 },
      { sku: "SKU-HP67-XL", name: "High Yield 67XL (240 pages)", in_stock: true, qty: 4 }
    ],
    attributes: {
      compatible_printers: [
        "HP DeskJet 2331",
        "HP DeskJet 2722",
        "HP DeskJet 2723",
        "HP DeskJet 2755",
        "HP DeskJet Plus 4155",
        "HP ENVY 6055",
        "HP ENVY Pro 6455"
      ],
      ink_type: "Pigment Black",
      model_series: "HP 67 Series"
    },
    docs: ["doc_elec_hp_cartridge"],
    doc_details: [
      { id: "doc_elec_hp_cartridge", name: "HP DeskJet 2300 Compatibility Guide", type: "spec_sheet", pages: 4 },
      { id: "doc_elec_hp_install", name: "Ink Cartridge Handling & Installation Sheet", type: "manual", pages: 2 }
    ],
    marketing_copy: "Original HP ink cartridges deliver reliable performance, consistent page yields, and standout results with rich black text."
  },
  {
    id: "prod_elec_tv_mount_01",
    name: "ProMount Heavy-Duty Tilting TV Wall Mount",
    brand: "ProMount",
    category: "electronics_accessory",
    price: 49.99,
    image_url: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=600&q=80",
    variants: [
      { sku: "SKU-PM-TILT-55", name: "32\" - 55\" Tilt Bracket", in_stock: true, qty: 7 }
    ],
    attributes: {
      supported_vesa_patterns: [
        "75x75", "100x100", "200x100", "200x200", "300x300", "400x200", "400x400"
      ],
      max_tv_size_inches: 55,
      min_tv_size_inches: 32,
      max_weight_kg: 30,
      tilt_degrees: 12
    },
    docs: ["doc_elec_tv_mount_promount"],
    doc_details: [
      { id: "doc_elec_tv_mount_promount", name: "ProMount Architectural & Installation Manual", type: "manual", pages: 8 },
      { id: "doc_elec_vesa_guide", name: "Universal VESA Mounting Standards Table", type: "spec_sheet", pages: 2 }
    ],
    marketing_copy: "Engineered from commercial-grade cold rolled steel to hold medium displays up to 55 inches safely with quick-release pull cords."
  },
  {
    id: "prod_elec_tv_mount_02",
    name: "UltraSlim Large TV Mount 85\"",
    brand: "ProMount",
    category: "electronics_accessory",
    price: 79.99,
    image_url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80",
    variants: [
      { sku: "SKU-PM-TILT-85", name: "55\" - 85\" XL Frame", in_stock: true, qty: 3 }
    ],
    attributes: {
      supported_vesa_patterns: [
        "200x200", "300x300", "400x400", "600x400", "800x400"
      ],
      max_tv_size_inches: 85,
      min_tv_size_inches: 55,
      max_weight_kg: 65
    },
    docs: ["doc_elec_tv_mount_ultraslim"],
    doc_details: [
      { id: "doc_elec_tv_mount_ultraslim", name: "UltraSlim Heavy-Duty VESA Spec Sheet", type: "spec_sheet", pages: 6 }
    ],
    marketing_copy: "Extra wide dual-stud TV wall mount supporting screens up to 85 inches and 600x400 VESA configurations."
  },
  {
    id: "prod_furniture_01",
    name: "Nordic Comfort 3-Seater Fabric Sofa",
    brand: "Nordic Living",
    category: "furniture",
    price: 499,
    image_url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
    variants: [
      { sku: "SKU-NL-SOFA-GRY", name: "Slate Grey", in_stock: true, qty: 2 },
      { sku: "SKU-NL-SOFA-BEI", name: "Oat Beige", in_stock: true, qty: 1 }
    ],
    attributes: {
      assembled_width_cm: 210,
      assembled_depth_cm: 88,
      assembled_height_cm: 82,
      packaged_width_cm: null, // intentionally missing to trigger CANNOT_CONFIRM
      packaged_depth_cm: null,
      packaged_height_cm: null,
      detachable_legs: true,
      min_door_clearance_without_legs_cm: 76
    },
    docs: ["doc_furn_nordic_sofa"],
    doc_details: [
      { id: "doc_furn_nordic_sofa", name: "Nordic Living Dimensional Sheet & Assembly Manual", type: "spec_sheet", pages: 5 }
    ],
    marketing_copy: "Minimalist Scandinavian design with pocket spring support, textured polyester weave, and solid tapered birch wood legs."
  },
  {
    id: "prod_elec_filter_01",
    name: "PureAir Post-Motor HEPA Filter for Dyson Vacuums",
    brand: "PureAir",
    category: "electronics_accessory",
    price: 24.99,
    image_url: "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=600&q=80",
    variants: [
      { sku: "SKU-PA-DY-V11", name: "Standard 1-Pack", in_stock: true, qty: 12 }
    ],
    attributes: {
      compatible_vacuums: [
        "Dyson V11 Absolute",
        "Dyson V11 Torque Drive",
        "Dyson V11 Animal",
        "Dyson V15 Detect",
        "Dyson Outsize"
      ],
      incompatible_vacuums: [
        "Dyson V7",
        "Dyson V8",
        "Dyson V10"
      ],
      filter_grade: "H13 HEPA"
    },
    docs: ["doc_elec_pureair_dyson"],
    doc_details: [
      { id: "doc_elec_pureair_dyson", name: "PureAir Replacement Filter Cross-Reference Chart", type: "spec_sheet", pages: 2 }
    ],
    marketing_copy: "Washable replacement post-motor filter capturing 99.97% of particulates down to 0.3 microns."
  },
  {
    id: "prod_pharm_paracetamol",
    name: "Crocin Advance Paracetamol 500mg Fast Relief",
    brand: "Crocin",
    category: "grocery_pharmacy",
    price: 2.50,
    image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
    variants: [
      { sku: "SKU-CROCIN-15", name: "Strip of 15 Tablets", in_stock: true, qty: 45 },
      { sku: "SKU-CROCIN-30", name: "Pack of 30 Tablets", in_stock: true, qty: 20 }
    ],
    attributes: {
      active_ingredient: "Paracetamol 500 mg",
      gluten_free: true,
      lactose_free: true,
      vegetarian: true,
      nut_free: true,
      dosage_form: "Tablet",
      prescription_required: false
    },
    docs: ["doc_pharm_crocin_leaf"],
    doc_details: [
      { id: "doc_pharm_crocin_leaf", name: "Crocin Advance Packaging Facts & Patient Leaflet", type: "label_facts", pages: 4 }
    ],
    marketing_copy: "Fast-acting formulation with Optizorb technology for prompt relief from fever, headache, body ache and mild pain."
  },
  {
    id: "prod_groc_cookies",
    name: "Artisan Spelt & Honey Crunch Cookies",
    brand: "Natures Best",
    category: "grocery_pharmacy",
    price: 4.99,
    image_url: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80",
    variants: [
      { sku: "SKU-NB-COOK-250", name: "250g Box", in_stock: true, qty: 14 }
    ],
    attributes: {
      gluten_free: false,
      contains_wheat: true,
      contains_spelt: true,
      organic: true
    },
    docs: ["doc_groc_spelt_cookies"],
    doc_details: [
      { id: "doc_groc_spelt_cookies", name: "Product Nutritional Label & Allergen Declaration", type: "label_facts", pages: 1 }
    ],
    marketing_copy: "Slow-baked spelt flour biscuits sweetened with pure wildflower honey."
  },
  {
    id: "prod_clothing_dress_03",
    name: "Boho Cotton Tiered Dress",
    brand: "Meadow Walk",
    category: "clothing",
    price: 55,
    image_url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=600&q=80",
    variants: [
      { sku: "SKU-MW-TIER-S", name: "Size S", in_stock: true, qty: 3 },
      { sku: "SKU-MW-TIER-M", name: "Size M", in_stock: true, qty: 4 },
      { sku: "SKU-MW-TIER-L", name: "Size L", in_stock: false, qty: 0 }
    ],
    attributes: {
      size_chart: {
        S: { chest: [32, 34], waist: [26, 28], hip: [35, 38] },
        M: { chest: [35, 37], waist: [28, 31], hip: [38, 42] },
        L: { chest: [38, 41], waist: [32, 35], hip: [42, 45] }
      },
      unit: "inches"
    },
    docs: ["doc_clothing_meadow_walk"],
    doc_details: [
      { id: "doc_clothing_meadow_walk", name: "Meadow Walk Sizing & Fabric Specifications", type: "size_chart", pages: 2 }
    ],
    marketing_copy: "Breezy tiered cotton dress with elbow-length puff sleeves."
  },
  {
    id: "prod_clothing_dress_04",
    name: "Classic Evening Gown",
    brand: "Aura Apparel",
    category: "clothing",
    price: 110,
    image_url: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=80",
    variants: [
      { sku: "SKU-AURA-GWN-S", name: "Size S", in_stock: false, qty: 0 },
      { sku: "SKU-AURA-GWN-M", name: "Size M", in_stock: true, qty: 2 },
      { sku: "SKU-AURA-GWN-L", name: "Size L", in_stock: true, qty: 5 }
    ],
    attributes: {
      size_chart: {
        M: { chest: [35, 37], waist: [29, 31], hip: [38, 41] },
        L: { chest: [38, 40], waist: [31, 34], hip: [41, 44] }
      },
      unit: "inches"
    },
    docs: ["doc_clothing_aura_gown"],
    doc_details: [
      { id: "doc_clothing_aura_gown", name: "Aura Haute Collection Sizing Spec", type: "size_chart", pages: 3 }
    ],
    marketing_copy: "Floor-length floor-grazing formal gown with sweetheart neckline."
  },
  {
    id: "prod_footwear_01",
    name: "SprintPro Aero Running Shoes",
    brand: "SprintPro Athletic",
    category: "footwear",
    price: 89.99,
    image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    variants: [
      { sku: "SKU-SP-AERO-UK6", name: "UK-6", in_stock: true, qty: 3 },
      { sku: "SKU-SP-AERO-UK7", name: "UK-7", in_stock: true, qty: 5 },
      { sku: "SKU-SP-AERO-UK8", name: "UK-8", in_stock: true, qty: 4 },
      { sku: "SKU-SP-AERO-UK9", name: "UK-9", in_stock: true, qty: 6 },
      { sku: "SKU-SP-AERO-UK10", name: "UK-10", in_stock: false, qty: 0 }
    ],
    attributes: {
      size_chart: {
        "UK-6": [24.5, 25.0],
        "UK-7": [25.1, 25.8],
        "UK-8": [25.9, 26.6],
        "UK-9": [26.7, 27.5],
        "UK-10": [27.6, 28.3]
      },
      gender: "unisex",
      source_doc: "doc_footwear_sprintpro (Page 2)"
    },
    docs: ["doc_footwear_sprintpro"],
    doc_details: [
      { id: "doc_footwear_sprintpro", name: "SprintPro Footwear Technical Fit Matrix", type: "size_chart", pages: 3 }
    ],
    marketing_copy: "Engineered for speed, energy return and seamless marathon performance on any road."
  },
  {
    id: "prod_hw_anchor_01",
    name: "Shield Anchor Bolt M8 Heavy-Duty",
    brand: "ForgeTorque Fixings",
    category: "hardware",
    price: 14.50,
    image_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    variants: [
      { sku: "SKU-FT-SA-M8-4PK", name: "M8 4-Pack", in_stock: true, qty: 25 }
    ],
    attributes: {
      thread_size: "M8",
      load_rating_kg: 150,
      material: "Stainless Steel 304",
      suitable_substrates: ["concrete", "solid brick", "stone"],
      source_doc: "doc_hw_m8_anchor (Page 2)"
    },
    docs: ["doc_hw_m8_anchor"],
    doc_details: [
      { id: "doc_hw_m8_anchor", name: "ForgeTorque Structural Anchor Specifications", type: "spec_sheet", pages: 2 }
    ],
    marketing_copy: "Industrial-grade expanding anchor bolts for mounting heavy structural gates, machinery, and brackets."
  }
];
