import { ProductQuestionnaire } from '../types/questionnaire';

export const PRODUCT_QUESTIONNAIRES: Record<string, ProductQuestionnaire> = {
  // 1. Aura Silk Floral Wrap Dress
  prod_clothing_dress_01: {
    productId: 'prod_clothing_dress_01',
    productName: 'Aura Silk Floral Wrap Dress',
    category: 'clothing',
    headline: 'Check your size fit against Aura sizing specs',
    whyAsk: 'Mulberry silk woven fabric has minimal stretch. We check your bust and waist against official garment tolerances to avoid fit disappointment.',
    questions: [
      {
        id: 'dress_size_fit',
        title: 'Select your body measurements to check Size M / L fit:',
        inputType: 'options',
        options: [
          {
            label: 'Bust 36", Waist 30" (Check Size M)',
            sublabel: 'Tests Size M fit — will advise if snug at waist',
            prompt: 'I am bust 36, waist 30. Will the M fit?',
            isRecommended: true
          },
          {
            label: 'Bust 34", Waist 27" (Check Size S)',
            sublabel: 'Comfortable fit for Size S (waist 26–28")',
            prompt: 'I have bust 34 and waist 27. Will Size S fit me?'
          },
          {
            label: 'Bust 39", Waist 32" (Check Size L)',
            sublabel: 'Roomy relaxed fit for Size L (waist 30–33")',
            prompt: 'My measurements are bust 39, waist 32. Does Size L fit?'
          }
        ],
        measurementFields: [
          { id: 'bust', label: 'Bust / Chest', placeholder: 'e.g. 36', unit: 'in' },
          { id: 'waist', label: 'Waist', placeholder: 'e.g. 30', unit: 'in' },
          { id: 'hip', label: 'Hips', placeholder: 'e.g. 38', unit: 'in' }
        ]
      }
    ]
  },

  // 2. Urban Elegance Black Midi Dress
  prod_clothing_dress_02: {
    productId: 'prod_clothing_dress_02',
    productName: 'Urban Elegance Black Midi Dress',
    category: 'clothing',
    headline: 'Check your fit for stretch crepe fabric',
    whyAsk: 'Features medium-weight stretch crepe that contours to hips. We check if your waist and hips match comfortably.',
    questions: [
      {
        id: 'midi_measurements',
        title: 'Choose your measurement range:',
        inputType: 'options',
        options: [
          {
            label: 'Bust 36", Waist 30", Hip 39" (Size M)',
            sublabel: 'Standard Medium fit (waist 29–31")',
            prompt: 'Black dress, size M, available near me today',
            isRecommended: true
          },
          {
            label: 'Bust 33", Waist 27", Hip 36" (Size S)',
            sublabel: 'Tailored fit for Size S',
            prompt: 'Will the Urban Elegance black dress size S fit bust 33 waist 27?'
          },
          {
            label: 'Bust 40", Waist 33", Hip 42" (Size L)',
            sublabel: 'Comfort fit for Size L',
            prompt: 'Will the Size L fit bust 40 waist 33?'
          }
        ]
      }
    ]
  },

  // 3. Original HP 67 Black Ink Cartridge
  prod_elec_cartridge_01: {
    productId: 'prod_elec_cartridge_01',
    productName: 'Original HP 67 Black Ink Cartridge',
    category: 'electronics_accessory',
    headline: 'Verify printer hardware compatibility',
    whyAsk: 'HP cartridges only lock into specific printer carriage models. We check your printer series against HP certified firmware tables.',
    questions: [
      {
        id: 'printer_model',
        title: 'Which printer model do you own?',
        inputType: 'options',
        options: [
          {
            label: 'HP DeskJet 2331 All-in-One',
            sublabel: 'Certified compatible · Ready for pickup today',
            prompt: 'Does this cartridge work with my HP DeskJet 2331?',
            isRecommended: true
          },
          {
            label: 'HP DeskJet 2722 / 2723',
            sublabel: 'Standard HP 67 series printer',
            prompt: 'Does HP 67 work with HP DeskJet 2722?'
          },
          {
            label: 'HP ENVY 6055 / 6455',
            sublabel: 'Certified for ENVY wireless series',
            prompt: 'Will HP 67 cartridge work in HP ENVY 6055?'
          },
          {
            label: 'HP LaserJet / OfficeJet (Other)',
            sublabel: 'LaserJet uses toner, not ink cartridges',
            prompt: 'Does this work on HP LaserJet Pro?'
          }
        ]
      }
    ]
  },

  // 4. ProMount Heavy-Duty Tilting TV Wall Mount
  prod_elec_tv_mount_01: {
    productId: 'prod_elec_tv_mount_01',
    productName: 'ProMount Heavy-Duty Tilting TV Wall Mount',
    category: 'electronics_accessory',
    headline: 'Check TV screen size & VESA bolt pattern',
    whyAsk: 'TV mounts require exact bracket screw hole spacing (VESA in mm) and weight rating limits to prevent wall collapse.',
    questions: [
      {
        id: 'tv_vesa_specs',
        title: 'Select your TV display specs:',
        inputType: 'options',
        options: [
          {
            label: '55" TV, 200x200 mm VESA, 18 kg',
            sublabel: 'Fits securely within 55" and 30 kg limit',
            prompt: 'TV wall mount for a 55 inch TV with 200x200 VESA',
            isRecommended: true
          },
          {
            label: '75" TV, 600x400 mm VESA, 35 kg',
            sublabel: 'Exceeds 55" limit — we will suggest the 85" XL mount',
            prompt: 'I have a 75 inch TV with 600x400 VESA weighing 35kg. Will this mount fit?'
          },
          {
            label: '43" TV, 100x100 mm VESA, 12 kg',
            sublabel: 'Fully compatible small/medium bracket',
            prompt: 'Will this mount work for a 43 inch Samsung TV?'
          }
        ]
      }
    ]
  },

  // 5. Nordic Comfort 3-Seater Fabric Sofa
  prod_furniture_01: {
    productId: 'prod_furniture_01',
    productName: 'Nordic Comfort 3-Seater Fabric Sofa',
    category: 'furniture',
    headline: 'Check entryway & doorway clearance',
    whyAsk: 'Sofas frequently cannot pass through apartment doorways, stairwell corners, or lift doors. We calculate turning radius from dimensions.',
    questions: [
      {
        id: 'door_clearance',
        title: 'What is your narrowest doorway clearance?',
        inputType: 'options',
        options: [
          {
            label: '80 cm door width (Standard doorway)',
            sublabel: 'Checks unpacked 76 cm frame vs missing box specs',
            prompt: 'Sofa that fits through an 80 cm door',
            isRecommended: true
          },
          {
            label: '75 cm door width (Narrow entrance)',
            sublabel: 'Tighter than sofa minimum 76 cm body height',
            prompt: 'Can this sofa fit through a 75 cm doorway without legs?'
          },
          {
            label: '90 cm+ double door / wide entrance',
            sublabel: 'Ample space for delivery',
            prompt: 'Will this sofa fit through a 90 cm wide front door?'
          }
        ]
      }
    ]
  },

  // 6. PureAir Post-Motor HEPA Filter for Dyson
  prod_elec_filter_01: {
    productId: 'prod_elec_filter_01',
    productName: 'PureAir Post-Motor HEPA Filter for Dyson Vacuums',
    category: 'electronics_accessory',
    headline: 'Verify vacuum locking collar & model',
    whyAsk: 'Dyson filters look similar, but collar tabs and sealing gaskets differ significantly across generations (V8 vs V11).',
    questions: [
      {
        id: 'vacuum_model',
        title: 'Which Dyson vacuum model do you own?',
        inputType: 'options',
        options: [
          {
            label: 'Dyson V11 Absolute / Torque Drive',
            sublabel: 'Certified exact fit with airtight H13 seal',
            prompt: 'Does this filter fit my Dyson V11 Torque Drive?',
            isRecommended: true
          },
          {
            label: 'Dyson V15 Detect / Outsize',
            sublabel: 'Compatible with V15 series twist-lock',
            prompt: 'Does this filter fit my Dyson V15 Detect?'
          },
          {
            label: 'Dyson V8 Animal / Absolute',
            sublabel: 'Uses 64 mm collar — incompatible with V11 filter',
            prompt: 'Does this filter fit my Dyson V8 Animal?'
          },
          {
            label: 'Not sure / General vacuum',
            sublabel: 'Asks clarifying question to verify your model',
            prompt: 'Does this filter fit my vacuum?'
          }
        ]
      }
    ]
  },

  // 7. Crocin Advance Paracetamol 500mg
  prod_pharm_paracetamol: {
    productId: 'prod_pharm_paracetamol',
    productName: 'Crocin Advance Paracetamol 500mg Fast Relief',
    category: 'grocery_pharmacy',
    headline: 'Verify dietary label facts & active ingredients',
    whyAsk: 'FitCheck verifies packaging allergen declarations and excipients while providing safe medical guidance to consult a doctor.',
    questions: [
      {
        id: 'pharm_dietary',
        title: 'What allergen or dietary requirement do you have?',
        inputType: 'options',
        options: [
          {
            label: 'Gluten-Free & Lactose-Free verification',
            sublabel: 'Verified gluten-free excipients on packaging facts',
            prompt: 'I need a gluten-free pain reliever. Is Crocin Advance gluten-free?',
            isRecommended: true
          },
          {
            label: 'Vegetarian certified check',
            sublabel: 'Confirm no animal gelatins in tablet binder',
            prompt: 'Is Crocin Advance vegetarian certified?'
          }
        ]
      }
    ]
  },

  // 8. SprintPro Aero Running Shoes
  prod_footwear_01: {
    productId: 'prod_footwear_01',
    productName: 'SprintPro Aero Running Shoes',
    category: 'footwear',
    headline: 'Check foot length & UK shoe size',
    whyAsk: 'Footwear sizing varies by manufacturer. We check your foot length in cm against the brand-specific sizing matrix.',
    questions: [
      {
        id: 'shoe_size',
        title: 'Select your foot length or standard UK size:',
        inputType: 'options',
        options: [
          {
            label: '27.5 cm foot length (UK 9)',
            sublabel: '6 in stock at Devaraja Mohalla today',
            prompt: 'SprintPro running shoes size 9 for 27.5 cm foot',
            isRecommended: true
          },
          {
            label: '26.5 cm foot length (UK 8)',
            sublabel: '4 in stock for immediate pickup',
            prompt: 'Will SprintPro Aero UK 8 fit a 26.5 cm foot length?'
          },
          {
            label: '25.5 cm foot length (UK 7)',
            sublabel: '5 in stock today',
            prompt: 'SprintPro running shoes UK 7'
          }
        ]
      }
    ]
  },

  // 9. Artisan Spelt & Honey Crunch Cookies
  prod_groc_cookies: {
    productId: 'prod_groc_cookies',
    productName: 'Artisan Spelt & Honey Crunch Cookies',
    category: 'grocery_pharmacy',
    headline: 'Check allergen label facts for gluten/spelt',
    whyAsk: 'Spelt is an ancient grain that contains gluten. We check allergen warnings against dietary restrictions.',
    questions: [
      {
        id: 'cookie_dietary',
        title: 'What dietary requirement are you checking?',
        inputType: 'options',
        options: [
          {
            label: 'Gluten-free diet check',
            sublabel: 'Flags spelt as containing wheat/gluten',
            prompt: 'Gluten-free biscuits nearby',
            isRecommended: true
          },
          {
            label: 'Organic certification check',
            sublabel: 'Verifies wild honey & organic spelt certification',
            prompt: 'Are the Artisan Spelt cookies 100% organic certified?'
          }
        ]
      }
    ]
  },

  // 10. Shield Anchor Bolt M8 Heavy-Duty
  prod_hw_anchor_01: {
    productId: 'prod_hw_anchor_01',
    productName: 'Shield Anchor Bolt M8 Heavy-Duty',
    category: 'hardware',
    headline: 'Check wall substrate & load rating',
    whyAsk: 'Anchor bolts must match wall material (concrete vs hollow brick) and mechanical shear load capacity.',
    questions: [
      {
        id: 'anchor_specs',
        title: 'What wall substrate and load are you installing?',
        inputType: 'options',
        options: [
          {
            label: 'Concrete wall, 150 kg shear load',
            sublabel: 'M8 expansion sleeve rated for 150 kg in concrete',
            prompt: 'Shield Anchor Bolt M8 for concrete wall up to 150kg',
            isRecommended: true
          },
          {
            label: 'Hollow drywall / plasterboard',
            sublabel: 'Expansion anchors are unsuitable for hollow drywall',
            prompt: 'Can I use M8 shield anchor in hollow drywall?'
          }
        ]
      }
    ]
  }
};

export function getQuestionnaireForProduct(productId: string): ProductQuestionnaire | null {
  return PRODUCT_QUESTIONNAIRES[productId] || null;
}

