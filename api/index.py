import sys
from pathlib import Path

# Add fitcheck/backend to sys.path so app and its submodules resolve cleanly in Vercel's serverless environment
BACKEND_DIR = Path(__file__).resolve().parent.parent / "fitcheck" / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.main import app
