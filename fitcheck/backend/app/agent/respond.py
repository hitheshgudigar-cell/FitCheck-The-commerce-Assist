import re
from typing import List, Dict, Any, Optional
from app.models import (
    AnswerPayload, RuleEvaluation, Citation, StoreAvailability,
    Alternative, Product, CheckResult, VerdictType
)
from app.agent.llm import LLMClient

def extract_numbers(text: str) -> List[float]:
    """Extract all numeric quantities from text for guard verification."""
    # Find numbers like 36, 29.5, 180, 200, 2.5
    matches = re.findall(r"\b\d+(?:\.\d+)?\b", text)
    return [float(m) for m in matches]

def verify_response_guard(generated_text: str, allowed_context: str) -> bool:
    """Non-negotiable Guard:
    Rejects answers containing numbers not present in the structured result context.
    """
    gen_nums = extract_numbers(generated_text)
    ctx_nums = set(extract_numbers(allowed_context))

    for num in gen_nums:
        # Ignore common innocuous numbers like 1, 2, 3 (e.g. step numbers or top items)
        if num in [1.0, 2.0, 3.0]:
            continue
        # Check if number is present in context within small tolerance
        if not any(abs(num - c) < 0.05 for c in ctx_nums):
            return False  # Hallucinated number detected!
    return True

class ResponseBuilder:
    def __init__(self, llm: LLMClient):
        self.llm = llm

    def build_answer(
        self,
        rule_eval: RuleEvaluation,
        citations: List[Citation],
        availability: List[StoreAvailability],
        alternatives: List[Alternative],
        user_message: str,
        product: Optional[Product] = None,
        clarifying_question: Optional[str] = None,
        confidence: str = "high"
    ) -> AnswerPayload:
        if clarifying_question:
            return AnswerPayload(
                verdict="CANNOT_CONFIRM",
                headline="Clarification Needed",
                explanation=clarifying_question,
                checks=[],
                citations=citations,
                availability=[],
                alternatives=[],
                clarifying_question=clarifying_question,
                confidence="medium",
                product=product
            )

        verdict: VerdictType = rule_eval.verdict
        checks = rule_eval.checks
        reason = rule_eval.reason
        notes = rule_eval.notes

        # Build headline
        headline = f"Verification: {verdict}"
        if verdict == "YES":
            if rule_eval.recommended_variant:
                headline = f"Compatible & Fits: Recommended {rule_eval.recommended_variant}"
            else:
                headline = "Verified Compatible / Fits Your Specifications"
        elif verdict == "NO":
            if rule_eval.recommended_variant:
                headline = f"Current Selection Mismatch (Recommended: {rule_eval.recommended_variant})"
            else:
                headline = "Specifications Do Not Match Authoritative Requirements"
        else:
            headline = "Cannot Confirm From Manufacturer Documentation"

        # Find recommended SKU
        recommended_sku = None
        if product and rule_eval.recommended_variant:
            # Search variants for matching name
            v_target = rule_eval.recommended_variant.strip().upper()
            for v in product.variants:
                if v_target in v.name.upper() or v.name.upper() in v_target or v.sku.upper() == v_target:
                    recommended_sku = v.sku
                    break
            if not recommended_sku and product.variants:
                recommended_sku = product.variants[0].sku

        # Prepare context for LLM response generation and guard
        prod_name = product.name if product else "Product"
        checks_data = [c.model_dump() for c in checks]
        cites_data = [c.model_dump() for c in citations]
        avail_data = [a.model_dump() for a in availability]

        # Generate explanation via LLM
        raw_explanation = self.llm.generate_response(
            user_message=user_message,
            verdict=verdict,
            reason=reason,
            checks=checks_data,
            citations=cites_data,
            availability=avail_data,
            product_name=prod_name,
            notes=notes
        )

        # Context string for numeric guard verification
        context_str = f"{reason} {' '.join(notes)} {str(checks_data)} {str(avail_data)} {str(cites_data)} {user_message}"
        if not verify_response_guard(raw_explanation, context_str):
            # Guard tripped: Fall back to pure structured reason + inventory to ensure zero hallucination
            parts = [f"**Verdict: {verdict}**.", reason]
            if notes:
                parts.extend([n for n in notes if n not in reason])
            if availability and availability[0].qty > 0:
                parts.append(f"In stock ({availability[0].qty} available) at {availability[0].store} ({availability[0].distance_km} km away).")
            explanation = " ".join(parts)
        else:
            explanation = raw_explanation

        return AnswerPayload(
            verdict=verdict,
            headline=headline,
            explanation=explanation,
            checks=checks,
            citations=citations,
            availability=availability,
            alternatives=alternatives,
            clarifying_question=None,
            confidence=confidence,
            recommended_sku=recommended_sku,
            product=product
        )
