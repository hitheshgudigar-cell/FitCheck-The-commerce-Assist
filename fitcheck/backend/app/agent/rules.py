from typing import Dict, Any, Optional, List
import math
from app.models import RuleEvaluation, CheckResult, VerdictType
from app.agent.units import (
    parse_length, cm_to_inches, inches_to_cm, parse_weight_kg,
    normalize_vesa, normalize_thread_size, check_model_compatibility
)

def evaluate_clothing(
    shopper_inputs: Dict[str, Any],
    product_attrs: Dict[str, Any],
    target_variant: Optional[str] = None
) -> RuleEvaluation:
    """Compare shopper chest/bust, waist, hip to clothing size chart.
    Returns best size, flags snug/loose per dimension, checks target variant if requested.
    """
    size_chart = product_attrs.get("size_chart", {})
    chart_unit = product_attrs.get("unit", "inches").lower()
    source_ref = product_attrs.get("source_doc", "Brand Size Guide")

    if not size_chart:
        return RuleEvaluation(
            verdict="CANNOT_CONFIRM",
            reason="Product size chart is missing from manufacturer specifications.",
            notes=["No authoritative size chart available for this product."]
        )

    # Extract shopper measurements
    chest_raw = shopper_inputs.get("bust") or shopper_inputs.get("chest")
    waist_raw = shopper_inputs.get("waist")
    hip_raw = shopper_inputs.get("hip")

    chest_cm = parse_length(chest_raw, default_unit="in" if chart_unit == "inches" else "cm") if chest_raw is not None else None
    waist_cm = parse_length(waist_raw, default_unit="in" if chart_unit == "inches" else "cm") if waist_raw is not None else None
    hip_cm = parse_length(hip_raw, default_unit="in" if chart_unit == "inches" else "cm") if hip_raw is not None else None

    # Shopper values converted to chart unit
    shopper_dims = {}
    if chest_cm is not None:
        shopper_dims["chest"] = round(chest_cm if chart_unit == "cm" else cm_to_inches(chest_cm), 1)
    if waist_cm is not None:
        shopper_dims["waist"] = round(waist_cm if chart_unit == "cm" else cm_to_inches(waist_cm), 1)
    if hip_cm is not None:
        shopper_dims["hip"] = round(hip_cm if chart_unit == "cm" else cm_to_inches(hip_cm), 1)

    if not shopper_dims:
        return RuleEvaluation(
            verdict="CANNOT_CONFIRM",
            reason="Shopper body measurements (bust/chest, waist, or hip) were not provided.",
            notes=["Please provide your bust, waist, or hip measurement."]
        )

    # Normalize target variant if given (e.g. 'M', 'Size M', 'Medium', '40')
    target_size = None
    if target_variant:
        t_clean = target_variant.strip().upper()
        num_to_size = {"38": "S", "40": "M", "42": "L", "44": "XL"}
        if t_clean in num_to_size:
            target_size = num_to_size[t_clean]
        else:
            for size_key in size_chart.keys():
                if size_key.upper() == t_clean or f"SIZE {size_key.upper()}" == t_clean or (size_key.upper() == "M" and "MEDIUM" in t_clean):
                    target_size = size_key
                    break
        if not target_size:
            target_size = target_variant.strip().upper()

    # Find fit per size
    size_evaluations = {}
    for size_name, dimensions in size_chart.items():
        checks = []
        is_pass = True
        notes = []
        is_snug = False

        for dim_name, user_val in shopper_dims.items():
            dim_range = dimensions.get(dim_name)
            if not dim_range or len(dim_range) != 2:
                continue
            min_val, max_val = dim_range[0], dim_range[1]

            if min_val <= user_val <= max_val:
                checks.append(CheckResult(
                    attribute=dim_name,
                    required=f"{min_val}-{max_val} {chart_unit}",
                    actual=f"{user_val} {chart_unit}",
                    passed=True,
                    source_ref=source_ref
                ))
            elif user_val > max_val:
                # If slightly above max (within 1.0 inch or 2.5 cm), consider snug
                tolerance = 1.0 if chart_unit == "inches" else 2.5
                if user_val <= max_val + tolerance:
                    is_snug = True
                    checks.append(CheckResult(
                        attribute=dim_name,
                        required=f"{min_val}-{max_val} {chart_unit}",
                        actual=f"{user_val} {chart_unit} (snug / tight fit)",
                        passed=False,
                        source_ref=source_ref
                    ))
                    notes.append(f"{dim_name.capitalize()} ({user_val} {chart_unit}) exceeds size {size_name} maximum ({max_val} {chart_unit}) - fit will be snug.")
                else:
                    is_pass = False
                    checks.append(CheckResult(
                        attribute=dim_name,
                        required=f"{min_val}-{max_val} {chart_unit}",
                        actual=f"{user_val} {chart_unit} (too small)",
                        passed=False,
                        source_ref=source_ref
                    ))
                    notes.append(f"{dim_name.capitalize()} ({user_val} {chart_unit}) exceeds size {size_name} maximum ({max_val} {chart_unit}).")
            else:
                # user_val < min_val: loose fit
                checks.append(CheckResult(
                    attribute=dim_name,
                    required=f"{min_val}-{max_val} {chart_unit}",
                    actual=f"{user_val} {chart_unit} (loose fit)",
                    passed=True,
                    source_ref=source_ref
                ))
                notes.append(f"{dim_name.capitalize()} ({user_val} {chart_unit}) is below size {size_name} minimum ({min_val} {chart_unit}) - loose fit.")

        size_evaluations[size_name] = {
            "checks": checks,
            "is_pass": is_pass and not is_snug,
            "is_snug": is_snug,
            "notes": notes
        }

    # Determine recommended size: size where all provided dimensions pass without being snug
    recommended = None
    for size_name, data in size_evaluations.items():
        if data["is_pass"]:
            recommended = size_name
            break

    # If no pure pass, look for the size with snug or next up
    if not recommended:
        for size_name, data in size_evaluations.items():
            if data["is_snug"]:
                # If snug, check if there is a larger size available
                size_keys = list(size_chart.keys())
                curr_idx = size_keys.index(size_name) if size_name in size_keys else -1
                if curr_idx != -1 and curr_idx + 1 < len(size_keys):
                    recommended = size_keys[curr_idx + 1]
                else:
                    recommended = size_name
                break

    # If user asked about a specific target size (e.g. "Will the M fit?")
    if target_size and target_size in size_evaluations:
        eval_data = size_evaluations[target_size]
        if eval_data["is_pass"]:
            return RuleEvaluation(
                verdict="YES",
                recommended_variant=target_size,
                checks=eval_data["checks"],
                reason=f"Size {target_size} matches your measurements based on the official size chart.",
                notes=eval_data["notes"]
            )
        elif eval_data["is_snug"]:
            rec_note = f"Size {target_size} will be snug at the waist/bust. Size {recommended} is recommended for a comfortable fit." if recommended and recommended != target_size else f"Size {target_size} will be snug."
            notes = eval_data["notes"] + [rec_note]
            return RuleEvaluation(
                verdict="NO",
                recommended_variant=recommended,
                checks=eval_data["checks"],
                reason=f"Size {target_size} will be snug based on your measurements. Recommended size is {recommended}.",
                notes=notes
            )
        else:
            return RuleEvaluation(
                verdict="NO",
                recommended_variant=recommended,
                checks=eval_data["checks"],
                reason=f"Size {target_size} does not fit your measurements. Recommended size is {recommended}.",
                notes=eval_data["notes"]
            )

    # General fit question without specific size
    if recommended and recommended in size_evaluations:
        eval_data = size_evaluations[recommended]
        return RuleEvaluation(
            verdict="YES",
            recommended_variant=recommended,
            checks=eval_data["checks"],
            reason=f"Recommended size is {recommended} based on your measurements.",
            notes=eval_data["notes"]
        )

    return RuleEvaluation(
        verdict="CANNOT_CONFIRM",
        reason="Unable to determine a matching size within the manufacturer chart ranges.",
        notes=["Measurements fall outside the standard size chart range."]
    )


