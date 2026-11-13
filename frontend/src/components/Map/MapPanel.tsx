import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Store, LocationData, Product } from '../../types';
import { MapPin, Navigation, List, Map as MapIcon, ShoppingBag, Eye } from 'lucide-react';

interface MapPanelProps {
  stores: Store[];
  userLocation: LocationData;
  radiusKm: number;
  selectedStoreId?: string | null;
  onSelectStore: (storeId: string) => void;
  selectedProduct?: Product;
}

// Custom DivIcons for Leaflet
const createShopperIcon = () =>
  L.divIcon({
    className: 'custom-shopper-pin',
    html: `
      <div style="background-color: #0F766E; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(15,118,110,0.5); display: flex; align-items: center; justify-content: center; color: white;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });

const createStoreIcon = (status: 'green' | 'amber' | 'grey', isSelected: boolean) => {
  const bg =
    status === 'green'
      ? '#15803D'
      : status === 'amber'
      ? '#B45309'
      : '#64748B';

  const scale = isSelected ? 'transform: scale(1.2); z-index: 100;' : '';

  return L.divIcon({
    className: 'custom-store-pin',
    html: `
      <div style="${scale} background-color: ${bg}; width: 28px; height: 28px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; transition: transform 0.2s ease;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"></path>
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
          <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"></path>
          <path d="M2 7h20"></path>
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

export const MapPanel: React.FC<MapPanelProps> = ({
  stores,
  userLocation,
  radiusKm,
  selectedStoreId,
  onSelectStore,
  selectedProduct
}) => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  const centerLat = userLocation.lat || 12.3051;
  const centerLng = userLocation.lng || 76.6551;

  // Determine stock level per store for mock display
  const getStoreStatus = (storeId: string) => {
    if (storeId.includes('devaraja')) return { status: 'green' as const, stock: 8 };
    if (storeId.includes('jayalakshmi')) return { status: 'green' as const, stock: 5 };
    if (storeId.includes('kuvempunagar')) return { status: 'amber' as const, stock: 2 };
    if (storeId.includes('saraswathipuram')) return { status: 'green' as const, stock: 4 };
    if (storeId.includes('gokulam')) return { status: 'amber' as const, stock: 1 };
    return { status: 'grey' as const, stock: 0 };
  };

  return (
    <div
      data-testid="map-panel"
      className="h-full flex flex-col rounded-2xl border border-stone-200 dark:border-dark-border bg-white dark:bg-dark-card shadow-soft overflow-hidden"
    >
      {/* Header with View Toggle */}
      <div className="p-3.5 border-b border-stone-200 dark:border-dark-border bg-stone-50/75 dark:bg-dark-cardMuted flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-ink-900 dark:text-dark-ink flex items-center gap-1.5 font-serif">
            <MapPin size={15} className="text-teal-700 dark:text-teal-400" />
            <span>Mysuru Store Network</span>
          </div>
          <div className="text-[11px] text-ink-500 dark:text-dark-inkMuted font-mono">
            {stores.length} locations within {radiusKm} km radius
          </div>
        </div>

        {/* List / Map toggle for accessibility */}
        <div className="flex items-center rounded-xl border border-stone-200 dark:border-dark-border bg-stone-100 dark:bg-dark-card p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
              viewMode === 'map'
                ? 'bg-white dark:bg-dark-cardMuted text-ink-900 dark:text-dark-ink font-bold shadow-xs'
                : 'text-ink-500 hover:text-ink-800 dark:hover:text-dark-ink'
            }`}
          >
            <MapIcon size={13} />
            <span>Map</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-dark-cardMuted text-ink-900 dark:text-dark-ink font-bold shadow-xs'
                : 'text-ink-500 hover:text-ink-800 dark:hover:text-dark-ink'
            }`}
          >
            <List size={13} />
            <span>List</span>
          </button>
        </div>
      </div>

      {/* Map or Accessible List View */}
      <div className="relative flex-1 min-h-[320px] w-full bg-stone-100 dark:bg-dark-bg">
        {viewMode === 'map' ? (
          <MapContainer
            center={[centerLat, centerLng]}
            zoom={12}
            scrollWheelZoom={false}
            className="w-full h-full z-0"
            style={{ height: '100%', minHeight: '320px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Shopper Pin */}
            <Marker position={[centerLat, centerLng]} icon={createShopperIcon()}>
              <Popup>
                <div className="text-xs font-sans">
                  <strong>Your Location</strong>
                  <div className="text-[11px] text-ink-500">{userLocation.city} · 570001</div>
                </div>
              </Popup>
            </Marker>

            {/* Search Radius Circle */}
            <Circle
              center={[centerLat, centerLng]}
              radius={radiusKm * 1000}
              pathOptions={{
                color: '#0F766E',
                fillColor: '#0F766E',
                fillOpacity: 0.08,
                weight: 1.5,
                dashArray: '4, 4'
              }}
            />

            {/* Store Pins */}
            {stores.map(store => {
              const { status, stock } = getStoreStatus(store.id);
              const isSelected = selectedStoreId === store.id;

              return (
                <Marker
                  key={store.id}
                  position={[store.lat, store.lng]}
                  icon={createStoreIcon(status, isSelected)}
                  eventHandlers={{
                    click: () => onSelectStore(store.id)
                  }}
                >
                  <Popup>
                    <div className="text-xs font-sans space-y-1 p-0.5">
                      <div className="font-bold text-ink-900">{store.name}</div>
                      <div className="text-[11px] text-ink-600">{store.address}</div>
                      <div className="pt-1 flex items-center justify-between text-[11px] font-mono">
                        <span
                          className={`font-semibold ${
                            stock > 2
                              ? 'text-emerald-700'
                              : stock > 0
                              ? 'text-amber-700'
                              : 'text-stone-500'
                          }`}
                        >
                          {stock > 0 ? `${stock} units in stock` : 'Out of stock'}
                        </span>
                        <span>{store.open_hours}</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        ) : (
          <div className="p-3 space-y-2 h-full overflow-y-auto">
            {stores.map(store => {
              const { status, stock } = getStoreStatus(store.id);
              const isSelected = selectedStoreId === store.id;

              return (
                <div
                  key={store.id}
                  onClick={() => onSelectStore(store.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50 dark:bg-teal-950/30'
                      : 'border-stone-200 dark:border-dark-border bg-white dark:bg-dark-card hover:border-teal-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-ink-900 dark:text-dark-ink">
                      {store.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        status === 'green'
                          ? 'bg-emerald-100 text-emerald-800'
                          : status === 'amber'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {stock > 0 ? `${stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                  <p className="text-xs text-ink-500 dark:text-dark-inkMuted mt-1">
                    {store.address}
                  </p>
                  <p className="text-[11px] text-ink-400 font-mono mt-0.5">
                    Hours: {store.open_hours}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend Overlay on Map */}
        {viewMode === 'map' && (
          <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-dark-card/95 backdrop-blur-xs p-2 rounded-xl border border-stone-200 dark:border-dark-border shadow-soft text-[10px] font-mono space-y-1 z-10 pointer-events-auto">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-700" />
              <span>In stock</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
              <span>Low stock</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-500" />
              <span>Out of stock</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
