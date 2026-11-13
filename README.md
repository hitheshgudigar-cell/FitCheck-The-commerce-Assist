# FitCheck — Intelligent Commerce Assist for Local Retail

> **Mission**: Answer the high-stakes pre-purchase question that stalls a sale:  
> *"Will it fit? Is it compatible? Is it suitable for me? Can I get it nearby today?"*

FitCheck is a category-agnostic retail assistant powered by **authoritative source documents** (spec sheets, size charts, technical manuals, packaging facts) and **deterministic code evaluation** operating alongside local store-level inventory.

Please see the comprehensive documentation and demo guide in [`fitcheck/README.md`](./fitcheck/README.md).

## Quick Start
```bash
# 1. Install dependencies
pip install fastapi uvicorn pydantic pyyaml rank-bm25 google-genai httpx pytest

# 2. Seed database & authoritative documents
python fitcheck/backend/scripts/seed.py

# 3. Run automated tests (21 tests)
python -m pytest -v

# 4. Run evaluation harness (48 questions, 100% accuracy, 0% confident-wrong)
python fitcheck/eval/run_eval.py

# 5. Launch the Server (FastAPI Backend)
python -m uvicorn app.main:app --app-dir fitcheck/backend --reload --port 8000

# 6. Launch the Modern Frontend (React 18 + Vite + Tailwind + Leaflet)
cd frontend
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser!
If the backend is not running, the frontend automatically falls back to **Demo Mode** (`src/mocks/`) with full mock data for all 7 demo scenarios.
See [frontend/README.md](./frontend/README.md) for UI architecture, component breakdowns, and demo scenario screenshots.
