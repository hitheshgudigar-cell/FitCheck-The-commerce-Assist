import re
import json
from pathlib import Path
from typing import Dict, Any, Optional, List, Tuple
from app.models import Product
from app.agent.llm import LLMClient, ExtractedIntent

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
PRODUCTS_FILE = DATA_DIR / "products.json"

class IntentExtractor:
    def __init__(self, llm: LLMClient, products_file: Path = PRODUCTS_FILE):
        self.llm = llm
        self.products_file = products_file
        self.products: List[Product] = []
        self._load_products()

    def _load_products(self):
        if self.products_file.exists():
            with open(self.products_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.products = [Product(**p) for p in data]
        else:
            self.products = []

    def get_product_by_id(self, product_id: str) -> Optional[Product]:
        for p in self.products:
            if p.id == product_id:
                return p
        return None

    def match_product(self, query: str) -> Optional[Product]:
        """Fuzzy-match a product mentioned in query."""
        q_lower = query.lower()
        
        # 1. Exact or strong substring match in name or brand
        best_match = None
        best_score = 0
        for p in self.products:
            score = 0
            p_name_lower = p.name.lower()
            if p_name_lower in q_lower or q_lower in p_name_lower:
                score += 50
            for word in p_name_lower.split():
                if len(word) > 3 and word in q_lower:
                    score += 10
            if p.brand.lower() in q_lower:
                score += 15
            # Product specific aliases (e.g. "HP 67", "DeskJet 2331", "Aura dress", "TV mount", "Dyson")
            if "cartridge" in q_lower or "2331" in q_lower or "hp 67" in q_lower:
                if "cartridge" in p_name_lower or "hp 67" in p_name_lower:
                    score += 40
            if "aura" in q_lower and "aura" in p_name_lower:
                score += 40
            if "dyson" in q_lower or "vacuum" in q_lower:
                if "filter" in p_name_lower or "dyson" in p_name_lower:
                    score += 40
            if ("tv mount" in q_lower or "wall mount" in q_lower) and "mount" in p_name_lower:
                score += 30
            if ("sofa" in q_lower or "couch" in q_lower) and ("sofa" in p_name_lower or "couch" in p_name_lower):
                score += 30
            if "black dress" in q_lower and "black midi dress" in p_name_lower:
                score += 45

            if score > best_score:
                best_score = score
                best_match = p

        return best_match if best_score >= 20 else None

    def process(
        self,
        message: str,
        explicit_product_id: Optional[str] = None
    ) -> Tuple[ExtractedIntent, Optional[Product]]:
        # 1. Identify product
        product = None
        if explicit_product_id:
            product = self.get_product_by_id(explicit_product_id)

        if not product:
            product = self.match_product(message)

        current_prod_name = product.name if product else None

        # 2. Extract intent using LLM
        extracted = self.llm.extract_intent(message, current_product_name=current_prod_name)

        # 3. If product is resolved, ensure category aligns with product category
        if product:
            extracted.category = product.category
            extracted.product_ref = product.name

        return extracted, product
