import React from 'react';
import { MapPin, Globe, Share2, ExternalLink } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="footer-root">
      <div className="container footer-container">
        <div className="footer-brand">
          <div className="navbar-logo">
            <div className="logo-icon-bg">
              <MapPin className="logo-icon" size={20} />
            </div>
            <span className="logo-text">SmartPark</span>
          </div>
          <p className="footer-desc">
            SmartPark connects drivers with available parking spaces in real time. Search, book, and park — all in minutes.
          </p>
          <div className="social-links">
            <a href="#" className="social-btn"><Globe size={18} /></a>
            <a href="#" className="social-btn"><Share2 size={18} /></a>
            <a href="#" className="social-btn"><ExternalLink size={18} /></a>
          </div>
        </div>

        <div className="footer-columns">
          <div className="footer-col">
            <h4 className="col-title">Drivers</h4>
            <a href="#">Find Parking</a>
            <a href="#">Interactive Map</a>
            <a href="#">Pricing</a>
            <a href="#">Mobile App</a>
          </div>
          <div className="footer-col">
            <h4 className="col-title">Space Owners</h4>
            <a href="#">List Your Space</a>
            <a href="#">Owner Dashboard</a>
            <a href="#">Earnings Calculator</a>
            <a href="#">Partner Support</a>
          </div>
          <div className="footer-col">
            <h4 className="col-title">Company</h4>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Press</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container bottom-container">
          <p>© 2026 SmartPark Inc. All rights reserved.</p>
          <div className="bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Security</a>
          </div>
        </div>
      </div>

      <style>{`
        .footer-root {
          background: #0f172a;
          color: #94a3b8;
          padding-top: 4rem;
          margin-top: 5rem;
        }
        .footer-container {
          display: grid;
          grid-template-columns: 1.5fr 3fr;
          gap: 4rem;
          padding-bottom: 4rem;
        }
        .footer-brand .logo-text {
          color: #ffffff;
        }
        .footer-desc {
          margin-top: 1rem;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
          line-height: 1.6;
        }
        .social-links {
          display: flex;
          gap: 0.75rem;
        }
        .social-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #1e293b;
          color: #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .social-btn:hover {
          background: var(--primary);
          color: #ffffff;
        }
        .footer-columns {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }
        .col-title {
          color: #ffffff;
          font-size: 1rem;
          margin-bottom: 1.2rem;
        }
        .footer-col {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .footer-col a {
          color: #94a3b8;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.2s;
        }
        .footer-col a:hover {
          color: var(--primary-light);
        }
        .footer-bottom {
          border-top: 1px solid #1e293b;
          padding: 1.5rem 0;
          font-size: 0.85rem;
        }
        .bottom-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .bottom-links {
          display: flex;
          gap: 1.5rem;
        }
        .bottom-links a {
          color: #94a3b8;
          text-decoration: none;
        }
        .bottom-links a:hover {
          color: #ffffff;
        }
        @media (max-width: 768px) {
          .footer-container {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .footer-columns {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </footer>
  );
};
