import React, { useState } from 'react';
import { MapPin, User, LogOut, Shield, Car, Building2, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const Navbar = ({ onOpenAuth, onNavigate, currentTab }) => {
  const { user, isAuthenticated, logout, activeRole } = useAuth();
  const { addToast } = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleListSpaceClick = () => {
    if (!isAuthenticated) {
      onOpenAuth('register', 'OWNER');
    } else if (user?.role === 'DRIVER') {
      addToast('Listing a space requires a Space Owner account. Please register or log in as an Owner.', 'error');
      onOpenAuth('login', 'OWNER');
    } else if (user?.role === 'OWNER' || user?.role === 'ADMIN') {
      onNavigate('owner');
    }
  };

  const handleFindParkingClick = () => {
    onNavigate('search');
  };

  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        {/* Brand Logo */}
        <div className="navbar-logo" onClick={() => onNavigate('home')}>
          <div className="logo-icon-bg">
            <MapPin className="logo-icon" size={22} />
          </div>
          <span className="logo-text">SmartPark</span>
        </div>

        {/* Navigation Links */}
        <nav className="navbar-links">
          <button 
            className={`nav-link ${currentTab === 'search' ? 'active' : ''}`} 
            onClick={handleFindParkingClick}
          >
            Find Parking
          </button>
          {isAuthenticated && user?.role === 'DRIVER' && (
            <button 
              className={`nav-link ${currentTab === 'bookings' ? 'active' : ''}`} 
              onClick={() => onNavigate('bookings')}
            >
              My Bookings & Wallet
            </button>
          )}
          <button 
            className={`nav-link ${currentTab === 'owner' ? 'active' : ''}`} 
            onClick={handleListSpaceClick}
          >
            List Space
          </button>
          <button 
            className={`nav-link ${currentTab === 'how-it-works' ? 'active' : ''}`} 
            onClick={() => onNavigate('how-it-works')}
          >
            How It Works
          </button>
          <button 
            className={`nav-link ${currentTab === 'pricing' ? 'active' : ''}`} 
            onClick={() => onNavigate('pricing')}
          >
            Pricing
          </button>
        </nav>

        {/* Auth / Role / Actions */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="user-menu-wrapper">
              {/* Role Badge */}
              <div className="role-active-badge">
                {user.role === 'DRIVER' && <span className="badge badge-teal"><Car size={12} /> Driver Account</span>}
                {user.role === 'OWNER' && <span className="badge badge-emerald"><Building2 size={12} /> Owner Account</span>}
                {user.role === 'ADMIN' && <span className="badge badge-rose"><Shield size={12} /> Admin Account</span>}
              </div>

              {/* User Profile Dropdown */}
              <div className="profile-dropdown-trigger" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                <span className="user-name">{user.name}</span>
                <ChevronDown size={14} />

                {dropdownOpen && (
                  <div className="profile-dropdown-menu animate-fade">
                    <div className="dropdown-header">
                      <div className="user-email">{user.email}</div>
                      <span className="badge badge-teal">{user.role}</span>
                    </div>
                    <div className="dropdown-divider"></div>
                    
                    {user.role === 'DRIVER' && (
                      <button className="dropdown-item" onClick={() => { onNavigate('bookings'); setDropdownOpen(false); }}>
                        My Bookings
                      </button>
                    )}

                    {user.role === 'OWNER' && (
                      <button className="dropdown-item" onClick={() => { onNavigate('owner'); setDropdownOpen(false); }}>
                        My Listed Spaces
                      </button>
                    )}

                    {user.role === 'ADMIN' && (
                      <button className="dropdown-item" onClick={() => { onNavigate('admin'); setDropdownOpen(false); }}>
                        Admin Dashboard
                      </button>
                    )}

                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item logout-item" onClick={() => { logout(); setDropdownOpen(false); }}>
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="btn btn-secondary btn-sm" onClick={() => onOpenAuth('login')}>
                Log in
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => onOpenAuth('register')}>
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .navbar-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-light);
        }
        .navbar-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
        }
        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          cursor: pointer;
        }
        .logo-icon-bg {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, #0d9488, #14b8a6);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
        }
        .logo-text {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--secondary);
          letter-spacing: -0.03em;
        }
        .navbar-links {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .nav-link {
          background: none;
          border: none;
          font-family: var(--font-family);
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--secondary-muted);
          cursor: pointer;
          transition: color 0.2s;
          padding: 0.4rem 0;
        }
        .nav-link:hover, .nav-link.active {
          color: var(--primary);
        }
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .auth-buttons {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .user-menu-wrapper {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .profile-dropdown-trigger {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.35rem 0.6rem;
          border-radius: var(--radius-full);
          cursor: pointer;
          background: #f8fafc;
          border: 1px solid var(--border-light);
        }
        .user-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
        }
        .user-name {
          font-size: 0.88rem;
          font-weight: 600;
        }
        .profile-dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 220px;
          background: #ffffff;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          padding: 0.75rem;
          z-index: 1100;
        }
        .dropdown-header {
          padding: 0.4rem 0.5rem;
        }
        .user-email {
          font-size: 0.8rem;
          color: var(--secondary-muted);
          margin-bottom: 0.25rem;
          word-break: break-all;
        }
        .dropdown-divider {
          height: 1px;
          background: var(--border-light);
          margin: 0.5rem 0;
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.5rem 0.6rem;
          border: none;
          background: none;
          text-align: left;
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--secondary);
          cursor: pointer;
          border-radius: var(--radius-sm);
        }
        .dropdown-item:hover {
          background: #f1f5f9;
        }
        .logout-item {
          color: var(--accent-rose);
        }
        .logout-item:hover {
          background: #ffe4e6;
        }
        @media (max-width: 768px) {
          .navbar-links { display: none; }
          .role-active-badge { display: none; }
        }
      `}</style>
    </header>
  );
};
