import React from 'react';
import { Star } from 'lucide-react';

export const UserReviews = () => {
  const reviews = [
    {
      id: 1,
      quote: `"Found a spot 2 minutes from my office for half the price of the nearby garage. SmartPark has completely changed my morning commute."`,
      name: 'Priya Sharma',
      role: 'Driver · Mumbai',
      initials: 'PS',
      color: '#0d9488',
    },
    {
      id: 2,
      quote: `"My garage was sitting empty all day. Now it earns ₹8,000 a month with zero effort. The dashboard makes everything so simple."`,
      name: 'Rahul Mehta',
      role: 'Owner · Bangalore',
      initials: 'RM',
      color: '#0f766e',
    },
    {
      id: 3,
      quote: `"The QR check-in is genius. No fumbling with tickets or apps — just scan and park. I use SmartPark every single day."`,
      name: 'Ananya Iyer',
      role: 'Driver · Delhi',
      initials: 'AI',
      color: '#14b8a6',
    },
  ];

  return (
    <section className="reviews-section">
      <div className="container">
        <div className="reviews-header">
          <span className="badge badge-teal">Loved by thousands</span>
          <h2 className="reviews-title">What our users say</h2>
        </div>

        <div className="reviews-grid">
          {reviews.map((rev) => (
            <div key={rev.id} className="review-card">
              <div className="star-row">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p className="review-quote">{rev.quote}</p>
              <div className="review-user-info">
                <div className="user-initials-avatar" style={{ backgroundColor: rev.color }}>
                  {rev.initials}
                </div>
                <div>
                  <h4 className="user-name-title">{rev.name}</h4>
                  <p className="user-role-text">{rev.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .reviews-section {
          padding: 4rem 0 5rem;
        }
        .reviews-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        .reviews-title {
          font-size: 2.25rem;
          font-weight: 800;
          color: var(--secondary);
          margin-top: 0.75rem;
        }
        .reviews-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }
        .review-card {
          background: #ffffff;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: 2.25rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: var(--shadow-sm);
          transition: transform 0.2s;
        }
        .review-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }
        .star-row {
          display: flex;
          gap: 0.25rem;
          margin-bottom: 1.25rem;
        }
        .review-quote {
          font-size: 0.98rem;
          color: var(--secondary-light);
          line-height: 1.6;
          margin-bottom: 2rem;
          font-style: italic;
        }
        .review-user-info {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }
        .user-initials-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          color: #ffffff;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
        }
        .user-name-title {
          font-size: 0.98rem;
          font-weight: 700;
          color: var(--secondary);
        }
        .user-role-text {
          font-size: 0.82rem;
          color: var(--secondary-muted);
        }
        @media (max-width: 992px) {
          .reviews-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
};
