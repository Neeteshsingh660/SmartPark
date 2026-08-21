import React, { useState } from 'react';
import { MapPin, Calendar, Clock, Search, Star, Radio } from 'lucide-react';

export const HeroSection = ({ onSearch }) => {
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch({ location, date, time });
  };

  const handleTagClick = (tag) => {
    setLocation(tag);
    onSearch({ location: tag, date, time });
  };

  return (
    <section className="hero-section">
      <div className="container hero-container">
        {/* Left Side Text & Search Form */}
        <div className="hero-left">
          <h1 className="hero-title">
            Find a parking spot before you reach your destination.
          </h1>
          <p className="hero-subtitle">
            SmartPark connects drivers with available parking spaces in real time. Search, book, and park — all in minutes.
          </p>

          {/* Search Card Container */}
          <div className="search-card">
            <form onSubmit={handleSearchSubmit}>
              {/* Location Input */}
              <div className="search-field-wrapper">
                <MapPin className="field-icon" size={18} />
                <input
                  type="text"
                  placeholder="Enter city, address or landmark..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="search-input"
                />
              </div>

              {/* Date & Time Controls Grid */}
              <div className="search-controls-row">
                <div className="search-field-wrapper date-wrapper">
                  <Calendar className="field-icon" size={18} />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="search-input"
                  />
                </div>

                <div className="search-field-wrapper time-wrapper">
                  <Clock className="field-icon" size={18} />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="search-input"
                  />
                </div>

                <button type="submit" className="btn btn-primary search-btn">
                  <Search size={18} />
                  <span>Search Parking</span>
                </button>
              </div>
            </form>

            {/* Popular City Tags */}
            <div className="popular-tags">
              <span className="popular-label">Popular:</span>
              <button className="tag-btn" onClick={() => handleTagClick('Connaught Place')}>Connaught Place</button>
              <button className="tag-btn" onClick={() => handleTagClick('Bandra West')}>Bandra West</button>
              <button className="tag-btn" onClick={() => handleTagClick('Koramangala')}>Koramangala</button>
            </div>
          </div>
        </div>

        {/* Right Side Visual Image Card (Matching Attached Image 1) */}
        <div className="hero-right">
          <div className="map-hero-card">
            {/* Aerial Map Simulation Image */}
            <div className="map-image-wrapper">
              <img 
                src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1000&q=80" 
                alt="City Aerial View Map"
                className="hero-map-img"
              />
              
              {/* Floating Live Indicator Badge */}
              <div className="floating-badge live-badge">
                <Radio size={12} className="animate-pulse" /> Live
              </div>

              {/* Floating Price Pins */}
              <div className="map-price-pin pin-1">₹40/hr</div>
              <div className="map-price-pin pin-2">₹35/hr</div>
              <div className="map-price-pin pin-3">₹25/hr</div>
              <div className="map-price-pin pin-4">₹20/hr</div>

              {/* Booking Confirmed Pill Top Right */}
              <div className="floating-badge confirmed-pill">
                ✓ Booking Confirmed!
              </div>

              {/* Main Parking Details Card Overlay */}
              <div className="map-overlay-card">
                <div className="card-top-row">
                  <h4 className="spot-name">CP Central Parking</h4>
                  <span className="spot-rating"><Star size={14} fill="#f59e0b" color="#f59e0b" /> 4.9</span>
                </div>
                <div className="spot-distance">📍 0.3 km away</div>
                <div className="card-bottom-row">
                  <div className="spot-price">₹40<span className="price-unit">/hr</span></div>
                  <span className="badge badge-emerald">4 spots left</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hero-section {
          padding: 4rem 0 3rem;
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
        }
        .hero-container {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 3.5rem;
          align-items: center;
        }
        .hero-title {
          font-size: 3.25rem;
          font-weight: 800;
          line-height: 1.12;
          color: var(--secondary);
          letter-spacing: -0.03em;
          margin-bottom: 1.25rem;
        }
        .hero-subtitle {
          font-size: 1.15rem;
          color: var(--secondary-muted);
          line-height: 1.6;
          margin-bottom: 2rem;
          max-width: 540px;
        }
        .search-card {
          background: #ffffff;
          border: 1px solid var(--border-light);
          box-shadow: 0 20px 40px -15px rgba(13, 148, 136, 0.12);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
        }
        .search-field-wrapper {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #f8fafc;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          padding: 0.75rem 1rem;
          margin-bottom: 1rem;
          transition: border-color 0.2s;
        }
        .search-field-wrapper:focus-within {
          border-color: var(--primary);
          background: #ffffff;
        }
        .field-icon {
          color: var(--secondary-muted);
        }
        .search-input {
          border: none;
          background: transparent;
          width: 100%;
          font-family: var(--font-family);
          font-size: 0.95rem;
          color: var(--secondary);
          outline: none;
        }
        .search-controls-row {
          display: grid;
          grid-template-columns: 1fr 1fr auto;
          gap: 0.75rem;
        }
        .search-controls-row .search-field-wrapper {
          margin-bottom: 0;
        }
        .search-btn {
          height: 100%;
          padding: 0 1.5rem;
          white-space: nowrap;
        }
        .popular-tags {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-top: 1.25rem;
          font-size: 0.85rem;
          flex-wrap: wrap;
        }
        .popular-label {
          color: var(--secondary-muted);
          font-weight: 600;
        }
        .tag-btn {
          border: none;
          background: none;
          color: var(--primary);
          font-weight: 600;
          cursor: pointer;
          font-size: 0.85rem;
          padding: 0;
        }
        .tag-btn:hover {
          text-decoration: underline;
        }

        /* Right Hero Map Card */
        .hero-right {
          position: relative;
        }
        .map-hero-card {
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
          border: 4px solid #ffffff;
        }
        .map-image-wrapper {
          position: relative;
          height: 420px;
        }
        .hero-map-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .floating-badge {
          position: absolute;
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 700;
          z-index: 10;
        }
        .live-badge {
          top: 1.25rem;
          right: 1.25rem;
          background: #ffffff;
          color: var(--secondary);
          display: flex;
          align-items: center;
          gap: 0.4rem;
          box-shadow: var(--shadow-sm);
        }
        .confirmed-pill {
          top: 1.25rem;
          right: 6rem;
          background: #10b981;
          color: #ffffff;
        }
        .map-price-pin {
          position: absolute;
          background: var(--secondary);
          color: #ffffff;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.82rem;
          font-weight: 700;
          box-shadow: var(--shadow-md);
          border: 2px solid var(--primary-light);
          transform: translate(-50%, -50%);
          cursor: pointer;
        }
        .pin-1 { top: 35%; left: 60%; background: #0d9488; }
        .pin-2 { top: 22%; left: 82%; }
        .pin-3 { top: 62%; left: 85%; }
        .pin-4 { top: 66%; left: 72%; }

        .map-overlay-card {
          position: absolute;
          bottom: 1.25rem;
          left: 1.25rem;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(12px);
          border-radius: var(--radius-md);
          padding: 1rem 1.25rem;
          width: 240px;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-light);
        }
        .card-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .spot-name {
          font-size: 0.95rem;
          font-weight: 700;
        }
        .spot-rating {
          font-size: 0.82rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.2rem;
        }
        .spot-distance {
          font-size: 0.78rem;
          color: var(--secondary-muted);
          margin: 0.2rem 0 0.6rem;
        }
        .card-bottom-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .spot-price {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--primary);
        }
        .price-unit {
          font-size: 0.75rem;
          color: var(--secondary-muted);
          font-weight: 500;
        }

        @media (max-width: 992px) {
          .hero-container {
            grid-template-columns: 1fr;
          }
          .hero-title { font-size: 2.5rem; }
          .hero-right { display: none; }
        }
      `}</style>
    </section>
  );
};
