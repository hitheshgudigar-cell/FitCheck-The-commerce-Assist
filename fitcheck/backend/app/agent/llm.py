import os
import re
import json
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field

class ExtractedIntent(BaseModel):
    intent_type: str = "fit_check"  # fit_check, compatibility_check, suitability_check, availability_check, discovery
    category: Optional[str] = None
    product_ref: Optional[str] = None
    target_variant: Optional[str] = None
    entities: Dict[str, Any] = Field(default_factory=dict)
    shopper_constraints: Dict[str, Any] = Field(default_factory=dict)
    wants_local_availability: bool = True

class LLMClient(ABC):
    @abstractmethod
    def extract_intent(self, user_message: str, current_product_name: Optional[str] = None) -> ExtractedIntent:
        pass

    @abstractmethod
    def generate_response(
        self,
        user_message: str,
        verdict: str,
        reason: str,
        checks: List[Dict[str, Any]],
        citations: List[Dict[str, Any]],
        availability: List[Dict[str, Any]],
        product_name: str,
        notes: List[str]
    ) -> str:
        pass

class MockLLM(LLMClient):
    """Deterministic, regex & heuristic-based fallback LLM.
    Ensures FitCheck runs 100% reliably end-to-end without any API keys.
    """
    def extract_intent(self, user_message: str, current_product_name: Optional[str] = None) -> ExtractedIntent:
        msg = user_message.strip()
        msg_lower = msg.lower()
        msg_norm = msg_lower.replace("-", " ")

        intent_type = "fit_check"
        category = None
        target_variant = None
        entities = {}
        shopper_constraints = {}
        wants_local_availability = any(w in msg_lower for w in ["near me", "nearby", "today", "stock", "store", "available", "pickup"])

        # 1. Target variant extraction (requires 'size X', 'the X', or 'X fit')
        size_match = re.search(r"\b(?:size\s+([sml]|xl|xxl|[0-9]{2}|uk-?[0-9]+)|the\s+([sml]|xl|xxl)\b|([sml]|xl|xxl|[0-9]{2}|uk-?[0-9]+)\s+fit)\b", msg_lower)
        if size_match:
            candidate = (size_match.group(1) or size_match.group(2) or size_match.group(3)).upper()
            if candidate in ["S", "M", "L", "XL", "XXL"] or candidate.startswith("UK") or candidate.isdigit():
                target_variant = candidate.replace("UK", "UK-") if candidate.startswith("UK") and "-" not in candidate else candidate

        # 2. Body measurements
        bust_match = re.search(r"\b(?:bust|chest)\s*(?:is|=|:)?\s*([0-9]+(?:\.[0-9]+)?)\s*(in|inch|inches|\"|cm)?\b", msg_lower)
        if bust_match:
            val = float(bust_match.group(1))
            unit = bust_match.group(2) or "in"
            entities["bust"] = f"{val} {unit}"
            entities["chest"] = f"{val} {unit}"
            category = "clothing"

        waist_match = re.search(r"\bwaist\s*(?:is|=|:)?\s*([0-9]+(?:\.[0-9]+)?)\s*(in|inch|inches|\"|cm)?\b", msg_lower)
        if waist_match:
            val = float(waist_match.group(1))
            unit = waist_match.group(2) or "in"
            entities["waist"] = f"{val} {unit}"
            category = "clothing"

        hip_match = re.search(r"\bhip\s*(?:is|=|:)?\s*([0-9]+(?:\.[0-9]+)?)\s*(in|inch|inches|\"|cm)?\b", msg_lower)
        if hip_match:
            val = float(hip_match.group(1))
            unit = hip_match.group(2) or "in"
            entities["hip"] = f"{val} {unit}"
            category = "clothing"

        # Foot length
        foot_match = re.search(r"\b(?:foot\s+length|feet|foot)\s*(?:is|=|:)?\s*([0-9]+(?:\.[0-9]+)?)\s*(cm|in|inch|inches|\"|mm)?\b", msg_lower)
        if not foot_match:
            foot_match = re.search(r"\b([0-9]+(?:\.[0-9]+)?)\s*(cm|in|inch|inches|\"|mm)\s*(?:long|foot|feet)\b", msg_lower)
        if foot_match:
            val = float(foot_match.group(1))
            unit = foot_match.group(2) or "cm"
            entities["foot_length_cm"] = f"{val} {unit}"
            category = "footwear"
            intent_type = "fit_check"

        # Door / Entryway clearance: e.g. "80cm door", "50 cm narrow hallway", "35 cm opening"
        door_match = re.search(r"\b([0-9]+(?:\.[0-9]+)?)\s*(cm|in|inch|inches|\"|ft)?\s*(?:narrow\s+|entry\s+|door\s+)?(?:door|doorway|entryway|passage|hallway|hall|opening)\b", msg_lower)
        if not door_match:
            door_match = re.search(r"\b(?:door|doorway|entryway|passage|hallway|hall|opening)\s*(?:width|size)?\s*(?:is|=|:)?\s*([0-9]+(?:\.[0-9]+)?)\s*(cm|in|inch|inches|\"|ft)?\b", msg_lower)
        if door_match:
            val = float(door_match.group(1))
            unit = door_match.group(2) or "cm"
            entities["door_width_cm"] = f"{val} {unit}"
            category = "furniture"
            intent_type = "fit_check"

        # VESA pattern (e.g. 200x200, 400x400, 600x400)
        vesa_match = re.search(r"\b([0-9]{2,3}\s*[x*]\s*[0-9]{2,3})\s*(?:mm)?\b", msg_lower)
        if vesa_match:
            entities["vesa"] = vesa_match.group(1).replace(" ", "")
            category = "electronics_accessory"
            intent_type = "compatibility_check"

        # Weight / Load (e.g., 60kg, 200 kg load, weighing 35kg, 50 kg shelf)
        weight_match = re.search(r"\b([0-9]+(?:\.[0-9]+)?)\s*(kg|lbs?|pounds?)\s*(?:load|weight|shelf|mirror)?\b", msg_lower)
        if not weight_match:
            weight_match = re.search(r"\b(?:weighs?|weighing|weight|load|capacity)\s*(?:is|=|:)?\s*([0-9]+(?:\.[0-9]+)?)\s*(kg|lbs?|pounds?)?\b", msg_lower)
        if weight_match:
            val = float(weight_match.group(1))
            unit = weight_match.group(2) or "kg"
            entities["tv_weight_kg"] = f"{val} {unit}"
            entities["load_kg"] = f"{val} {unit}"

        # Thread size (e.g. M8, M6, M10, 1/4-20, 1/4")
        thread_match = re.search(r"\b(m[0-9]{1,2}|1/4-20|1/4\"?|3/8\"?)\b", msg_lower)
        if thread_match:
            entities["thread_size"] = thread_match.group(1).upper()
            if not category:
                category = "hardware"
            intent_type = "compatibility_check"

        # Substrates (concrete, drywall, brick, etc.)
        for sub in ["concrete", "drywall", "brick", "stone", "masonry", "wood", "plasterboard"]:
            if sub in msg_lower:
                entities["substrate"] = sub
                if not category:
                    category = "hardware"
                intent_type = "compatibility_check"

        # Dietary Preferences & Certifications
        if "gluten free" in msg_norm:
            entities.setdefault("dietary_preferences", []).append("gluten_free")
            category = "grocery_pharmacy"
            intent_type = "suitability_check"
        if "dairy free" in msg_norm:
            entities.setdefault("dietary_preferences", []).append("dairy_free")
            category = "grocery_pharmacy"
            intent_type = "suitability_check"
        if "lactose free" in msg_norm:
            entities.setdefault("dietary_preferences", []).append("lactose_free")
            category = "grocery_pharmacy"
            intent_type = "suitability_check"
        if "vegan" in msg_norm:
            entities.setdefault("dietary_preferences", []).append("vegan")
            category = "grocery_pharmacy"
            intent_type = "suitability_check"
        if "vegetarian" in msg_norm:
            entities.setdefault("dietary_preferences", []).append("vegetarian")
            category = "grocery_pharmacy"
            intent_type = "suitability_check"

        # Allergens / Intolerances
        # Nut / Tree nuts
        if ("tree nut" in msg_norm or "nut" in msg_norm or "peanut" in msg_norm) and ("allergy" in msg_norm or "allergic" in msg_norm):
            entities.setdefault("allergens", []).append("tree nuts")
            category = "grocery_pharmacy"
            intent_type = "suitability_check"
        # Lactose / Dairy
        if ("lactose" in msg_norm or "dairy" in msg_norm or "milk" in msg_norm) and ("intolerance" in msg_norm or "allergy" in msg_norm or "allergic" in msg_norm):
            entities.setdefault("allergens", []).append("lactose")
            entities.setdefault("allergens", []).append("dairy")
            category = "grocery_pharmacy"
            intent_type = "suitability_check"
        # Gluten / Celiac
        if ("celiac" in msg_norm or "gluten allergy" in msg_norm) and "gluten_free" not in entities.get("dietary_preferences", []):
            entities.setdefault("allergens", []).append("gluten")
            entities.setdefault("dietary_preferences", []).append("gluten_free")
            category = "grocery_pharmacy"
            intent_type = "suitability_check"

        # Device model extraction (HP, Epson, Canon, Dyson, etc.)
        device_match = re.search(r"\b((?:hp|epson|canon|brother|samsung|dyson)\s+[a-zA-Z0-9\s-]+?)(?:\s+printer|\s+vacuum|\?|$|,|\.)", msg_lower)
        if device_match:
            entities["device_model"] = device_match.group(1).title().strip()
            category = "electronics_accessory"
            intent_type = "compatibility_check"
        elif any(w in msg_lower for w in ["printer", "cartridge", "ink", "filter", "vacuum"]):
            category = "electronics_accessory"
            intent_type = "compatibility_check"
            # Generic model match after 'my', 'with', 'for'
            generic_model = re.search(r"\b(?:my|with|fit|for)\s+([a-zA-Z0-9\s-]+?)(?:\s+printer|\s+vacuum|\?|$)", msg_lower)
            if generic_model:
                clean_m = generic_model.group(1).strip()
                if len(clean_m) > 2 and clean_m not in ["this", "the", "my"]:
                    entities["device_model"] = clean_m.title()

        # Category detection fallback
        if not category:
            if any(w in msg_lower for w in ["dress", "kurta", "shirt", "top", "pant", "size m", "size l", "bust", "waist"]):
                category = "clothing"
            elif any(w in msg_lower for w in ["shoe", "shoes", "sneaker", "boot", "footwear", "foot"]):
                category = "footwear"
            elif any(w in msg_lower for w in ["sofa", "couch", "wardrobe", "table", "chair", "bed", "furniture", "door", "hallway", "opening"]):
                category = "furniture"
            elif any(w in msg_lower for w in ["cartridge", "ink", "mount", "charger", "vesa", "vacuum", "filter", "tv"]):
                category = "electronics_accessory"
            elif any(w in msg_lower for w in ["anchor", "bolt", "screw", "bracket", "thread", "hardware"]):
                category = "hardware"
            elif any(w in msg_lower for w in ["allergic", "allergen", "gluten", "vegan", "medicine", "tablet", "paracetamol", "cookies", "milk", "diet", "eat"]):
                category = "grocery_pharmacy"

        # Discovery intent
        if any(w in msg_lower for w in ["find", "looking for", "recommend", "search"]) or (("near me" in msg_lower or "available" in msg_lower) and not current_product_name):
            intent_type = "discovery"

        return ExtractedIntent(
            intent_type=intent_type,
            category=category,
            product_ref=current_product_name,
            target_variant=target_variant,
            entities=entities,
            shopper_constraints=shopper_constraints,
            wants_local_availability=wants_local_availability
        )

    def generate_response(
        self,
        user_message: str,
        verdict: str,
        reason: str,
        checks: List[Dict[str, Any]],
        citations: List[Dict[str, Any]],
        availability: List[Dict[str, Any]],
        product_name: str,
        notes: List[str]
    ) -> str:
        parts = [f"**Verdict: {verdict}**."]
        parts.append(reason)

        if notes:
            for note in notes:
                if note and note not in reason:
                    parts.append(note)

        if availability:
            nearest = availability[0]
            if nearest.get("qty", 0) > 0:
                parts.append(f"Available today: {nearest['qty']} in stock at {nearest['store']} ({nearest['distance_km']} km away).")
            else:
                in_stock = next((s for s in availability if s.get("qty", 0) > 0), None)
                if in_stock:
                    parts.append(f"Out of stock at nearest store ({nearest['store']}), but available at {in_stock['store']} ({in_stock['distance_km']} km away, {in_stock['qty']} in stock).")
                else:
                    parts.append("Currently out of stock within your local area.")

        return " ".join(parts)


