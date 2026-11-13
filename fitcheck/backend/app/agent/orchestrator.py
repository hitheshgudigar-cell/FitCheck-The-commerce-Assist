import os
from typing import Dict, Any, Optional, List, Tuple
from app.models import (
    AnswerPayload, Product, ShopperProfile, Location,
    RuleEvaluation, Citation, StoreAvailability, Alternative,
    CheckResult
)
from app.agent.llm import LLMClient, GeminiLLM, MockLLM, ExtractedIntent
from app.agent.intent import IntentExtractor
from app.agent.clarify import ClarifyManager
from app.agent.retrieval import DocRetriever
from app.agent.inventory import InventoryService
from app.agent.rules import EVALUATE_RULES
from app.agent.respond import ResponseBuilder

class Orchestrator:
    def __init__(
        self,
        llm: Optional[LLMClient] = None,
        retriever: Optional[DocRetriever] = None,
        inventory_service: Optional[InventoryService] = None
    ):
        if llm:
            self.llm = llm
        elif os.environ.get("GEMINI_API_KEY"):
            self.llm = GeminiLLM()
        else:
            self.llm = MockLLM()

        self.retriever = retriever or DocRetriever()
        self.inventory = inventory_service or InventoryService()
        self.clarify_mgr = ClarifyManager()
        self.intent_extractor = IntentExtractor(self.llm)
        self.response_builder = ResponseBuilder(self.llm)

        # In-memory session store
        self.sessions: Dict[str, ShopperProfile] = {}

    def get_or_create_session(self, session_id: str) -> ShopperProfile:
        if session_id not in self.sessions:
            self.sessions[session_id] = ShopperProfile(
                location=Location(lat=12.3106, lng=76.6528, city="Mysuru"),
                radius_km=10.0
            )
        return self.sessions[session_id]

    def update_session_profile(self, session_id: str, updates: Dict[str, Any]) -> ShopperProfile:
        prof = self.get_or_create_session(session_id)
        if "location" in updates and updates["location"]:
            loc_data = updates["location"]
            if isinstance(loc_data, dict):
                prof.location = Location(**loc_data)
            elif isinstance(loc_data, Location):
                prof.location = loc_data
        if "radius_km" in updates and updates["radius_km"] is not None:
            prof.radius_km = float(updates["radius_km"])
        if "measurements" in updates and updates["measurements"]:
            prof.measurements.update(updates["measurements"])
        if "spaces" in updates and updates["spaces"]:
            prof.spaces.update(updates["spaces"])
        if "devices" in updates and updates["devices"]:
            prof.devices.extend(updates["devices"])
        if "dietary" in updates and updates["dietary"]:
            for d in updates["dietary"]:
                if d not in prof.dietary:
                    prof.dietary.append(d)
        return prof

    def _sync_entities_to_session(self, session: ShopperProfile, entities: Dict[str, Any]):
        for k in ["bust", "chest", "waist", "hip", "foot_length_cm"]:
            if k in entities and entities[k]:
                session.measurements[k] = entities[k]
        for k in ["door_width_cm", "door_height_cm"]:
            if k in entities and entities[k]:
                session.spaces[k] = entities[k]
        if "device_model" in entities and entities["device_model"]:
            session.devices.append({"model": entities["device_model"]})
        if "allergens" in entities and entities["allergens"]:
            for a in entities["allergens"]:
                if a not in session.dietary:
                    session.dietary.append(a)
        if "dietary_preferences" in entities and entities["dietary_preferences"]:
            for d in entities["dietary_preferences"]:
                if d not in session.dietary:
                    session.dietary.append(d)

    def _merge_session_with_inputs(self, session: ShopperProfile, entities: Dict[str, Any]) -> Dict[str, Any]:
        combined = {}
        combined.update(session.measurements)
        combined.update(session.spaces)
        if session.devices:
            combined["device_model"] = session.devices[-1].get("model")
        if session.dietary:
            combined["dietary_preferences"] = session.dietary
            combined["allergens"] = session.dietary
        combined.update(entities)
        return combined

    def handle_discovery(
        self,
        query: str,
        category: Optional[str],
        session: ShopperProfile,
        target_variant: Optional[str] = None
    ) -> AnswerPayload:
        all_products = self.intent_extractor.products
        candidates = []

        q_lower = query.lower()
        for p in all_products:
            if category and p.category != category:
                continue
            p_text = f"{p.name} {p.brand} {p.attributes.get('color', '')}".lower()
            score = 0
            for term in q_lower.split():
                if len(term) > 2 and term in p_text:
                    score += 15
            if "black dress" in q_lower and "black midi dress" in p_text:
                score += 50
            if score > 0 or not category:
                candidates.append((p, score))

        candidates.sort(key=lambda x: x[1], reverse=True)
        top_prods = [c[0] for c in candidates[:5]] if candidates else all_products[:5]

        ranked_results = []
        for prod in top_prods:
            target_sku = None
            if target_variant:
                t_clean = target_variant.strip().upper()
                for v in prod.variants:
                    if t_clean in v.name.upper() or t_clean in v.sku:
                        target_sku = v.sku
                        break
            if not target_sku and prod.variants:
                target_sku = prod.variants[0].sku

            avail = self.inventory.check_availability(
                target_sku,
                shopper_loc=session.location,
                radius_km=session.radius_km
            ) if target_sku else []

            has_local_stock = any(a.qty > 0 and a.distance_km <= session.radius_km for a in avail)
            min_dist = min([a.distance_km for a in avail]) if avail else 999.0
            stock_score = 10 if has_local_stock else 0
            rank = (stock_score, -min_dist)

            ranked_results.append({
                "product": prod,
                "availability": avail,
                "target_sku": target_sku,
                "rank": rank
            })

        ranked_results.sort(key=lambda x: x["rank"], reverse=True)

        if not ranked_results:
            return AnswerPayload(
                verdict="CANNOT_CONFIRM",
                headline="No Matching Products Found",
                explanation="No products matched your search criteria within local inventory.",
                checks=[],
                citations=[],
                availability=[],
                alternatives=[],
                clarifying_question=None,
                confidence="low"
            )

        best = ranked_results[0]
        best_prod = best["product"]
        best_avail = best["availability"]
        best_sku = best["target_sku"]

        # Fetch citation from authoritative doc
        citations = []
        if best_prod.docs:
            citations = self.retriever.retrieve(query, doc_ids=best_prod.docs, top_k=2)

        alts = []
        for r in ranked_results[1:3]:
            alts.append(Alternative(
                product_id=r["product"].id,
                product_name=r["product"].name,
                variant_sku=r["target_sku"],
                reason=f"Alternative in-stock match ({r['product'].brand})",
                availability=r["availability"][:2]
            ))

        target_name = f"size {target_variant}" if target_variant else "in stock"
        headline = f"Found: {best_prod.name} ({target_name})"
        nearest = best_avail[0] if best_avail else None
        stock_msg = f"{nearest.qty} available at {nearest.store} ({nearest.distance_km} km away)" if nearest and nearest.qty > 0 else "check store stock"

        explanation = f"**Verdict: YES**. Found **{best_prod.name}** ({best_prod.brand}). Local inventory confirms {stock_msg}."

        return AnswerPayload(
            verdict="YES",
            headline=headline,
            explanation=explanation,
            checks=[
                CheckResult(
                    attribute="local_inventory",
                    required="In stock within local radius",
                    actual=f"{nearest.qty} in stock at {nearest.store}" if nearest else "Out of stock",
                    passed=bool(nearest and nearest.qty > 0),
                    source_ref="Local Store Inventory Database"
                )
            ],
            citations=citations,
            availability=best_avail,
            alternatives=alts,
            clarifying_question=None,
            confidence="high",
            recommended_sku=best_sku,
            product=best_prod
        )

    def run(
        self,
        session_id: str,
        message: str,
        explicit_product_id: Optional[str] = None,
        location: Optional[Location] = None,
        radius_km: Optional[float] = None
    ) -> AnswerPayload:
        session = self.get_or_create_session(session_id)
        if location:
            session.location = location
        if radius_km:
            session.radius_km = radius_km

        # 1. INTENT & Product match
        intent, product = self.intent_extractor.process(
            message=message,
            explicit_product_id=explicit_product_id
        )

        self._sync_entities_to_session(session, intent.entities)

        # Discovery Mode check: ONLY when NO explicit_product_id is provided
        has_measurements = bool(
            intent.entities.get("bust") or intent.entities.get("chest") or
            intent.entities.get("foot_length_cm") or intent.entities.get("door_width_cm") or
            intent.entities.get("vesa")
        )
        if not explicit_product_id and (intent.intent_type == "discovery" or intent.wants_local_availability) and not has_measurements:
            return self.handle_discovery(
                query=message,
                category=intent.category or (product.category if product else None),
                session=session,
                target_variant=intent.target_variant
            )

        if not product:
            return AnswerPayload(
                verdict="CANNOT_CONFIRM",
                headline="Product Not Found",
                explanation="Could not find the product you are asking about in our authoritative store catalog.",
                checks=[],
                citations=[],
                availability=[],
                alternatives=[],
                clarifying_question=None,
                confidence="low"
            )

        # 2. PROFILE: Load category profile
        category = product.category
        profile_data = self.clarify_mgr.get_profile(category)
        if not profile_data:
            return AnswerPayload(
                verdict="CANNOT_CONFIRM",
                headline="Unsupported Category",
                explanation=f"Category '{category}' does not have an active verification profile.",
                checks=[],
                citations=[],
                availability=[],
                alternatives=[],
                clarifying_question=None,
                confidence="low",
                product=product
            )

        # 3. MISSING INFO: Check required inputs
        shopper_inputs = self._merge_session_with_inputs(session, intent.entities)

        supported_checks = profile_data.get("check_types", ["fit"])
        check_type = supported_checks[0]
        if "compatibility" in supported_checks and (intent.intent_type == "compatibility_check" or "compatible" in message.lower() or "work with" in message.lower()):
            check_type = "compatibility"
        elif "suitability" in supported_checks and (intent.intent_type == "suitability_check" or "allergic" in message.lower() or "suitable" in message.lower()):
            check_type = "suitability"

        missing_question = self.clarify_mgr.find_missing_input_and_question(
            category=category,
            check_type=check_type,
            shopper_inputs=shopper_inputs,
            product_attrs=product.attributes
        )

        if missing_question:
            cites = self.retriever.retrieve(message, doc_ids=product.docs, top_k=1)
            return self.response_builder.build_answer(
                rule_eval=RuleEvaluation(
                    verdict="CANNOT_CONFIRM",
                    reason="Required shopper measurement or model specification missing.",
                    checks=[]
                ),
                citations=cites,
                availability=[],
                alternatives=[],
                user_message=message,
                product=product,
                clarifying_question=missing_question,
                confidence="medium"
            )

        # 4. RETRIEVE: Fetch top-k chunks from authoritative docs only
        citations = self.retriever.retrieve(message, doc_ids=product.docs, top_k=2)

        # 5. RULES: Run deterministic comparator
        rule_name = profile_data.get("rule")
        rule_fn = EVALUATE_RULES.get(rule_name)

        if not rule_fn:
            rule_eval = RuleEvaluation(
                verdict="CANNOT_CONFIRM",
                reason=f"No deterministic evaluator found for rule '{rule_name}'.",
                checks=[]
            )
        else:
            rule_eval = rule_fn(
                shopper_inputs=shopper_inputs,
                product_attrs=product.attributes,
                target_variant=intent.target_variant
            )

        if citations:
            top_cite = citations[0]
            for check in rule_eval.checks:
                if not check.source_ref:
                    check.source_ref = f"{top_cite.doc} (Page {top_cite.page})"

        # 6. INVENTORY
        target_variant_sku = None
        if rule_eval.recommended_variant:
            rec_clean = rule_eval.recommended_variant.strip().upper()
            for v in product.variants:
                if rec_clean in v.name.upper() or rec_clean in v.sku:
                    target_variant_sku = v.sku
                    break

        if not target_variant_sku and intent.target_variant:
            t_clean = intent.target_variant.strip().upper()
            for v in product.variants:
                if t_clean in v.name.upper() or t_clean in v.sku:
                    target_variant_sku = v.sku
                    break

        if not target_variant_sku and product.variants:
            target_variant_sku = product.variants[0].sku

        availability = []
        if target_variant_sku:
            availability = self.inventory.check_availability(
                sku=target_variant_sku,
                shopper_loc=session.location,
                radius_km=session.radius_km
            )

        # 7. ALTERNATIVES
        alternatives = []
        nearest_stock = availability[0].qty if availability else 0

        if rule_eval.verdict == "NO" or nearest_stock == 0:
            # 7a. Alternate size/variant
            if rule_eval.recommended_variant:
                rec_v = rule_eval.recommended_variant.strip().upper()
                for v in product.variants:
                    if (rec_v in v.name.upper() or rec_v in v.sku) and v.sku != target_variant_sku:
                        alt_avail = self.inventory.check_availability(
                            sku=v.sku,
                            shopper_loc=session.location,
                            radius_km=session.radius_km
                        )
                        if any(a.qty > 0 for a in alt_avail):
                            alternatives.append(Alternative(
                                product_id=product.id,
                                product_name=f"{product.name} ({v.name})",
                                variant_sku=v.sku,
                                reason=f"In-stock recommended size ({v.name}) that fits your measurements.",
                                availability=alt_avail[:2]
                            ))
                            break

            # 7b. Alternative product in same category
            for alt_prod in self.intent_extractor.products:
                if alt_prod.id != product.id and alt_prod.category == product.category:
                    alt_eval_fn = EVALUATE_RULES.get(profile_data.get("rule"))
                    if alt_eval_fn:
                        alt_eval = alt_eval_fn(shopper_inputs, alt_prod.attributes)
                        if alt_eval.verdict == "YES":
                            alt_sku = alt_eval.recommended_variant or (alt_prod.variants[0].sku if alt_prod.variants else None)
                            if alt_sku:
                                for v in alt_prod.variants:
                                    if alt_sku in v.name or alt_sku in v.sku:
                                        alt_sku = v.sku
                                        break
                                alt_avail = self.inventory.check_availability(
                                    sku=alt_sku,
                                    shopper_loc=session.location,
                                    radius_km=session.radius_km
                                )
                                if any(a.qty > 0 for a in alt_avail):
                                    alternatives.append(Alternative(
                                        product_id=alt_prod.id,
                                        product_name=alt_prod.name,
                                        variant_sku=alt_sku,
                                        reason=f"Compatible alternative ({alt_prod.brand}) available locally.",
                                        availability=alt_avail[:2]
                                    ))
                                    if len(alternatives) >= 2:
                                        break

        # 8. RESPOND
        return self.response_builder.build_answer(
            rule_eval=rule_eval,
            citations=citations,
            availability=availability,
            alternatives=alternatives,
            user_message=message,
            product=product,
            confidence="high" if rule_eval.verdict != "CANNOT_CONFIRM" else "medium"
        )