def evaluate_footwear(
    shopper_inputs: Dict[str, Any],
    product_attrs: Dict[str, Any],
    target_variant: Optional[str] = None
) -> RuleEvaluation:
    """Map shopper foot length to brand footwear size chart."""
    size_chart = product_attrs.get("size_chart", {})
    source_ref = product_attrs.get("source_doc", "Manufacturer Footwear Sizing Table")

    if not size_chart:
        return RuleEvaluation(
            verdict="CANNOT_CONFIRM",
            reason="Footwear sizing chart is missing from product specifications.",
            notes=["No authoritative footwear chart available."]
        )

    foot_raw = shopper_inputs.get("foot_length_cm") or shopper_inputs.get("foot_length") or shopper_inputs.get("foot_length_in")
    if foot_raw is None:
        return RuleEvaluation(
            verdict="CANNOT_CONFIRM",
            reason="Foot length measurement was not provided.",
            notes=["Please provide your foot length in cm or inches."]
        )

    foot_cm = parse_length(foot_raw, default_unit="cm")
    if foot_cm is None:
        return RuleEvaluation(
            verdict="CANNOT_CONFIRM",
            reason="Invalid foot length value provided.",
            notes=["Could not parse foot length."]
        )

    # Normalize target variant
    target_size = None
    if target_variant:
        t_clean = target_variant.strip().upper().replace(" ", "-")
        for size_key in size_chart.keys():
            if size_key.upper() == t_clean or size_key.upper().replace("-", "") == t_clean.replace("-", "") or size_key.upper() == f"UK-{t_clean}":
                target_size = size_key
                break
        if not target_size:
            target_size = target_variant.strip()

    recommended_size = None
    checks = []

    for size_name, bounds in size_chart.items():
        dim_range = bounds.get("foot_length_cm", bounds) if isinstance(bounds, dict) else bounds
        if isinstance(dim_range, list) and len(dim_range) == 2:
            min_cm, max_cm = dim_range[0], dim_range[1]
            if min_cm <= foot_cm <= max_cm:
                recommended_size = size_name
                break

    # If target variant was specified
    if target_size and target_size in size_chart:
        bounds = size_chart[target_size]
        dim_range = bounds.get("foot_length_cm", bounds) if isinstance(bounds, dict) else bounds
        min_cm, max_cm = dim_range[0], dim_range[1]
        passed = min_cm <= foot_cm <= max_cm
        checks.append(CheckResult(
            attribute="foot_length_cm",
            required=f"{min_cm}-{max_cm} cm",
            actual=f"{round(foot_cm, 1)} cm",
            passed=passed,
            source_ref=source_ref
        ))

        if passed:
            return RuleEvaluation(
                verdict="YES",
                recommended_variant=target_size,
                checks=checks,
                reason=f"Size {target_size} matches your foot length ({round(foot_cm, 1)} cm).",
                notes=[f"Official chart specifies {min_cm}-{max_cm} cm for {target_size}."]
            )
        else:
            reason = f"Size {target_size} requires foot length {min_cm}-{max_cm} cm, but your foot length is {round(foot_cm, 1)} cm."
            return RuleEvaluation(
                verdict="NO",
                recommended_variant=recommended_size,
                checks=checks,
                reason=reason,
                notes=[f"Recommended size for your foot length is {recommended_size}." if recommended_size else "Foot length falls outside standard size ranges."]
            )

    if recommended_size:
        bounds = size_chart[recommended_size]
        dim_range = bounds.get("foot_length_cm", bounds) if isinstance(bounds, dict) else bounds
        min_cm, max_cm = dim_range[0], dim_range[1]
        checks.append(CheckResult(
            attribute="foot_length_cm",
            required=f"{min_cm}-{max_cm} cm",
            actual=f"{round(foot_cm, 1)} cm",
            passed=True,
            source_ref=source_ref
        ))
        return RuleEvaluation(
            verdict="YES",
            recommended_variant=recommended_size,
            checks=checks,
            reason=f"Recommended size is {recommended_size} for foot length {round(foot_cm, 1)} cm.",
            notes=[f"Based on manufacturer foot length guide: {min_cm}-{max_cm} cm."]
        )

    return RuleEvaluation(
        verdict="CANNOT_CONFIRM",
        reason=f"Foot length {round(foot_cm, 1)} cm does not match any entry in the manufacturer size chart.",
        notes=["Please double check the foot measurement or consult store staff."]
    )


