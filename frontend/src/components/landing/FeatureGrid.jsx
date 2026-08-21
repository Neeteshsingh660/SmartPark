import React, { useState, useEffect } from 'react';
import { Radio, Lock, CreditCard, QrCode, TrendingUp } from 'lucide-react';

export const FeatureGrid = () => {
  // Live countdown timer simulation for Instant Booking feature card
  const [seconds, setSeconds] = useState(180);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <section className="features-section">
      <div className="container">
        <div className="features-header">
          <h2 className="features-title">Built for the modern city</h2>
          <p className="features-subtitle">
            Every feature is designed to make parking effortless — for drivers and owners alike.
          </p>
        </div>

        <div className="features-grid">
          {/* Card 1: Real-Time Availability (Large Teal Card - Matching Image 2) */}
          <div className="feature-card real-time-card">
            <div className="card-top">
              <span className="badge badge-live">
                <Radio size={12} className="animate-pulse" /> Live Updates
              </span>
            </div>
            <div className="card-body">
              <h3 className="feature-card-title">Real-Time Availability</h3>
              <p className="feature-card-desc">
                Live WebSocket updates show you exactly which spots are open right now. No more circling the block.
              </p>
            </div>
            <div className="card-footer-visual">
              <span className="visual-pill">₹40</span>
              <span className="visual-pill">₹25</span>
              <span className="visual-pill">₹35</span>
            </div>
          </div>

          {/* Card 2: Instant Booking (White Card - Matching Image 2) */}
          <div className="feature-card instant-booking-card">
            <div className="card-top">
              <div className="feature-icon-circle">
                <Lock size={20} />
              </div>
              <span className="badge badge-redis">Redis Lock</span>
            </div>
            <div className="card-body">
              <h3 className="feature-card-title">Instant Booking</h3>
              <p className="feature-card-desc">
                Redis-powered 5-minute hold locks your spot the moment you select it — nobody else can grab it.
              </p>
            </div>
            <div className="timer-bar-visual">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(seconds / 300) * 100}%` }}></div>
              </div>
              <div className="timer-labels">
                <span>Spot held for 5 minutes</span>
                <span className="timer-countdown">{formatTime(seconds)}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Secure Payments */}
          <div className="feature-card standard-feature-card">
            <div className="card-top">
              <div className="feature-icon-circle">
                <CreditCard size={20} />
              </div>
              <span className="badge badge-teal">Encrypted</span>
            </div>
            <h3 className="feature-card-title">Secure Payments</h3>
            <p className="feature-card-desc">
              Integrated payments with automatic receipt generation. Pay effortlessly via Cards or UPI.
            </p>
          </div>

          {/* Card 4: QR Check-In */}
          <div className="feature-card standard-feature-card dark-feature-card">
            <div className="card-top">
              <div className="feature-icon-circle dark-icon">
                <QrCode size={20} />
              </div>
              <span className="badge badge-dark-pill">Instant Scan</span>
            </div>
            <h3 className="feature-card-title text-white">QR Check-In</h3>
            <p className="feature-card-desc text-slate-300">
              No paper tickets. Simply scan your unique digital QR code at entry to check in and check out.
            </p>
          </div>

          {/* Card 5: Owner Earnings */}
          <div className="feature-card standard-feature-card">
            <div className="card-top">
              <div className="feature-icon-circle">
                <TrendingUp size={20} />
              </div>
              <span className="badge badge-emerald">Analytics</span>
            </div>
            <h3 className="feature-card-title">Owner Earnings</h3>
            <p className="feature-card-desc">
              Monetize empty driveways and parking spots. Track total bookings and revenue in real-time.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .features-section {
          padding: 5rem 0;
        }
        .features-header {
          text-align: center;
          max-width: 650px;
          margin: 0 auto 3.5rem;
        }
        .features-title {
          font-size: 2.25rem;
          font-weight: 800;
          color: var(--secondary);
          margin-bottom: 0.75rem;
        }
        .features-subtitle {
          font-size: 1.05rem;
          color: var(--secondary-muted);
          line-height: 1.6;
        }
        .features-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 1.5rem;
        }
        .feature-card {
          border-radius: var(--radius-lg);
          padding: 2rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border: 1px solid var(--border-light);
          box-shadow: var(--shadow-sm);
        }
        
        /* Real time teal card */
        .real-time-card {
          background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
          color: #ffffff;
          min-height: 280px;
        }
        .badge-live {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
          backdrop-filter: blur(4px);
        }
        .real-time-card .feature-card-title {
          color: #ffffff;
          font-size: 1.6rem;
          margin-bottom: 0.5rem;
        }
        .real-time-card .feature-card-desc {
          color: #ccfbf1;
          font-size: 1rem;
          line-height: 1.6;
        }
        .card-footer-visual {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }
        .visual-pill {
          background: rgba(255, 255, 255, 0.15);
          padding: 0.4rem 1rem;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 700;
        }

        /* Instant booking card */
        .instant-booking-card {
          background: #ffffff;
        }
        .feature-icon-circle {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background: var(--primary-soft);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }
        .badge-redis {
          background: #e0f2fe;
          color: #0369a1;
        }
        .feature-card-title {
          font-size: 1.35rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .feature-card-desc {
          font-size: 0.92rem;
          color: var(--secondary-muted);
          line-height: 1.5;
        }
        .timer-bar-visual {
          margin-top: 1.5rem;
        }
        .progress-bar {
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }
        .progress-fill {
          height: 100%;
          background: var(--primary);
          transition: width 1s linear;
        }
        .timer-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--secondary-muted);
          font-weight: 600;
        }
        .timer-countdown {
          color: var(--primary);
          font-weight: 700;
        }

        /* Bottom 3 cards row */
        .standard-feature-card {
          background: #ffffff;
        }
        .dark-feature-card {
          background: #0f172a;
          border-color: #1e293b;
        }
        .dark-icon {
          background: #1e293b;
          color: #38bdf8;
        }
        .badge-dark-pill {
          background: #1e293b;
          color: #94a3b8;
        }

        @media (max-width: 992px) {
          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
};
