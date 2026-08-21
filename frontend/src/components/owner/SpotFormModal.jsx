import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Zap, Shield, Warehouse, Loader2, Search, MapPin, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { parkingService } from '../../services/parkingService';
import { useToast } from '../../context/ToastContext';

// ─── Fly to updated coordinates whenever lat/lng changes ───────────────────
function MapFlyTo({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], Math.max(map.getZoom(), 15), { duration: 1 });
    }
  }, [lat, lng, map]);
  return null;
}

// ─── Click handler to pick a coordinate from the map ──────────────────────
function LocationPickerMarker({ position, onLocationSelected }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelected(lat, lng);
    },
  });

  if (!position) return null;

  const customPin = L.divIcon({
    className: 'picker-map-pin',
    html: `<div style="
      background:#0d9488;color:white;width:36px;height:36px;
      border-radius:50%;display:flex;align-items:center;justify-content:center;
      font-size:18px;border:3px solid white;box-shadow:0 4px 14px rgba(0,0,0,0.35);
    ">📍</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

  return <Marker position={position} icon={customPin} />;
}

// ─── Debounce helper ───────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Nominatim search suggestions ─────────────────────────────────────────
async function nominatimSearch(query) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`,
    { headers: { 'Accept-Language': 'en' } }
  );
  return res.json();
}

async function nominatimReverse(lat, lng) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
    { headers: { 'Accept-Language': 'en' } }
  );
  return res.json();
}

