import React from 'react';
import { Modal } from '../common/Modal';
import { QrCode, CheckCircle2, Copy, Download, Share2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const QrTicketModal = ({ isOpen, onClose, booking }) => {
  const { addToast } = useToast();

  if (!booking) return null;

  const qrToken = booking.qrCodeToken || booking.bookingReference || `QR-SP-${booking.id}`;

  const copyQrToken = () => {
    navigator.clipboard.writeText(qrToken);
    addToast('QR Token copied to clipboard', 'info');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Digital Parking Pass" maxWidth="420px">
      <div className="qr-ticket-body">
        {/* Confirmed Banner */}
        <div className="ticket-confirmed-header">
          <CheckCircle2 size={24} className="text-emerald-500" />
          <div>
            <h4 className="ticket-status">Booking Confirmed</h4>
            <p className="ticket-ref">Ref: {booking.bookingReference || `#BK-${booking.id}`}</p>
          </div>
        </div>

        {/* Generated Visual QR Code Card */}
        <div className="qr-card">
          <div className="qr-image-wrapper">
            {/* SVG generated QR pattern simulation */}
            <svg className="qr-svg" viewBox="0 0 200 200">
              <rect width="200" height="200" fill="#ffffff" />
              {/* Target Corners */}
              <rect x="10" y="10" width="50" height="50" fill="#0f172a" />
              <rect x="18" y="18" width="34" height="34" fill="#ffffff" />
              <rect x="26" y="26" width="18" height="18" fill="#0d9488" />

              <rect x="140" y="10" width="50" height="50" fill="#0f172a" />
              <rect x="148" y="18" width="34" height="34" fill="#ffffff" />
              <rect x="156" y="26" width="18" height="18" fill="#0d9488" />

              <rect x="10" y="140" width="50" height="50" fill="#0f172a" />
              <rect x="18" y="148" width="34" height="34" fill="#ffffff" />
              <rect x="26" y="156" width="18" height="18" fill="#0d9488" />

              {/* Data matrix dots */}
              <rect x="70" y="20" width="15" height="15" fill="#0f172a" />
              <rect x="90" y="35" width="15" height="15" fill="#0d9488" />
              <rect x="110" y="20" width="15" height="15" fill="#0f172a" />
              <rect x="70" y="70" width="20" height="20" fill="#0d9488" />
              <rect x="100" y="70" width="30" height="20" fill="#0f172a" />
              <rect x="140" y="80" width="20" height="20" fill="#0d9488" />
              <rect x="20" y="70" width="30" height="20" fill="#0f172a" />
              <rect x="70" y="110" width="25" height="25" fill="#0f172a" />
              <rect x="110" y="120" width="25" height="25" fill="#0d9488" />
              <rect x="150" y="140" width="35" height="35" fill="#0f172a" />
              <rect x="80" y="150" width="30" height="30" fill="#0d9488" />
            </svg>
          </div>
          <div className="token-text-row">
            <span className="token-code">{qrToken}</span>
            <button className="copy-btn" onClick={copyQrToken} title="Copy Token">
              <Copy size={16} />
            </button>
          </div>
        </div>

        {/* Instructions */}
        <p className="scan-instruction">
          Show this QR code to the parking space owner or scan at entry to check in.
        </p>

        {/* Navigate to parking spot */}
        {(() => {
          const dest = (booking.latitude && booking.longitude)
            ? `${booking.latitude},${booking.longitude}`
            : encodeURIComponent(`${booking.address || ''}`.trim() || 'India');
          return (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${dest}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm w-full"
              style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem' }}
            >
              🧭 Navigate to Parking Spot
            </a>
          );
        })()}

        <button className="btn btn-secondary btn-sm w-full" onClick={onClose}>
          Close Ticket
        </button>
      </div>

      <style>{`
        .qr-ticket-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          text-align: center;
        }
        .ticket-confirmed-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #d1fae5;
          padding: 0.75rem 1.25rem;
          border-radius: var(--radius-md);
          width: 100%;
          text-align: left;
        }
        .ticket-status {
          font-size: 0.95rem;
          font-weight: 700;
          color: #047857;
        }
        .ticket-ref {
          font-size: 0.8rem;
          color: #065f46;
        }
        .qr-card {
          background: #ffffff;
          border: 2px solid var(--border-medium);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          box-shadow: var(--shadow-md);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .qr-image-wrapper {
          width: 180px;
          height: 180px;
          margin-bottom: 1rem;
        }
        .qr-svg {
          width: 100%;
          height: 100%;
        }
        .token-text-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #f1f5f9;
          padding: 0.4rem 0.8rem;
          border-radius: var(--radius-sm);
        }
        .token-code {
          font-family: monospace;
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--secondary);
        }
        .copy-btn {
          border: none;
          background: none;
          cursor: pointer;
          color: var(--primary);
        }
        .scan-instruction {
          font-size: 0.85rem;
          color: var(--secondary-muted);
          line-height: 1.5;
        }
      `}</style>
    </Modal>
  );
};
