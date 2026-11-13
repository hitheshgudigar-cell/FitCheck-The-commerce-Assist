from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field

# Three-state verdicts
VerdictType = Literal["YES", "NO", "CANNOT_CONFIRM"]
ConfidenceType = Literal["high", "medium", "low"]

class Variant(BaseModel):
    sku: str
    name: str
    attributes: Dict[str, Any] = Field(default_factory=dict)

class Product(BaseModel):
    id: str
    name: str
    brand: str
    category: str
    variants: List[Variant] = Field(default_factory=list)
    attributes: Dict[str, Any] = Field(default_factory=dict)
    docs: List[str] = Field(default_factory=list)  # Authoritative doc references only
    marketing_copy: str = ""  # Stored for UI display only, NEVER indexed or used for evidence

class Store(BaseModel):
    id: str
    name: str
    lat: float
    lng: float
    address: str
    pickup_today: bool = True
    open_hours: str = "10:00 AM - 9:00 PM"

class StockItem(BaseModel):
    store_id: str
    sku: str
    qty: int
    updated_at: str

class Location(BaseModel):
    lat: Optional[float] = None
    lng: Optional[float] = None
    pincode: Optional[str] = None
    city: str = "Mysuru"

class ShopperProfile(BaseModel):
    location: Location = Field(default_factory=Location)
    radius_km: float = 10.0
    measurements: Dict[str, float] = Field(default_factory=dict)  # e.g. chest, waist, hip, height, foot_length_cm
    devices: List[Dict[str, str]] = Field(default_factory=list)   # [{"type": "printer", "model": "HP DeskJet 2331"}]
    spaces: Dict[str, float] = Field(default_factory=dict)         # door_width_cm, room_width_cm, ceiling_height_cm
    dietary: List[str] = Field(default_factory=list)              # ["gluten_free", "vegan", "peanut_allergy"]

class CheckResult(BaseModel):
    attribute: str
    required: Any
    actual: Any
    passed: Optional[bool]
    source_ref: Optional[str] = None

class RuleEvaluation(BaseModel):
    verdict: VerdictType
    recommended_variant: Optional[str] = None  # e.g. SKU or Size M
    checks: List[CheckResult] = Field(default_factory=list)
    reason: str
    notes: List[str] = Field(default_factory=list)

class Citation(BaseModel):
    doc: str
    page: int
    snippet: str

class StoreAvailability(BaseModel):
    store: str
    store_id: str
    distance_km: float
    qty: int
    pickup_today: bool
    address: str

class Alternative(BaseModel):
    product_id: Optional[str] = None
    product_name: str
    variant_sku: Optional[str] = None
    reason: str
    availability: List[StoreAvailability] = Field(default_factory=list)

class AnswerPayload(BaseModel):
    verdict: VerdictType
    headline: str
    explanation: str
    checks: List[CheckResult] = Field(default_factory=list)
    citations: List[Citation] = Field(default_factory=list)
    availability: List[StoreAvailability] = Field(default_factory=list)
    alternatives: List[Alternative] = Field(default_factory=list)
    clarifying_question: Optional[str] = None
    confidence: ConfidenceType = "high"
    recommended_sku: Optional[str] = None
    product: Optional[Product] = None

class ChatRequest(BaseModel):
    session_id: str
    message: str
    product_id: Optional[str] = None
    location: Optional[Location] = None
    radius_km: Optional[float] = None

class ProfileUpdateRequest(BaseModel):
    location: Optional[Location] = None
    radius_km: Optional[float] = None
    measurements: Optional[Dict[str, float]] = None
    devices: Optional[List[Dict[str, str]]] = None
    spaces: Optional[Dict[str, float]] = None
    dietary: Optional[List[str]] = None
