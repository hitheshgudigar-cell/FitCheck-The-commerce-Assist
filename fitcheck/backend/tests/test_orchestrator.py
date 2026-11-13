import pytest
from app.agent.orchestrator import Orchestrator
from app.models import Location

@pytest.fixture
def orchestrator():
    return Orchestrator()

def test_demo_1_dress_fit_and_inventory(orchestrator):
    """Dress: 'I'm bust 36, waist 30. Will the M fit?'
    Expects: NO for M (snug at waist), recommends L, shows L in stock at nearest store.
    """
    ans = orchestrator.run(
        session_id="session_test_demo1",
        message="I'm bust 36, waist 30. Will the M fit?",
        explicit_product_id="prod_clothing_dress_01"
    )

    assert ans.verdict == "NO"
    assert "M" in ans.headline or "Current Selection Mismatch" in ans.headline
    assert any("snug" in n.lower() or "exceeds" in n.lower() for n in ans.explanation.lower().split("."))
    # Recommended size L
    assert ans.recommended_sku == "SKU-AURA-DR-L" or "L" in ans.headline
    # Availability shows local stores
    assert len(ans.availability) > 0
    # In stock store for size L is nearest (Devaraja Mohalla has 3 in stock)
    nearest = ans.availability[0]
    assert nearest.store_id == "store_mysuru_devaraja"
    assert nearest.qty == 3
    assert nearest.distance_km < 5.0
    # Citations present
    assert len(ans.citations) > 0
    assert "doc_clothing_aura_dress" in ans.citations[0].doc

def test_demo_2_electronics_cartridge(orchestrator):
    """Electronics: 'Does this cartridge work with my HP DeskJet 2331?'
    Expects: YES + citation + local stock.
    """
    ans = orchestrator.run(
        session_id="session_test_demo2",
        message="Does this cartridge work with my HP DeskJet 2331?",
        explicit_product_id="prod_elec_cartridge_01"
    )

    assert ans.verdict == "YES"
    assert len(ans.citations) > 0
    assert "doc_elec_hp67" in ans.citations[0].doc
    assert ans.citations[0].page == 2
    assert len(ans.availability) > 0
    assert ans.availability[0].qty > 0
    assert "compatible" in ans.explanation.lower()

def test_demo_3_tv_mount_wrong_vesa(orchestrator):
    """TV mount: wrong VESA -> NO with calculation, plus in-stock alternative."""
    ans = orchestrator.run(
        session_id="session_test_demo3",
        message="I have a 75 inch TV with 600x400 VESA weighing 35kg. Will this mount fit?",
        explicit_product_id="prod_elec_tv_mount_01"
    )

    assert ans.verdict == "NO"
    # Shows VESA failed check
    failed_checks = [c for c in ans.checks if c.passed is False]
    assert any(c.attribute == "vesa_pattern" for c in failed_checks)
    # Provides in-stock alternative (UltraSlim Large Mount supports 600x400)
    assert len(ans.alternatives) > 0
    assert "UltraSlim" in ans.alternatives[0].product_name

def test_demo_4_furniture_missing_packaged_dims(orchestrator):
    """Furniture with missing packaged dimensions -> CANNOT_CONFIRM honestly stated."""
    ans = orchestrator.run(
        session_id="session_test_demo4",
        message="Will this sectional couch fit through my 80cm door?",
        explicit_product_id="prod_furniture_03"
    )

    assert ans.verdict == "CANNOT_CONFIRM"
    assert "packaged dimensions" in ans.explanation.lower()
    assert len(ans.citations) > 0

def test_demo_5_clarifying_question(orchestrator):
    """Vague question ('Does this filter fit my vacuum?') -> exactly one clarifying question."""
    ans = orchestrator.run(
        session_id="session_test_demo5",
        message="Does this filter fit my vacuum?",
        explicit_product_id="prod_elec_filter_01"
    )

    assert ans.verdict == "CANNOT_CONFIRM"
    assert ans.clarifying_question is not None
    assert "device model" in ans.clarifying_question.lower() or "model" in ans.clarifying_question.lower()

def test_demo_6_discovery_mode(orchestrator):
    """Discovery: 'black dress size M available near me today' -> ranked local results."""
    ans = orchestrator.run(
        session_id="session_test_demo6",
        message="black dress size M available near me today"
    )

    assert ans.product is not None
    assert "black" in ans.product.name.lower() or "dress" in ans.product.name.lower()
    assert ans.verdict in ["YES", "CANNOT_CONFIRM"]
    assert len(ans.availability) > 0
    # Local stock verified
    assert any(a.qty > 0 for a in ans.availability)

def test_session_remembers_shopper_profile(orchestrator):
    """Test that session remembers measurements so shopper is not asked twice."""
    sess_id = "session_test_profile_memory"
    
    # 1. First provide measurements
    orchestrator.run(
        session_id=sess_id,
        message="My bust is 36 inches and waist is 28 inches"
    )
    
    # Verify session profile stored them
    sess = orchestrator.get_or_create_session(sess_id)
    assert "bust" in sess.measurements
    assert "waist" in sess.measurements

    # 2. Later ask about a dress without re-stating measurements
    ans = orchestrator.run(
        session_id=sess_id,
        message="Will the M fit me?",
        explicit_product_id="prod_clothing_dress_01"
    )
    # Does not ask clarifying question because session remembered measurements!
    assert ans.clarifying_question is None
    assert ans.verdict in ["YES", "NO"]
