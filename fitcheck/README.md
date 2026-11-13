# FitCheck — Intelligent Commerce Assist for Local Retail

> **Mission**: Answer the high-stakes pre-purchase question that stalls a sale:  
> *"Will it fit? Is it compatible? Is it suitable for me? Can I get it nearby today?"*

FitCheck is a category-agnostic retail assistant powered by **authoritative source documents** (spec sheets, size charts, technical manuals, packaging facts) and **deterministic code evaluation** operating alongside local store-level inventory.

---

## 1. Non-Negotiable Principles

1. **Source Over Sales Copy**: Only authoritative documentation (spec sheets, size charts, manuals, ingredient labels) is indexed and used as evidence. Marketing copy is stored strictly for display in the UI and is never indexed or used to justify a verdict.
2. **Authoritative Citations**: Every factual claim carries an explicit citation (`document_name` + `page/section`).
3. **Three-State Verdicts Only**: `YES` / `NO` / `CANNOT_CONFIRM`. FitCheck never bluffs or fabricates numbers. If data is absent, it honestly returns `CANNOT_CONFIRM`.
4. **Deterministic Code Verdicts**: The LLM interprets the query and paraphrases findings; the **verdict itself is strictly calculated by pure deterministic rule comparators** operating on structured data.
5. **Single Clarifying Question**: Asks at most one question at a time, only when essential required parameters are missing.
6. **Local-First Inventory**: Checks store-level inventory within the shopper's radius (calculated via haversine distance). Never recommends unavailable items without clear distance and stock indicators.
7. **Category-Agnostic Profile System**: Adding a new product category requires only a single YAML configuration file, with zero modifications to core agent code.

---

## 2. Architecture & Pipeline

```
Shopper Query
     │
     ▼
[ 1. INTENT EXTRACTION ] ──── (LLMClient / MockLLM extracts category, variant, entities)
     │
     ▼
[ 2. CATEGORY PROFILE ]  ──── (Loads YAML profile: required inputs, check types, rule name)
     │
     ▼
[ 3. MISSING INFO CHECK] ──── (Compares required inputs vs shopper profile memory)
     │                          ↳ If missing: Returns exactly ONE clarifying question & stops.
     ▼
[ 4. RAG RETRIEVAL ]     ──── (BM25 over authoritative documents, preserving [page N] citations)
     │
     ▼
[ 5. DETERMINISTIC RULES]──── (Pure rule comparator executes on structured specifications)
     │                          ↳ Verdict: YES | NO | CANNOT_CONFIRM
     ▼
[ 6. LOCAL INVENTORY ]   ──── (SQLite query across local stores sorted by haversine distance)
     │
     ▼
[ 7. ALTERNATIVE SEARCH] ──── (If NO or out-of-stock: finds in-stock size/model nearby)
     │
     ▼
[ 8. GUARDED RESPONSE ]  ──── (Paraphrased answer with anti-hallucination numeric guard)
```

---

## 3. Product Categories & Supported Rules

FitCheck natively supports 6 distinct retail verticals:

| Category | Deterministic Rule | Authoritative Evidence | Core Checks |
| :--- | :--- | :--- | :--- |
| **Clothing** | `clothing_size_match` | Brand Size Guides & Measurement Sheets | Chest/bust, waist, hip range comparison; flags snug/loose fit; recommends size up if on boundary threshold. |
| **Footwear** | `footwear_size_match` | Footwear Fitment Tables | Foot length in cm/in mapped to brand sizing charts. |
| **Furniture** | `furniture_clearance_match`| Assembly Manuals & Shipping Specs | Packaged dimensions vs doorway/hallway clearance across orientations. **Rule: Returns `CANNOT_CONFIRM` if packaged dims are missing from documentation.** |
| **Electronics Accessories**| `electronics_compatibility_match`| Hardware Compatibility Matrices | Device model normalization (e.g. `DeskJet 2331` == `deskjet2331`), VESA hole patterns (e.g. 200x200), weight capacities, wattage. |
| **Hardware** | `hardware_fitment_match` | Engineering Data Sheets | Metric/imperial thread sizes (M6, M8, 1/4-20), rated safe working loads, substrate compatibility. |
| **Grocery & Pharmacy** | `dietary_allergen_match` | Package Labels & Fact Inserts | Ingredient statements, allergens, dietary certifications. **Mandatory: Always adds pharmacist/doctor disclaimer on medical items; never prescribes dosage.** |

---

## 4. Evaluation Benchmark Results

The evaluation test suite (`fitcheck/eval/run_eval.py`) runs **48 labelled test questions** across all 6 categories, including edge cases, boundary thresholds, missing specs, and clarification cases.

```
================================================================================
                    FITCHECK EVALUATION REPORT
================================================================================
Category                 | Total  | Accuracy   | Confident-Wrong  | Citations 
--------------------------------------------------------------------------------
clothing                 | 8      | 100.0%     | 0 (0.0%)         | 100.0%    
footwear                 | 7      | 100.0%     | 0 (0.0%)         | 100.0%    
furniture                | 7      | 100.0%     | 0 (0.0%)         | 100.0%    
electronics_accessory    | 11     | 100.0%     | 0 (0.0%)         | 100.0%    
hardware                 | 7      | 100.0%     | 0 (0.0%)         | 100.0%    
grocery_pharmacy         | 8      | 100.0%     | 0 (0.0%)         | 100.0%    
--------------------------------------------------------------------------------
OVERALL TOTALS           | 48     | 100.0%     | 0 (0.0%)         | 100.0%
================================================================================

Key Non-Negotiable Metrics:
- Verdict Accuracy:       100.0% (48/48)
- Confident-Wrong Rate:   0.00% (0/48) [TARGET: 0%]
- Citation Correctness:   100.0% (48/48)
```

