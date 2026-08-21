import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom marker icon with price badge for parking spots
const createPriceIcon = (price) => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `<div style="
      background: #0d9488;
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 12px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      border: 2px solid white;
      white-space: nowrap;
    ">₹${price}/hr</div>`,
    iconSize: [50, 25],
    iconAnchor: [25, 25],
  });
};

// Custom marker icon for User's Chosen Search Location
const searchLocationIcon = L.divIcon({
  className: 'user-search-pin',
  html: `<div style="
    background: #f43f5e;
    color: white;
    padding: 6px 12px;
    border-radius: 16px;
    font-weight: 800;
    font-size: 13px;
    box-shadow: 0 4px 14px rgba(244,63,94,0.5);
    border: 3px solid white;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 4px;
  ">📍 Search Location</div>`,
  iconSize: [130, 32],
  iconAnchor: [65, 16],
});

// Click Listener Component for Leaflet Map
function MapClickListener({ onPickLocation }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      if (onPickLocation) {
        onPickLocation(lat, lng);
      }
    },
  });
  return null;
}

export const ParkingMap = ({ spots = [], selectedSpot, onSelectSpot, onPickLocation, center = [28.6139, 77.2090] }) => {
  const mapCenter = selectedSpot
    ? [selectedSpot.latitude || center[0], selectedSpot.longitude || center[1]]
    : center;

  return (
    <div className="map-wrapper">
      <div className="map-instruction-banner">
        💡 Tip: Click anywhere on the map to choose a search location!
      </div>

      <MapContainer
        center={mapCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-lg)' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Enable click listener to pick locations on map */}
        <MapClickListener onPickLocation={onPickLocation} />

        {/* Selected Search Location Pin */}
        {center && (
          <Marker position={center} icon={searchLocationIcon}>
            <Popup>
              <div className="map-popup-card">
                <h4>Search Location</h4>
                <p>Searching nearby spots within radius.</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Parking Spot Pins */}
        {spots.map((spot) => {
          const lat = spot.latitude || (28.6139 + (Math.random() - 0.5) * 0.05);
          const lng = spot.longitude || (77.2090 + (Math.random() - 0.5) * 0.05);
          return (
            <Marker
              key={spot.id}
              position={[lat, lng]}
              icon={createPriceIcon(spot.pricePerHour)}
              eventHandlers={{
                click: () => onSelectSpot(spot),
              }}
            >
              <Popup>
                <div className="map-popup-card">
                  <h4>{spot.title}</h4>
                  <p>{spot.address}</p>
                  <div className="popup-price">₹{spot.pricePerHour}/hr</div>
                  <button className="btn btn-primary btn-sm popup-btn" onClick={() => onSelectSpot(spot)}>
                    Book Spot
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <style>{`
        .map-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 480px;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border-light);
        }
        .map-instruction-banner {
          position: absolute;
          top: 10px;
          left: 50px;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.85);
          color: #ffffff;
          backdrop-filter: blur(4px);
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: 0.78rem;
          font-weight: 600;
          pointer-events: none;
          box-shadow: var(--shadow-md);
        }
        .map-popup-card h4 {
          margin: 0 0 0.2rem;
          font-size: 0.95rem;
        }
        .map-popup-card p {
          margin: 0 0 0.5rem;
          font-size: 0.8rem;
          color: var(--secondary-muted);
        }
        .popup-price {
          font-weight: 800;
          color: var(--primary);
          margin-bottom: 0.5rem;
        }
        .popup-btn {
          width: 100%;
        }
      `}</style>
    </div>
  );
};
