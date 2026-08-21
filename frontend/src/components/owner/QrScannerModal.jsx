import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { QrCode, LogIn, LogOut, CheckCircle2, Loader2, Camera } from 'lucide-react';
import { checkInService } from '../../services/checkInService';
import { useToast } from '../../context/ToastContext';

export const QrScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const { addToast } = useToast();

  const [qrToken, setQrToken] = useState('');
  const [actionType, setActionType] = useState('checkin'); // 'checkin' or 'checkout'
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!qrToken) {
      addToast('Please enter or scan a valid QR token', 'error');
      return;
    }

    setLoading(true);
    try {
      let res;
      if (actionType === 'checkin') {
        res = await checkInService.checkIn(qrToken);
        addToast('Driver checked in successfully! Booking marked ACTIVE.', 'success');
      } else {
        res = await checkInService.checkOut(qrToken);
        addToast('Driver checked out successfully! Booking marked COMPLETED.', 'success');
      }

      if (onScanSuccess) onScanSuccess(res.data);
      setQrToken('');
      onClose();
    } catch (err) {
      addToast(err.message || 'Check-in/out failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Driver QR Check-In / Check-Out" maxWidth="480px">
      <div className="qr-scanner-body">
        {/* Action Toggle */}
        <div className="action-toggle-row">
          <button
            type="button"
            className={`action-btn ${actionType === 'checkin' ? 'active-checkin' : ''}`}
            onClick={() => setActionType('checkin')}
          >
            <LogIn size={18} /> Driver Check-In
          </button>

          <button
            type="button"
            className={`action-btn ${actionType === 'checkout' ? 'active-checkout' : ''}`}
            onClick={() => setActionType('checkout')}
          >
            <LogOut size={18} /> Driver Check-Out
          </button>
        </div>

        {/* Camera Visual Simulator */}
        <div className="scanner-camera-box">
          <div className="camera-viewfinder">
            <Camera size={36} className="text-teal-400 animate-pulse" />
            <span>Scanning for Driver QR Code...</span>
          </div>
        </div>

        {/* Token Input Form */}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Enter or Paste QR Code Token</label>
            <div className="input-icon-wrapper">
              <QrCode className="field-icon" size={18} />
              <input
                type="text"
                required
                placeholder="e.g. QR-TOKEN-8921"
                value={qrToken}
                onChange={(e) => setQrToken(e.target.value)}
                className="input-field-with-icon"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : actionType === 'checkin' ? (
              'Confirm Driver Entry'
            ) : (
              'Confirm Driver Exit'
            )}
          </button>
        </form>
      </div>

      <style>{`
        .qr-scanner-body {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .action-toggle-row {
          display: flex;
          background: #f1f5f9;
          padding: 4px;
          border-radius: var(--radius-md);
        }
        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          border: none;
          background: none;
          padding: 0.6rem;
          font-weight: 700;
          font-size: 0.88rem;
          color: var(--secondary-muted);
          cursor: pointer;
          border-radius: var(--radius-sm);
        }
        .active-checkin {
          background: #ffffff;
          color: var(--primary);
          box-shadow: 0 2px 4px rgba(0,0,0,0.06);
        }
        .active-checkout {
          background: #ffffff;
          color: var(--accent-rose);
          box-shadow: 0 2px 4px rgba(0,0,0,0.06);
        }
        .scanner-camera-box {
          background: #0f172a;
          border-radius: var(--radius-lg);
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
        }
        .camera-viewfinder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: #94a3b8;
        }
      `}</style>
    </Modal>
  );
};