def evaluate_furniture_clearance(
    shopper_inputs: Dict[str, Any],
    product_attrs: Dict[str, Any],
    target_variant: Optional[str] = None
) -> RuleEvaluation:
    """Check product packaged dimensions against door width and clearance.
    NON-NEGOTIABLE: If packaged dimensions are missing from docs, return CANNOT_CONFIRM.
    """
    source_ref = product_attrs.get("source_doc", "Product Assembly Manual & Packaging Specs")
    pkg_dims = product_attrs.get("packaged_dimensions_cm")

    # Critical non-negotiable rule: if packaged dims missing, return CANNOT_CONFIRM
    if not pkg_dims or not isinstance(pkg_dims, dict):
        return RuleEvaluation(
            verdict="CANNOT_CONFIRM",
            reason="Packaged dimensions are not specified in the manufacturer documentation or assembly manual.",
            notes=["Cannot verify entryway clearance without authoritative packaged box dimensions."]
        )

    box_l = pkg_dims.get("length")
    box_w = pkg_dims.get("width")
    box_h = pkg_dims.get("height")

    if box_l is None or box_w is None or box_h is None:
        return RuleEvaluation(
            verdict="CANNOT_CONFIRM",
            reason="Incomplete packaged dimensions in manufacturer documentation.",
            notes=["Packaged length, width, or height is missing."]
        )

    # Shopper inputs
    door_w_raw = shopper_inputs.get("door_width_cm") or shopper_inputs.get("door_width")
    if door_w_raw is None:
        return RuleEvaluation(
            verdict="CANNOT_CONFIRM",
            reason="Entryway or door width was not provided.",
            notes=["Please provide the door width in cm or inches."]
        )

    door_w_cm = parse_length(door_w_raw, default_unit="cm")
    if door_w_cm is None:
        return RuleEvaluation(
            verdict="CANNOT_CONFIRM",
            reason="Invalid door width provided.",
            notes=["Could not parse door width."]
        )

    door_h_raw = shopper_inputs.get("door_height_cm") or shopper_inputs.get("door_height") or 200.0
    door_h_cm = parse_length(door_h_raw, default_unit="cm") or 200.0

    # Sort packaged dimensions
    sorted_dims = sorted([box_l, box_w, box_h])
    min_dim, mid_dim, max_dim = sorted_dims[0], sorted_dims[1], sorted_dims[2]

    checks = []
    # Check 1: Minimum dimension vs door width (box can be carried turned on its smallest face)
    width_passed = min_dim <= door_w_cm
    checks.append(CheckResult(
        attribute="entry_clearance_width",
        required=f">= {min_dim} cm (minimum packaged dimension)",
        actual=f"{round(door_w_cm, 1)} cm (door width)",
        passed=width_passed,
        source_ref=source_ref
    ))

    # Check 2: Second dimension vs door height
    height_passed = mid_dim <= door_h_cm
    checks.append(CheckResult(
        attribute="entry_clearance_height",
        required=f">= {mid_dim} cm (secondary packaged dimension)",
        actual=f"{round(door_h_cm, 1)} cm (door height)",
        passed=height_passed,
        source_ref=source_ref
    ))

    # Diagonal clearance
    diagonal_dim = round(math.sqrt(min_dim**2 + mid_dim**2), 1)

    if width_passed and height_passed:
        clearance_margin = round(door_w_cm - min_dim, 1)
        return RuleEvaluation(
            verdict="YES",
            checks=checks,
            reason=f"The packaged box ({box_l}x{box_w}x{box_h} cm) will fit through the {round(door_w_cm, 1)} cm door with {clearance_margin} cm clearance margin.",
            notes=[
                f"Smallest packaged face is {min_dim} cm x {mid_dim} cm.",
                f"Requires minimum doorway width of {min_dim} cm."
            ]
        )
    else:
        deficit = round(min_dim - door_w_cm, 1)
        return RuleEvaluation(
            verdict="NO",
            checks=checks,
            reason=f"The packaged box ({box_l}x{box_w}x{box_h} cm) requires a minimum door width of {min_dim} cm, but your door is {round(door_w_cm, 1)} cm ({deficit} cm too narrow).",
            notes=[
                f"The minimum cross-section is {min_dim} cm x {mid_dim} cm.",
                "The item will not pass through the entryway without unboxing or disassembly."
            ]
        )


