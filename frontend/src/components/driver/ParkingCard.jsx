import React from 'react';
import { MapPin, Zap, Shield, Warehouse, Star, Navigation, Clock, TrendingUp } from 'lucide-react';

export const ParkingCard = ({ spot, onSelect, onBook }) => {
  const {
    id,
    title,
    address,
    city,
    pricePerHour,
    peakPricePerHour,
    capacity,
    totalSpots,
    availableSpots,
    covered,
    isCovered,
    securityAvailable,
    hasSecurity,
    evChargingAvailable,
    hasEvCharging,
    distanceKm,
    averageRating,
    imageUrl,
    operatingHours,
    latitude,
    longitude,
  } = spot;

  const isSpotCovered = covered ?? isCovered ?? false;
  const isSecurity = securityAvailable ?? hasSecurity ?? false;
  const isEv = evChargingAvailable ?? hasEvCharging ?? false;
  const spotCapacity = capacity ?? totalSpots ?? 5;

  // Build Google Maps navigation URL
  const navUrl = latitude && longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + ', ' + (city || ''))}`;

  // Determine if peak pricing is active (weekdays 8-10am and 5-8pm)
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  const isWeekday = day >= 1 && day <= 5;
  const isPeakHour = isWeekday && ((hour >= 8 && hour < 10) || (hour >= 17 && hour < 20));
  const currentRate = isPeakHour && peakPricePerHour ? peakPricePerHour : pricePerHour;

  const displayImage = imageUrl || spot.image || spot.image_url || spot.photoUrl || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="parking-card animate-fade">
      {/* Spot photo display */}
      <div className="spot-image-wrap">
        <img src={displayImage} alt={title} className="spot-image" onError={(e) => {
          e.target.src = 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80';
        }} />
      </div>

      <div className="card-header-row">
        <div>
          <h3 className="spot-title" onClick={() => onSelect(spot)}>{title}</h3>
          <p className="spot-address">
            <MapPin size={14} className="inline-pin" /> {address}{city ? `, ${city}` : ''}
          </p>
          {operatingHours && (
            <p className="operating-hours-label">
              <Clock size={12} className="inline-pin" /> {operatingHours}
            </p>
          )}
        </div>
        <div className="card-right-meta">
          <div className="spot-rating-badge">
            <Star size={14} fill="#f59e0b" color="#f59e0b" />
            <span>{averageRating ? averageRating.toFixed(1) : '4.8'}</span>
          </div>
          {/* Navigate Here button */}
          <a
            href={navUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-btn"
            title="Navigate with Google Maps"
            onClick={e => e.stopPropagation()}
          >
            <Navigation size={14} /> Navigate
          </a>
        </div>
      </div>

      <div className="amenities-row">
        {isEv && (
          <span className="amenity-chip chip-green"><Zap size={12} /> EV Charge</span>
        )}
        {isSpotCovered && (
          <span className="amenity-chip chip-blue"><Warehouse size={12} /> Covered</span>
        )}
        {isSecurity && (
          <span className="amenity-chip chip-amber"><Shield size={12} /> Security</span>
        )}
        {isPeakHour && peakPricePerHour && (
          <span className="amenity-chip chip-rose"><TrendingUp size={12} /> Peak Pricing</span>
        )}
      </div>

      <div className="card-footer-row">
        <div>
          <div className="price-tag">
            ₹{currentRate} <span className="price-label">/ hr</span>
            {isPeakHour && peakPricePerHour && pricePerHour !== peakPricePerHour && (
              <span className="peak-was">was ₹{pricePerHour}</span>
            )}
          </div>
          {distanceKm != null && (
            <div className="distance-label">{distanceKm.toFixed(1)} km away</div>
          )}
        </div>

        <div className="actions-right">
          <span className={`badge ${availableSpots > 0 || availableSpots == null ? 'badge-emerald' : 'badge-rose'}`}>
            {availableSpots != null ? `${availableSpots} spots open` : `${spotCapacity} total`}
          </span>
          <button className="btn btn-primary btn-sm" onClick={() => onBook(spot)}>
            Book Spot
          </button>
        </div>
      </div>

      <style>{`
        .parking-card {
          background: #ffffff;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: 1.25rem 1.5rem;
          margin-bottom: 1rem;
          transition: all 0.2s;
          overflow: hidden;
        }
        .parking-card:hover {
          border-color: var(--primary);
          box-shadow: var(--shadow-md);
        }
        .spot-image-wrap {
          margin: -1.25rem -1.5rem 1rem;
          height: 160px;
          overflow: hidden;
        }
        .spot-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .card-header-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
        }
        .card-right-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
          flex-shrink: 0;
        }
        .spot-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--secondary);
          cursor: pointer;
        }
        .spot-title:hover { color: var(--primary); }
        .spot-address {
          font-size: 0.85rem;
          color: var(--secondary-muted);
          margin-top: 0.2rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .operating-hours-label {
          font-size: 0.78rem;
          color: var(--secondary-muted);
          margin-top: 0.2rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .inline-pin { color: var(--primary); }
        .spot-rating-badge {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: #fef3c7;
          color: #b45309;
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
          font-size: 0.82rem;
          font-weight: 700;
        }
        .nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: #eff6ff;
          color: #2563eb;
          border: 1px solid #bfdbfe;
          border-radius: var(--radius-sm);
          padding: 0.25rem 0.65rem;
          font-size: 0.78rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.15s;
        }
        .nav-btn:hover {
          background: #2563eb;
          color: #fff;
        }
        .amenities-row {
          display: flex;
          gap: 0.5rem;
          margin: 0.85rem 0 1rem;
          flex-wrap: wrap;
        }
        .amenity-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-full);
        }
        .chip-green { background: #d1fae5; color: #047857; }
        .chip-blue { background: #e0f2fe; color: #0369a1; }
        .chip-amber { background: #fef3c7; color: #b45309; }
        .chip-rose { background: #ffe4e6; color: #be123c; }
        .card-footer-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--border-light);
          padding-top: 0.85rem;
        }
        .price-tag {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--primary);
          display: flex;
          align-items: baseline;
          gap: 0.35rem;
        }
        .price-label {
          font-size: 0.78rem;
          color: var(--secondary-muted);
          font-weight: 500;
        }
        .peak-was {
          font-size: 0.75rem;
          color: var(--secondary-muted);
          font-weight: 400;
          text-decoration: line-through;
        }
        .distance-label {
          font-size: 0.75rem;
          color: var(--secondary-muted);
          margin-top: 0.15rem;
        }
        .actions-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
      `}</style>
    </div>
  );
};
