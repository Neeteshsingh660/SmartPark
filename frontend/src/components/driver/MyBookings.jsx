import React, { useState, useEffect } from 'react';
import { QrCode, Star, Clock, Calendar, CheckCircle2, AlertCircle, Loader2, Navigation, Car, PlusCircle, XCircle, TimerReset, Wallet } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { reviewService } from '../../services/reviewService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { EmptyState } from '../common/EmptyState';
import { Modal } from '../common/Modal';
import { QrTicketModal } from './QrTicketModal';
import { useToast } from '../../context/ToastContext';

const STATUS_COLORS = {
  CONFIRMED: 'badge-emerald',
  ACTIVE: 'badge-teal',
  COMPLETED: 'badge-dark',
  CANCELLED: 'badge-rose',
  EXTENSION_REQUESTED: 'badge-amber',
  PAYMENT_PENDING: 'badge-amber',
  PENDING: 'badge-amber',
  EXPIRED: 'badge-rose',
};

export const MyBookings = () => {
  const { addToast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(null);
  const [selectedBookingForQr, setSelectedBookingForQr] = useState(null);

  // Review state
  const [reviewBookingId, setReviewBookingId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Extension state
  const [extendingBookingId, setExtendingBookingId] = useState(null);
  const [extensionHours, setExtensionHours] = useState(1);
  const [submittingExtension, setSubmittingExtension] = useState(false);

  // Cancel state
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingService.getMyBookings();
      if (res && res.success) {
        setBookings(res.data || []);
      }
    } catch (err) {
      console.warn('Failed to fetch bookings:', err.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const res = await bookingService.getWalletBalance();
      if (res && res.success && res.data) {
        setWalletBalance(res.data.walletBalance);
      }
    } catch (err) {
      // Wallet balance not critical — silently ignore
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchWalletBalance();

    const handleNotification = (e) => {
      if (e.detail?.type === 'EXTENSION_APPROVED' || e.detail?.type === 'EXTENSION_DECLINED' || e.detail?.type === 'BOOKING_SUCCESS') {
        fetchBookings();
        fetchWalletBalance();
      }
    };
    window.addEventListener('smartpark_notification', handleNotification);
    return () => window.removeEventListener('smartpark_notification', handleNotification);
  }, []);

  // Review submit
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewBookingId) return;
    setSubmittingReview(true);
    try {
      const res = await reviewService.addReview(reviewBookingId, { rating, comment });
      if (res.success) {
        addToast('Review submitted! Thank you.', 'success');
        setReviewBookingId(null);
        setComment('');
      }
    } catch (err) {
      addToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Extension request
  const handleRequestExtension = async () => {
    if (!extendingBookingId) return;
    setSubmittingExtension(true);
    try {
      const res = await bookingService.requestExtension(extendingBookingId, extensionHours);
      if (res && (res.success || res.data)) {
        addToast(`Extension request for +${extensionHours}h sent to space owner! Awaiting approval.`, 'success');
        setExtendingBookingId(null);
        fetchBookings();
      } else {
        addToast(res?.message || 'Failed to request extension', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Error requesting extension', 'error');
    } finally {
      setSubmittingExtension(false);
    }
  };

  // Helper to parse 'YYYY-MM-DDTHH:mm' into local Date cleanly
  const parseLocalDateTime = (dtStr) => {
    if (!dtStr) return null;
    const [datePart, timePart] = dtStr.split('T');
    if (!datePart || !timePart) return new Date(dtStr);
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  };

  // Cancel booking with refund notice
  const handleCancel = async (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    const isConfirmed = booking?.status === 'CONFIRMED';
    const startTime = parseLocalDateTime(booking?.startTime);
    const now = new Date();
    let refundMsg = '';
    if (isConfirmed && startTime && booking?.amount) {
      const minutesLeft = startTime > now ? (startTime.getTime() - now.getTime()) / 60000 : -1;
      if (minutesLeft < 0) {
        refundMsg = ' No refund (start time already passed).';
      } else if (minutesLeft >= 120) {
        refundMsg = ` You will receive a 100% refund (₹${booking.amount}) to your SmartPark Wallet.`;
      } else {
        const half = (booking.amount * 0.5).toFixed(2);
        refundMsg = ` You will receive a 50% refund (₹${half}) to your SmartPark Wallet.`;
      }
    }
    if (!window.confirm(`Are you sure you want to cancel this booking?${refundMsg}`)) return;
    setCancellingId(bookingId);
    try {
      const res = await bookingService.cancelBooking(bookingId);
      if (res.success || res.data) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
        const toastMsg = refundMsg ? `Booking cancelled.${refundMsg}` : 'Booking cancelled successfully.';
        addToast(toastMsg, 'info');
        fetchWalletBalance(); // Refresh wallet after cancellation
      } else {
        addToast(res.message || 'Failed to cancel booking', 'error');
        fetchBookings();
      }
    } catch (err) {
      addToast(err.message || 'Error cancelling booking', 'error');
      fetchBookings();
    } finally {
      setCancellingId(null);
    }
  };

  const [filterTab, setFilterTab] = useState('upcoming');

  const now = new Date();
  const upcomingCount = bookings.filter(b => b.status !== 'CANCELLED' && b.status !== 'EXPIRED' && b.status !== 'COMPLETED' && (!b.endTime || parseLocalDateTime(b.endTime) >= now)).length;
  const pastCount = bookings.filter(b => b.status === 'COMPLETED' || (b.endTime && parseLocalDateTime(b.endTime) < now && b.status !== 'CANCELLED' && b.status !== 'EXPIRED')).length;
  const cancelledCount = bookings.filter(b => b.status === 'CANCELLED' || b.status === 'EXPIRED').length;

  const filteredBookings = bookings.filter(b => {
    const isCancelled = b.status === 'CANCELLED' || b.status === 'EXPIRED';
    const isCompleted = b.status === 'COMPLETED';
    const isPast = isCompleted || (b.endTime && parseLocalDateTime(b.endTime) < now);

    if (filterTab === 'upcoming') return !isCancelled && !isPast;
    if (filterTab === 'past') return isPast && !isCancelled;
    if (filterTab === 'cancelled') return isCancelled;
    return true; // 'all'
  });

  if (loading) return <LoadingSpinner label="Loading your bookings history..." />;

  const canExtend = (b) => ['CONFIRMED', 'ACTIVE'].includes(b.status);
  const canCancel = (b) => ['CONFIRMED', 'ACTIVE', 'PAYMENT_PENDING', 'PENDING', 'EXTENSION_REQUESTED'].includes(b.status) && b.status !== 'CANCELLED' && b.status !== 'COMPLETED';

  return (
    <div className="container my-bookings-container">
      <div className="bookings-header-row">
        <div>
          <h2 className="page-title">My Parking Bookings</h2>
          <p className="page-subtitle">Manage your reservations, request extensions, or cancel upcoming slots.</p>
        </div>
      </div>

      {/* SmartPark Wallet Balance Card */}
      {walletBalance !== null && (
        <div className="wallet-balance-card">
          <div className="wallet-icon-wrap"><Wallet size={22} /></div>
          <div className="wallet-info">
            <span className="wallet-label">SmartPark Wallet Balance</span>
            <span className="wallet-amount">₹{parseFloat(walletBalance).toFixed(2)}</span>
          </div>
          <div className="wallet-note">
            {parseFloat(walletBalance) > 0
              ? '✅ Refunds from cancelled bookings are credited here instantly.'
              : '💡 Cancellation refunds will appear here automatically.'}
          </div>
        </div>
      )}

      {/* Booking Filter Tabs */}
      <div className="booking-filter-tabs">
        <button
          className={`filter-tab-btn ${filterTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setFilterTab('upcoming')}
        >
          Upcoming ({upcomingCount})
        </button>
        <button
          className={`filter-tab-btn ${filterTab === 'past' ? 'active' : ''}`}
          onClick={() => setFilterTab('past')}
        >
          Past / Completed ({pastCount})
        </button>
        <button
          className={`filter-tab-btn ${filterTab === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilterTab('cancelled')}
        >
          Cancelled ({cancelledCount})
        </button>
        <button
          className={`filter-tab-btn ${filterTab === 'all' ? 'active' : ''}`}
          onClick={() => setFilterTab('all')}
        >
          All Bookings ({bookings.length})
        </button>
      </div>

      {filteredBookings.length === 0 ? (
        <EmptyState
          title={`No ${filterTab === 'upcoming' ? 'Upcoming' : filterTab === 'past' ? 'Past' : filterTab === 'cancelled' ? 'Cancelled' : ''} Bookings`}
          description={filterTab === 'upcoming' ? "You don't have any upcoming reservations. Search nearby spots to book!" : "No bookings found in this category."}
        />
      ) : (
        <div className="bookings-list-grid">
          {filteredBookings.map((b) => {
            const destinationQuery = (b.latitude && b.longitude)
              ? `${b.latitude},${b.longitude}`
              : encodeURIComponent(`${b.address || ''}`.trim() || 'India');
            const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${destinationQuery}`;

            return (
              <div key={b.id} className="booking-card card">
                {/* Header */}
                <div className="booking-top-row">
                  <div>
                    <span className="booking-ref-badge">{b.bookingReference || `#BK-${b.id}`}</span>
                    <h3 className="spot-title-text">{b.parkingSpotTitle || 'SmartPark Spot'}</h3>
                    {b.address && <p className="spot-address-sm">{b.address}</p>}
                  </div>
                  <span className={`badge ${STATUS_COLORS[b.status] || 'badge-amber'}`}>
                    {b.status?.replace('_', ' ')}
                  </span>
                </div>

                {/* Extension pending banner */}
                {b.status === 'EXTENSION_REQUESTED' && (
                  <div className="extension-pending-banner">
                    <TimerReset size={16} /> Extension request of +{b.extensionHours}h pending owner approval...
                  </div>
                )}

                {/* Time Details */}
                <div className="booking-details-grid">
                  <div className="detail-item">
                    <Calendar size={14} className="text-teal-600" />
                    <span>Start: {new Date(b.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                  <div className="detail-item">
                    <Clock size={14} className="text-teal-600" />
                    <span>End: {new Date(b.endTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                  {b.vehicleNumber && (
                    <div className="detail-item">
                      <Car size={14} className="text-teal-600" />
                      <span>{b.vehicleNumber} — {b.vehicleType}</span>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="booking-bottom-row">
                  <div className="total-price-text">₹{b.amount || b.totalPrice || '—'}</div>
                  <div className="booking-actions">
                    {/* Always visible Navigate button */}
                    <a
                      href={navUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm nav-link-btn"
                      title="Navigate with Google Maps"
                    >
                      <Navigation size={14} /> Navigate
                    </a>

                    {/* View QR Pass */}
                    {(b.status === 'CONFIRMED' || b.status === 'ACTIVE') && (
                      <button className="btn btn-primary btn-sm" onClick={() => setSelectedBookingForQr(b)}>
                        <QrCode size={14} /> Pass
                      </button>
                    )}

                    {/* Extend Booking */}
                    {canExtend(b) && b.status !== 'EXTENSION_REQUESTED' && (
                      <button
                        className="btn btn-secondary btn-sm extend-btn"
                        onClick={() => { setExtendingBookingId(b.id); setExtensionHours(1); }}
                      >
                        <PlusCircle size={14} /> Extend
                      </button>
                    )}

                    {/* Cancel Booking */}
                    {canCancel(b) && (
                      <button
                        className="btn btn-secondary btn-sm cancel-btn"
                        onClick={() => handleCancel(b.id)}
                        disabled={cancellingId === b.id}
                      >
                        {cancellingId === b.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                        Cancel
                      </button>
                    )}

                    {/* Rate & Review */}
                    {b.status === 'COMPLETED' && (
                      <button className="btn btn-secondary btn-sm" onClick={() => setReviewBookingId(b.id)}>
                        <Star size={14} fill="#f59e0b" color="#f59e0b" /> Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Pass Modal */}
      <QrTicketModal
        isOpen={!!selectedBookingForQr}
        onClose={() => setSelectedBookingForQr(null)}
        booking={selectedBookingForQr}
      />

      {/* Extension Request Modal */}
      <Modal
        isOpen={!!extendingBookingId}
        onClose={() => setExtendingBookingId(null)}
        title="Request Booking Extension"
        maxWidth="400px"
      >
        <div className="extension-modal-body">
          <p className="extension-description">
            Choose how many extra hours you need. The space owner will be notified and must approve the request.
          </p>

          <div className="hours-picker">
            {[1, 2, 3].map((h) => (
              <button
                key={h}
                type="button"
                className={`hour-chip ${extensionHours === h ? 'selected' : ''}`}
                onClick={() => setExtensionHours(h)}
              >
                +{h}h
              </button>
            ))}
          </div>

          <div className="extension-warning">
            <AlertCircle size={14} /> Owner approval required. You'll be notified once they respond.
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary btn-lg" style={{ flex: 1 }} onClick={() => setExtendingBookingId(null)}>
              Cancel
            </button>
            <button
              className="btn btn-primary btn-lg"
              style={{ flex: 2 }}
              onClick={handleRequestExtension}
              disabled={submittingExtension}
            >
              {submittingExtension ? <Loader2 size={18} className="animate-spin" /> : `Request +${extensionHours}h Extension`}
            </button>
          </div>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={!!reviewBookingId}
        onClose={() => setReviewBookingId(null)}
        title="Rate Your Parking Experience"
        maxWidth="460px"
      >
        <form onSubmit={handleReviewSubmit} className="review-form">
          <div className="input-group">
            <label className="input-label">Star Rating</label>
            <div className="stars-picker">
              {[1, 2, 3, 4, 5].map((star) => (
                <button type="button" key={star} className="star-btn" onClick={() => setRating(star)}>
                  <Star size={28} fill={star <= rating ? '#f59e0b' : 'none'} color={star <= rating ? '#f59e0b' : '#cbd5e1'} />
                </button>
              ))}
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Your Feedback</label>
            <textarea rows={4} required
              placeholder="Tell us about the parking space condition, security, ease of access..."
              value={comment} onChange={(e) => setComment(e.target.value)} className="input-field"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={submittingReview}>
            {submittingReview ? <Loader2 className="animate-spin" size={20} /> : 'Submit Review'}
          </button>
        </form>
      </Modal>

      <style>{`
        .my-bookings-container { padding: 3rem 1.5rem 5rem; }
        .bookings-header-row { margin-bottom: 2rem; }
        .page-title { font-size: 2rem; font-weight: 800; }
        .page-subtitle { color: var(--secondary-muted); font-size: 1rem; margin-top: 0.25rem; }
        .bookings-list-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }
        .booking-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .booking-top-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .booking-ref-badge {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--primary);
          background: var(--primary-soft);
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
        }
        .spot-title-text { font-size: 1.05rem; font-weight: 700; margin-top: 0.25rem; }
        .spot-address-sm { font-size: 0.78rem; color: var(--secondary-muted); margin-top: 0.1rem; }
        .extension-pending-banner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #fef9c3;
          border: 1px solid #fde047;
          color: #854d0e;
          padding: 0.6rem 0.85rem;
          border-radius: var(--radius-md);
          font-size: 0.82rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }
        .booking-details-grid { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.25rem; }
        .detail-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.88rem; color: var(--secondary-muted); }
        .booking-bottom-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--border-light);
          padding-top: 1rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .total-price-text { font-size: 1.3rem; font-weight: 800; color: var(--primary); }
        .booking-actions { display: flex; gap: 0.4rem; flex-wrap: wrap; }
        .nav-link-btn { text-decoration: none; display: inline-flex; align-items: center; gap: 0.3rem; background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; font-weight: 700; }
        .nav-link-btn:hover { background: #2563eb; color: white; }
        .extend-btn { color: #0d9488; border-color: #0d9488; }
        .extend-btn:hover { background: #0d9488; color: white; }
        .cancel-btn { color: #be123c; }
        .cancel-btn:hover { background: #ffe4e6; }
        .stars-picker { display: flex; gap: 0.5rem; justify-content: center; margin: 0.5rem 0; }
        .star-btn { border: none; background: none; cursor: pointer; }
        .extension-modal-body { display: flex; flex-direction: column; gap: 1.25rem; }
        .extension-description { font-size: 0.9rem; color: var(--secondary-muted); line-height: 1.5; }
        .hours-picker { display: flex; gap: 0.75rem; justify-content: center; }
        .hour-chip {
          width: 72px;
          height: 72px;
          border-radius: var(--radius-lg);
          border: 2px solid var(--border-medium);
          background: #f8fafc;
          font-size: 1.2rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.15s;
          color: var(--secondary);
        }
        .hour-chip.selected {
          border-color: var(--primary);
          background: var(--primary);
          color: white;
        }
        .hour-chip:hover:not(.selected) { border-color: var(--primary); color: var(--primary); }
        .extension-warning {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--secondary-muted);
          background: #f8fafc;
          padding: 0.65rem 0.85rem;
          border-radius: var(--radius-md);
        }
        @media (max-width: 768px) {
          .bookings-list-grid { grid-template-columns: 1fr; }
        }
        .wallet-balance-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
          color: white;
          border-radius: var(--radius-lg);
          padding: 1.1rem 1.4rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 16px rgba(13,148,136,0.25);
          flex-wrap: wrap;
        }
        .wallet-icon-wrap {
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          width: 44px; height: 44px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .wallet-info { display: flex; flex-direction: column; flex: 1; }
        .wallet-label { font-size: 0.78rem; opacity: 0.85; font-weight: 500; }
        .wallet-amount { font-size: 1.6rem; font-weight: 800; letter-spacing: -0.5px; }
        .wallet-note { font-size: 0.78rem; opacity: 0.85; width: 100%; padding-top: 0.3rem; }
        .booking-filter-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 0.5rem;
          overflow-x: auto;
        }
        .filter-tab-btn {
          background: none;
          border: none;
          padding: 0.5rem 1rem;
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--secondary-muted);
          cursor: pointer;
          border-radius: var(--radius-md);
          transition: all 0.15s;
          white-space: nowrap;
        }
        .filter-tab-btn:hover {
          background: #f1f5f9;
          color: var(--secondary);
        }
        .filter-tab-btn.active {
          background: var(--primary);
          color: white;
        }
      `}</style>
    </div>
  );
};