def evaluate_electronics(
    shopper_inputs: Dict[str, Any],
    product_attrs: Dict[str, Any],
    target_variant: Optional[str] = None
) -> RuleEvaluation:
    """Check electronics accessories: model compatibility, VESA mount, wattage/voltage."""
    source_ref = product_attrs.get("source_doc", "Hardware Compatibility Matrix")
    checks = []

    # 1. Device model list check (e.g. printer cartridges, vacuum filters, phone cases)
    supported_models = product_attrs.get("supported_models")
    shopper_model = shopper_inputs.get("device_model") or shopper_inputs.get("model") or shopper_inputs.get("printer_model") or shopper_inputs.get("vacuum_model")

    # 2. VESA mount check
    supported_vesa = product_attrs.get("supported_vesa")
    shopper_vesa_raw = shopper_inputs.get("vesa") or shopper_inputs.get("vesa_pattern") or shopper_inputs.get("vesa_mount")

    # 3. Weight capacity check (e.g. TV mounts)
    max_weight_kg = product_attrs.get("max_weight_kg")
    shopper_weight_raw = shopper_inputs.get("tv_weight_kg") or shopper_inputs.get("weight_kg") or shopper_inputs.get("device_weight")

    # 4. Wattage / protocol check (e.g. chargers)
    supported_protocols = product_attrs.get("supported_protocols")
    product_wattage = product_attrs.get("wattage")
    shopper_wattage = shopper_inputs.get("wattage") or shopper_inputs.get("required_wattage")

    # Case A: TV Mount with VESA and weight
    if supported_vesa:
        if not shopper_vesa_raw and not shopper_model:
            return RuleEvaluation(
                verdict="CANNOT_CONFIRM",
                reason="VESA pattern or TV model was not provided.",
                notes=["Please provide your TV's VESA pattern (e.g., 200x200 mm) or TV model and weight."]
            )

        norm_user_vesa = normalize_vesa(shopper_vesa_raw) if shopper_vesa_raw else None
        norm_supported_vesa = [normalize_vesa(v) for v in supported_vesa]

        vesa_passed = norm_user_vesa in norm_supported_vesa if norm_user_vesa else False
        checks.append(CheckResult(
            attribute="vesa_pattern",
            required=f"One of {supported_vesa}",
            actual=str(shopper_vesa_raw),
            passed=vesa_passed,
            source_ref=source_ref
        ))

        weight_passed = True
        if max_weight_kg and shopper_weight_raw:
            shopper_weight = parse_weight_kg(shopper_weight_raw)
            if shopper_weight:
                weight_passed = shopper_weight <= max_weight_kg
                checks.append(CheckResult(
                    attribute="tv_weight_capacity",
                    required=f"<= {max_weight_kg} kg",
                    actual=f"{shopper_weight} kg",
                    passed=weight_passed,
                    source_ref=source_ref
                ))

        if vesa_passed and weight_passed:
            return RuleEvaluation(
                verdict="YES",
                checks=checks,
                reason=f"Compatible: VESA pattern {shopper_vesa_raw} and weight are within the mount's certified specifications.",
                notes=[f"Certified VESA patterns: {', '.join(supported_vesa)}."]
            )
        else:
            fail_reasons = []
            if not vesa_passed:
                fail_reasons.append(f"VESA pattern {shopper_vesa_raw} is not supported (supported: {', '.join(supported_vesa)})")
            if not weight_passed:
                fail_reasons.append(f"TV weight exceeds mount limit of {max_weight_kg} kg")
            return RuleEvaluation(
                verdict="NO",
                checks=checks,
                reason="Incompatible with your TV: " + "; ".join(fail_reasons) + ".",
                notes=[f"Supported VESA patterns: {', '.join(supported_vesa)}.", f"Max weight: {max_weight_kg} kg."]
            )

    # Case B: Supported models list (printers, vacuum filters, etc.)
    if supported_models:
        if not shopper_model:
            return RuleEvaluation(
                verdict="CANNOT_CONFIRM",
                reason="Device model was not specified.",
                notes=["Please provide your exact device model name or number."]
            )

        is_compat = check_model_compatibility(shopper_model, supported_models)
        checks.append(CheckResult(
            attribute="supported_models",
            required="Listed in manufacturer compatibility matrix",
            actual=str(shopper_model),
            passed=is_compat,
            source_ref=source_ref
        ))

        if is_compat:
            return RuleEvaluation(
                verdict="YES",
                checks=checks,
                reason=f"Compatible: Your model '{shopper_model}' is explicitly listed in the manufacturer compatibility matrix.",
                notes=[f"Verified against {source_ref}."]
            )
        else:
            return RuleEvaluation(
                verdict="NO",
                checks=checks,
                reason=f"Incompatible: Model '{shopper_model}' is not in the manufacturer's supported device list.",
                notes=[f"Authoritative manual lists compatible models: {', '.join(supported_models[:5])}..."]
            )

    # Case C: Charger / Power adapter
    if product_wattage and shopper_wattage:
        try:
            req_w = float(shopper_wattage)
            cap_w = float(product_wattage)
            wattage_pass = cap_w >= req_w
            checks.append(CheckResult(
                attribute="wattage_delivery",
                required=f">= {req_w}W",
                actual=f"{cap_w}W",
                passed=wattage_pass,
                source_ref=source_ref
            ))
            if wattage_pass:
                return RuleEvaluation(
                    verdict="YES",
                    checks=checks,
                    reason=f"Compatible: The {cap_w}W output meets or exceeds your required {req_w}W.",
                    notes=["Supports standard USB Power Delivery negotiated charging."]
                )
            else:
                return RuleEvaluation(
                    verdict="NO",
                    checks=checks,
                    reason=f"Underpowered: The charger delivers {cap_w}W, but your device requires at least {req_w}W.",
                    notes=["Using an underpowered charger may result in slow charging or battery discharge under load."]
                )
        except ValueError:
            pass

    return RuleEvaluation(
        verdict="CANNOT_CONFIRM",
        reason="Unable to determine compatibility from provided device specifications.",
        notes=["Please provide specific device model or connection requirements."]
    )


