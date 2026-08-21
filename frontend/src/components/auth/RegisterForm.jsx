import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Eye, EyeOff, KeyRound, Loader2, Car, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const RegisterForm = ({ initialRole = 'DRIVER', onSuccess, onSwitchToLogin }) => {
  const { register, sendOtp } = useAuth();
  const { addToast } = useToast();

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Live password strength (0 to 4 bars)
  const calculateStrength = (pass) => {
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8 && /[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };
  const strength = calculateStrength(password);

  const handleSendOtpClick = async () => {
    if (!email || !email.includes('@')) {
      addToast('Please enter a valid email address to receive OTP', 'error');
      return;
    }
    setSendingOtp(true);
    try {
      await sendOtp(email);
      setOtpSent(true);
    } catch (err) {
      addToast(err.message || 'Failed to send OTP', 'error');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }

    if (!otp) {
      addToast('Please enter the OTP sent to your email', 'error');
      return;
    }

    setLoading(true);
    try {
      await register({
        name,
        email,
        phone,
        password,
        role,
        otp,
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      addToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form animate-fade">
      {/* Role Toggle Selector */}
      <div className="role-selector-container">
        <label className="input-label">Select Account Type</label>
        <div className="role-toggle-grid">
          <button
            type="button"
            className={`role-card-btn ${role === 'DRIVER' ? 'active' : ''}`}
            onClick={() => setRole('DRIVER')}
          >
            <Car size={18} />
            <div className="role-btn-text">
              <strong>Driver</strong>
              <span>Find & book parking</span>
            </div>
          </button>

          <button
            type="button"
            className={`role-card-btn ${role === 'OWNER' ? 'active' : ''}`}
            onClick={() => setRole('OWNER')}
          >
            <Building2 size={18} />
            <div className="role-btn-text">
              <strong>Space Owner</strong>
              <span>List & earn money</span>
            </div>
          </button>
        </div>
      </div>

      {/* Full Name Input */}
      <div className="input-group">
        <label className="input-label">Full Name</label>
        <div className="input-icon-wrapper">
          <User className="field-icon" size={18} />
          <input
            type="text"
            required
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field-with-icon"
          />
        </div>
      </div>

      {/* Email + Send OTP Button */}
      <div className="input-group">
        <label className="input-label">Email Address</label>
        <div className="otp-email-row">
          <div className="input-icon-wrapper flex-1">
            <Mail className="field-icon" size={18} />
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field-with-icon"
            />
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm send-otp-btn"
            onClick={handleSendOtpClick}
            disabled={sendingOtp}
          >
            {sendingOtp ? <Loader2 className="animate-spin" size={16} /> : otpSent ? 'Resend OTP' : 'Send OTP'}
          </button>
        </div>
      </div>

      {/* OTP Field */}
      <div className="input-group">
        <label className="input-label">OTP Verification Code</label>
        <div className="input-icon-wrapper">
          <KeyRound className="field-icon" size={18} />
          <input
            type="text"
            required
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="input-field-with-icon"
          />
        </div>
      </div>

      {/* Phone Number Input */}
      <div className="input-group">
        <label className="input-label">Phone Number (Optional)</label>
        <div className="input-icon-wrapper">
          <Phone className="field-icon" size={18} />
          <input
            type="tel"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input-field-with-icon"
          />
        </div>
      </div>

      {/* Password Field + Live Strength Indicator */}
      <div className="input-group">
        <label className="input-label">Password</label>
        <div className="input-icon-wrapper">
          <Lock className="field-icon" size={18} />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            placeholder="Minimum 6 characters"
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

        {/* Strength Meter Bars */}
        {password && (
          <div className="strength-meter-wrapper">
            <div className="strength-bars">
              {[1, 2, 3, 4].map((barIndex) => (
                <div
                  key={barIndex}
                  className={`strength-bar ${barIndex <= strength ? 'active-bar' : ''}`}
                ></div>
              ))}
            </div>
            <span className="strength-label">
              {strength === 0 && 'Weak'}
              {strength === 1 && 'Fair'}
              {strength === 2 && 'Good'}
              {strength === 3 && 'Strong'}
              {strength === 4 && 'Very Strong'}
            </span>
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div className="input-group">
        <label className="input-label">Confirm Password</label>
        <div className="input-icon-wrapper">
          <Lock className="field-icon" size={18} />
          <input
            type="password"
            required
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-field-with-icon"
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Complete Registration'}
      </button>

      <p className="switch-auth-text">
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToLogin} className="switch-link">
          Log in
        </button>
      </p>

      <style>{`
        .role-selector-container {
          margin-bottom: 0.5rem;
        }
        .role-toggle-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-top: 0.4rem;
        }
        .role-card-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-light);
          background: #f8fafc;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }
        .role-card-btn.active {
          background: var(--primary-soft);
          border-color: var(--primary);
          color: var(--primary);
        }
        .role-btn-text {
          display: flex;
          flex-direction: column;
        }
        .role-btn-text strong {
          font-size: 0.88rem;
        }
        .role-btn-text span {
          font-size: 0.72rem;
          color: var(--secondary-muted);
        }
        .otp-email-row {
          display: flex;
          gap: 0.5rem;
        }
        .flex-1 {
          flex: 1;
        }
        .send-otp-btn {
          white-space: nowrap;
          height: 44px;
        }
        .strength-meter-wrapper {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.4rem;
        }
        .strength-bars {
          display: flex;
          gap: 4px;
          flex: 1;
        }
        .strength-bar {
          height: 4px;
          flex: 1;
          background: #e2e8f0;
          border-radius: 2px;
          transition: background 0.2s;
        }
        .active-bar {
          background: var(--primary);
        }
        .strength-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--secondary-muted);
        }
      `}</style>
    </form>
  );
};
