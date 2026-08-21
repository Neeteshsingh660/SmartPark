import React from 'react';

export const ImpactStats = () => {
  return (
    <section className="stats-banner">
      <div className="container stats-container">
        <div className="stat-item">
          <div className="stat-value">10,000+</div>
          <div className="stat-label">Parking Spots</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">50,000+</div>
          <div className="stat-label">Bookings Made</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">5,000+</div>
          <div className="stat-label">Space Owners</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">98%</div>
          <div className="stat-label">Satisfaction Rate</div>
        </div>
      </div>

      <style>{`
        .stats-banner {
          background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
          padding: 3.5rem 0;
          color: #ffffff;
          margin: 3rem 0;
        }
        .stats-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          text-align: center;
        }
        .stat-value {
          font-size: 3rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-bottom: 0.25rem;
          line-height: 1;
        }
        .stat-label {
          font-size: 0.95rem;
          font-weight: 600;
          color: #99f6e4;
        }
        @media (max-width: 768px) {
          .stats-container {
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
          }
        }
      `}</style>
    </section>
  );
};
