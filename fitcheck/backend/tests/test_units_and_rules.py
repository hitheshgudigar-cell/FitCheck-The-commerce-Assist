import pytest
from app.agent.units import (
    parse_length, cm_to_inches, inches_to_cm, parse_weight_kg,
    normalize_vesa, normalize_thread_size, normalize_model_name,
    check_model_compatibility
)
from app.agent.rules import (
    evaluate_clothing, evaluate_footwear, evaluate_furniture_clearance,
    evaluate_electronics, evaluate_hardware, evaluate_grocery_pharmacy
)
from app.agent.inventory import haversine_distance_km, InventoryService
from app.models import Location
from pathlib import Path

def test_unit_conversions():
    # Length parsing
    assert parse_length("36 in") == pytest.approx(91.44, 0.01)
    assert parse_length("36 inches") == pytest.approx(91.44, 0.01)
    assert parse_length('36"') == pytest.approx(91.44, 0.01)
    assert parse_length("100 cm") == 100.0
    assert parse_length("1000 mm") == 100.0
    assert parse_length(36, default_unit="in") == pytest.approx(91.44, 0.01)
    
    # Weight parsing
    assert parse_weight_kg("100 kg") == 100.0
    assert parse_weight_kg("500 g") == 0.5
    assert parse_weight_kg("10 lb") == pytest.approx(4.535, 0.01)

    # VESA normalization
    assert normalize_vesa("200x200") == "200x200"
    assert normalize_vesa("200 x 200 mm") == "200x200"
    assert normalize_vesa("400*400") == "400x400"

    # Thread size normalization
    assert normalize_thread_size("m8") == "M8"
    assert normalize_thread_size("M 8") == "M8"
    assert normalize_thread_size('1/4-20') == "1/4-20"
    assert normalize_thread_size('1/4"') == "1/4"

    # Model compatibility
    assert check_model_compatibility("HP DeskJet 2331", ["HP DeskJet 2331", "HP DeskJet 2722"]) is True
    assert check_model_compatibility("deskjet2331", ["HP DeskJet 2331"]) is True
    assert check_model_compatibility("Canon G2010", ["HP DeskJet 2331"]) is False

def test_clothing_rule_evaluation():
    size_chart = {
        "S": {"chest": [32, 34], "waist": [26, 28]},
        "M": {"chest": [35, 37], "waist": [28, 29.5]},
        "L": {"chest": [38, 40], "waist": [30, 33]}
    }
    attrs = {"size_chart": size_chart, "unit": "inches", "source_doc": "Test Size Guide"}

    # Case: Bust 36, Waist 30, asks "Will size M fit?"
    # In M: Bust 36 is within 35-37, but waist 30 > 29.5 (snug/tight)
    res = evaluate_clothing({"bust": 36, "waist": 30}, attrs, target_variant="M")
    assert res.verdict == "NO"
    assert res.recommended_variant == "L"
    assert any("snug" in n.lower() for n in res.notes)

    # Asks about Size L
    res_l = evaluate_clothing({"bust": 38, "waist": 31}, attrs, target_variant="L")
    assert res_l.verdict == "YES"
    assert res_l.recommended_variant == "L"

    # Missing inputs
    res_missing = evaluate_clothing({}, attrs)
    assert res_missing.verdict == "CANNOT_CONFIRM"

def test_footwear_rule_evaluation():
    size_chart = {
        "UK-7": [25.1, 25.8],
        "UK-8": [25.9, 26.6]
    }
    attrs = {"size_chart": size_chart, "source_doc": "Shoe Chart"}

    res = evaluate_footwear({"foot_length_cm": 26.2}, attrs, target_variant="UK-8")
    assert res.verdict == "YES"
    assert res.recommended_variant == "UK-8"

    res_no = evaluate_footwear({"foot_length_cm": 26.2}, attrs, target_variant="UK-7")
    assert res_no.verdict == "NO"
    assert res_no.recommended_variant == "UK-8"

    # Missing foot length
    res_missing = evaluate_footwear({}, attrs)
    assert res_missing.verdict == "CANNOT_CONFIRM"

