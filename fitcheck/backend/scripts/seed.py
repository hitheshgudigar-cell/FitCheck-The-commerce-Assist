import os
import json
import sqlite3
from pathlib import Path
from datetime import datetime

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DOCS_DIR = DATA_DIR / "docs"
PRODUCTS_FILE = DATA_DIR / "products.json"
STORES_FILE = DATA_DIR / "stores.json"
DB_FILE = DATA_DIR / "inventory.db"

def build_seed_data():
    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    
    # ----------------------------------------------------
    # Authoritative Documents
    # ----------------------------------------------------
    docs = {
        "doc_clothing_aura_dress": """[page 1]
AURA APPAREL SPECIFICATION SHEET - AURA SILK FLORAL WRAP DRESS (STYLE #AU-302)
Fabrication: 100% Habotai Mulberry Silk with Polyester Crepe Lining.
Fit Profile: Tailored bodice with adjustable wrap closure, A-line skirt drape.

[page 2]
OFFICIAL BODY MEASUREMENT SIZE CHART (ALL MEASUREMENTS IN INCHES):
- Size S: Bust 32 - 34 in | Waist 26 - 28 in | Hip 34 - 36 in | Length 42 in
- Size M: Bust 35 - 37 in | Waist 28 - 29.5 in | Hip 37 - 39 in | Length 43 in
- Size L: Bust 38 - 40 in | Waist 30 - 33 in | Hip 40 - 42 in | Length 44 in
- Size XL: Bust 41 - 43 in | Waist 34 - 37 in | Hip 43 - 46 in | Length 45 in
Fitting Note: Garment has zero stretch. Shoppers with measurements falling at the upper threshold of waist tolerance are advised to size up to avoid tension along side seams.
""",
        "doc_clothing_urban_midi": """[page 1]
URBAN ELEGANCE TECHNICAL GARMENT MANUAL - BLACK MIDI DRESS (REF #UE-MD-09)
Construction: 95% Organic Cotton, 5% Spandex stretch jersey.

[page 2]
SIZE CHART SPECIFICATIONS (INCHES):
- Size S: Bust 33 - 35 in | Waist 26 - 28 in | Hip 35 - 37 in
- Size M: Bust 36 - 38 in | Waist 29 - 31 in | Hip 38 - 40 in
- Size L: Bust 39 - 41 in | Waist 32 - 34 in | Hip 41 - 43 in
- Size XL: Bust 42 - 44 in | Waist 35 - 38 in | Hip 44 - 47 in
Care Instructions: Cold machine wash inside out. Dry in shade.
""",
        "doc_clothing_boho_dress": """[page 1]
BOHO CRAFT GARMENT SPEC SHEET - TIERED COTTON MAXI DRESS (REF #BC-TM-44)
Fabric: 100% Breathable Cambric Cotton.
Fit: Relaxed Bohemian tiered silhouette.

[page 2]
SIZE GUIDE (INCHES):
- Size S: Bust 32 - 34 in | Waist 26 - 28 in | Hip Free / Flare
- Size M: Bust 35 - 37 in | Waist 28 - 30 in | Hip Free / Flare
- Size L: Bust 38 - 40 in | Waist 31 - 33 in | Hip Free / Flare
- Size XL: Bust 41 - 43 in | Waist 34 - 36 in | Hip Free / Flare
""",
        "doc_clothing_evening_gown": """[page 1]
ATELIER ROYALE COUTURE - CLASSIC EVENING GOWN SPECIFICATION (#AR-EG-77)
Structured boned bodice with satin mermaid flare.

[page 2]
PRECISION SIZING (INCHES):
- Size S: Bust 32 - 33 in | Waist 25 - 26 in | Hip 35 - 36 in
- Size M: Bust 34 - 35.5 in | Waist 27 - 28.5 in | Hip 37 - 38.5 in
- Size L: Bust 36 - 38 in | Waist 29 - 31 in | Hip 39 - 41 in
- Size XL: Bust 39 - 41 in | Waist 32 - 34 in | Hip 42 - 44 in
""",
        "doc_clothing_kurta_cotton": """[page 1]
VIRAASAT ETHNIC WEAR - CLASSIC COTTON MENS KURTA SPECIFICATION (SKU: VK-CC-01)
Material: 100% Handloom Cotton. Straight cut with side slits.

[page 2]
CHEST SIZING CHART (INCHES):
- Size 38 (S): Chest 37 - 39 in | Kurta Chest 42 in | Shoulder 17.5 in
- Size 40 (M): Chest 39 - 41 in | Kurta Chest 44 in | Shoulder 18.0 in
- Size 42 (L): Chest 41 - 43 in | Kurta Chest 46 in | Shoulder 18.5 in
- Size 44 (XL): Chest 43 - 45 in | Kurta Chest 48 in | Shoulder 19.0 in
""",
        "doc_clothing_kurta_silk": """[page 1]
VIRAASAT ETHNIC WEAR - FESTIVE SILK EMBROIDERED KURTA (SKU: VK-SK-02)
Material: Tussar Silk blend with zari border.

[page 2]
SIZE SPECIFICATION TABLE (INCHES):
- Size 38 (S): Body Chest 37 - 39 in | Body Waist 32 - 34 in
- Size 40 (M): Body Chest 39 - 41 in | Body Waist 34 - 36 in
- Size 42 (L): Body Chest 41 - 43 in | Body Waist 36 - 38 in
- Size 44 (XL): Body Chest 43 - 45 in | Body Waist 38 - 40 in
""",
        "doc_footwear_sprintpro": """[page 1]
SPRINTPRO ATHLETIC ENGINEERING - AERO RUNNING SHOE SIZING MANUAL (MODEL: SP-AERO-01)
Last Type: Neutral biomechanical running shoe.

[page 2]
OFFICIAL FOOT LENGTH FITMENT TABLE (CENTIMETERS TO UK SIZE):
- UK-6: Foot Length 24.5 - 25.0 cm (US 7 / EU 40)
- UK-7: Foot Length 25.1 - 25.8 cm (US 8 / EU 41)
- UK-8: Foot Length 25.9 - 26.6 cm (US 9 / EU 42)
- UK-9: Foot Length 26.7 - 27.5 cm (US 10 / EU 43)
- UK-10: Foot Length 27.6 - 28.3 cm (US 11 / EU 44)
Fit Warning: Running shoe allows 5mm toe-box clearance automatically when mapped to foot length.
""",
        "doc_footwear_derby": """[page 1]
OXFORD & CO. CRAFTED FOOTWEAR - DERBY LEATHER SHOE FITMENT SPECIFICATION
Full grain calfskin with Goodyear welted sole.

[page 2]
FOOT MEASUREMENT CONVERSION TABLE:
- UK-7: Foot Length 25.0 - 25.7 cm
- UK-8: Foot Length 25.8 - 26.5 cm
- UK-9: Foot Length 26.6 - 27.4 cm
- UK-10: Foot Length 27.5 - 28.2 cm
""",
        "doc_footwear_hiking": """[page 1]
TRAILGRIP OUTDOORS - EXPEDITION HIKING BOOTS SPECIFICATION (#TG-HIK-09)
Waterproof Vibram outsole with reinforced toe cap.

[page 2]
FOOT SIZING CHART (CENTIMETERS):
- UK-7: Foot Length 25.2 - 25.9 cm
- UK-8: Foot Length 26.0 - 26.7 cm
- UK-9: Foot Length 26.8 - 27.6 cm
- UK-10: Foot Length 27.7 - 28.5 cm
""",
        "doc_footwear_glidestride": """[page 1]
GLIDESTRIDE WALKING COMFORT - SNEAKER FIT GUIDE (#GS-WALK-12)
Ultra foam cushioning sole with memory foam insole.

[page 2]
SIZING SPECIFICATION:
- UK-6: Foot Length 24.5 - 25.0 cm
- UK-7: Foot Length 25.1 - 25.8 cm
- UK-8: Foot Length 25.9 - 26.6 cm
- UK-9: Foot Length 26.7 - 27.5 cm
""",
        "doc_furniture_nordic_sofa": """[page 1]
NORDIC LIVING - 3-SEATER FABRIC SOFA ASSEMBLY & LOGISTICS MANUAL (MODEL #NL-S3-GRY)
Assembled Dimensions: Length 212 cm, Depth 88 cm, Height 82 cm. Total Weight: 52 kg.

[page 2]
PACKAGED SHIPPING BOX SPECIFICATIONS:
- Box Dimensions: Length 180 cm x Width 85 cm x Height 75 cm.
- Packaged Gross Weight: 56.5 kg.
- Minimum Passage Clearance: Entry doors and hallways must have a minimum clear passage width of 75 cm (when rotated along minimum height profile) or 85 cm for standard orientation.
""",
        "doc_furniture_wardrobe": """[page 1]
SCANWOOD FURNITURE - 2-DOOR WARDROBE TECHNICAL DATASHEET (#SW-WD-02)
Engineered hardwood wardrobe with dual hanging rails and top shelf.
Assembled Dimensions: 195 cm (H) x 90 cm (W) x 55 cm (D).

[page 2]
FLAT-PACK SHIPPING SPECIFICATIONS:
- Package Box 1 of 2: 200 cm x 92 cm x 12 cm (Gross Weight: 38 kg).
- Package Box 2 of 2: 95 cm x 58 cm x 14 cm (Gross Weight: 26 kg).
Minimum Passage Requirement: Single door width minimum 40 cm, height clearance minimum 95 cm.
""",
        "doc_furniture_studio_couch": """[page 1]
METRO LIVING - STUDIO SECTIONAL COUCH SPECIFICATION SHEET (#ML-SEC-01)
Configuration: L-shaped 4-seater modular living room sectional.
Assembled Dimensions: 220 cm (Width) x 150 cm (Chaise Depth) x 85 cm (Height).

[page 2]
PACKAGING AND DELIVERY NOTICE:
Pre-assembled modular frame delivered in protective non-woven wrap.
CRITICAL NOTE: Packaged crate and exterior shipping carton dimensions are currently not registered by manufacturer logistics. Unboxed modular delivery requires on-site measurement.
""",
        "doc_furniture_dining_table": """[page 1]
KAVITA TIMBER CRAFT - SOLID TEAK 6-SEATER DINING TABLE SPECIFICATION (#KT-DT-06)
100% Seasoned Plantation Teak Wood with polyurethane lacquer.

[page 2]
SHIPPING BOX SPECIFICATIONS:
- Table Top Package: 160 cm (Length) x 95 cm (Width) x 22 cm (Height). Weight: 36 kg.
- Table Legs Package: 80 cm x 25 cm x 25 cm. Weight: 12 kg.
Clearance Notice: Minimum clear doorway opening required: 25 cm if tilted, 95 cm for horizontal transport.
""",
        "doc_elec_hp67": """[page 1]
HEWLETT PACKARD ORIGINAL INK SUPPLIES - HP 67 BLACK INK CARTRIDGE (3YM56AN)
Product Description: Standard Yield Pigment Black Ink Cartridge.
Page Yield: Approximately 120 pages at 5% standard ISO/IEC 24711 coverage.

[page 2]
AUTHORITATIVE HARDWARE COMPATIBILITY MATRIX:
The HP 67 Black Original Ink Cartridge is certified and guaranteed compatible ONLY with the following printer models:
- HP DeskJet 1255, 2331, 2332, 2333, 2710, 2720, 2722, 2723, 2724, 2725, 2729, 2755
- HP DeskJet Plus 4120, 4122, 4123, 4132, 4152, 4155, 4158
- HP ENVY 6010, 6020, 6022, 6030, 6032, 6052, 6055, 6058, 6420, 6452, 6455
Non-Compatible Notice: Not compatible with HP LaserJet, OfficeJet Pro 8000/9000, or DeskJet 1112/2130 series.
""",
        "doc_elec_tv_mount_promount": """[page 1]
PROMOUNT HEAVY-DUTY TILTING TV WALL BRACKET - TECHNICAL SPEC SHEET (#PM-T65)
Applicable Screen Sizes: 32 inches to 65 inches flat and curved panels.
Maximum Load Capacity: 45 kg (99 lbs) safety tested to 3x load factor.

[page 2]
VESA COMPATIBILITY TABLE:
Certified VESA Patterns:
- 100x100 mm
- 200x200 mm
- 300x300 mm
- 400x400 mm
Incompatible Notice: Does NOT support VESA 600x400 mm, 800x400 mm, or 75x75 mm patterns. TVs exceeding 45 kg must NOT be mounted with this bracket.
""",
        "doc_elec_tv_mount_ultraslim": """[page 1]
PROMOUNT ULTRASLIM LARGE SCREEN TV WALL MOUNT - SPEC SHEET (#PM-LG85)
Applicable Screen Sizes: 55 inches to 85 inches.
Maximum Load Capacity: 75 kg (165 lbs).

[page 2]
CERTIFIED VESA MOUNTING PATTERNS:
- 200x200 mm
- 400x400 mm
- 600x400 mm
Compatible with large OLED and Neo-QLED displays weighing up to 75 kg.
""",
        "doc_elec_dyson_filter": """[page 1]
PUREAIR REPLACEMENT POST-MOTOR HEPA FILTER SPECIFICATION (#PA-DY-11)
Filtration Standard: True HEPA H13 filtration (99.97% capture of particles down to 0.3 microns).

[page 2]
CERTIFIED VACUUM MODEL COMPATIBILITY:
This replacement filter is engineered to fit the following cordless vacuum models ONLY:
- Dyson V11 Absolute
- Dyson V11 Torque Drive
- Dyson V11 Animal
- Dyson V11 Total Clean
- Dyson V15 Detect
Warning: Does NOT fit Dyson V10, V8, V7, V6, or Dyson Outsize vacuum cleaner models.
""",
        "doc_elec_charger_65w": """[page 1]
VOLTRAPID GAN 65W ULTRA FAST CHARGER - TECHNICAL SPECIFICATION (#VR-GAN-65)
Technology: Gallium Nitride (GaN III) semiconductor. Dual USB-C + Single USB-A.

[page 2]
POWER DELIVERY SPECIFICATIONS:
- Single USB-C1 Output: 5V/3A, 9V/3A, 12V/3A, 15V/3A, 20V/3.25A (65W Max).
- Supported Protocols: USB Power Delivery 3.0 (PD 3.0), Qualcomm Quick Charge 4.0+ (QC 4.0), PPS (3.3V-11V 5A).
- Input Voltage Range: 100V - 240V AC ~ 50/60Hz 1.5A international standard.
""",
        "doc_elec_thunderbolt_cable": """[page 1]
SPEEDSYNC THUNDERBOLT 4 USB-C CABLE 2M (#SS-TB4-2M)
Transfer Speed: 40 Gbps bi-directional data bandwidth.

[page 2]
POWER & DISPLAY CAPABILITIES:
- Charging: Supports up to 100W USB-C Power Delivery (20V/5A E-Marker chip).
- Video Output: Supports single 8K@60Hz or dual 4K@60Hz video streaming.
- Connector: Standard USB Type-C to USB Type-C.
""",
        "doc_hw_m8_anchor": """[page 1]
FORGETORQUE FIXINGS - M8 SHIELD EXPANSION ANCHOR BOLT (ITEM #FT-SA-M8-75)
Material: Grade 304 (A2) Marine Stainless Steel.

[page 2]
MECHANICAL PERFORMANCE AND SUBSTRATE RATINGS:
- Thread Size: Metric M8 (Pitch 1.25 mm).
- Drill Hole Diameter: 12 mm | Minimum Embedment Depth: 50 mm.
- Recommended Safe Working Tensile Load: 150 kg (1.47 kN) in Grade 30 Concrete.
- Suitable Substrates: Concrete, Dense Solid Brick, Hard Natural Stone.
- Unsuitable Substrates: Drywall, Lightweight Aerated Block, Hollow Masonry.
""",
        "doc_hw_m6_drywall": """[page 1]
FORGETORQUE FIXINGS - M6 HOLLOW CAVITY DRYWALL ANCHOR (#FT-DW-M6)
Material: Corrosion-resistant die-cast zinc alloy.

[page 2]
LOAD AND THREAD SPECIFICATIONS:
- Thread Size: Metric M6.
- Maximum Working Shear Load: 35 kg in 12.5mm standard gypsum board (drywall).
- Suitable Substrates: Gywall, Plasterboard, Hollow Core Block.
- Unsuitable Substrates: Solid poured concrete, granite.
""",
        "doc_hw_bracket_l": """[page 1]
TITANSTRUCT HEAVY DUTY STEEL L-BRACKET (#TS-LB-300)
Dimensions: 300 mm x 200 mm x 30 mm. Heavy 4mm cold-rolled steel.

[page 2]
LOAD RATING & FIXTURE SPECIFICATIONS:
- Fastener Hole Diameter: 8.5 mm (Engineered for M8 bolts/screws).
- Maximum Uniform Distributed Load: 100 kg per pair installed into solid substrate.
- Suitable Wall Types: Solid concrete, masonry, timber studs.
""",
        "doc_hw_bolt_quarter": """[page 1]
ACCUMETRIC FASTENERS - 1/4-20 UNC HEX HEAD MACHINE BOLTS (#AM-HB-1420)
Material: Grade 5 High Tensile Zinc Plated Steel.

[page 2]
ENGINEERING SPECIFICATIONS:
- Thread Size: 1/4"-20 UNC (Coarse thread, 20 threads per inch).
- Nominal Tensile Strength: 120,000 PSI.
- Working Load Limit: 80 kg per bolt.
""",
        "doc_hw_m10_concrete": """[page 1]
FORGETORQUE M10 HEAVY DUTY CONCRETE SCREW ANCHORS (#FT-CS-M10)
Material: Case hardened carbon steel with Ruspert anti-corrosion coating.

[page 2]
TECHNICAL LOAD CAPACITY:
- Thread Size: Metric M10.
- Safe Tensile Load: 250 kg in cracked & non-cracked C20/25 concrete.
- Suitable Substrates: Reinforced Concrete, Solid Stone, Cinder Block.
""",
        "doc_groc_almond": """[page 1]
NATURE'S BEST ORGANIC ALMOND FLOUR 500G - PACKAGING LABEL & FACTS
Batch: NBF-2026-04 | Origin: 100% California Blanched Almonds.

[page 2]
INGREDIENTS AND ALLERGEN DECLARATION:
Ingredients: 100% Pure Blanched Almond Flour.
ALLERGEN STATEMENT: Contains Tree Nuts (Almonds). Processed in a dedicated gluten-free facility.
Dietary Certifications: Certified Gluten-Free, Certified Vegan, Keto Friendly, Non-GMO Verified.
Zero added sugars, zero preservatives.
""",
        "doc_groc_oatmilk": """[page 1]
PUREHARVEST BARISTA SPECIAL OAT MILK 1L - CARTON LABEL & FACTS
Formulated for coffee frothing and general culinary use.

[page 2]
NUTRITIONAL FACTS AND INGREDIENTS:
Ingredients: Filtered Water, Whole Grain Oats (12%), Cold-Pressed Sunflower Oil, Sea Salt, Dipotassium Phosphate.
ALLERGEN INFORMATION: Contains Oats. Manufactured on equipment free from dairy, soy, and peanuts.
Dietary Flags: 100% Plant-Based, Vegan, Dairy-Free, Lactose-Free.
""",
        "doc_groc_cookies": """[page 1]
ARTISAN BAKERY - SPELT & HONEY CRUNCH COOKIES (200G BOX)
Handcrafted gourmet baked treats.

[page 2]
INGREDIENT SPECIFICATION:
Ingredients: Stoneground Spelt Flour (Wheat family), Salted Cream Butter (Cow's Milk), Raw Forest Honey, Fresh Farm Eggs, Baking Powder, Sea Salt.
ALLERGEN WARNING: Contains Gluten (Spelt/Wheat), Cow's Milk (Dairy), and Eggs. May contain traces of sesame.
Dietary Classification: Vegetarian. NOT Gluten-Free. NOT Vegan.
""",
        "doc_pharm_crocin": """[page 1]
CROCIN ADVANCE FAST RELIEF TABLETS - OFFICIAL PACKAGE INSERT & LABEL
Pack Size: Strip of 15 film-coated tablets.
Active Ingredient: Each film-coated tablet contains Paracetamol I.P. 500 mg.

[page 2]
LABEL FACTS AND CONTRAINDICATIONS:
Inactive Ingredients: Microcrystalline Cellulose, Corn Starch, Magnesium Stearate, Povidone.
Allergen Information: Gluten-free, Lactose-free, Sugar-free.
Contraindications: Hypersensitivity to Paracetamol. Severe hepatic impairment.
REGULATORY NOTICE: Consult a pharmacist or doctor for medical decisions. FitCheck reports label facts only and does not provide dosage or medical advice.
""",
        "doc_pharm_cetzine": """[page 1]
CETZINE 10MG ANTI-ALLERGY TABLETS - PACKAGE INSERT & LABEL
Active Pharmaceutical Ingredient: Cetirizine Dihydrochloride 10 mg per tablet.

[page 2]
EXCIPIENT & ALLERGEN LABEL FACTS:
Inactive Excipients: Lactose Monohydrate (65 mg per tablet), Microcrystalline Cellulose, Colloidal Anhydrous Silica, Magnesium Stearate.
ALLERGEN & DIETARY NOTICE: Contains Lactose (Cow's Milk derivative). Patients with rare hereditary galactose intolerance or Lapp lactase deficiency should not take this medicine. Gluten-free.
Contraindications: End-stage renal disease (CrCl < 10 ml/min).
REGULATORY NOTICE: Consult a pharmacist or doctor for medical decisions. FitCheck reports label facts only and does not provide dosage or medical advice.
"""
    }

    for doc_name, content in docs.items():
        doc_file = DOCS_DIR / f"{doc_name}.txt"
        with open(doc_file, "w", encoding="utf-8") as f:
            f.write(content.strip())
            
    print(f"Generated {len(docs)} authoritative docs in {DOCS_DIR}")

    # ----------------------------------------------------
    # Products
    # ----------------------------------------------------
    products = [
        # --- CLOTHING ---
        {
            "id": "prod_clothing_dress_01",
            "name": "Aura Silk Floral Wrap Dress",
            "brand": "Aura Apparel",
            "category": "clothing",
            "variants": [
                {"sku": "SKU-AURA-DR-S", "name": "Size S"},
                {"sku": "SKU-AURA-DR-M", "name": "Size M"},
                {"sku": "SKU-AURA-DR-L", "name": "Size L"},
                {"sku": "SKU-AURA-DR-XL", "name": "Size XL"}
            ],
            "attributes": {
                "size_chart": {
                    "S": {"chest": [32, 34], "waist": [26, 28], "hip": [34, 36]},
                    "M": {"chest": [35, 37], "waist": [28, 29.5], "hip": [37, 39]},
                    "L": {"chest": [38, 40], "waist": [30, 33], "hip": [40, 42]},
                    "XL": {"chest": [41, 43], "waist": [34, 37], "hip": [43, 46]}
                },
                "unit": "inches",
                "fit_type": "regular_wrap",
                "source_doc": "doc_clothing_aura_dress (Page 2)"
            },
            "docs": ["doc_clothing_aura_dress"],
            "marketing_copy": "Exquisite mulberry silk floral wrap dress designed for elegant evening soirees and garden brunches."
        },
        {
            "id": "prod_clothing_dress_02",
            "name": "Urban Elegance Black Midi Dress",
            "brand": "Urban Elegance",
            "category": "clothing",
            "variants": [
                {"sku": "SKU-UE-MIDI-S", "name": "Size S"},
                {"sku": "SKU-UE-MIDI-M", "name": "Size M"},
                {"sku": "SKU-UE-MIDI-L", "name": "Size L"},
                {"sku": "SKU-UE-MIDI-XL", "name": "Size XL"}
            ],
            "attributes": {
                "size_chart": {
                    "S": {"chest": [33, 35], "waist": [26, 28], "hip": [35, 37]},
                    "M": {"chest": [36, 38], "waist": [29, 31], "hip": [38, 40]},
                    "L": {"chest": [39, 41], "waist": [32, 34], "hip": [41, 43]},
                    "XL": {"chest": [42, 44], "waist": [35, 38], "hip": [44, 47]}
                },
                "unit": "inches",
                "fit_type": "midi_stretch",
                "color": "black",
                "source_doc": "doc_clothing_urban_midi (Page 2)"
            },
            "docs": ["doc_clothing_urban_midi"],
            "marketing_copy": "Sleek organic black midi dress offering effortless sophistication from desk to dinner."
        },
        {
            "id": "prod_clothing_dress_03",
            "name": "Boho Cotton Tiered Dress",
            "brand": "Boho Craft",
            "category": "clothing",
            "variants": [
                {"sku": "SKU-BC-TIER-S", "name": "Size S"},
                {"sku": "SKU-BC-TIER-M", "name": "Size M"},
                {"sku": "SKU-BC-TIER-L", "name": "Size L"},
                {"sku": "SKU-BC-TIER-XL", "name": "Size XL"}
            ],
            "attributes": {
                "size_chart": {
                    "S": {"chest": [32, 34], "waist": [26, 28], "hip": [34, 40]},
                    "M": {"chest": [35, 37], "waist": [28, 30], "hip": [38, 44]},
                    "L": {"chest": [38, 40], "waist": [31, 33], "hip": [41, 47]},
                    "XL": {"chest": [41, 43], "waist": [34, 36], "hip": [44, 50]}
                },
                "unit": "inches",
                "fit_type": "relaxed_fit",
                "source_doc": "doc_clothing_boho_dress (Page 2)"
            },
            "docs": ["doc_clothing_boho_dress"],
            "marketing_copy": "Breezy tiered cambric dress crafted for warm days and carefree weekend getaways."
        },
        {
            "id": "prod_clothing_dress_04",
            "name": "Classic Evening Gown",
            "brand": "Atelier Royale",
            "category": "clothing",
            "variants": [
                {"sku": "SKU-AR-GOWN-S", "name": "Size S"},
                {"sku": "SKU-AR-GOWN-M", "name": "Size M"},
                {"sku": "SKU-AR-GOWN-L", "name": "Size L"},
                {"sku": "SKU-AR-GOWN-XL", "name": "Size XL"}
            ],
            "attributes": {
                "size_chart": {
                    "S": {"chest": [32, 33], "waist": [25, 26], "hip": [35, 36]},
                    "M": {"chest": [34, 35.5], "waist": [27, 28.5], "hip": [37, 38.5]},
                    "L": {"chest": [36, 38], "waist": [29, 31], "hip": [39, 41]},
                    "XL": {"chest": [39, 41], "waist": [32, 34], "hip": [42, 44]}
                },
                "unit": "inches",
                "fit_type": "tailored_couture",
                "source_doc": "doc_clothing_evening_gown (Page 2)"
            },
            "docs": ["doc_clothing_evening_gown"],
            "marketing_copy": "Statuesque floor-sweeping gown designed with sculptured corsetry for black-tie galas."
        },
        {
            "id": "prod_clothing_kurta_01",
            "name": "FabIndia Style Classic Cotton Kurta",
            "brand": "Viraasat Ethnic",
            "category": "clothing",
            "variants": [
                {"sku": "SKU-VK-KURT-38", "name": "Size 38 (S)"},
                {"sku": "SKU-VK-KURT-40", "name": "Size 40 (M)"},
                {"sku": "SKU-VK-KURT-42", "name": "Size 42 (L)"},
                {"sku": "SKU-VK-KURT-44", "name": "Size 44 (XL)"}
            ],
            "attributes": {
                "size_chart": {
                    "S": {"chest": [37, 39], "waist": [32, 34]},
                    "M": {"chest": [39, 41], "waist": [34, 36]},
                    "L": {"chest": [41, 43], "waist": [36, 38]},
                    "XL": {"chest": [43, 45], "waist": [38, 40]}
                },
                "unit": "inches",
                "fit_type": "comfort_regular",
                "source_doc": "doc_clothing_kurta_cotton (Page 2)"
            },
            "docs": ["doc_clothing_kurta_cotton"],
            "marketing_copy": "Handspun pure cotton kurta combining traditional artisanal roots with breathable comfort."
        },
        {
            "id": "prod_clothing_kurta_02",
            "name": "Festive Silk Embroidered Kurta",
            "brand": "Viraasat Ethnic",
            "category": "clothing",
            "variants": [
                {"sku": "SKU-VK-SILK-38", "name": "Size 38 (S)"},
                {"sku": "SKU-VK-SILK-40", "name": "Size 40 (M)"},
                {"sku": "SKU-VK-SILK-42", "name": "Size 42 (L)"},
                {"sku": "SKU-VK-SILK-44", "name": "Size 44 (XL)"}
            ],
            "attributes": {
                "size_chart": {
                    "S": {"chest": [37, 39], "waist": [32, 34]},
                    "M": {"chest": [39, 41], "waist": [34, 36]},
                    "L": {"chest": [41, 43], "waist": [36, 38]},
                    "XL": {"chest": [43, 45], "waist": [38, 40]}
                },
                "unit": "inches",
                "fit_type": "festive_tailored",
                "source_doc": "doc_clothing_kurta_silk (Page 2)"
            },
            "docs": ["doc_clothing_kurta_silk"],
            "marketing_copy": "Lustrous Tussar silk kurta accentuated with royal zari thread embroidery for grand celebrations."
        },

        # --- FOOTWEAR ---
        {
            "id": "prod_footwear_01",
            "name": "SprintPro Aero Running Shoes",
            "brand": "SprintPro Athletic",
            "category": "footwear",
            "variants": [
                {"sku": "SKU-SP-AERO-UK6", "name": "UK-6"},
                {"sku": "SKU-SP-AERO-UK7", "name": "UK-7"},
                {"sku": "SKU-SP-AERO-UK8", "name": "UK-8"},
                {"sku": "SKU-SP-AERO-UK9", "name": "UK-9"},
                {"sku": "SKU-SP-AERO-UK10", "name": "UK-10"}
            ],
            "attributes": {
                "size_chart": {
                    "UK-6": [24.5, 25.0],
                    "UK-7": [25.1, 25.8],
                    "UK-8": [25.9, 26.6],
                    "UK-9": [26.7, 27.5],
                    "UK-10": [27.6, 28.3]
                },
                "gender": "unisex",
                "source_doc": "doc_footwear_sprintpro (Page 2)"
            },
            "docs": ["doc_footwear_sprintpro"],
            "marketing_copy": "Engineered for speed, energy return and seamless marathon performance on any road."
        },
        {
            "id": "prod_footwear_02",
            "name": "UrbanTrek Leather Derby Shoes",
            "brand": "Oxford & Co.",
            "category": "footwear",
            "variants": [
                {"sku": "SKU-OX-DRB-UK7", "name": "UK-7"},
                {"sku": "SKU-OX-DRB-UK8", "name": "UK-8"},
                {"sku": "SKU-OX-DRB-UK9", "name": "UK-9"},
                {"sku": "SKU-OX-DRB-UK10", "name": "UK-10"}
            ],
            "attributes": {
                "size_chart": {
                    "UK-7": [25.0, 25.7],
                    "UK-8": [25.8, 26.5],
                    "UK-9": [26.6, 27.4],
                    "UK-10": [27.5, 28.2]
                },
                "gender": "men",
                "source_doc": "doc_footwear_derby (Page 2)"
            },
            "docs": ["doc_footwear_derby"],
            "marketing_copy": "Timeless British styling in polished leather with Goodyear welted durability."
        },
        {
            "id": "prod_footwear_03",
            "name": "TrailGrip All-Terrain Hiking Boots",
            "brand": "TrailGrip Outdoors",
            "category": "footwear",
            "variants": [
                {"sku": "SKU-TG-HIK-UK7", "name": "UK-7"},
                {"sku": "SKU-TG-HIK-UK8", "name": "UK-8"},
                {"sku": "SKU-TG-HIK-UK9", "name": "UK-9"},
                {"sku": "SKU-TG-HIK-UK10", "name": "UK-10"}
            ],
            "attributes": {
                "size_chart": {
                    "UK-7": [25.2, 25.9],
                    "UK-8": [26.0, 26.7],
                    "UK-9": [26.8, 27.6],
                    "UK-10": [27.7, 28.5]
                },
                "gender": "unisex",
                "source_doc": "doc_footwear_hiking (Page 2)"
            },
            "docs": ["doc_footwear_hiking"],
            "marketing_copy": "Waterproof all-weather mountain boots built to conquer rugged trails and steep ascents."
        },
        {
            "id": "prod_footwear_04",
            "name": "GlideStride Cushioned Walking Sneakers",
            "brand": "GlideStride Comfort",
            "category": "footwear",
            "variants": [
                {"sku": "SKU-GS-WALK-UK6", "name": "UK-6"},
                {"sku": "SKU-GS-WALK-UK7", "name": "UK-7"},
                {"sku": "SKU-GS-WALK-UK8", "name": "UK-8"},
                {"sku": "SKU-GS-WALK-UK9", "name": "UK-9"}
            ],
            "attributes": {
                "size_chart": {
                    "UK-6": [24.5, 25.0],
                    "UK-7": [25.1, 25.8],
                    "UK-8": [25.9, 26.6],
                    "UK-9": [26.7, 27.5]
                },
                "gender": "women",
                "source_doc": "doc_footwear_glidestride (Page 2)"
            },
            "docs": ["doc_footwear_glidestride"],
            "marketing_copy": "Cloud-like foam cushioning designed for all-day standing and brisk urban strolls."
        },

        # --- FURNITURE ---
        {
            "id": "prod_furniture_01",
            "name": "Nordic Comfort 3-Seater Fabric Sofa",
            "brand": "Nordic Living",
            "category": "furniture",
            "variants": [
                {"sku": "SKU-NL-SOFA-GRY", "name": "Ash Grey"}
            ],
            "attributes": {
                "packaged_dimensions_cm": {
                    "length": 180,
                    "width": 85,
                    "height": 75
                },
                "assembled_dimensions_cm": {
                    "length": 212,
                    "width": 88,
                    "height": 82
                },
                "weight_kg": 52,
                "source_doc": "doc_furniture_nordic_sofa (Page 2)"
            },
            "docs": ["doc_furniture_nordic_sofa"],
            "marketing_copy": "Contemporary Scandinavian aesthetic wrapped in soft textured fabric with high-resilience foam."
        },
        {
            "id": "prod_furniture_02",
            "name": "Modern Oak 2-Door Wardrobe",
            "brand": "ScanWood Furniture",
            "category": "furniture",
            "variants": [
                {"sku": "SKU-SW-WARD-OAK", "name": "Natural Oak"}
            ],
            "attributes": {
                "packaged_dimensions_cm": {
                    "length": 200,
                    "width": 92,
                    "height": 40
                },
                "assembled_dimensions_cm": {
                    "length": 90,
                    "width": 55,
                    "height": 195
                },
                "weight_kg": 64,
                "source_doc": "doc_furniture_wardrobe (Page 2)"
            },
            "docs": ["doc_furniture_wardrobe"],
            "marketing_copy": "Sleek flat-pack double-door wardrobe with ample hanging clearance and minimalist matte black hardware."
        },
        {
            "id": "prod_furniture_03",
            "name": "Studio Minimalist Sectional Couch",
            "brand": "Metro Living",
            "category": "furniture",
            "variants": [
                {"sku": "SKU-ML-SECT-NVY", "name": "Navy Blue"}
            ],
            "attributes": {
                # Deliberate edge case: packaged_dimensions_cm is omitted/missing from documentation!
                "packaged_dimensions_cm": None,
                "assembled_dimensions_cm": {
                    "length": 220,
                    "width": 150,
                    "height": 85
                },
                "weight_kg": 68,
                "source_doc": "doc_furniture_studio_couch (Page 2)"
            },
            "docs": ["doc_furniture_studio_couch"],
            "marketing_copy": "Chic L-shaped modular sectional designed to maximize lounge comfort in trendy loft apartments."
        },
        {
            "id": "prod_furniture_04",
            "name": "Kavita Solid Teak Dining Table 6-Seater",
            "brand": "Kavita Timber",
            "category": "furniture",
            "variants": [
                {"sku": "SKU-KT-DINE-TEAK", "name": "Natural Teak Finish"}
            ],
            "attributes": {
                "packaged_dimensions_cm": {
                    "length": 160,
                    "width": 95,
                    "height": 22
                },
                "assembled_dimensions_cm": {
                    "length": 150,
                    "width": 90,
                    "height": 76
                },
                "weight_kg": 48,
                "source_doc": "doc_furniture_dining_table (Page 2)"
            },
            "docs": ["doc_furniture_dining_table"],
            "marketing_copy": "Handcrafted solid Indian teak dining table bringing regal warmth and durability for generations."
        },

        # --- ELECTRONICS ACCESSORIES ---
        {
            "id": "prod_elec_cartridge_01",
            "name": "Original HP 67 Black Ink Cartridge",
            "brand": "HP",
            "category": "electronics_accessory",
            "variants": [
                {"sku": "SKU-HP-67-BLK", "name": "Black Single Pack"}
            ],
            "attributes": {
                "supported_models": [
                    "HP DeskJet 1255",
                    "HP DeskJet 2331",
                    "HP DeskJet 2332",
                    "HP DeskJet 2333",
                    "HP DeskJet 2710",
                    "HP DeskJet 2720",
                    "HP DeskJet 2722",
                    "HP DeskJet 2723",
                    "HP DeskJet 2724",
                    "HP DeskJet 2725",
                    "HP DeskJet 2729",
                    "HP DeskJet 2755",
                    "HP DeskJet Plus 4120",
                    "HP DeskJet Plus 4122",
                    "HP DeskJet Plus 4123",
                    "HP DeskJet Plus 4132",
                    "HP DeskJet Plus 4152",
                    "HP DeskJet Plus 4155",
                    "HP ENVY 6010",
                    "HP ENVY 6020",
                    "HP ENVY 6052",
                    "HP ENVY 6055"
                ],
                "cartridge_type": "Pigment Black",
                "page_yield": 120,
                "source_doc": "doc_elec_hp67 (Page 2)"
            },
            "docs": ["doc_elec_hp67"],
            "marketing_copy": "Count on crisp, sharp text and dependable lab-quality document printing page after page."
        },
        {
            "id": "prod_elec_tv_mount_01",
            "name": "ProMount Heavy-Duty Tilting TV Wall Mount",
            "brand": "ProMount",
            "category": "electronics_accessory",
            "variants": [
                {"sku": "SKU-PM-TILT-65", "name": "Tilting 32-65 Inch"}
            ],
            "attributes": {
                "supported_vesa": ["100x100", "200x200", "300x300", "400x400"],
                "max_weight_kg": 45,
                "screen_size_range_inches": [32, 65],
                "source_doc": "doc_elec_tv_mount_promount (Page 2)"
            },
            "docs": ["doc_elec_tv_mount_promount"],
            "marketing_copy": "Sleek low-profile wall mount featuring 15 degree fingertip tilt to eliminate annoying room glare."
        },
        {
            "id": "prod_elec_tv_mount_02",
            "name": "UltraSlim Large TV Mount 85\"",
            "brand": "ProMount",
            "category": "electronics_accessory",
            "variants": [
                {"sku": "SKU-PM-ULTRA-85", "name": "Large Screen 55-85 Inch"}
            ],
            "attributes": {
                "supported_vesa": ["200x200", "400x400", "600x400"],
                "max_weight_kg": 75,
                "screen_size_range_inches": [55, 85],
                "source_doc": "doc_elec_tv_mount_ultraslim (Page 2)"
            },
            "docs": ["doc_elec_tv_mount_ultraslim"],
            "marketing_copy": "Reinforced dual-arm steel architecture engineered specifically for monstrous cinema-grade home theater panels."
        },
        {
            "id": "prod_elec_filter_01",
            "name": "PureAir Post-Motor HEPA Filter for Dyson Vacuums",
            "brand": "PureAir",
            "category": "electronics_accessory",
            "variants": [
                {"sku": "SKU-PA-DYS-V11", "name": "Single Filter Unit"}
            ],
            "attributes": {
                "supported_models": [
                    "Dyson V11 Absolute",
                    "Dyson V11 Torque Drive",
                    "Dyson V11 Animal",
                    "Dyson V11 Total Clean",
                    "Dyson V15 Detect"
                ],
                "filtration_efficiency": "99.97% at 0.3 microns",
                "source_doc": "doc_elec_dyson_filter (Page 2)"
            },
            "docs": ["doc_elec_dyson_filter"],
            "marketing_copy": "Restore maximum suction power and trap microscopic dander, dust mites, and fine pollen particles."
        },
        {
            "id": "prod_elec_charger_01",
            "name": "VoltRapid 65W GaN USB-C PD Fast Charger",
            "brand": "VoltRapid",
            "category": "electronics_accessory",
            "variants": [
                {"sku": "SKU-VR-GAN-65W", "name": "65W Wall Adapter"}
            ],
            "attributes": {
                "wattage": 65,
                "connector": "USB-C",
                "supported_protocols": ["PD 3.0", "QC 4.0", "PPS"],
                "input_voltage_range": [100, 240],
                "source_doc": "doc_elec_charger_65w (Page 2)"
            },
            "docs": ["doc_elec_charger_65w"],
            "marketing_copy": "Pocket-sized Gallium Nitride power adapter charges laptops, tablets, and phones at blinding speeds."
        },
        {
            "id": "prod_elec_cable_01",
            "name": "ThunderBolt 4 High-Speed USB-C Cable 2m",
            "brand": "SpeedSync",
            "category": "electronics_accessory",
            "variants": [
                {"sku": "SKU-SS-TB4-2M", "name": "2 Meter Cable"}
            ],
            "attributes": {
                "wattage": 100,
                "data_rate_gbps": 40,
                "connector": "USB-C",
                "source_doc": "doc_elec_thunderbolt_cable (Page 2)"
            },
            "docs": ["doc_elec_thunderbolt_cable"],
            "marketing_copy": "Blazing 40Gbps throughput supporting flawless 8K video output and 100W laptop rapid charging."
        },

        # --- HARDWARE ---
        {
            "id": "prod_hw_anchor_01",
            "name": "Shield Anchor Bolt M8 Heavy-Duty",
            "brand": "ForgeTorque Fixings",
            "category": "hardware",
            "variants": [
                {"sku": "SKU-FT-SA-M8-4PK", "name": "M8 4-Pack"}
            ],
            "attributes": {
                "thread_size": "M8",
                "load_rating_kg": 150,
                "material": "Stainless Steel 304",
                "suitable_substrates": ["concrete", "solid brick", "stone"],
                "source_doc": "doc_hw_m8_anchor (Page 2)"
            },
            "docs": ["doc_hw_m8_anchor"],
            "marketing_copy": "Industrial-grade expanding anchor bolts for mounting heavy structural gates, machinery, and brackets."
        },
        {
            "id": "prod_hw_anchor_02",
            "name": "Hollow Wall Drywall Anchor M6",
            "brand": "ForgeTorque Fixings",
            "category": "hardware",
            "variants": [
                {"sku": "SKU-FT-DW-M6-10PK", "name": "M6 10-Pack"}
            ],
            "attributes": {
                "thread_size": "M6",
                "load_rating_kg": 35,
                "material": "Zinc Alloy",
                "suitable_substrates": ["drywall", "plasterboard", "hollow block"],
                "source_doc": "doc_hw_m6_drywall (Page 2)"
            },
            "docs": ["doc_hw_m6_drywall"],
            "marketing_copy": "Self-drilling hollow wall anchors that lock securely behind gypsum board without pre-drilling."
        },
        {
            "id": "prod_hw_bracket_01",
            "name": "L-Angle Heavy Duty Steel Shelf Bracket",
            "brand": "TitanStruct",
            "category": "hardware",
            "variants": [
                {"sku": "SKU-TS-BRKT-L", "name": "300x200mm Pair"}
            ],
            "attributes": {
                "thread_size": "M8",
                "load_rating_kg": 100,
                "material": "Cold-Rolled Steel",
                "suitable_substrates": ["concrete", "wood", "brick"],
                "source_doc": "doc_hw_bracket_l (Page 2)"
            },
            "docs": ["doc_hw_bracket_l"],
            "marketing_copy": "Indestructible triangular gusset bracket supporting brutal loads in workshops and commercial storage."
        },
        {
            "id": "prod_hw_bolt_01",
            "name": "Hex Head Machine Bolt 1/4-20 x 2 inch",
            "brand": "AccuMetric Fasteners",
            "category": "hardware",
            "variants": [
                {"sku": "SKU-AM-BOLT-1420", "name": "1/4-20 20-Pack"}
            ],
            "attributes": {
                "thread_size": "1/4-20",
                "load_rating_kg": 80,
                "material": "Grade 5 Zinc Steel",
                "source_doc": "doc_hw_bolt_quarter (Page 2)"
            },
            "docs": ["doc_hw_bolt_quarter"],
            "marketing_copy": "Precision-threaded hex cap screws delivering uncompromising tensile strength for machinery repair."
        },
        {
            "id": "prod_hw_screw_01",
            "name": "Self-Tapping Masonry Anchor Screws M10",
            "brand": "ForgeTorque Fixings",
            "category": "hardware",
            "variants": [
                {"sku": "SKU-FT-MS-M10", "name": "M10 8-Pack"}
            ],
            "attributes": {
                "thread_size": "M10",
                "load_rating_kg": 250,
                "material": "Carbon Steel",
                "suitable_substrates": ["concrete", "cinder block", "solid stone"],
                "source_doc": "doc_hw_m10_concrete (Page 2)"
            },
            "docs": ["doc_hw_m10_concrete"],
            "marketing_copy": "Direct-drive concrete screws that carve threads directly into solid masonry for instant high-capacity holding."
        },

        # --- GROCERY & PHARMACY ---
        {
            "id": "prod_groc_almond_flour",
            "name": "Natures Best Organic Almond Flour 500g",
            "brand": "Nature's Best",
            "category": "grocery_pharmacy",
            "variants": [
                {"sku": "SKU-NB-ALM-500", "name": "500g Pouch"}
            ],
            "attributes": {
                "ingredients": ["blanched almond flour"],
                "allergens": ["tree nuts", "almonds"],
                "dietary_flags": ["gluten_free", "vegan", "keto", "vegetarian"],
                "is_pharmacy": False,
                "source_doc": "doc_groc_almond (Page 2)"
            },
            "docs": ["doc_groc_almond"],
            "marketing_copy": "Finely sifted unbleached almond flour delivering nutty richness and wholesome baking texture."
        },
        {
            "id": "prod_groc_oat_milk",
            "name": "PureHarvest Barista Oat Milk 1L",
            "brand": "PureHarvest",
            "category": "grocery_pharmacy",
            "variants": [
                {"sku": "SKU-PH-OAT-1L", "name": "1 Liter TetraPak"}
            ],
            "attributes": {
                "ingredients": ["filtered water", "whole grain oats", "cold-pressed sunflower oil", "sea salt"],
                "allergens": ["oats"],
                "dietary_flags": ["dairy_free", "vegan", "lactose_free", "plant_based"],
                "is_pharmacy": False,
                "source_doc": "doc_groc_oatmilk (Page 2)"
            },
            "docs": ["doc_groc_oatmilk"],
            "marketing_copy": "Silky barista oat milk engineered to froth into glossy microfoam for cafe-quality lattes."
        },
        {
            "id": "prod_groc_cookies",
            "name": "Artisan Spelt & Honey Crunch Cookies",
            "brand": "Artisan Bakery",
            "category": "grocery_pharmacy",
            "variants": [
                {"sku": "SKU-AB-SPELT-200", "name": "200g Box"}
            ],
            "attributes": {
                "ingredients": ["stoneground spelt flour", "salted cream butter", "raw forest honey", "fresh farm eggs", "baking powder"],
                "allergens": ["gluten", "wheat", "dairy", "eggs", "milk"],
                "dietary_flags": ["vegetarian"],
                "is_pharmacy": False,
                "source_doc": "doc_groc_cookies (Page 2)"
            },
            "docs": ["doc_groc_cookies"],
            "marketing_copy": "Old-world rustic crunch cookies infused with golden wildflowers honey and churned cream butter."
        },
        {
            "id": "prod_pharm_paracetamol",
            "name": "Crocin Advance Paracetamol 500mg Fast Relief",
            "brand": "Crocin Advance",
            "category": "grocery_pharmacy",
            "variants": [
                {"sku": "SKU-CR-PARA-500", "name": "Strip of 15 Tablets"}
            ],
            "attributes": {
                "active_ingredients": ["paracetamol 500mg"],
                "inactive_ingredients": ["microcrystalline cellulose", "corn starch", "magnesium stearate", "povidone"],
                "allergens": [],
                "contraindications": ["severe hepatic impairment"],
                "dietary_flags": ["gluten_free", "lactose_free", "vegan"],
                "is_pharmacy": True,
                "form": "tablet",
                "source_doc": "doc_pharm_crocin (Page 2)"
            },
            "docs": ["doc_pharm_crocin"],
            "marketing_copy": "Optizorb technology enables paracetamol to release in as little as 5 minutes for rapid fever and pain relief."
        },
        {
            "id": "prod_pharm_cetirizine",
            "name": "Cetzine 10mg Anti-Allergy Tablets",
            "brand": "Cetzine",
            "category": "grocery_pharmacy",
            "variants": [
                {"sku": "SKU-CZ-CETZ-10", "name": "Strip of 10 Tablets"}
            ],
            "attributes": {
                "active_ingredients": ["cetirizine dihydrochloride 10mg"],
                "inactive_ingredients": ["lactose monohydrate", "microcrystalline cellulose", "colloidal anhydrous silica", "magnesium stearate"],
                "allergens": ["lactose", "dairy"],
                "contraindications": ["end-stage renal disease"],
                "dietary_flags": ["gluten_free"],
                "is_pharmacy": True,
                "form": "tablet",
                "source_doc": "doc_pharm_cetzine (Page 2)"
            },
            "docs": ["doc_pharm_cetzine"],
            "marketing_copy": "Proven 24-hour non-drowsy relief from allergic rhinitis, watery eyes, sneezing, and hives."
        }
    ]

    with open(PRODUCTS_FILE, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2)
    print(f"Generated {len(products)} products in {PRODUCTS_FILE}")

    # ----------------------------------------------------
    # Inventory SQLite Seeding
    # ----------------------------------------------------
    if DB_FILE.exists():
        DB_FILE.unlink()

    conn = sqlite3.connect(str(DB_FILE))
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE stock (
            store_id TEXT,
            sku TEXT,
            qty INTEGER,
            updated_at TEXT,
            PRIMARY KEY (store_id, sku)
        )
    """)

    # Stores:
    # 1. store_mysuru_devaraja (nearest center)
    # 2. store_mysuru_jayalakshmi
    # 3. store_mysuru_kuvempunagar
    # 4. store_mysuru_saraswathipuram
    # 5. store_mysuru_gokulam
    # 6. store_mysuru_bannimantap

    now_str = datetime.now().isoformat()
    stock_rows = []

    # Edge cases and specific demo script requirements:
    # Demo 1: Aura dress size M is OUT OF STOCK at nearest store (devaraja: 0),
    # but recommended size L is IN STOCK (devaraja: 3)!
    # And size M is available at Jayalakshmipuram (qty 2) for fallback demo.
    stock_rows.extend([
        ("store_mysuru_devaraja", "SKU-AURA-DR-S", 1, now_str),
        ("store_mysuru_devaraja", "SKU-AURA-DR-M", 0, now_str), # OUT OF STOCK at nearest!
        ("store_mysuru_devaraja", "SKU-AURA-DR-L", 3, now_str), # IN STOCK!
        ("store_mysuru_devaraja", "SKU-AURA-DR-XL", 2, now_str),
        ("store_mysuru_jayalakshmi", "SKU-AURA-DR-M", 2, now_str), # Available further away
        ("store_mysuru_jayalakshmi", "SKU-AURA-DR-L", 4, now_str),
    ])

    # Demo 2: HP 67 Black ink cartridge: IN STOCK at nearest store (devaraja: 5)
    stock_rows.extend([
        ("store_mysuru_devaraja", "SKU-HP-67-BLK", 5, now_str),
        ("store_mysuru_jayalakshmi", "SKU-HP-67-BLK", 8, now_str),
        ("store_mysuru_kuvempunagar", "SKU-HP-67-BLK", 2, now_str),
    ])

    # Demo 3: ProMount Tilting TV mount (400x400 max): in stock at devaraja (qty 4).
    # And UltraSlim Large Mount (600x400 alternative): in stock at devaraja (qty 3).
    stock_rows.extend([
        ("store_mysuru_devaraja", "SKU-PM-TILT-65", 4, now_str),
        ("store_mysuru_devaraja", "SKU-PM-ULTRA-85", 3, now_str),
        ("store_mysuru_jayalakshmi", "SKU-PM-ULTRA-85", 2, now_str),
    ])

    # Demo 4: Studio Minimalist Couch (missing packaged dimensions): stock 1
    stock_rows.extend([
        ("store_mysuru_devaraja", "SKU-ML-SECT-NVY", 1, now_str),
        ("store_mysuru_kuvempunagar", "SKU-NL-SOFA-GRY", 2, now_str),
    ])

    # Demo 5: Dyson Filter: stock 3 at devaraja
    stock_rows.extend([
        ("store_mysuru_devaraja", "SKU-PA-DYS-V11", 3, now_str),
        ("store_mysuru_gokulam", "SKU-PA-DYS-V11", 5, now_str),
    ])

    # Demo 6: Discovery mode: "black dress size M available near me today"
    stock_rows.extend([
        ("store_mysuru_devaraja", "SKU-UE-MIDI-M", 4, now_str),
        ("store_mysuru_devaraja", "SKU-UE-MIDI-S", 2, now_str),
        ("store_mysuru_jayalakshmi", "SKU-UE-MIDI-M", 3, now_str),
    ])

    # Seed all other SKUs with realistic distribution
    store_ids = [
        "store_mysuru_devaraja",
        "store_mysuru_jayalakshmi",
        "store_mysuru_kuvempunagar",
        "store_mysuru_saraswathipuram",
        "store_mysuru_gokulam",
        "store_mysuru_bannimantap"
    ]

    for p in products:
        for v in p["variants"]:
            sku = v["sku"]
            for idx, s_id in enumerate(store_ids):
                # Don't overwrite explicitly set items
                if any(r[0] == s_id and r[1] == sku for r in stock_rows):
                    continue
                # Deterministic synthetic qty
                qty = (hash(sku + s_id) % 7)  # 0 to 6
                stock_rows.append((s_id, sku, qty, now_str))

    cur.executemany("INSERT INTO stock VALUES (?, ?, ?, ?)", stock_rows)
    conn.commit()
    conn.close()
    print(f"Seeded SQLite inventory at {DB_FILE} with {len(stock_rows)} stock records.")

if __name__ == "__main__":
    build_seed_data()
