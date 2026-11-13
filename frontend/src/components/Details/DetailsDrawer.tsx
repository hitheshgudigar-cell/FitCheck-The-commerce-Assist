import React, { useState } from 'react';
import {
  X,
  ChevronDown,
  ChevronUp,
  MapPin,
  Ruler,
  Laptop,
  Maximize2,
  Salad,
  Trash2,
  Plus,
  ShieldCheck,
  Check
} from 'lucide-react';
import { ShopperProfile } from '../../types';
import { DEFAULT_USER_LOCATION } from '../../mocks';

interface DetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ShopperProfile;
  onUpdateProfile: (updates: Partial<ShopperProfile>) => Promise<void>;
  onClearProfile: () => void;
}

export const DetailsDrawer: React.FC<DetailsDrawerProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onClearProfile
}) => {
  const [unit, setUnit] = useState<'cm' | 'in'>('in');
  const [newDeviceType, setNewDeviceType] = useState('printer');
  const [newDeviceModel, setNewDeviceModel] = useState('');

  // Accordion section states
  const [openSections, setOpenSections] = useState({
    location: true,
    body: true,
    devices: false,
    spaces: false,
    dietary: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (!isOpen) return null;

  // Active details chips list
  const activeChips: Array<{ key: string; label: string; onRemove: () => void }> = [];

  if (profile.location?.pincode) {
    activeChips.push({
      key: 'pincode',
      label: `Pin: ${profile.location.pincode}`,
      onRemove: () => onUpdateProfile({ location: { ...profile.location, pincode: '' } })
    });
  }

  Object.entries(profile.measurements || {}).forEach(([k, v]) => {
    if (v) {
      activeChips.push({
        key: `m_${k}`,
        label: `${k}: ${v} ${unit}`,
        onRemove: () => {
          const next = { ...profile.measurements };
          delete next[k];
          onUpdateProfile({ measurements: next });
        }
      });
    }
  });

  (profile.devices || []).forEach((dev, idx) => {
    activeChips.push({
      key: `dev_${idx}`,
      label: `${dev.type}: ${dev.model}`,
      onRemove: () => {
        const next = profile.devices.filter((_, i) => i !== idx);
        onUpdateProfile({ devices: next });
      }
    });
  });

  Object.entries(profile.spaces || {}).forEach(([k, v]) => {
    if (v) {
      activeChips.push({
        key: `sp_${k}`,
        label: `${k.replace('_cm', '')}: ${v} cm`,
        onRemove: () => {
          const next = { ...profile.spaces };
          delete next[k];
          onUpdateProfile({ spaces: next });
        }
      });
    }
  });

  (profile.dietary || []).forEach(diet => {
    activeChips.push({
      key: `diet_${diet}`,
      label: diet,
      onRemove: () => {
        const next = profile.dietary.filter(d => d !== diet);
        onUpdateProfile({ dietary: next });
      }
    });
  });

  const handleAddDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDeviceModel.trim()) {
      const updated = [...(profile.devices || []), { type: newDeviceType, model: newDeviceModel.trim() }];
      onUpdateProfile({ devices: updated });
      setNewDeviceModel('');
    }
  };

  const handleToggleDietary = (diet: string) => {
    const current = profile.dietary || [];
    const exists = current.includes(diet);
    const updated = exists ? current.filter(d => d !== diet) : [...current, diet];
    onUpdateProfile({ dietary: updated });
  };

  const dietaryOptions = [
    'gluten-free',
    'vegetarian',
    'vegan',
    'lactose-free',
    'nut allergy',
    'diabetic-friendly'
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="details-drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-ink-950/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md h-full bg-white dark:bg-dark-card border-l border-stone-200 dark:border-dark-border shadow-lifted flex flex-col animate-in slide-in-from-right duration-250">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-dark-border bg-stone-50/75 dark:bg-dark-cardMuted flex items-center justify-between">
          <div>
            <h2 id="details-drawer-title" className="text-base sm:text-lg font-bold text-ink-900 dark:text-dark-ink font-serif">
              My Fit Details
            </h2>
            <p className="text-xs text-ink-500 dark:text-dark-inkMuted mt-0.5">
              Used only to check fit. Stays in this session.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close fit details"
            className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 dark:hover:text-dark-ink hover:bg-stone-200/50 dark:hover:bg-dark-border transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Removable Active Chips Strip */}
        {activeChips.length > 0 && (
          <div className="p-3 bg-stone-50 dark:bg-dark-cardMuted border-b border-stone-200 dark:border-dark-border">
            <div className="text-[10px] font-mono uppercase tracking-wider text-ink-500 dark:text-dark-inkMuted font-semibold mb-1.5 flex items-center justify-between">
              <span>Active Fit Filters ({activeChips.length})</span>
              <button
                type="button"
                onClick={onClearProfile}
                className="text-terracotta-700 dark:text-terracotta-400 hover:underline normal-case font-sans"
              >
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {activeChips.map(chip => (
                <span
                  key={chip.key}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
                >
                  <span>{chip.label}</span>
                  <button
                    type="button"
                    onClick={chip.onRemove}
                    aria-label={`Remove ${chip.label}`}
                    className="hover:text-rose-600 rounded-full"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Scrollable Sections */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Privacy Guarantee Note */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/40 text-xs text-teal-900 dark:text-teal-200">
            <ShieldCheck size={16} className="text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Privacy First:</span> All measurements & devices are stored strictly in memory for this session to run deterministic check algorithms. No cross-site profiling.
            </div>
          </div>

          {/* 1. Location Section */}
          <div className="rounded-xl border border-stone-200 dark:border-dark-border overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('location')}
              className="w-full p-3 flex items-center justify-between bg-stone-50 dark:bg-dark-cardMuted hover:bg-stone-100 transition-colors text-xs font-bold text-ink-900 dark:text-dark-ink"
            >
              <span className="flex items-center gap-2">
                <MapPin size={15} className="text-teal-700 dark:text-teal-400" />
                <span>Location & Search Radius</span>
              </span>
              {openSections.location ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            {openSections.location && (
              <div className="p-3.5 space-y-3 bg-white dark:bg-dark-card text-xs">
                <div>
                  <label htmlFor="pincode-input" className="block text-ink-600 dark:text-dark-inkMuted mb-1 font-medium">
                    Postal Pincode
                  </label>
                  <input
                    id="pincode-input"
                    type="text"
                    value={profile.location.pincode || ''}
                    onChange={e =>
                      onUpdateProfile({
                        location: { ...profile.location, pincode: e.target.value }
                      })
                    }
                    placeholder="e.g. 570001"
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-dark-border bg-white dark:bg-dark-cardMuted text-ink-900 dark:text-dark-ink font-mono focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onUpdateProfile({
                      location: DEFAULT_USER_LOCATION
                    })
                  }
                  className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 transition-colors"
                >
                  Use sample location (Mysuru · 570001)
                </button>

                <div className="pt-2 border-t border-stone-100 dark:border-dark-border">
                  <div className="flex justify-between text-ink-600 dark:text-dark-inkMuted mb-1">
                    <span>Default Radius</span>
                    <span className="font-mono font-bold text-teal-700 dark:text-teal-400">
                      {profile.radius_km} km
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={25}
                    value={profile.radius_km}
                    onChange={e => onUpdateProfile({ radius_km: Number(e.target.value) })}
                    className="w-full accent-teal-700 h-1.5 bg-stone-200 dark:bg-dark-cardMuted rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 2. Body & Feet Section */}
          <div className="rounded-xl border border-stone-200 dark:border-dark-border overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('body')}
              className="w-full p-3 flex items-center justify-between bg-stone-50 dark:bg-dark-cardMuted hover:bg-stone-100 transition-colors text-xs font-bold text-ink-900 dark:text-dark-ink"
            >
              <span className="flex items-center gap-2">
                <Ruler size={15} className="text-teal-700 dark:text-teal-400" />
                <span>Body & Feet Measurements</span>
              </span>
              {openSections.body ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            {openSections.body && (
              <div className="p-3.5 space-y-3 bg-white dark:bg-dark-card text-xs">
                {/* Unit Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-ink-600 dark:text-dark-inkMuted font-medium">Measurement unit:</span>
                  <div className="flex items-center rounded-lg border border-stone-200 dark:border-dark-border bg-stone-100 dark:bg-dark-cardMuted p-0.5 font-mono">
                    <button
                      type="button"
                      onClick={() => setUnit('in')}
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        unit === 'in' ? 'bg-white dark:bg-dark-card font-bold shadow-xs' : 'text-ink-500'
                      }`}
                    >
                      inches
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnit('cm')}
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        unit === 'cm' ? 'bg-white dark:bg-dark-card font-bold shadow-xs' : 'text-ink-500'
                      }`}
                    >
                      cm
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { key: 'bust', label: 'Bust / Chest' },
                    { key: 'waist', label: 'Waist' },
                    { key: 'hip', label: 'Hip' },
                    { key: 'height', label: 'Height' },
                    { key: 'foot_length', label: 'Foot Length' }
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-[11px] text-ink-600 dark:text-dark-inkMuted mb-1">
                        {field.label} ({unit})
                      </label>
                      <input
                        type="number"
                        step={0.5}
                        value={profile.measurements?.[field.key] || ''}
                        onChange={e =>
                          onUpdateProfile({
                            measurements: {
                              ...profile.measurements,
                              [field.key]: parseFloat(e.target.value) || 0
                            }
                          })
                        }
                        placeholder={field.key === 'bust' ? '36' : field.key === 'waist' ? '30' : ''}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-dark-border bg-white dark:bg-dark-cardMuted text-ink-900 dark:text-dark-ink font-mono focus:outline-none focus:ring-1 focus:ring-teal-600"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Devices Section */}
          <div className="rounded-xl border border-stone-200 dark:border-dark-border overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('devices')}
              className="w-full p-3 flex items-center justify-between bg-stone-50 dark:bg-dark-cardMuted hover:bg-stone-100 transition-colors text-xs font-bold text-ink-900 dark:text-dark-ink"
            >
              <span className="flex items-center gap-2">
                <Laptop size={15} className="text-teal-700 dark:text-teal-400" />
                <span>My Hardware & Devices</span>
              </span>
              {openSections.devices ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            {openSections.devices && (
              <div className="p-3.5 space-y-3 bg-white dark:bg-dark-card text-xs">
                {profile.devices && profile.devices.length > 0 && (
                  <div className="space-y-1.5">
                    {profile.devices.map((dev, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-stone-50 dark:bg-dark-cardMuted border border-stone-200 dark:border-dark-border font-mono text-[11px]"
                      >
                        <div>
                          <span className="font-bold uppercase text-teal-800 dark:text-teal-300">
                            {dev.type}:
                          </span>{' '}
                          <span className="text-ink-800 dark:text-dark-ink">{dev.model}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const next = profile.devices.filter((_, i) => i !== idx);
                            onUpdateProfile({ devices: next });
                          }}
                          className="text-ink-400 hover:text-rose-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleAddDevice} className="space-y-2 pt-1">
                  <div className="flex gap-2">
                    <select
                      value={newDeviceType}
                      onChange={e => setNewDeviceType(e.target.value)}
                      className="px-2 py-1.5 rounded-lg border border-stone-300 dark:border-dark-border bg-white dark:bg-dark-cardMuted text-ink-900 dark:text-dark-ink font-medium"
                    >
                      <option value="printer">Printer</option>
                      <option value="vacuum">Vacuum</option>
                      <option value="tv">Television</option>
                      <option value="phone">Phone/Tablet</option>
                    </select>

                    <input
                      type="text"
                      value={newDeviceModel}
                      onChange={e => setNewDeviceModel(e.target.value)}
                      placeholder="e.g. HP DeskJet 2331"
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-dark-border bg-white dark:bg-dark-cardMuted text-ink-900 dark:text-dark-ink font-mono focus:outline-none focus:ring-1 focus:ring-teal-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!newDeviceModel.trim()}
                    className="w-full py-1.5 px-3 rounded-lg font-semibold text-xs text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 disabled:opacity-40 transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus size={14} />
                    <span>Add Device</span>
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* 4. Spaces & Clearances */}
          <div className="rounded-xl border border-stone-200 dark:border-dark-border overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('spaces')}
              className="w-full p-3 flex items-center justify-between bg-stone-50 dark:bg-dark-cardMuted hover:bg-stone-100 transition-colors text-xs font-bold text-ink-900 dark:text-dark-ink"
            >
              <span className="flex items-center gap-2">
                <Maximize2 size={15} className="text-teal-700 dark:text-teal-400" />
                <span>Spaces & Doorway Clearances</span>
              </span>
              {openSections.spaces ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            {openSections.spaces && (
              <div className="p-3.5 space-y-2.5 bg-white dark:bg-dark-card text-xs">
                <div>
                  <label className="block text-[11px] text-ink-600 dark:text-dark-inkMuted mb-1">
                    Narrowest Door Width (cm)
                  </label>
                  <input
                    type="number"
                    value={profile.spaces?.door_width_cm || ''}
                    onChange={e =>
                      onUpdateProfile({
                        spaces: {
                          ...profile.spaces,
                          door_width_cm: parseFloat(e.target.value) || 0
                        }
                      })
                    }
                    placeholder="e.g. 80"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-dark-border bg-white dark:bg-dark-cardMuted text-ink-900 dark:text-dark-ink font-mono focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-ink-600 dark:text-dark-inkMuted mb-1">
                    Room Width (cm)
                  </label>
                  <input
                    type="number"
                    value={profile.spaces?.room_width_cm || ''}
                    onChange={e =>
                      onUpdateProfile({
                        spaces: {
                          ...profile.spaces,
                          room_width_cm: parseFloat(e.target.value) || 0
                        }
                      })
                    }
                    placeholder="e.g. 350"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-dark-border bg-white dark:bg-dark-cardMuted text-ink-900 dark:text-dark-ink font-mono focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 5. Dietary Preferences */}
          <div className="rounded-xl border border-stone-200 dark:border-dark-border overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection('dietary')}
              className="w-full p-3 flex items-center justify-between bg-stone-50 dark:bg-dark-cardMuted hover:bg-stone-100 transition-colors text-xs font-bold text-ink-900 dark:text-dark-ink"
            >
              <span className="flex items-center gap-2">
                <Salad size={15} className="text-teal-700 dark:text-teal-400" />
                <span>Dietary & Allergen Restrictions</span>
              </span>
              {openSections.dietary ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            {openSections.dietary && (
              <div className="p-3.5 space-y-2 bg-white dark:bg-dark-card text-xs">
                <p className="text-[11px] text-ink-500 dark:text-dark-inkMuted">
                  Select ingredients you avoid to automatically flag packaging allergens:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {dietaryOptions.map(diet => {
                    const isSelected = profile.dietary?.includes(diet);
                    return (
                      <button
                        key={diet}
                        type="button"
                        onClick={() => handleToggleDietary(diet)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
                          isSelected
                            ? 'bg-teal-700 text-white border-teal-800'
                            : 'bg-stone-100 dark:bg-dark-cardMuted text-ink-700 dark:text-dark-ink border-stone-200 dark:border-dark-border hover:bg-stone-200'
                        }`}
                      >
                        {isSelected && <Check size={12} />}
                        <span>{diet}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-dark-border bg-stone-50/75 dark:bg-dark-cardMuted flex items-center justify-between">
          <button
            type="button"
            onClick={onClearProfile}
            className="inline-flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold"
          >
            <Trash2 size={14} />
            <span>Clear all my details</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 transition-colors shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