class GeminiLLM(LLMClient):
    """Gemini SDK integration using google-genai library."""
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        self.mock_fallback = MockLLM()
        self.client = None
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"[GeminiLLM] Init warning: {e}. Falling back to MockLLM.")
                self.client = None

    def extract_intent(self, user_message: str, current_product_name: Optional[str] = None) -> ExtractedIntent:
        if not self.client:
            return self.mock_fallback.extract_intent(user_message, current_product_name)

        prompt = f"""You are a precise retail intent extractor. Extract structured information from the shopper's message.
Shopper Message: "{user_message}"
Current Product: "{current_product_name or 'None'}"

Return ONLY a valid JSON object matching this schema:
{{
  "intent_type": "fit_check" | "compatibility_check" | "suitability_check" | "availability_check" | "discovery",
  "category": "clothing" | "footwear" | "furniture" | "electronics_accessory" | "hardware" | "grocery_pharmacy" | null,
  "product_ref": string | null,
  "target_variant": string | null,
  "entities": {{
     "bust": string | null,
     "waist": string | null,
     "hip": string | null,
     "foot_length_cm": string | null,
     "door_width_cm": string | null,
     "device_model": string | null,
     "vesa": string | null,
     "tv_weight_kg": string | null,
     "thread_size": string | null,
     "load_kg": string | null,
     "allergens": list of strings,
     "dietary_preferences": list of strings
  }},
  "shopper_constraints": {{}},
  "wants_local_availability": boolean
}}
"""
        for attempt in range(2):
            try:
                response = self.client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt
                )
                text = response.text.strip()
                text = re.sub(r"^```(?:json)?", "", text)
                text = re.sub(r"```$", "", text).strip()
                data = json.loads(text)
                return ExtractedIntent(**data)
            except Exception:
                continue

        return self.mock_fallback.extract_intent(user_message, current_product_name)

    def generate_response(
        self,
        user_message: str,
        verdict: str,
        reason: str,
        checks: List[Dict[str, Any]],
        citations: List[Dict[str, Any]],
        availability: List[Dict[str, Any]],
        product_name: str,
        notes: List[str]
    ) -> str:
        if not self.client:
            return self.mock_fallback.generate_response(
                user_message, verdict, reason, checks, citations, availability, product_name, notes
            )

        prompt = f"""Paraphrase the following structured retail verification result into a helpful 2-3 sentence shopper answer.
STRICT NON-NEGOTIABLE GUARD:
- Do NOT introduce any new numbers, measurements, or facts not present in the structured data below.
- Verdict is {verdict}.

Product: {product_name}
Verdict: {verdict}
Reason: {reason}
Checks: {json.dumps(checks)}
Notes: {json.dumps(notes)}
Local Availability: {json.dumps(availability[:2] if availability else [])}
"""
        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            return response.text.strip()
        except Exception:
            return self.mock_fallback.generate_response(
                user_message, verdict, reason, checks, citations, availability, product_name, notes
            )
