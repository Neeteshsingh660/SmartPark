import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const LoginForm = ({ onSuccess, onSwitchToRegister }) => {
  const { login } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password', 'error');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      if (onSuccess) onSuccess();
    } catch (err) {
      addToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form animate-fade">
      <div className="input-group">
        <label className="input-label">Email Address</label>
        <div className="input-icon-wrapper">
          <Mail className="field-icon" size={18} />
          <input
            type="email"
            required
            placeholder="driver@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field-with-icon"
          />
        </div>
      </div>

      <div className="input-group">
        <label className="input-label">Password</label>
        <div className="input-icon-wrapper">
          <Lock className="field-icon" size={18} />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field-with-icon"
          />
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="form-extra-row">
        <label className="checkbox-label">
          <input type="checkbox" defaultChecked /> Remember me
        </label>
        <a href="#" onClick={(e) => { e.preventDefault(); addToast('OTP login can be used via register flow.', 'info'); }} className="forgot-link">
          Forgot Password?
        </a>
      </div>

      <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Log In'}
      </button>

      <p className="switch-auth-text">
        Don't have an account?{' '}
        <button type="button" onClick={onSwitchToRegister} className="switch-link">
          Create account
        </button>
      </p>

      <style>{`
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }
        .input-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon-wrapper .field-icon {
          position: absolute;
          left: 1rem;
          color: var(--secondary-muted);
        }
        .input-field-with-icon {
          width: 100%;
          padding: 0.8rem 2.8rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-light);
          font-family: var(--font-family);
          font-size: 0.95rem;
          outline: none;
          transition: all 0.2s;
        }
        .input-field-with-icon:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
        }
        .password-toggle-btn {
          position: absolute;
          right: 1rem;
          background: none;
          border: none;
          color: var(--secondary-muted);
          cursor: pointer;
        }
        .form-extra-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.85rem;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--secondary-muted);
          cursor: pointer;
        }
        .forgot-link {
          color: var(--primary);
          text-decoration: none;
          font-weight: 600;
        }
        .w-full {
          width: 100%;
        }
        .switch-auth-text {
          text-align: center;
          font-size: 0.9rem;
          color: var(--secondary-muted);
          margin-top: 0.5rem;
        }
        .switch-link {
          border: none;
          background: none;
          color: var(--primary);
          font-weight: 700;
          cursor: pointer;
          font-size: 0.9rem;
        }
      `}</style>
    </form>
  );
};
