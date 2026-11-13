import sqlite3
import math
import json
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from app.models import Store, StoreAvailability, Location

DEFAULT_DB_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "inventory.db"
DEFAULT_STORES_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "stores.json"

# Haversine distance calculation
def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points in kilometers."""
    R = 6371.0  # Earth's radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2.0) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

class InventoryService:
    def __init__(self, db_path: Path = DEFAULT_DB_PATH, stores_path: Path = DEFAULT_STORES_PATH):
        self.db_path = db_path
        self.stores_path = stores_path
        self._stores: List[Store] = []
        self._load_stores()

    def _load_stores(self):
        if self.stores_path.exists():
            with open(self.stores_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                self._stores = [Store(**item) for item in data]
        else:
            self._stores = []

    def get_all_stores(self) -> List[Store]:
        return self._stores

    def get_store_by_id(self, store_id: str) -> Optional[Store]:
        for s in self._stores:
            if s.id == store_id:
                return s
        return None

    def get_stock_for_sku(self, sku: str) -> Dict[str, int]:
        """Fetch stock quantities across all stores for a SKU."""
        if not self.db_path.exists():
            return {}
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()
        cursor.execute("SELECT store_id, qty FROM stock WHERE sku = ?", (sku,))
        rows = cursor.fetchall()
        conn.close()
        return {r[0]: r[1] for r in rows}

    def check_availability(
        self,
        sku: str,
        shopper_loc: Optional[Location] = None,
        radius_km: float = 10.0
    ) -> List[StoreAvailability]:
        """Find store inventory for the SKU within the shopper radius, sorted by distance."""
        stock_map = self.get_stock_for_sku(sku)
        results = []

        # Default to Mysuru center if no coordinates provided
        user_lat = shopper_loc.lat if shopper_loc and shopper_loc.lat is not None else 12.3106
        user_lng = shopper_loc.lng if shopper_loc and shopper_loc.lng is not None else 76.6528

        for store in self._stores:
            dist = haversine_distance_km(user_lat, user_lng, store.lat, store.lng)
            qty = stock_map.get(store.id, 0)
            
            # Record availability
            results.append(StoreAvailability(
                store=store.name,
                store_id=store.id,
                distance_km=dist,
                qty=qty,
                pickup_today=store.pickup_today and (qty > 0),
                address=store.address
            ))

        # Sort by distance
        results.sort(key=lambda x: x.distance_km)

        # Filter by radius if provided
        filtered = [r for r in results if r.distance_km <= radius_km]
        return filtered if filtered else results[:2]  # fallback to nearest if none within strict radius
