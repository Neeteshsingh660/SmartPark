import React, { useState, useEffect } from 'react';
import { Plus, QrCode, Building2, TrendingUp, Users, Edit3, Trash2, Zap, Shield, Warehouse, Calendar, User, Phone, Mail, Clock, TimerReset, CheckCircle2, XCircle, Banknote, Loader2, Image } from 'lucide-react';
import { parkingService } from '../../services/parkingService';
import { bookingService } from '../../services/bookingService';
import { SpotFormModal } from './SpotFormModal';
import { QrScannerModal } from './QrScannerModal';
import { Modal } from '../common/Modal';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { EmptyState } from '../common/EmptyState';
import { useToast } from '../../context/ToastContext';

export const OwnerDashboard = () => {
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('spots');
  const [spots, setSpots] = useState([]);
  const [ownerBookings, setOwnerBookings] = useState([]);
  const [bookingFilterTab, setBookingFilterTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);

  const parseLocalDateTime = (dtStr) => {
    if (!dtStr) return null;
    const [datePart, timePart] = dtStr.split('T');
    if (!datePart || !timePart) return new Date(dtStr);
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  };

  const now = new Date();
  const ownerUpcomingCount = ownerBookings.filter(b => b.status !== 'CANCELLED' && b.status !== 'EXPIRED' && b.status !== 'COMPLETED' && (!b.endTime || parseLocalDateTime(b.endTime) >= now)).length;
  const ownerPastCount = ownerBookings.filter(b => b.status === 'COMPLETED' || (b.endTime && parseLocalDateTime(b.endTime) < now && b.status !== 'CANCELLED' && b.status !== 'EXPIRED')).length;
  const ownerCancelledCount = ownerBookings.filter(b => b.status === 'CANCELLED' || b.status === 'EXPIRED').length;

  const filteredOwnerBookings = ownerBookings.filter(b => {
    const isCancelled = b.status === 'CANCELLED' || b.status === 'EXPIRED';
    const isCompleted = b.status === 'COMPLETED';
    const isPast = isCompleted || (b.endTime && parseLocalDateTime(b.endTime) < now);

    if (bookingFilterTab === 'upcoming') return !isCancelled && !isPast;
    if (bookingFilterTab === 'past') return isPast && !isCancelled;
    if (bookingFilterTab === 'cancelled') return isCancelled;
    return true; // 'all'
  });

  const [isSpotFormOpen, setIsSpotFormOpen] = useState(false);
  const [editingSpot, setEditingSpot] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Payout modal state
  const [isPayoutOpen, setIsPayoutOpen] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState('UPI');
  const [payoutAccount, setPayoutAccount] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [submittingPayout, setSubmittingPayout] = useState(false);

  // Extension response loading
  const [respondingTo, setRespondingTo] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [spotsRes, bookingsRes] = await Promise.all([
        parkingService.getMySpots().catch(() => ({ success: true, data: [] })),
        parkingService.getOwnerBookings().catch(() => ({ success: true, data: [] })),
      ]);

      if (spotsRes && spotsRes.success) {
        setSpots(spotsRes.data || []);
      }
      if (bookingsRes && bookingsRes.success) {
        setOwnerBookings(bookingsRes.data || []);
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleNotification = (e) => {
      if (e.detail?.type === 'EXTENSION_REQUESTED' || e.detail?.type === 'NEW_BOOKING') {
        fetchData();
      }
    };
    window.addEventListener('smartpark_notification', handleNotification);
    return () => window.removeEventListener('smartpark_notification', handleNotification);
  }, []);

  const handleDeleteSpot = async (id) => {
    if (!window.confirm('Are you sure you want to unlist/delete this parking spot listing? If it has booking history, it will be unlisted cleanly.')) return;
    try {
      await parkingService.deleteSpot(id);
      addToast('Parking spot unlisted/deleted successfully', 'info');
      fetchData();
    } catch (err) {
      addToast(err.message || 'Failed to unlist spot', 'error');
    }
  };

  const handleToggleSpotStatus = async (id) => {
    try {
      const res = await parkingService.toggleSpotStatus(id);
      if (res && res.success) {
        addToast(`Spot is now ${res.data?.status === 'AVAILABLE' ? 'Active & Published' : 'Unlisted/Inactive'}`, 'success');
        fetchData();
      }
    } catch (err) {
      addToast(err.message || 'Failed to update spot status', 'error');
    }
  };

  const handleExtensionResponse = async (bookingId, approve) => {
    setRespondingTo(bookingId);
    try {
      const res = await bookingService.respondToExtension(bookingId, approve);
      if (res && (res.success || res.data)) {
        addToast(approve ? '✅ Extension approved! Driver notified.' : '❌ Extension declined. Driver notified.', approve ? 'success' : 'info');
        fetchData();
      } else {
        addToast(res?.message || 'Failed to process extension response', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Error processing extension response', 'error');
    } finally {
      setRespondingTo(null);
    }
  };

  const handlePayoutSubmit = async (e) => {
    e.preventDefault();
    if (!payoutAccount || !payoutAmount) {
      addToast('Please fill all payout details', 'error');
      return;
    }
    setSubmittingPayout(true);
    // Simulate payout request (real integration would call a bank API)
    await new Promise(r => setTimeout(r, 1500));
    addToast(`Payout of ₹${payoutAmount} via ${payoutMethod} to "${payoutAccount}" has been requested! Processing in 2-3 business days.`, 'success');
    setIsPayoutOpen(false);
    setPayoutAmount('');
    setPayoutAccount('');
    setSubmittingPayout(false);
  };

  if (loading) return <LoadingSpinner label="Loading your dashboard..." />;

  const totalCapacity = spots.reduce((acc, s) => acc + (s.capacity || 1), 0);
  const totalRevenue = ownerBookings.reduce((acc, b) => {
    if (['CONFIRMED', 'ACTIVE', 'COMPLETED'].includes(b.status)) {
      return acc + (b.amount || 0);
    }
    if (b.status === 'CANCELLED' && b.cancellationFee) {
      return acc + b.cancellationFee;
    }
    return acc;
  }, 0);
  const pendingExtensions = ownerBookings.filter(b => b.status === 'EXTENSION_REQUESTED');

  return (
    <div className="container owner-dashboard-container">
      {/* Header */}
      <div className="dashboard-header-row">
        <div>
          <h2 className="dashboard-title">Space Owner Dashboard</h2>
          <p className="dashboard-subtitle">Manage listings, approve driver extensions & request payouts.</p>
        </div>
        <div className="dashboard-actions">
          <button className="btn btn-secondary" onClick={() => setIsScannerOpen(true)}>
            <QrCode size={18} /> Scan QR
          </button>
          <button className="btn btn-secondary" onClick={() => setIsPayoutOpen(true)}>
            <Banknote size={18} /> Request Payout
          </button>
          <button className="btn btn-primary" onClick={() => { setEditingSpot(null); setIsSpotFormOpen(true); }}>
            <Plus size={18} /> List New Space
          </button>
        </div>
      </div>

      {/* Extension Approval Alert Banner */}
      {pendingExtensions.length > 0 && (
        <div className="extension-alert-banner">
          <TimerReset size={20} />
          <div className="extension-alert-content">
            <strong>{pendingExtensions.length} Driver Extension Request{pendingExtensions.length > 1 ? 's' : ''} Pending Approval</strong>
            <p>Review and approve or decline below in the Bookings tab.</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('bookings')}>
            Review Now →
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="stats-cards-grid">
        <div className="stat-card card">
          <div className="stat-card-icon bg-teal-50 text-teal-600"><Building2 size={24} /></div>
          <div>
            <div className="stat-card-val">{spots.length}</div>
            <div className="stat-card-lbl">Listed Locations</div>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-card-icon bg-emerald-50 text-emerald-600"><Users size={24} /></div>
          <div>
            <div className="stat-card-val">{totalCapacity} Spots</div>
            <div className="stat-card-lbl">Total Capacity</div>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-card-icon bg-amber-50 text-amber-600"><TrendingUp size={24} /></div>
          <div>
            <div className="stat-card-val">₹{totalRevenue.toLocaleString()}</div>
            <div className="stat-card-lbl">Total Revenue</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tab-bar">
        <button className={`dash-tab-btn ${activeTab === 'spots' ? 'active' : ''}`} onClick={() => setActiveTab('spots')}>
          <Building2 size={16} /> My Spots ({spots.length})
        </button>
        <button className={`dash-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
          <Users size={16} /> Booker Details ({ownerBookings.length})
          {pendingExtensions.length > 0 && <span className="tab-alert-dot">{pendingExtensions.length}</span>}
        </button>
      </div>

      {/* TAB: SPOTS */}
      {activeTab === 'spots' && (
        spots.length === 0 ? (
          <EmptyState icon={Building2} title="No Parking Spaces Listed Yet"
            description="Monetize your empty garage or driveway."
            actionLabel="List Your Space Now"
            onAction={() => { setEditingSpot(null); setIsSpotFormOpen(true); }}
          />
        ) : (
          <div className="owner-spots-grid">
            {spots.map(spot => (
              <div key={spot.id} className="owner-spot-card card">
                {spot.imageUrl && (
                  <div className="spot-card-image">
                    <img src={spot.imageUrl} alt={spot.title} onError={e => e.target.style.display = 'none'} />
                  </div>
                )}
                <div className="spot-card-top">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h4 className="spot-title-text" style={{ margin: 0 }}>{spot.title}</h4>
                      <span className={`badge ${spot.status === 'INACTIVE' ? 'badge-rose' : 'badge-emerald'}`}>
                        {spot.status === 'INACTIVE' ? 'Unlisted / Inactive' : 'Active'}
                      </span>
                    </div>
                    <p className="spot-address-text">{spot.address}{spot.city ? `, ${spot.city}` : ''}</p>
                    {spot.operatingHours && <p className="spot-hours-text">🕐 {spot.operatingHours}</p>}
                  </div>
                  <div className="price-col">
                    <span className="badge badge-teal">₹{spot.pricePerHour}/hr</span>
                    {spot.peakPricePerHour && <span className="peak-rate-tag">🔥 Peak ₹{spot.peakPricePerHour}/hr</span>}
                  </div>
                </div>

                <div className="amenity-badges-row">
                  {(spot.covered || spot.isCovered) && <span className="badge badge-amber"><Warehouse size={12} /> Covered</span>}
                  {(spot.securityAvailable || spot.hasSecurity) && <span className="badge badge-emerald"><Shield size={12} /> Security</span>}
                  {(spot.evChargingAvailable || spot.hasEvCharging) && <span className="badge badge-teal"><Zap size={12} /> EV</span>}
                </div>

                <div className="spot-card-bottom">
                  <div className="capacity-text">Capacity: <strong>{spot.capacity || 1} spots</strong></div>
                  <div className="spot-actions-btns">
                    <button
                      className={`btn btn-sm ${spot.status === 'INACTIVE' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => handleToggleSpotStatus(spot.id)}
                    >
                      {spot.status === 'INACTIVE' ? '⚡ Activate & Publish' : 'Pause / Unlist'}
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setEditingSpot(spot); setIsSpotFormOpen(true); }}>
                      <Edit3 size={14} /> Edit
                    </button>
                    <button className="btn btn-secondary btn-sm delete-btn" onClick={() => handleDeleteSpot(spot.id)}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* TAB: BOOKINGS / BOOKER DETAILS */}
      {activeTab === 'bookings' && (
        <div className="owner-bookings-section">
          {/* Filter Tabs Bar */}
          <div className="booking-filter-tabs" style={{ marginBottom: '1.25rem' }}>
            <button
              className={`filter-tab-btn ${bookingFilterTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setBookingFilterTab('upcoming')}
            >
              Upcoming ({ownerUpcomingCount})
            </button>
            <button
              className={`filter-tab-btn ${bookingFilterTab === 'past' ? 'active' : ''}`}
              onClick={() => setBookingFilterTab('past')}
            >
              Past / Completed ({ownerPastCount})
            </button>
            <button
              className={`filter-tab-btn ${bookingFilterTab === 'cancelled' ? 'active' : ''}`}
              onClick={() => setBookingFilterTab('cancelled')}
            >
              Cancelled ({ownerCancelledCount})
            </button>
            <button
              className={`filter-tab-btn ${bookingFilterTab === 'all' ? 'active' : ''}`}
              onClick={() => setBookingFilterTab('all')}
            >
              All Bookings ({ownerBookings.length})
            </button>
          </div>

          {filteredOwnerBookings.length === 0 ? (
            <EmptyState icon={Users} title={`No ${bookingFilterTab === 'upcoming' ? 'Upcoming' : bookingFilterTab === 'past' ? 'Past' : bookingFilterTab === 'cancelled' ? 'Cancelled' : ''} Bookings`}
              description="No driver bookings found in this category."
            />
          ) : (
            <div className="bookers-list-grid">
              {filteredOwnerBookings.map(b => (
              <div key={b.id} className={`booker-card card ${b.status === 'EXTENSION_REQUESTED' ? 'extension-card' : ''}`}>
                {/* Extension request highlight */}
                {b.status === 'EXTENSION_REQUESTED' && (
                  <div className="extension-request-bar">
                    <TimerReset size={16} />
                    <span>Driver requests +{b.extensionHours}h extension</span>
                    <div className="extension-btns">
                      <button
                        className="btn btn-primary btn-xs"
                        disabled={respondingTo === b.id}
                        onClick={() => handleExtensionResponse(b.id, true)}
                      >
                        {respondingTo === b.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />} Approve
                      </button>
                      <button
                        className="btn btn-secondary btn-xs"
                        disabled={respondingTo === b.id}
                        onClick={() => handleExtensionResponse(b.id, false)}
                      >
                        <XCircle size={12} /> Decline
                      </button>
                    </div>
                  </div>
                )}

                <div className="booker-header-row">
                  <div>
                    <span className="booking-ref-tag">{b.bookingReference || `#BK-${b.id}`}</span>
                    <h4 className="spot-title-small">{b.parkingSpotTitle || 'Your Parking Spot'}</h4>
                  </div>
                  <span className={`badge ${
                    b.status === 'CONFIRMED' ? 'badge-emerald' :
                    b.status === 'ACTIVE' ? 'badge-teal' :
                    b.status === 'EXTENSION_REQUESTED' ? 'badge-amber' :
                    b.status === 'COMPLETED' ? 'badge-dark' : 'badge-rose'
                  }`}>{b.status?.replace('_', ' ')}</span>
                </div>

                {/* Driver Info */}
                <div className="booker-info-box">
                  <div className="info-row"><User size={14} className="text-teal-600" /><span>Driver: <strong>{b.driverName || b.driverEmail || 'Registered Driver'}</strong></span></div>
                  <div className="info-row"><Mail size={14} className="text-teal-600" /><span>{b.driverEmail || 'Contact via App'}</span></div>
                  {b.driverPhone && <div className="info-row"><Phone size={14} className="text-teal-600" /><span>{b.driverPhone}</span></div>}
                  {b.vehicleNumber && (
                    <div className="info-row">
                      <span style={{fontSize:'0.82rem'}}>🚗</span>
                      <span>{b.vehicleNumber} — {b.vehicleType}</span>
                    </div>
                  )}
                </div>

                <div className="booking-dates-box">
                  <div className="date-item"><Calendar size={14} /> {new Date(b.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
                  <div className="date-item"><Clock size={14} /> {new Date(b.endTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
                </div>

                <div className="booker-card-footer">
                  <div className="revenue-amount">
                    {b.status === 'CANCELLED' ? (
                      b.cancellationFee > 0 ? (
                        <span style={{ fontSize: '0.9rem', color: '#0d9488' }}>₹{b.cancellationFee} (Penalty Compensation)</span>
                      ) : (
                        <span style={{ fontSize: '0.9rem', color: 'var(--secondary-muted)' }}>₹0 (Full Refunded)</span>
                      )
                    ) : (
                      `₹${b.amount}`
                    )}
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => setIsScannerOpen(true)}>
                    <QrCode size={14} /> Scan Pass
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* MODALS */}
      <SpotFormModal isOpen={isSpotFormOpen} onClose={() => setIsSpotFormOpen(false)} initialData={editingSpot} onSaved={fetchData} />
      <QrScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScanSuccess={fetchData} />

      {/* PAYOUT MODAL */}
      <Modal isOpen={isPayoutOpen} onClose={() => setIsPayoutOpen(false)} title="Request Revenue Payout" maxWidth="460px">
        <form onSubmit={handlePayoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="payout-balance-card">
            <div className="payout-balance-label">Available Balance</div>
            <div className="payout-balance-val">₹{totalRevenue.toLocaleString()}</div>
            <div className="payout-balance-sub">From confirmed & completed bookings</div>
          </div>

          <div className="input-group">
            <label className="input-label">Payout Method</label>
            <div className="payout-method-row">
              {['UPI', 'Bank Transfer (NEFT)', 'Wallet Credit'].map(m => (
                <button key={m} type="button"
                  className={`payout-method-chip ${payoutMethod === m ? 'selected' : ''}`}
                  onClick={() => setPayoutMethod(m)}
                >{m}</button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">
              {payoutMethod === 'UPI' ? 'UPI ID' : payoutMethod === 'Bank Transfer (NEFT)' ? 'Bank Account Number / IFSC' : 'Wallet ID'}
            </label>
            <input
              type="text"
              required
              placeholder={payoutMethod === 'UPI' ? 'yourname@upi' : payoutMethod === 'Bank Transfer (NEFT)' ? 'ACCOUNT_NO / IFSC' : 'Wallet ID'}
              value={payoutAccount}
              onChange={e => setPayoutAccount(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Withdrawal Amount (₹)</label>
            <input type="number" required min="1" max={totalRevenue}
              placeholder={`Max ₹${totalRevenue}`}
              value={payoutAmount}
              onChange={e => setPayoutAmount(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="payout-info-note">
            ℹ️ Payouts are processed within 2–3 business days. Minimum withdrawal: ₹100.
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={submittingPayout}>
            {submittingPayout ? <Loader2 size={18} className="animate-spin" /> : `Request ₹${payoutAmount || '0'} Payout`}
          </button>
        </form>
      </Modal>

      <style>{`
        .owner-dashboard-container { padding: 3rem 1.5rem 5rem; }
        .dashboard-header-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:2rem; flex-wrap:wrap; gap:1rem; }
        .dashboard-title { font-size:2rem; font-weight:800; }
        .dashboard-subtitle { color:var(--secondary-muted); font-size:1rem; }
        .dashboard-actions { display:flex; gap:0.75rem; flex-wrap:wrap; }

        .extension-alert-banner {
          display:flex; align-items:center; gap:1rem;
          background: #fef9c3; border: 1.5px solid #fde047;
          border-radius: var(--radius-lg); padding: 1rem 1.25rem;
          margin-bottom: 1.5rem; flex-wrap:wrap;
        }
        .extension-alert-content { flex: 1; }
        .extension-alert-content strong { font-size:0.95rem; color:#854d0e; display:block; }
        .extension-alert-content p { font-size:0.82rem; color:#a16207; margin-top:0.15rem; }

        .stats-cards-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; margin-bottom:2.5rem; }
        .stat-card { display:flex; align-items:center; gap:1.25rem; }
        .stat-card-icon { width:52px; height:52px; border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; }
        .stat-card-val { font-size:1.6rem; font-weight:800; line-height:1.1; }
        .stat-card-lbl { font-size:0.85rem; color:var(--secondary-muted); margin-top:0.2rem; }

        .dashboard-tab-bar { display:flex; gap:0.75rem; border-bottom:2px solid var(--border-light); margin-bottom:1.5rem; }
        .dash-tab-btn { display:flex; align-items:center; gap:0.5rem; border:none; background:none; padding:0.75rem 1.25rem; font-size:0.95rem; font-weight:700; color:var(--secondary-muted); cursor:pointer; border-bottom:3px solid transparent; margin-bottom:-2px; position:relative; }
        .dash-tab-btn.active { color:var(--primary); border-bottom-color:var(--primary); }
        .tab-alert-dot { background:#ef4444; color:white; border-radius:50%; width:18px; height:18px; display:inline-flex; align-items:center; justify-content:center; font-size:0.7rem; font-weight:800; }

        .owner-spots-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:1.5rem; }
        .owner-spot-card { display:flex; flex-direction:column; justify-content:space-between; overflow:hidden; }
        .spot-card-image { margin:-1.5rem -1.5rem 1rem; height:140px; overflow:hidden; }
        .spot-card-image img { width:100%; height:100%; object-fit:cover; }
        .spot-card-top { display:flex; justify-content:space-between; align-items:flex-start; gap:0.75rem; }
        .spot-title-text { font-size:1.1rem; font-weight:700; }
        .spot-address-text { font-size:0.82rem; color:var(--secondary-muted); margin-top:0.15rem; }
        .spot-hours-text { font-size:0.78rem; color:var(--secondary-muted); margin-top:0.1rem; }
        .price-col { display:flex; flex-direction:column; align-items:flex-end; gap:0.3rem; flex-shrink:0; }
        .peak-rate-tag { font-size:0.72rem; color:#be123c; font-weight:700; }
        .amenity-badges-row { display:flex; gap:0.4rem; margin:0.85rem 0; flex-wrap:wrap; }
        .spot-card-bottom { display:flex; align-items:center; justify-content:space-between; border-top:1px solid var(--border-light); padding-top:1rem; }
        .capacity-text { font-size:0.88rem; color:var(--secondary-muted); }
        .spot-actions-btns { display:flex; gap:0.5rem; }
        .delete-btn { color:var(--accent-rose); }
        .delete-btn:hover { background:#ffe4e6; }

        .bookers-list-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:1.5rem; }
        .booker-card { display:flex; flex-direction:column; gap:0.85rem; }
        .extension-card { border:2px solid #fde047 !important; }
        .extension-request-bar {
          display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;
          background:#fef9c3; border-radius:var(--radius-md); padding:0.6rem 0.85rem;
          font-size:0.82rem; font-weight:700; color:#854d0e;
        }
        .extension-btns { display:flex; gap:0.5rem; margin-left:auto; }
        .btn-xs { padding: 0.2rem 0.65rem !important; font-size: 0.75rem !important; }
        .booker-header-row { display:flex; justify-content:space-between; align-items:flex-start; }
        .booking-ref-tag { font-size:0.75rem; font-weight:700; color:var(--primary); background:var(--primary-soft); padding:0.2rem 0.5rem; border-radius:var(--radius-sm); }
        .spot-title-small { font-size:1rem; font-weight:700; margin-top:0.2rem; }
        .booker-info-box { background:#f8fafc; border:1px solid var(--border-light); padding:0.85rem; border-radius:var(--radius-md); display:flex; flex-direction:column; gap:0.35rem; }
        .info-row { display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; color:var(--secondary); }
        .booking-dates-box { display:flex; flex-direction:column; gap:0.25rem; font-size:0.82rem; color:var(--secondary-muted); }
        .date-item { display:flex; align-items:center; gap:0.35rem; }
        .booker-card-footer { display:flex; align-items:center; justify-content:space-between; border-top:1px solid var(--border-light); padding-top:0.75rem; }
        .revenue-amount { font-size:1.1rem; font-weight:800; color:var(--primary); }

        .booking-filter-tabs { display:flex; gap:0.5rem; flex-wrap:wrap; }
        .filter-tab-btn {
          padding: 0.45rem 1.1rem;
          border-radius: var(--radius-full, 9999px);
          border: 1.5px solid var(--border-medium, #e2e8f0);
          background: transparent;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--secondary-muted, #64748b);
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .filter-tab-btn:hover {
          border-color: var(--primary, #0d9488);
          color: var(--primary, #0d9488);
          background: var(--primary-soft, #f0fdfa);
        }
        .filter-tab-btn.active {
          background: var(--primary, #0d9488);
          border-color: var(--primary, #0d9488);
          color: white;
        }

        .payout-balance-card { background: linear-gradient(135deg, #0d9488, #0f766e); color:white; border-radius:var(--radius-lg); padding:1.25rem 1.5rem; text-align:center; }
        .payout-balance-label { font-size:0.82rem; opacity:0.85; }
        .payout-balance-val { font-size:2rem; font-weight:900; margin:0.25rem 0; }
        .payout-balance-sub { font-size:0.75rem; opacity:0.75; }
        .payout-method-row { display:flex; gap:0.5rem; flex-wrap:wrap; margin-top:0.4rem; }
        .payout-method-chip { border:1.5px solid var(--border-medium); background:#f8fafc; border-radius:var(--radius-full); padding:0.3rem 0.85rem; font-size:0.8rem; font-weight:600; cursor:pointer; transition:all 0.15s; color:var(--secondary); }
        .payout-method-chip.selected { border-color:var(--primary); background:var(--primary); color:white; }
        .payout-info-note { font-size:0.78rem; color:var(--secondary-muted); background:#f8fafc; border-radius:var(--radius-md); padding:0.6rem 0.85rem; }

        @media (max-width:992px) {
          .stats-cards-grid { grid-template-columns:1fr; }
          .owner-spots-grid { grid-template-columns:1fr; }
          .bookers-list-grid { grid-template-columns:1fr; }
        }
      `}</style>
    </div>
  );
};
