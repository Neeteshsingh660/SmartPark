import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export const AuthModal = ({ isOpen, onClose, initialTab = 'login', defaultRole = 'DRIVER' }) => {
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tab === 'login' ? 'Welcome Back to SmartPark' : 'Create your SmartPark Account'}
      maxWidth="500px"
    >
      <div className="auth-modal-tabs">
        <button
          className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`}
          onClick={() => setTab('login')}
        >
          Log In
        </button>
        <button
          className={`auth-tab-btn ${tab === 'register' ? 'active' : ''}`}
          onClick={() => setTab('register')}
        >
          Register
        </button>
      </div>

      <div className="auth-modal-content">
        {tab === 'login' ? (
          <LoginForm onSuccess={onClose} onSwitchToRegister={() => setTab('register')} />
        ) : (
          <RegisterForm
            initialRole={defaultRole}
            onSuccess={onClose}
            onSwitchToLogin={() => setTab('login')}
          />
        )}
      </div>

      <style>{`
        .auth-modal-tabs {
          display: flex;
          background: #f1f5f9;
          border-radius: var(--radius-md);
          padding: 4px;
          margin-bottom: 1.5rem;
        }
        .auth-tab-btn {
          flex: 1;
          border: none;
          background: none;
          padding: 0.6rem;
          font-family: var(--font-family);
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--secondary-muted);
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: all 0.2s;
        }
        .auth-tab-btn.active {
          background: #ffffff;
          color: var(--primary);
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
      `}</style>
    </Modal>
  );
};