def evaluate_hardware(
    shopper_inputs: Dict[str, Any],
    product_attrs: Dict[str, Any],
    target_variant: Optional[str] = None
) -> RuleEvaluation:
    """Compare thread size, load rating, substrate, and material."""
    source_ref = product_attrs.get("source_doc", "Technical Data Sheet & Load Tables")
    checks = []

    prod_thread = product_attrs.get("thread_size")
    prod_load_kg = product_attrs.get("load_rating_kg")
    prod_substrates = product_attrs.get("suitable_substrates", [])
    prod_material = product_attrs.get("material")

    user_thread_raw = shopper_inputs.get("thread_size") or shopper_inputs.get("thread")
    user_load_raw = shopper_inputs.get("load_kg") or shopper_inputs.get("weight_kg") or shopper_inputs.get("load")
    user_substrate = shopper_inputs.get("substrate") or shopper_inputs.get("wall_type") or shopper_inputs.get("material_type")

    if not user_thread_raw and not user_load_raw and not user_substrate:
        return RuleEvaluation(
            verdict="CANNOT_CONFIRM",
            reason="Hardware specifications (thread size, required load, or substrate) were not provided.",
            notes=["Please provide your required thread size (e.g., M8) or load requirement in kg."]
        )

    all_passed = True

    # 1. Thread size check
    if user_thread_raw and prod_thread:
        norm_user_thread = normalize_thread_size(user_thread_raw)
        norm_prod_thread = normalize_thread_size(prod_thread)
        thread_pass = norm_user_thread == norm_prod_thread
        checks.append(CheckResult(
            attribute="thread_size",
            required=norm_user_thread,
            actual=norm_prod_thread,
            passed=thread_pass,
            source_ref=source_ref
        ))
        if not thread_pass:
            all_passed = False

    # 2. Load rating check
    if user_load_raw and prod_load_kg:
        user_load = parse_weight_kg(user_load_raw)
        if user_load is not None:
            load_pass = prod_load_kg >= user_load
            checks.append(CheckResult(
                attribute="safe_working_load",
                required=f"<= {prod_load_kg} kg rated capacity",
                actual=f"{round(user_load, 1)} kg required load",
                passed=load_pass,
                source_ref=source_ref
            ))
            if not load_pass:
                all_passed = False

    # 3. Substrate check
    if user_substrate and prod_substrates:
        sub_str = str(user_substrate).lower().strip()
        matched_substrate = any(sub_str in s.lower() or s.lower() in sub_str for s in prod_substrates)
        checks.append(CheckResult(
            attribute="substrate_compatibility",
            required=f"One of {prod_substrates}",
            actual=user_substrate,
            passed=matched_substrate,
            source_ref=source_ref
        ))
        if not matched_substrate:
            all_passed = False

    if all_passed:
        return RuleEvaluation(
            verdict="YES",
            checks=checks,
            reason="Compatible: Product specifications satisfy your mechanical and load requirements.",
            notes=[f"Rated load: {prod_load_kg} kg; Material: {prod_material}."]
        )
    else:
        failed_attrs = [c.attribute for c in checks if c.passed is False]
        return RuleEvaluation(
            verdict="NO",
            checks=checks,
            reason=f"Requirements not met for: {', '.join(failed_attrs)}.",
            notes=["Do not exceed rated load limits as specified in technical data sheet."]
        )


