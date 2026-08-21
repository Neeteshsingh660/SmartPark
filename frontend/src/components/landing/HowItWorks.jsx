import React from 'react';
import { ChevronRight } from 'lucide-react';

export const HowItWorks = ({ onNavigate, onOpenAuth }) => {
  return (
    <section className="how-it-works-section">
      <div className="container">
        <div className="section-grid-3">
          {/* Step 1 */}
          <div className="step-card">
            <div className="step-number">01</div>
            <h3 className="step-title">Search & Find</h3>
            <p className="step-description">
              Enter your destination, browse the interactive map, and filter by price, distance, covered parking, EV charging, and more.
            </p>
            <button className="step-link" onClick={() => onNavigate('search')}>
              Explore the Map <ChevronRight size={16} />
            </button>
          </div>

          {/* Step 2 */}
          <div className="step-card">
            <div className="step-number">02</div>
            <h3 className="step-title">Book & Pay</h3>
            <p className="step-description">
              Select your time slot — our system instantly holds your spot for 5 minutes while you complete a secure payment.
            </p>
            <button className="step-link" onClick={() => onNavigate('pricing')}>
              See Pricing <ChevronRight size={16} />
            </button>
          </div>

          {/* Step 3 */}
          <div className="step-card">
            <div className="step-number">03</div>
            <h3 className="step-title">Park & Go</h3>
            <p className="step-description">
              Arrive, scan your QR code to check in, and enjoy your session. Check out when done and leave a review.
            </p>
            <button className="step-link" onClick={() => onOpenAuth('register')}>
              Get Started <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .how-it-works-section {
          padding: 4rem 0;
        }
        .section-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }
        .step-card {
          background: #ffffff;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: 2.25rem;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .step-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }
        .step-number {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          background: var(--primary);
          color: #ffffff;
          font-size: 1.25rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
        }
        .step-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--secondary);
          margin-bottom: 0.75rem;
        }
        .step-description {
          font-size: 0.95rem;
          color: var(--secondary-muted);
          line-height: 1.6;
          margin-bottom: 1.75rem;
          flex: 1;
        }
        .step-link {
          border: none;
          background: none;
          color: var(--primary);
          font-weight: 700;
          font-size: 0.92rem;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          cursor: pointer;
          padding: 0;
        }
        .step-link:hover {
          text-decoration: underline;
        }
        @media (max-width: 992px) {
          .section-grid-3 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
};