**Target Achieved**: Confident-Wrong Rate is **0.00%** (zero fabricated or mistaken confident answers).

---

## 5. Quick Start & Installation

### Prerequisites
- Python 3.11+
- Git

### 1. Install Dependencies
```bash
pip install fastapi uvicorn pydantic pyyaml rank-bm25 google-genai httpx pytest
```

*(Note: FitCheck includes a built-in `MockLLM` fallback, so it runs 100% locally and passes all tests without requiring an API key. To enable Gemini 2.5 Flash, simply export `GEMINI_API_KEY=your_key`)*.

### 2. Seed Database & Authoritative Documents
```bash
python fitcheck/backend/scripts/seed.py
```
This generates:
- 30 authoritative markdown/text docs with `[page N]` markers in `fitcheck/backend/data/docs/`
- 30 catalog products in `fitcheck/backend/data/products.json`
- SQLite inventory in `fitcheck/backend/data/inventory.db` across 6 stores in Mysuru.

### 3. Run Automated Tests
```bash
python -m pytest -v
```
Runs 21 unit & integration tests covering unit normalization, rule engines, inventory calculations, clarify logic, demo scenarios, and API routes.

### 4. Run Evaluation Suite
```bash
python fitcheck/eval/run_eval.py
```

### 5. Launch the Server (API + Web UI)
```bash
python -m uvicorn app.main:app --app-dir fitcheck/backend --reload --port 8000
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser to interact with the full web UI!

---

## 6. 3-Minute Interactive Demo Script

Use the built-in **Quick Demo Buttons** in the top navigation bar or enter the following queries:

### Demo 1: Clothing Fit & Size Recommendation
- **Product**: *Aura Silk Floral Wrap Dress* (`prod_clothing_dress_01`)
- **Query**: `"I'm bust 36, waist 30. Will the M fit?"`
- **Output**:
  - **Verdict**: `NO`
  - **Explanation**: Size M waist maximum is 29.5 inches; waist 30 will be snug. Size L (waist 30-33 in) is recommended for comfort.
  - **Inventory**: Size M is out of stock at nearest store (Devaraja Mohalla), but recommended **Size L is in stock (3 units, 0.0 km away)**.
  - **Citation**: `doc_clothing_aura_dress (Page 2)`.

### Demo 2: Electronics Model Compatibility
- **Product**: *Original HP 67 Black Ink Cartridge* (`prod_elec_cartridge_01`)
- **Query**: `"Does this cartridge work with my HP DeskJet 2331?"`
- **Output**:
  - **Verdict**: `YES`
  - **Explanation**: Model *HP DeskJet 2331* is explicitly verified in the manufacturer's compatibility matrix.
  - **Inventory**: In stock (5 units at Devaraja Mohalla).
  - **Citation**: `doc_elec_hp67 (Page 2)`.

### Demo 3: TV Mount Incompatibility & Alternative
- **Product**: *ProMount Heavy-Duty Tilting TV Wall Mount* (`prod_elec_tv_mount_01`)
- **Query**: `"I have a 75 inch TV with 600x400 VESA weighing 35kg. Will this mount fit?"`
- **Output**:
  - **Verdict**: `NO`
  - **Explanation**: Mount supports up to VESA 400x400 mm; does not support VESA 600x400 mm.
  - **Alternative**: Recommends *UltraSlim Large TV Mount 85"* (`prod_elec_tv_mount_02`) which supports VESA 600x400 mm and is in stock nearby (3 units).
  - **Citation**: `doc_elec_tv_mount_promount (Page 2)`.

### Demo 4: Missing Documentation Handling
- **Product**: *Studio Minimalist Sectional Couch* (`prod_furniture_03`)
- **Query**: `"Will this sectional couch fit through my 80cm door?"`
- **Output**:
  - **Verdict**: `CANNOT_CONFIRM`
  - **Explanation**: Packaged shipping box dimensions are missing from manufacturer logistics documentation. FitCheck refuses to guess unverified clearance.
  - **Citation**: `doc_furniture_studio_couch (Page 2)`.

### Demo 5: Single Clarifying Question
- **Product**: *PureAir Post-Motor HEPA Filter* (`prod_elec_filter_01`)
- **Query**: `"Does this filter fit my vacuum?"`
- **Output**:
  - **Verdict**: `CANNOT_CONFIRM`
  - **Clarifying Question**: *"What is your specific device model (e.g. Dyson V11, HP DeskJet 2331)?"*

### Demo 6: Discovery Mode (Local-First Ranking)
- **Mode**: "Find Nearby" tab
- **Query**: `"black dress size M available near me today"`
- **Output**:
  - Matches *Urban Elegance Black Midi Dress*, checks local stock for SKU `SKU-UE-MIDI-M`, and ranks results by distance: **4 in stock at Devaraja Mohalla (0.0 km away, Pickup Today)**.

---

## 7. Known Limitations & Future Roadmap

1. **Retailer Inventory Integration**: Currently queries a local SQLite inventory database with synthetic Mysuru store data. Future releases will connect via webhooks to Shopify POS, Square, and Lightspeed APIs.
2. **Computer Vision & Device Scanning**: Adding camera-based model barcode and appliance rating-plate scanning to automatically extract model numbers and measurements without manual typing.
3. **Multilingual & Voice Support**: Expanding natural language interaction to regional Indian languages (Kannada, Hindi, Tamil, Telugu) with speech-to-text input.
4. **Dynamic Delivery Time Estimates**: Incorporating live local traffic and store fulfillment slots alongside in-store pickup.