// ═══════════════════════════════════════════════════════════════════════════
export const SpotFormModal = ({ isOpen, onClose, initialData, onSaved }) => {
  const { addToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [latitude, setLatitude] = useState(28.6315);
  const [longitude, setLongitude] = useState(77.2167);
  const [pricePerHour, setPricePerHour] = useState(40);
  const [peakPricePerHour, setPeakPricePerHour] = useState('');
  const [capacity, setCapacity] = useState(5);
  const [covered, setCovered] = useState(false);
  const [securityAvailable, setSecurityAvailable] = useState(false);
  const [evChargingAvailable, setEvChargingAvailable] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [operatingHours, setOperatingHours] = useState('');
  const [loading, setLoading] = useState(false);

  // Search bar state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const searchRef = useRef(null);

  const debouncedSearch = useDebounce(searchQuery, 400);

  // ── Populate form from initialData ─────────────────────────────────────
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setAddress(initialData.address || '');
      setCity(initialData.city || '');
      setLatitude(initialData.latitude || 28.6315);
      setLongitude(initialData.longitude || 77.2167);
      setPricePerHour(initialData.pricePerHour || 40);
      setPeakPricePerHour(initialData.peakPricePerHour || '');
      setCapacity(initialData.capacity || initialData.totalSpots || 5);
      setCovered(initialData.covered ?? initialData.isCovered ?? false);
      setSecurityAvailable(initialData.securityAvailable ?? initialData.hasSecurity ?? false);
      setEvChargingAvailable(initialData.evChargingAvailable ?? initialData.hasEvCharging ?? false);
      setImageUrl(initialData.imageUrl || '');
      setOperatingHours(initialData.operatingHours || '');
      setSearchQuery(initialData.address || '');
    } else {
      setTitle(''); setDescription(''); setAddress(''); setCity('New Delhi');
      setLatitude(28.6315); setLongitude(77.2167);
      setPricePerHour(40); setPeakPricePerHour('');
      setCapacity(5); setCovered(false); setSecurityAvailable(false);
      setEvChargingAvailable(false); setImageUrl(''); setOperatingHours('');
      setSearchQuery('');
    }
    setSuggestions([]);
  }, [initialData, isOpen]);

  // ── Fetch suggestions when search query changes ────────────────────────
  useEffect(() => {
    if (debouncedSearch.length < 3) { setSuggestions([]); return; }
    setSearchLoading(true);
    nominatimSearch(debouncedSearch)
      .then(data => { setSuggestions(data || []); setShowSuggestions(true); })
      .catch(() => setSuggestions([]))
      .finally(() => setSearchLoading(false));
  }, [debouncedSearch]);

  // ── Dismiss suggestions on outside click ──────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Apply a suggestion ─────────────────────────────────────────────────
  const applySuggestion = useCallback((place) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    const addr = place.display_name;
    const foundCity =
      place.address?.city ||
      place.address?.town ||
      place.address?.village ||
      place.address?.county ||
      'New Delhi';

    setLatitude(lat);
    setLongitude(lng);
    setAddress(addr);
    setCity(foundCity);
    setSearchQuery(addr);
    setSuggestions([]);
    setShowSuggestions(false);
    addToast(`Location set to: ${foundCity}`, 'info');
  }, [addToast]);

  // ── Map click → reverse geocode ────────────────────────────────────────
  const handlePickMapLocation = useCallback(async (lat, lng) => {
    setLatitude(lat);
    setLongitude(lng);
    setGeocoding(true);
    try {
      const data = await nominatimReverse(lat, lng);
      if (data?.address) {
        const foundCity =
          data.address.city || data.address.town ||
          data.address.village || data.address.county || 'New Delhi';
        const fullAddr = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setCity(foundCity);
        setAddress(fullAddr);
        setSearchQuery(fullAddr);
        addToast(`Pinned: ${foundCity}`, 'info');
      }
    } catch (e) {
      console.warn('Reverse geocoding error:', e);
    } finally {
      setGeocoding(false);
    }
  }, [addToast]);

  // ── Form submit ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!city) { addToast('City is required', 'error'); return; }
    setLoading(true);
    const payload = {
      title, description: description || title, address, city,
      latitude: parseFloat(latitude), longitude: parseFloat(longitude),
      pricePerHour: parseFloat(pricePerHour),
      peakPricePerHour: peakPricePerHour ? parseFloat(peakPricePerHour) : null,
      capacity: parseInt(capacity, 10),
      covered, securityAvailable, evChargingAvailable,
      imageUrl: imageUrl || null, operatingHours: operatingHours || null,
    };
    try {
      let res;
      if (initialData?.id) {
        res = await parkingService.updateSpot(initialData.id, payload);
        addToast('Parking spot updated successfully', 'success');
      } else {
        res = await parkingService.createSpot(payload);
        addToast('New parking spot listed successfully!', 'success');
      }
      onSaved(res.data);
      onClose();
    } catch (err) {
      addToast(err.message || 'Failed to save parking spot', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Parking Space' : 'List New Parking Space'}
      maxWidth="720px"
    >
      <form onSubmit={handleSubmit} className="spot-form">

        {/* Title */}
        <div className="input-group">
          <label className="input-label">Parking Title / Name *</label>
          <input
            type="text" required className="input-field"
            placeholder="e.g. Connaught Place Underground Parking"
            value={title} onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* ── Location Search Box ── */}
        <div className="input-group" ref={searchRef} style={{ position: 'relative' }}>
          <label className="input-label">
            <MapPin size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            Search Location *
            <span className="label-hint">Type a place name, landmark or address</span>
          </label>
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="input-field search-input"
              placeholder="e.g. Lajpat Nagar Metro Station, Mumbai..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              autoComplete="off"
            />
            {searchLoading && <Loader2 size={15} className="animate-spin search-spinner" />}
            {searchQuery && !searchLoading && (
              <button type="button" className="search-clear-btn"
                onClick={() => { setSearchQuery(''); setSuggestions([]); }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((place, idx) => (
                <li key={idx} className="suggestion-item"
                  onMouseDown={() => applySuggestion(place)}>
                  <MapPin size={13} className="suggestion-pin" />
                  <span className="suggestion-text">{place.display_name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Map ── */}
        <div className="map-picker-section">
          <div className="map-picker-header">
            <label className="input-label" style={{ margin: 0 }}>
              📍 Fine-tune Location on Map
            </label>
            {geocoding && (
              <span className="geocoding-spinner">
                <Loader2 size={14} className="animate-spin" /> Resolving address...
              </span>
            )}
          </div>
          <p className="map-picker-hint">
            Drag or click anywhere on the map to pin your exact spot. Address will auto-fill.
          </p>
          <div className="modal-map-wrapper">
            <MapContainer
              center={[latitude, longitude]}
              zoom={15}
              style={{ width: '100%', height: '280px' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {/* Flies map to new lat/lng reactively */}
              <MapFlyTo lat={latitude} lng={longitude} />
              <LocationPickerMarker
                position={[latitude, longitude]}
                onLocationSelected={handlePickMapLocation}
              />
            </MapContainer>
          </div>
          <div className="coords-display">
            Lat: {Number(latitude).toFixed(5)}, Lng: {Number(longitude).toFixed(5)}
          </div>
        </div>

        {/* City + Address (auto-filled, still editable) */}
        <div className="input-row-2">
          <div className="input-group">
            <label className="input-label">City *</label>
            <input type="text" required className="input-field"
              placeholder="Auto-filled from map / search"
              value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">Full Address *</label>
            <input type="text" required className="input-field"
              placeholder="Auto-filled from map / search"
              value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
        </div>

        {/* Description */}
        <div className="input-group">
          <label className="input-label">Description <span className="label-hint">(optional)</span></label>
          <input type="text" className="input-field"
            placeholder="e.g. Clean, well-lit multi-level garage with CCTV monitoring."
            value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        {/* Pricing */}
        <div className="input-row-2">
          <div className="input-group">
            <label className="input-label">Base Price / hr (₹) *</label>
            <input type="number" required min="1" step="0.5" className="input-field"
              value={pricePerHour} onChange={(e) => setPricePerHour(e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">Peak Price / hr (₹) <span className="label-hint">(optional)</span></label>
            <input type="number" min="1" step="0.5" className="input-field"
              placeholder="e.g. 80 for rush hours"
              value={peakPricePerHour} onChange={(e) => setPeakPricePerHour(e.target.value)} />
          </div>
        </div>

        {/* Capacity + Hours */}
        <div className="input-row-2">
          <div className="input-group">
            <label className="input-label">Capacity (Total Spots) *</label>
            <input type="number" required min="1" className="input-field"
              value={capacity} onChange={(e) => setCapacity(e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">Operating Hours <span className="label-hint">(optional)</span></label>
            <input type="text" className="input-field"
              placeholder="e.g. Mon-Fri 9AM-6PM, 24/7"
              value={operatingHours} onChange={(e) => setOperatingHours(e.target.value)} />
          </div>
        </div>

        {/* Photo */}
        <div className="input-group">
          <label className="input-label">
            Parking Spot Photo <span className="label-hint">(upload, choose preset, or paste URL)</span>
          </label>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
              📷 Upload Image
              <input type="file" accept="image/*" style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (evt) => {
                    const img = new window.Image();
                    img.onload = () => {
                      const canvas = document.createElement('canvas');
                      const MAX_WIDTH = 600;
                      const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
                      canvas.width = img.width * scale;
                      canvas.height = img.height * scale;
                      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                      setImageUrl(canvas.toDataURL('image/jpeg', 0.7));
                      addToast('Photo uploaded and optimized!', 'info');
                    };
                    img.src = evt.target.result;
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </label>
            <button type="button" className="btn btn-secondary btn-sm"
              onClick={() => setImageUrl('https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80')}>
              🏢 Garage Preset
            </button>
            <button type="button" className="btn btn-secondary btn-sm"
              onClick={() => setImageUrl('https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=600&q=80')}>
              🚗 Driveway Preset
            </button>
          </div>

          <input type="text" className="input-field" value={imageUrl}
            placeholder="Or paste image URL (https://...)"
            onChange={(e) => setImageUrl(e.target.value)} />

          {imageUrl && (
            <div style={{ marginTop: '0.5rem', position: 'relative' }}>
              <img src={imageUrl} alt="Spot preview"
                style={{ borderRadius: 'var(--radius-md)', maxHeight: '140px', objectFit: 'cover', width: '100%', border: '1px solid var(--border-medium)' }}
                onError={(e) => e.target.style.display = 'none'} />
              <button type="button" className="btn btn-secondary btn-sm"
                style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', padding: '0.2rem 0.5rem' }}
                onClick={() => setImageUrl('')}>
                Remove Photo
              </button>
            </div>
          )}
        </div>

        {/* Amenities */}
        <label className="input-label">Available Amenities</label>
        <div className="amenities-checkbox-grid">
          <label className="checkbox-card">
            <input type="checkbox" checked={covered} onChange={(e) => setCovered(e.target.checked)} />
            <Warehouse size={16} /> Covered Shed
          </label>
          <label className="checkbox-card">
            <input type="checkbox" checked={securityAvailable} onChange={(e) => setSecurityAvailable(e.target.checked)} />
            <Shield size={16} /> 24/7 Security
          </label>
          <label className="checkbox-card">
            <input type="checkbox" checked={evChargingAvailable} onChange={(e) => setEvChargingAvailable(e.target.checked)} />
            <Zap size={16} /> EV Charging Port
          </label>
        </div>

        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" size={20} /> : initialData ? 'Update Spot' : 'Publish Spot Listing'}
        </button>
      </form>

      <style>{`
        .spot-form { display:flex; flex-direction:column; gap:1rem; }
        .input-row-2 { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
        .label-hint { font-weight:400; color:var(--secondary-muted); font-size:0.75rem; margin-left:0.4rem; }

        /* Search bar */
        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 0.75rem;
          color: var(--secondary-muted);
          pointer-events: none;
          z-index: 1;
        }
        .search-input { padding-left: 2.25rem !important; padding-right: 2.25rem !important; }
        .search-spinner {
          position: absolute;
          right: 0.75rem;
          color: var(--primary);
        }
        .search-clear-btn {
          position: absolute;
          right: 0.6rem;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--secondary-muted);
          display: flex;
          align-items: center;
          padding: 0.2rem;
          border-radius: 50%;
          transition: color 0.15s;
        }
        .search-clear-btn:hover { color: var(--accent-rose); }

        /* Suggestions dropdown */
        .suggestions-list {
          position: absolute;
          top: calc(100% + 4px);
          left: 0; right: 0;
          background: white;
          border: 1.5px solid var(--border-medium);
          border-radius: var(--radius-md);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          z-index: 9999;
          max-height: 220px;
          overflow-y: auto;
          list-style: none;
          padding: 0.25rem 0;
          margin: 0;
        }
        .suggestion-item {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 0.6rem 0.85rem;
          cursor: pointer;
          font-size: 0.83rem;
          color: var(--secondary);
          transition: background 0.1s;
        }
        .suggestion-item:hover { background: var(--primary-soft, #f0fdfa); }
        .suggestion-pin { color:var(--primary); flex-shrink:0; margin-top:2px; }
        .suggestion-text { line-height: 1.4; }

        /* Map */
        .map-picker-section {
          background:#f8fafc;
          border:1px solid var(--border-light);
          padding:0.9rem;
          border-radius:var(--radius-md);
        }
        .map-picker-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:0.3rem; }
        .map-picker-hint { font-size:0.78rem; color:var(--secondary-muted); margin:0 0 0.6rem; }
        .geocoding-spinner { font-size:0.78rem; color:var(--primary); display:flex; align-items:center; gap:0.3rem; }
        .modal-map-wrapper { border-radius:var(--radius-md); overflow:hidden; border:1.5px solid var(--border-medium); }
        .coords-display { font-size:0.76rem; color:var(--secondary-muted); margin-top:0.4rem; text-align:right; font-family:monospace; }

        /* Amenities */
        .amenities-checkbox-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:0.75rem; margin-bottom:1rem; }
        .checkbox-card {
          display:flex; align-items:center; gap:0.4rem;
          background:#fff; padding:0.6rem 0.75rem;
          border-radius:var(--radius-md); border:1px solid var(--border-light);
          font-size:0.82rem; font-weight:600; cursor:pointer;
        }
        .checkbox-card input { accent-color:var(--primary); }
      `}</style>
    </Modal>
  );
};
