# FitCheck Frontend — Intelligent Local-First Commerce Assistant

FitCheck is a pre-purchase verification assistant built with **React 18**, **Vite**, **TypeScript**, and **Tailwind CSS**. It answers high-stakes retail questions (*"Will it fit? Is it compatible? Is it suitable for my dietary needs? Can I get it nearby today?"*) by grounding answers strictly in **authoritative source documents** (spec sheets, size charts, technical manuals, packaging facts) rather than hallucinated marketing copy, evaluated alongside real-time local store inventory.

---

## 1. Quick Start

### Installation & Development
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the Vite development server (runs on port 5173)
npm run dev

# Run automated tests (Vitest + React Testing Library)
npm test

# Build production bundle
npm run build
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser to view the application.

---

## 2. Switching Between Demo Mode and Live API

FitCheck is engineered with an automatic **graceful fallback engine**. You never have to worry about broken screens if the backend server is offline.

### Automatic Detection
- On boot, the frontend checks `GET /api/status` (or `http://localhost:8000/api/status`).
- **If the FastAPI backend is running**: The app automatically switches to live API mode, streaming requests to `POST /chat`, `GET /products`, `GET /stores`, and `POST /session/{id}/profile`.
- **If the backend is unreachable or down**: The app seamlessly falls back to the built-in mock data engine in `src/mocks/` and displays a persistent amber **"Demo mode"** pill in the top header. Every scenario, tab, filter, and interaction continues to work 100% standalone.

### Configuring the Backend URL
Set the `VITE_API_URL` environment variable:
```bash
# In frontend/.env or shell
VITE_API_URL=http://localhost:8000
```
If omitted, it defaults automatically to `http://localhost:8000`.

---

## 3. UI Structure & Architecture

```
frontend/
├── index.html                    # HTML entry point with Google Fonts (Fraunces, Inter, JetBrains Mono) & Leaflet CSS
├── src/
│   ├── api/
│   │   ├── client.ts             # Typed API client with automatic offline detection & fallback
│   │   └── session.ts            # In-memory session manager (per-session ID generation, no localStorage)
│   ├── mocks/
│   │   ├── products.ts           # Product catalog with variants, authoritative docs, prices, specs
│   │   ├── stores.ts             # Mysuru stores with coordinates, addresses, stock levels
│   │   ├── scenarios.ts          # The 7 exact mock scenarios + discovery query handler
│   │   └── index.ts              # Exported mock query evaluator & ranked results
│   ├── context/
│   │   └── FitCheckContext.tsx   # React context for session profile, chat threads, active product, filters & modals
│   ├── components/
│   │   ├── AppShell/
│   │   │   ├── AppShell.tsx      # Responsive shell (Desktop 3-column, Tablet 2-column, Mobile 1-column)
│   │   │   ├── Header.tsx        # Logo, tagline, location chip, details button, theme switcher, demo badge
│   │   │   └── Footer.tsx        # "All data shown is SAMPLE DATA" + "How FitCheck checks answers" modal trigger
│   │   ├── AnswerCard/
│   │   │   ├── AnswerCard.tsx    # Verdict badge, headline, explanation, ChecksTable, citations, availability, alternatives, feedback
│   │   │   ├── VerdictBadge.tsx  # YES (#15803D), NO (#B91C1C), CANNOT_CONFIRM (#B45309) paired with icon & label
│   │   │   ├── ChecksTable.tsx   # "How we checked" expandable table with monospace values and failing row highlight
│   │   │   ├── CitationChip.tsx  # Document citation chip (e.g. "Size chart · p.2")
│   │   │   ├── CitationSheet.tsx # Modal showing exact authoritative excerpt, page number, and guarantee notice
│   │   │   ├── AvailabilityList.tsx # Local store distances, stock pills, Directions link, and pickup reservation
│   │   │   ├── AlternativesStrip.tsx # Horizontal alternative recommendations with "Check this instead"
│   │   │   ├── ClarifyCard.tsx   # Clarification card with quick-reply chips and inline input (auto-saves to details)
│   │   │   └── ReserveModal.tsx  # 2-hour same-day pickup reservation confirmation modal
│   │   ├── Chat/
│   │   │   ├── ChatThread.tsx    # Message thread with aria-live="polite", typing/thinking steps progress
│   │   │   ├── Composer.tsx      # Accessible keyboard-friendly textarea composer with auto-resize
│   │   │   └── Skeletons.tsx     # Animated progress pipeline ("Understanding...", "Checking specs...", "Checking stock...")
│   │   ├── Discovery/
│   │   │   ├── EmptyState.tsx    # Hero headline, reassurance badge, composer, and 5 tappable demo prompts
│   │   │   ├── ProductLinkParser.tsx # Online link parser (Amazon, Flipkart, Myntra, IKEA, Nykaa) + local Mysuru store inventory matcher
│   │   │   ├── ProductCatalogGrid.tsx # Categorized local product list on home page with category pills & "Start Fit Questionnaire" triggers
│   │   │   ├── ProductQuestionnaireModal.tsx # Interactive pre-purchase fit & compatibility questionnaire with 1-tap options and custom specs
│   │   │   ├── FilterBar.tsx     # Radius slider (1-25 km), Pickup today toggle, In stock toggle, Sort selector
│   │   │   └── ProductResultCard.tsx # Ranked result card with image, brand, fit badge, nearest store, and "Why this verdict"
│   │   ├── ProductPage/
│   │   │   ├── ProductPanel.tsx  # Product selector, image, variant selector with stock dots, collapsed seller copy, docs list
│   │   │   └── SuggestedChips.tsx # Category-tailored verification question chips
│   │   ├── Details/
│   │   │   └── DetailsDrawer.tsx # Collapsible sections (Location, Body & feet, Hardware, Spaces, Dietary), unit toggle, removable chips
│   │   ├── Map/
│   │   │   └── MapPanel.tsx      # Leaflet map with shopper pin, colored store pins (green/amber/grey), radius circle, list view toggle
│   │   └── Modals/
│   │       ├── HowItWorksModal.tsx # Explaining deterministic evaluation vs generic AI hallucinations
│   │       └── ReportWrongAnswerModal.tsx # User accuracy feedback logger
│   ├── test/
│   │   ├── setup.ts              # Vitest + RTL setup and media query mocking
│   │   ├── components.test.tsx   # Unit tests for VerdictBadge, ChecksTable, ClarifyCard
│   │   └── scenarios.test.ts     # Verification tests for all 7 mock scenarios
│   ├── styles/
│   │   └── index.css             # Tailwind base/components/utilities, scrollbar, leaflet fixes
│   ├── types/
│   │   └── index.ts              # TypeScript models, AnswerPayload, Store, Product, ShopperProfile
│   ├── App.tsx                   # Top-level application component
│   └── main.tsx                  # React DOM mount point
```

