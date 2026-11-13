from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from typing import List, Optional
import os
import json
from pathlib import Path

from app.models import (
    ChatRequest, AnswerPayload, Product, Store,
    ShopperProfile, ProfileUpdateRequest
)
from app.agent.orchestrator import Orchestrator

app = FastAPI(
    title="FitCheck API",
    description="Intelligent Commerce Assist for Local Retail: Source-grounded pre-purchase verification & local inventory",
    version="1.0.0"
)

# Configure CORS: support comma-separated origins from ALLOWED_ORIGINS env var, with safe local defaults
raw_origins = os.environ.get("ALLOWED_ORIGINS", "").strip()
if raw_origins and raw_origins != "*":
    allowed_origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
    if "http://localhost:5173" not in allowed_origins:
        allowed_origins.append("http://localhost:5173")
    if "http://127.0.0.1:5173" not in allowed_origins:
        allowed_origins.append("http://127.0.0.1:5173")
    cors_credentials = True
else:
    allowed_origins = ["*"]
    cors_credentials = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=cors_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = Orchestrator()

BASE_DIR = Path(__file__).resolve().parent.parent.parent
FRONTEND_FILE = BASE_DIR / "frontend" / "index.html"
DATA_DIR = Path(__file__).resolve().parent.parent / "data"
PRODUCTS_FILE = DATA_DIR / "products.json"
STORES_FILE = DATA_DIR / "stores.json"

@app.get("/")
def read_root():
    # If browser requests HTML or frontend exists, serve frontend
    if FRONTEND_FILE.exists():
        return FileResponse(FRONTEND_FILE)
    return {
        "app": "FitCheck API",
        "status": "online",
        "stores": len(orchestrator.inventory.get_all_stores()),
        "products": len(orchestrator.intent_extractor.products)
    }

@app.get("/api/status")
def read_status():
    return {
        "app": "FitCheck API",
        "status": "online",
        "stores": len(orchestrator.inventory.get_all_stores()),
        "products": len(orchestrator.intent_extractor.products)
    }

@app.post("/chat", response_model=AnswerPayload)
def chat_endpoint(req: ChatRequest):
    try:
        answer = orchestrator.run(
            session_id=req.session_id,
            message=req.message,
            explicit_product_id=req.product_id,
            location=req.location,
            radius_km=req.radius_km
        )
        return answer
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while evaluating your query. Please try again.")

@app.get("/products", response_model=List[Product])
def get_products(
    q: Optional[str] = None,
    category: Optional[str] = None
):
    products = orchestrator.intent_extractor.products
    results = products

    if category and isinstance(category, str):
        c_clean = category.lower().strip()
        results = [p for p in results if p.category.lower() == c_clean]

    if q and isinstance(q, str):
        q_lower = q.lower().strip()
        matched = []
        for p in results:
            text = f"{p.name} {p.brand} {p.category} {p.marketing_copy}".lower()
            if q_lower in text:
                matched.append(p)
        results = matched

    return results

@app.get("/products/{product_id}", response_model=Product)
def get_product(product_id: str):
    p = orchestrator.intent_extractor.get_product_by_id(product_id)
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return p

@app.get("/stores", response_model=List[Store])
def get_stores():
    return orchestrator.inventory.get_all_stores()

@app.get("/session/{session_id}", response_model=ShopperProfile)
def get_session(session_id: str):
    return orchestrator.get_or_create_session(session_id)

@app.post("/session/{session_id}/profile", response_model=ShopperProfile)
def update_profile(session_id: str, updates: ProfileUpdateRequest):
    update_dict = updates.model_dump(exclude_unset=True)
    prof = orchestrator.update_session_profile(session_id, update_dict)
    return prof