def evaluate_grocery_pharmacy(
    shopper_inputs: Dict[str, Any],
    product_attrs: Dict[str, Any],
    target_variant: Optional[str] = None
) -> RuleEvaluation:
    """Compare product ingredients, allergens, and dietary flags against shopper needs.
    MANDATORY: For pharmacy items, always add disclaimer:
    'Consult a pharmacist or doctor for medical decisions; never give dosage or medical advice.'
    """
    source_ref = product_attrs.get("source_doc", "Product Packaging Label & Facts")
    is_pharmacy = product_attrs.get("is_pharmacy", False)

    pharmacy_disclaimer = "Consult a pharmacist or doctor for medical decisions. FitCheck reports label facts only and does not provide dosage or medical advice."

    allergens_prod = [a.lower().strip() for a in product_attrs.get("allergens", [])]
    ingredients_prod = [i.lower().strip() for i in product_attrs.get("ingredients", [])]
    dietary_prod = [d.lower().strip() for d in product_attrs.get("dietary_flags", [])]
    active_ingredients = [a.lower().strip() for a in product_attrs.get("active_ingredients", [])]

    # Shopper constraints
    user_allergens = shopper_inputs.get("allergens", [])
    if isinstance(user_allergens, str):
        user_allergens = [s.strip() for s in user_allergens.split(",")]
    user_allergens = [a.lower().strip() for a in user_allergens]

    user_dietary = shopper_inputs.get("dietary_preferences", []) or shopper_inputs.get("dietary", [])
    if isinstance(user_dietary, str):
        user_dietary = [s.strip() for s in user_dietary.split(",")]
    user_dietary = [d.lower().strip() for d in user_dietary]

    # If user provided a specific allergy or requirement
    allergy_check = shopper_inputs.get("allergy")
    if allergy_check and allergy_check.lower() not in user_allergens:
        user_allergens.append(allergy_check.lower().strip())

    if not user_allergens and not user_dietary:
        notes = [pharmacy_disclaimer] if is_pharmacy else ["No dietary constraints provided."]
        return RuleEvaluation(
            verdict="CANNOT_CONFIRM",
            reason="No dietary preferences, allergen restrictions, or specific ingredient queries were provided.",
            notes=notes
        )

    checks = []
    conflict_found = False
    conflict_reasons = []

    # Check allergens
    for allergen in user_allergens:
        # Check against allergen list and ingredient list
        present_in_allergens = any(allergen in a or a in allergen for a in allergens_prod)
        present_in_ingredients = any(allergen in i for i in ingredients_prod)

        has_allergen = present_in_allergens or present_in_ingredients
        checks.append(CheckResult(
            attribute=f"allergen_free_{allergen}",
            required=f"Zero {allergen}",
            actual=f"Contains {allergen}" if has_allergen else f"No {allergen} listed on label",
            passed=not has_allergen,
            source_ref=source_ref
        ))

        if has_allergen:
            conflict_found = True
            conflict_reasons.append(f"Contains allergen: {allergen}")

    # Check dietary preferences (e.g. vegan, gluten_free)
    for pref in user_dietary:
        pref_norm = pref.replace("-", "_").replace(" ", "_")
        matches = any(pref_norm == d.replace("-", "_") for d in dietary_prod)
        checks.append(CheckResult(
            attribute=f"dietary_{pref_norm}",
            required=f"Certified / labeled {pref}",
            actual=f"Labeled {pref}" if matches else f"Not certified / labeled {pref}",
            passed=matches,
            source_ref=source_ref
        ))
        if not matches:
            conflict_found = True
            conflict_reasons.append(f"Not labeled or certified as {pref}")

    notes = []
    if is_pharmacy:
        notes.append(pharmacy_disclaimer)

    if conflict_found:
        return RuleEvaluation(
            verdict="NO",
            checks=checks,
            reason="Unsuitable based on product packaging label: " + "; ".join(conflict_reasons) + ".",
            notes=notes
        )
    else:
        label_summary = f"Verified free from stated allergens ({', '.join(user_allergens)})" if user_allergens else "Meets stated dietary preferences"
        return RuleEvaluation(
            verdict="YES",
            checks=checks,
            reason=f"Suitable: {label_summary} according to official product label.",
            notes=notes
        )

# Mapping of rule name to evaluator function
EVALUATE_RULES = {
    "clothing_size_match": evaluate_clothing,
    "footwear_size_match": evaluate_footwear,
    "furniture_clearance_match": evaluate_furniture_clearance,
    "electronics_compatibility_match": evaluate_electronics,
    "hardware_fitment_match": evaluate_hardware,
    "dietary_allergen_match": evaluate_grocery_pharmacy,
}