---

## 4. Design Direction & Palette Tokens

- **Warm Off-White Background**: `#FAF7F2` (`bg-warm-50`)
- **Ink Text**: `#1F2933` (`text-ink-800`)
- **Deep Teal Primary**: `#0F766E` (`teal-700`)
- **Terracotta Accent**: `#C2410C` (`terracotta-700`)
- **Verdicts**:
  - `YES` = Green `#15803D` (`CheckCircle2` icon + "FITS YOU / COMPATIBLE" label)
  - `NO` = Red `#B91C1C` (`XCircle` icon + "WILL NOT FIT / INCOMPATIBLE" label)
  - `CANNOT CONFIRM` = Amber `#B45309` (`HelpCircle` icon + "CANNOT CONFIRM" label)
- **Typography**:
  - Serif headings: *Fraunces*
  - Clean body: *Inter*
  - Monospace specs & citations: *JetBrains Mono*
- **Dark Mode**: Accessible via theme toggle in the header, with tokens redefined (warm charcoal/slate `#14171A` background and `#1C2128` surfaces), never inverted.

---

## 5. Walkthrough of the 7 Mock Scenarios

All 7 scenarios are accessible directly from the UI through tappable prompt chips or chat queries:

1. **Dress Fit Check**:
   - *Prompt*: "bust 36, waist 30, will the M fit?"
   - *Result*: **WILL NOT FIT / INCOMPATIBLE** (`NO`).
   - *Explanation*: Bust 36" fits Size M (35–37"), but waist 30" exceeds Size M maximum allowance of 29.5".
   - *Checks Table*: Chest passes (35–37"), waist highlighted failing row (needed 30", actual 28–29.5").
   - *Alternative Strip*: Recommends Size L (fits waist 30–33") with live in-stock badge at Central store (1.2 km away).

2. **HP Cartridge Compatibility**:
   - *Prompt*: "Does this cartridge work with my HP DeskJet 2331?"
   - *Result*: **FITS YOU / COMPATIBLE** (`YES`).
   - *Citation*: HP DeskJet 2300 series Compatibility Guide, Page 1.
   - *Store Availability*: 8 in stock at Central - Devaraja Mohalla, 4 in stock at Kuvempunagar with Pickup Today tag.

3. **TV Mount with Incompatible VESA**:
   - *Prompt*: "I have a 75 inch TV with 600x400 VESA weighing 35kg. Will this mount fit?"
   - *Result*: **WILL NOT FIT / INCOMPATIBLE** (`NO`).
   - *Checks Table*: VESA 600x400 mm exceeds mount max (400x400 mm); 75" exceeds 55" limit; 35 kg exceeds 30 kg capacity.
   - *Alternative*: ProMount UltraSlim 85" Mount (supports up to 600x400 VESA, 65 kg load).

4. **Sofa Doorway Clearance**:
   - *Prompt*: "Sofa that fits through an 80 cm door"
   - *Result*: **CANNOT CONFIRM** (`CANNOT_CONFIRM`).
   - *Explanation*: Assembled sofa depth is 88 cm (exceeds 80 cm door), but packaged carton dimensions are omitted from manufacturer spec sheets. Unboxed clearance with legs removed is 76 cm. Recommends contacting Central store depot.

5. **Vacuum Filter Clarification**:
   - *Prompt*: "Does this filter fit my vacuum?"
   - *Result*: Renders **ClarifyCard** asking: *"Which vacuum model do you own?"* with quick-reply buttons (`Dyson V11 Absolute`, `Dyson V15 Detect`, `Dyson V8 Animal`, etc.).
   - *Behavior*: Tapping a model auto-saves the vacuum device to My Details and produces an instant verdict (YES for V11/V15, NO for V8).

6. **Discovery Search**:
   - *Prompt*: "Black dress, size M, available near me today"
   - *Result*: 4 ranked product result cards across Mysuru stores, with fit badges ("Fits you", "Snug at waist"), radius slider, in-stock filters, and synchronized Leaflet map pins.

7. **Pharmacy Item Facts**:
   - *Prompt*: "I need a gluten-free pain reliever. Is Crocin Advance gluten-free?"
   - *Result*: **FITS YOU / COMPATIBLE** (`YES`).
   - *Facts*: Optizorb paracetamol 500mg verified gluten-free and lactose-free from packaging facts.
   - *Medical Disclaimer*: Distinct rose-tinted warning box advising consultation with a registered doctor or pharmacist.

---

## 6. Screenshots & Media

High-resolution screenshots for both Desktop (1280px) and Mobile (375px) are saved in `frontend/screenshots/`:

| Scenario | Desktop (1280px) | Mobile (375px) |
|---|---|---|
| **Discovery Hero** | `screenshots/01_discovery_hero_desktop_1280px.png` | `screenshots/01_discovery_hero_mobile_375px.png` |
| **1. Dress Fit (NO / Snug)** | `screenshots/scenario_1_dress_desktop_1280px.png` | `screenshots/scenario_1_dress_mobile_375px.png` |
| **2. HP Cartridge (YES)** | `screenshots/scenario_2_hp_cartridge_desktop_1280px.png` | `screenshots/scenario_2_hp_cartridge_mobile_375px.png` |
| **3. TV Mount (NO / VESA)** | `screenshots/scenario_3_tv_mount_desktop_1280px.png` | `screenshots/scenario_3_tv_mount_mobile_375px.png` |
| **4. Sofa Clearance (CANNOT CONFIRM)** | `screenshots/scenario_4_sofa_desktop_1280px.png` | `screenshots/scenario_4_sofa_mobile_375px.png` |
| **5. Vacuum ClarifyCard** | `screenshots/scenario_5_vacuum_clarify_desktop_1280px.png` | `screenshots/scenario_5_vacuum_clarify_mobile_375px.png` |
| **6. Discovery Results & Map** | `screenshots/scenario_6_discovery_results_desktop_1280px.png` | `screenshots/scenario_6_discovery_results_mobile_375px.png` |
| **7. Pharmacy & Medical Notice** | `screenshots/scenario_7_pharmacy_desktop_1280px.png` | `screenshots/scenario_7_pharmacy_mobile_375px.png` |
| **My Details Drawer** | `screenshots/details_drawer_desktop_1280px.png` | - |
| **How FitCheck Checks Answers Modal**| `screenshots/how_it_works_modal_desktop_1280px.png` | - |
| **Authoritative Citation Sheet** | `screenshots/citation_sheet_modal_desktop_1280px.png` | - |
| **Reserve for Pickup Modal** | `screenshots/reserve_pickup_modal_desktop_1280px.png` | - |
| **Pickup Code Confirmed** | `screenshots/reserve_pickup_confirmed_desktop_1280px.png` | - |
| **Dark Mode View** | `screenshots/02_discovery_dark_mode_1280px.png` | - |

---

## 7. Testing & Quality Assurance

Run the automated test suite with:
```bash
npm test
```
The suite verifies:
- `VerdictBadge`: YES (green `#15803D`), NO (red `#B91C1C`), and CANNOT_CONFIRM (amber `#B45309`) badge variants, icons, and custom labels.
- `ChecksTable`: Attribute rendering, monospace formatting, and red highlight on failing rows.
- `ClarifyCard`: Question rendering, option chip clicks, and custom text inputs.
- `Mock Scenarios`: All 7 core scenarios returning their expected three-state verdicts, citations, and alternatives.
