from typing import Dict, Any, Optional, List
import yaml
from pathlib import Path

PROFILES_DIR = Path(__file__).resolve().parent.parent / "profiles"

class ClarifyManager:
    def __init__(self, profiles_dir: Path = PROFILES_DIR):
        self.profiles_dir = profiles_dir
        self.profiles: Dict[str, Dict[str, Any]] = {}
        self._load_profiles()

    def _load_profiles(self):
        if not self.profiles_dir.exists():
            return
        for p in self.profiles_dir.glob("*.yaml"):
            try:
                with open(p, "r", encoding="utf-8") as f:
                    data = yaml.safe_load(f)
                    cat = data.get("category")
                    if cat:
                        self.profiles[cat] = data
            except Exception as e:
                print(f"Error loading profile {p}: {e}")

    def get_profile(self, category_name: str) -> Optional[Dict[str, Any]]:
        if not category_name:
            return None
        c_clean = category_name.lower().strip()
        if c_clean in self.profiles:
            return self.profiles[c_clean]
        for cat, data in self.profiles.items():
            aliases = data.get("aliases", [])
            if c_clean in [a.lower() for a in aliases]:
                return data
        return None

    def find_missing_input_and_question(
        self,
        category: str,
        check_type: str,
        shopper_inputs: Dict[str, Any],
        product_attrs: Optional[Dict[str, Any]] = None
    ) -> Optional[str]:
        profile = self.get_profile(category)
        if not profile:
            return None

        clarifying_templates = profile.get("clarifying_questions", {})

        if product_attrs:
            # 1. Clothing:
            if category == "clothing":
                is_dress = "dress" in product_attrs.get("fit_type", "").lower() or "dress" in product_attrs.get("source_doc", "").lower()
                if is_dress:
                    if not (shopper_inputs.get("bust") or shopper_inputs.get("chest")):
                        return clarifying_templates.get("bust", "What is your chest or bust measurement (in inches or cm)?")
                    if not shopper_inputs.get("waist"):
                        return clarifying_templates.get("waist", "What is your waist measurement (in inches or cm)?")
                    return None
                else:
                    if not (shopper_inputs.get("chest") or shopper_inputs.get("bust")):
                        return clarifying_templates.get("chest", "What is your chest measurement (in inches or cm)?")
                    return None

            # 2. Footwear:
            if category == "footwear":
                if not shopper_inputs.get("foot_length_cm"):
                    return clarifying_templates.get("foot_length_cm", "What is your foot length in centimeters (or inches)?")
                return None

            # 3. Electronics: TV mount requires VESA; Cartridge/Filter requires device model
            if "supported_vesa" in product_attrs:
                if not shopper_inputs.get("vesa") and not shopper_inputs.get("device_model"):
                    return clarifying_templates.get("vesa", "What is the VESA mounting hole pattern on the back of your TV (e.g. 200x200 mm)?")
                return None

            if "supported_models" in product_attrs:
                if not shopper_inputs.get("device_model"):
                    return clarifying_templates.get("device_model", "What is your specific device model (e.g. Dyson V11, HP DeskJet 2331)?")
                return None

            # 4. Furniture: requires door_width_cm (if packaged dimensions are documented)
            if "packaged_dimensions_cm" in product_attrs:
                if product_attrs.get("packaged_dimensions_cm") is not None and not shopper_inputs.get("door_width_cm"):
                    return clarifying_templates.get("door_width_cm", "What is the width of your entry door or narrowest hallway passage in centimeters or inches?")
                return None

            # 5. Hardware: if any spec (thread_size, load_kg, substrate) is given, rule evaluates
            if "load_rating_kg" in product_attrs or "thread_size" in product_attrs:
                has_hw_input = bool(
                    shopper_inputs.get("thread_size") or shopper_inputs.get("load_kg") or shopper_inputs.get("substrate")
                )
                if has_hw_input:
                    return None

            # 6. Grocery & Pharmacy: if allergens or dietary preferences given, rule evaluates
            if "ingredients" in product_attrs or "dietary_flags" in product_attrs or "allergens" in product_attrs or "active_ingredients" in product_attrs:
                has_diet_input = bool(
                    shopper_inputs.get("allergens") or shopper_inputs.get("dietary_preferences")
                )
                if has_diet_input:
                    return None

        # Fallback to category profile required_inputs
        required_inputs_by_check = profile.get("required_inputs", {})
        req_list = required_inputs_by_check.get(check_type) or next(iter(required_inputs_by_check.values()), [])

        for req_field in req_list:
            if req_field in ["chest", "bust"]:
                if "chest" not in shopper_inputs and "bust" not in shopper_inputs:
                    return clarifying_templates.get("chest", clarifying_templates.get("bust", "What is your chest or bust measurement (in inches or cm)?"))
            elif req_field not in shopper_inputs or shopper_inputs[req_field] is None:
                q = clarifying_templates.get(req_field)
                if q:
                    return q
                return f"Could you please provide your {req_field.replace('_', ' ')}?"

        return None