def test_furniture_rule_evaluation():
    # Product with packaged dimensions
    attrs = {
        "packaged_dimensions_cm": {"length": 180, "width": 85, "height": 75},
        "source_doc": "Manual"
    }
    # Door width 80 cm: 75 cm min dim <= 80 cm
    res_fits = evaluate_furniture_clearance({"door_width_cm": 80}, attrs)
    assert res_fits.verdict == "YES"

    # Door width 70 cm: 75 cm > 70 cm
    res_no = evaluate_furniture_clearance({"door_width_cm": 70}, attrs)
    assert res_no.verdict == "NO"

    # NON-NEGOTIABLE PRINCIPLE: Missing packaged dimensions must return CANNOT_CONFIRM
    attrs_missing = {
        "packaged_dimensions_cm": None,
        "source_doc": "Manual"
    }
    res_missing = evaluate_furniture_clearance({"door_width_cm": 80}, attrs_missing)
    assert res_missing.verdict == "CANNOT_CONFIRM"

def test_electronics_rule_evaluation():
    attrs = {
        "supported_models": ["HP DeskJet 2331", "HP DeskJet 2722"],
        "source_doc": "Matrix"
    }
    res_yes = evaluate_electronics({"device_model": "HP DeskJet 2331"}, attrs)
    assert res_yes.verdict == "YES"

    res_no = evaluate_electronics({"device_model": "Epson L3150"}, attrs)
    assert res_no.verdict == "NO"

    # TV mount VESA test
    attrs_mount = {
        "supported_vesa": ["100x100", "200x200", "400x400"],
        "max_weight_kg": 45,
        "source_doc": "Mount Spec"
    }
    res_vesa_yes = evaluate_electronics({"vesa": "200x200", "tv_weight_kg": 20}, attrs_mount)
    assert res_vesa_yes.verdict == "YES"

    res_vesa_no = evaluate_electronics({"vesa": "600x400", "tv_weight_kg": 30}, attrs_mount)
    assert res_vesa_no.verdict == "NO"

def test_hardware_rule_evaluation():
    attrs = {
        "thread_size": "M8",
        "load_rating_kg": 150,
        "material": "Stainless Steel 304",
        "suitable_substrates": ["concrete", "brick"],
        "source_doc": "Anchor Spec"
    }
    res_yes = evaluate_hardware({"thread_size": "M8", "load_kg": 100, "substrate": "concrete"}, attrs)
    assert res_yes.verdict == "YES"

    res_no_load = evaluate_hardware({"thread_size": "M8", "load_kg": 200}, attrs)
    assert res_no_load.verdict == "NO"

def test_grocery_pharmacy_rule_evaluation():
    # Food item
    food_attrs = {
        "ingredients": ["almond flour"],
        "allergens": ["tree nuts", "almonds"],
        "dietary_flags": ["gluten_free", "vegan"],
        "is_pharmacy": False,
        "source_doc": "Label"
    }
    res_allergen_no = evaluate_grocery_pharmacy({"allergens": ["tree nuts"]}, food_attrs)
    assert res_allergen_no.verdict == "NO"

    res_vegan_yes = evaluate_grocery_pharmacy({"dietary_preferences": ["gluten_free", "vegan"]}, food_attrs)
    assert res_vegan_yes.verdict == "YES"

    # Pharmacy item must include medical disclaimer
    pharm_attrs = {
        "active_ingredients": ["Paracetamol 500mg"],
        "allergens": [],
        "dietary_flags": ["gluten_free"],
        "is_pharmacy": True,
        "source_doc": "Package Insert"
    }
    res_pharm = evaluate_grocery_pharmacy({"dietary_preferences": ["gluten_free"]}, pharm_attrs)
    assert res_pharm.verdict == "YES"
    assert any("consult a pharmacist or doctor" in n.lower() for n in res_pharm.notes)

def test_inventory_and_haversine():
    # Mysuru Devaraja Mohalla to Jayalakshmipuram ~ 3 km
    dist = haversine_distance_km(12.3106, 76.6528, 12.3215, 76.6265)
    assert 2.0 <= dist <= 4.0

    inv = InventoryService()
    stores = inv.get_all_stores()
    assert len(stores) == 6

    # Test stock lookup for Demo 1: SKU-AURA-DR-M is 0 at devaraja, but SKU-AURA-DR-L is 3
    avail_m = inv.check_availability("SKU-AURA-DR-M", Location(lat=12.3106, lng=76.6528))
    assert avail_m[0].store_id == "store_mysuru_devaraja"
    assert avail_m[0].qty == 0  # Out of stock at nearest!

    avail_l = inv.check_availability("SKU-AURA-DR-L", Location(lat=12.3106, lng=76.6528))
    assert avail_l[0].store_id == "store_mysuru_devaraja"
    assert avail_l[0].qty == 3  # In stock at nearest!
