import pytest
from app.main import (
    read_root, get_products, get_product, get_stores,
    get_session, update_profile, chat_endpoint
)
from app.models import ChatRequest, ProfileUpdateRequest

def test_api_root():
    data = read_root()
    # If FileResponse or dict
    assert data is not None

def test_api_status():
    from app.main import read_status
    data = read_status()
    assert data["app"] == "FitCheck API"
    assert data["status"] == "online"
    assert data["stores"] == 6
    assert data["products"] >= 30

def test_api_products_list():
    products = get_products()
    assert len(products) >= 30

    # Filter by category
    clothing_prods = get_products(category="clothing")
    assert len(clothing_prods) >= 6
    for p in clothing_prods:
        assert p.category == "clothing"

    # Search query
    cartridges = get_products(q="cartridge")
    assert len(cartridges) >= 1
    assert any("cartridge" in p.name.lower() for p in cartridges)

    # Get single product
    first_id = products[0].id
    p_single = get_product(first_id)
    assert p_single.id == first_id

def test_api_stores():
    stores = get_stores()
    assert len(stores) == 6
    assert any("Devaraja" in s.name for s in stores)

def test_api_session_profile():
    sess_id = "test_api_sess_01"
    # Get session
    prof = get_session(sess_id)
    assert prof.location is not None

    # Update profile
    update_req = ProfileUpdateRequest(
        measurements={"bust": 36, "waist": 28},
        radius_km=15.0,
        dietary=["gluten_free"]
    )
    updated = update_profile(sess_id, update_req)
    assert updated.measurements["bust"] == 36
    assert updated.radius_km == 15.0
    assert "gluten_free" in updated.dietary

def test_api_chat_endpoint():
    chat_req = ChatRequest(
        session_id="test_api_chat_01",
        message="Does this cartridge work with my HP DeskJet 2331?",
        product_id="prod_elec_cartridge_01"
    )
    answer = chat_endpoint(chat_req)
    assert answer.verdict == "YES"
    assert len(answer.citations) > 0
    assert len(answer.availability) > 0
