import re
from typing import Optional, Tuple, Dict, Any

# Standard conversion factors to centimeters
LENGTH_TO_CM = {
    "mm": 0.1,
    "cm": 1.0,
    "m": 100.0,
    "meter": 100.0,
    "meters": 100.0,
    "in": 2.54,
    "inch": 2.54,
    "inches": 2.54,
    '"': 2.54,
    "ft": 30.48,
    "feet": 30.48,
    "foot": 30.48,
    "'": 30.48,
}

# Standard conversion factors to kilograms
WEIGHT_TO_KG = {
    "g": 0.001,
    "gram": 0.001,
    "grams": 0.001,
    "kg": 1.0,
    "kilogram": 1.0,
    "kilograms": 1.0,
    "lb": 0.45359237,
    "lbs": 0.45359237,
    "pound": 0.45359237,
    "pounds": 0.45359237,
}

def parse_length(value: Any, default_unit: str = "in") -> Optional[float]:
    """Parse a length representation into centimeters.
    If value is a number, assumes default_unit (e.g. 'in' for clothing bust/waist/hip, or 'cm' if specified).
    """
    if value is None:
        return None
    if isinstance(value, (int, float)):
        unit_factor = LENGTH_TO_CM.get(default_unit.lower(), 1.0)
        return float(value) * unit_factor

    val_str = str(value).strip().lower()
    # Match patterns like: 36 in, 36", 91.4cm, 2.5 ft, 10 inch, 25.5
    match = re.match(r"^([0-9]+(?:\.[0-9]+)?)\s*([a-z\"']*)?$", val_str)
    if match:
        num = float(match.group(1))
        unit = match.group(2) or default_unit
        factor = LENGTH_TO_CM.get(unit, LENGTH_TO_CM.get(default_unit, 1.0))
        return num * factor

    return None

def cm_to_inches(cm: float) -> float:
    return cm / 2.54

def inches_to_cm(inches: float) -> float:
    return inches * 2.54

def parse_weight_kg(value: Any, default_unit: str = "kg") -> Optional[float]:
    """Parse a weight representation into kilograms."""
    if value is None:
        return None
    if isinstance(value, (int, float)):
        unit_factor = WEIGHT_TO_KG.get(default_unit.lower(), 1.0)
        return float(value) * unit_factor

    val_str = str(value).strip().lower()
    match = re.match(r"^([0-9]+(?:\.[0-9]+)?)\s*([a-z]+)?$", val_str)
    if match:
        num = float(match.group(1))
        unit = match.group(2) or default_unit
        factor = WEIGHT_TO_KG.get(unit, WEIGHT_TO_KG.get(default_unit, 1.0))
        return num * factor

    return None

def normalize_vesa(vesa_str: Any) -> Optional[str]:
    """Normalize VESA pattern strings to standard format like '200x200'."""
    if not vesa_str:
        return None
    s = str(vesa_str).strip().lower()
    # Replace * with x, remove mm, spaces
    s = re.sub(r"\s+", "", s)
    s = s.replace("*", "x").replace("mm", "")
    match = re.match(r"^([0-9]+)x([0-9]+)$", s)
    if match:
        return f"{match.group(1)}x{match.group(2)}"
    return None

def normalize_thread_size(thread_str: Any) -> Optional[str]:
    """Normalize thread strings like 'M6', 'm8', '1/4-20', '1/4\"', '1/4 inch'."""
    if not thread_str:
        return None
    s = str(thread_str).strip().upper()
    # Check metric: M4, M6, M8, M10, M12
    metric_match = re.match(r"^M\s*([0-9]+)$", s, re.IGNORECASE)
    if metric_match:
        return f"M{metric_match.group(1)}"

    # Check imperial like 1/4-20, 1/4", 1/4 inch, 3/8", 1/2"
    s_clean = s.replace("INCH", "").replace('"', '').replace(" ", "")
    if "1/4" in s_clean:
        return "1/4-20" if "20" in s_clean else "1/4"
    if "3/8" in s_clean:
        return "3/8-16" if "16" in s_clean else "3/8"
    if "1/2" in s_clean:
        return "1/2-13" if "13" in s_clean else "1/2"

    return s.strip()

def normalize_model_name(model_str: Any) -> str:
    """Normalize model strings for fuzzy-exact matching.
    e.g. 'HP DeskJet 2331' -> 'deskjet2331', 'Dyson V11 Animal' -> 'dysonv11animal'
    """
    if not model_str:
        return ""
    # Lowercase, remove non-alphanumeric
    cleaned = re.sub(r"[^a-zA-Z0-9]", "", str(model_str).lower())
    # Strip common brand prefixes if needed for cross-match, but keep unified
    return cleaned

def check_model_compatibility(target_model: str, supported_models: list) -> bool:
    """Check if target_model is in supported_models after normalization."""
    if not target_model or not supported_models:
        return False
    norm_target = normalize_model_name(target_model)
    norm_supported = [normalize_model_name(m) for m in supported_models]
    
    # Exact match on normalized
    if norm_target in norm_supported:
        return True
    
    # Also check if target is substring or vice versa for models like 'Deskjet 2331' vs 'HP Deskjet 2331'
    for sm in norm_supported:
        if norm_target and sm and (norm_target in sm or sm in norm_target):
            return True
            
    return False
