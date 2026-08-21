import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Clock, Calendar, Lock, Loader2, Car, Hash } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const VEHICLE_TYPES = ['Sedan', 'SUV', 'Hatchback', 'EV', 'Bike', 'Other'];

// LocalStorage helpers for saved vehicles
const VEHICLES_KEY = 'smartpark_saved_vehicles';
const getSavedVehicles = () => { try { return JSON.parse(localStorage.getItem(VEHICLES_KEY)) || []; } catch { return []; } };
const saveVehicle = (v) => {
  const list = getSavedVehicles();
  if (!list.find(x => x.vehicleNumber === v.vehicleNumber)) {
    localStorage.setItem(VEHICLES_KEY, JSON.stringify([v, ...list].slice(0, 5)));
  }
};

export const BookingModal = ({ isOpen, onClose, spot, onBookingCreated }) => {
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Sedan');
  const [savedVehicles, setSavedVehicles] = useState([]);
  const [reservedSlots, setReservedSlots] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && spot?.id) {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 15);
      const startIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      const end = new Date(now);
      end.setHours(end.getHours() + 2);
      const endIso = new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setStartTime(startIso);
      setEndTime(endIso);
      setSavedVehicles(getSavedVehicles());

      // Fetch availability
      setLoadingAvailability(true);
      bookingService.getSpotAvailability(spot.id)
        .then(res => {
          if (res.success && res.data) {
            setReservedSlots(res.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingAvailability(false));
    }
  }, [isOpen, spot?.id]);

  if (!spot) return null;

  const calculateHours = () => {
    if (!startTime || !endTime) return 0;
    const diffMs = new Date(endTime) - new Date(startTime);
    const hours = diffMs / (1000 * 60 * 60);
    return hours > 0 ? Math.max(1, Math.round(hours * 10) / 10) : 0;
  };

  const hours = calculateHours();

  // Peak price logic
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  const isWeekday = day >= 1 && day <= 5;
  const isPeakHour = isWeekday && ((hour >= 8 && hour < 10) || (hour >= 17 && hour < 20));
  const ratePerHour = isPeakHour && spot.peakPricePerHour ? spot.peakPricePerHour : spot.pricePerHour;
  const totalPrice = hours * ratePerHour;

  const handleSelectSaved = (v) => {
    setVehicleNumber(v.vehicleNumber);
    setVehicleType(v.vehicleType);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      addToast('Please log in or register as a Driver to complete your booking', 'error');
      return;
    }
    if (hours <= 0) {
      addToast('End time must be after start time', 'error');
      return;
    }

    setLoading(true);
    try {
      // Send as local datetime string (no UTC conversion) to match what user selected
      const res = await bookingService.createBooking({
        parkingSpotId: spot.id,
        startTime: startTime,
        endTime: endTime,
        vehicleNumber: vehicleNumber.trim() || null,
        vehicleType: vehicleType || null,
      });

      if (res.success && res.data) {
        if (vehicleNumber.trim()) saveVehicle({ vehicleNumber: vehicleNumber.trim(), vehicleType });
        addToast('Spot held for 5 minutes! Complete payment to confirm.', 'success');
        onBookingCreated(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to create booking slot', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Book ${spot.title}`} maxWidth="500px">
      <div className="booking-modal-body">
        {/* Spot Summary */}
        <div className="spot-summary-banner">
          <div>
            <h4 className="spot-summary-title">{spot.title}</h4>
            <p className="spot-summary-address">{spot.address}</p>
          </div>
          <div>
            <div className="spot-price-badge">₹{ratePerHour}/hr</div>
            {isPeakHour && spot.peakPricePerHour && (
              <div style={{ fontSize: '0.7rem', color: '#be123c', textAlign: 'center', marginTop: '0.2rem' }}>
                🔥 Peak rate
              </div>
            )}
          </div>
        </div>

        {/* Spot Availability Calendar / Reserved Slots Banner */}
        <div className="availability-card">
          <div className="availability-header">
            <span className="availability-title">📅 Upcoming Reserved Time Slots</span>
            {loadingAvailability && <span className="loading-tag">Loading...</span>}
          </div>
          {reservedSlots.length === 0 ? (
            <div className="slot-empty-notice">✨ All time slots currently available for booking!</div>
          ) : (
            <div className="reserved-slots-list">
              {reservedSlots.map((slot, idx) => {
                const sTime = new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const eTime = new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const sDate = new Date(slot.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' });
                return (
                  <div key={idx} className="reserved-slot-chip">
                    🔒 {sDate}: {sTime} – {eTime}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Time Fields */}
          <div className="input-group">
            <label className="input-label">Start Time</label>
            <div className="input-icon-wrapper">
              <Calendar className="field-icon" size={18} />
              <input type="datetime-local" required value={startTime}
                onChange={(e) => setStartTime(e.target.value)} className="input-field-with-icon" />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">End Time</label>
            <div className="input-icon-wrapper">
              <Clock className="field-icon" size={18} />
              <input type="datetime-local" required value={endTime}
                onChange={(e) => setEndTime(e.target.value)} className="input-field-with-icon" />
            </div>
          </div>

          {/* Vehicle Profile Section */}
          <div className="vehicle-section">
            <label className="input-label">Vehicle Details <span className="optional-tag">(optional, helps owner identify your car)</span></label>

            {/* Saved Vehicles Quick-Select */}
            {savedVehicles.length > 0 && (
              <div className="saved-vehicles-row">
                {savedVehicles.map((v, i) => (
                  <button key={i} type="button" className="saved-vehicle-chip" onClick={() => handleSelectSaved(v)}>
                    🚗 {v.vehicleNumber} ({v.vehicleType})
                  </button>
                ))}
              </div>
            )}

            <div className="vehicle-inputs-row">
              <div className="input-icon-wrapper" style={{ flex: 2 }}>
                <Hash className="field-icon" size={16} />
                <input
                  type="text"
                  placeholder="MH 01 AB 1234"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  className="input-field-with-icon"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
              <div className="input-icon-wrapper" style={{ flex: 1 }}>
                <Car className="field-icon" size={16} />
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="input-field-with-icon"
                >
                  {VEHICLE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="price-breakdown-card">
            <div className="breakdown-row">
              <span>Duration</span>
              <strong>{hours} hours</strong>
            </div>
            <div className="breakdown-row">
              <span>Rate per hour</span>
              <span>₹{ratePerHour}{isPeakHour && spot.peakPricePerHour ? ' (peak)' : ''}</span>
            </div>
            <div className="breakdown-divider"></div>
            <div className="breakdown-row total-row">
              <span>Total Estimated Amount</span>
              <strong className="total-amount">₹{totalPrice.toFixed(2)}</strong>
            </div>
          </div>

          <div className="redis-hold-notice">
            <Lock size={16} className="text-teal-600" />
            <span>Upon clicking, Redis will hold this spot exclusively for 5 minutes.</span>
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Hold Spot & Proceed to Payment'}
          </button>
        </form>
      </div>

      <style>{`
        .booking-modal-body { display: flex; flex-direction: column; gap: 1.25rem; }
        .availability-card {
          background: #f8fafc; border: 1px dashed var(--primary-border);
          border-radius: var(--radius-md); padding: 0.8rem 1rem;
        }
        .availability-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem; }
        .availability-title { font-size: 0.85rem; font-weight: 700; color: var(--secondary); }
        .loading-tag { font-size: 0.75rem; color: var(--secondary-muted); }
        .slot-empty-notice { font-size: 0.8rem; color: var(--primary); font-weight: 600; }
        .reserved-slots-list { display: flex; gap: 0.4rem; flex-wrap: wrap; }
        .reserved-slot-chip {
          background: #fff1f2; border: 1px solid #fecdd3; color: #be123c;
          border-radius: var(--radius-md); padding: 0.2rem 0.5rem; font-size: 0.75rem; font-weight: 600;
        }
        .spot-summary-banner {
          display: flex; align-items: center; justify-content: space-between;
          background: #f8fafc; border: 1px solid var(--border-light);
          padding: 1rem; border-radius: var(--radius-md);
        }
        .spot-summary-title { font-size: 1rem; font-weight: 700; }
        .spot-summary-address { font-size: 0.8rem; color: var(--secondary-muted); }
        .spot-price-badge {
          background: var(--primary); color: white; padding: 0.35rem 0.75rem;
          border-radius: var(--radius-full); font-weight: 800; font-size: 0.9rem; text-align: center;
        }
        .vehicle-section { display: flex; flex-direction: column; gap: 0.6rem; }
        .optional-tag { font-size: 0.75rem; color: var(--secondary-muted); font-weight: 400; }
        .saved-vehicles-row { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .saved-vehicle-chip {
          background: #f0fdfa; border: 1px solid var(--primary-border); border-radius: var(--radius-full);
          padding: 0.25rem 0.7rem; font-size: 0.75rem; font-weight: 600; color: var(--primary);
          cursor: pointer; transition: all 0.15s;
        }
        .saved-vehicle-chip:hover { background: var(--primary); color: white; }
        .vehicle-inputs-row { display: flex; gap: 0.75rem; }
        .price-breakdown-card {
          background: #f0fdfa; border: 1px solid var(--primary-border);
          border-radius: var(--radius-md); padding: 1rem 1.25rem; margin: 0.5rem 0;
        }
        .breakdown-row {
          display: flex; justify-content: space-between;
          font-size: 0.9rem; color: var(--secondary-light); margin-bottom: 0.4rem;
        }
        .breakdown-divider { height: 1px; background: var(--primary-border); margin: 0.6rem 0; }
        .total-row { font-size: 1.05rem; color: var(--secondary); }
        .total-amount { color: var(--primary); font-size: 1.2rem; }
        .redis-hold-notice {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.8rem; color: var(--secondary-muted); margin-bottom: 0.5rem;
        }
      `}</style>
    </Modal>
  );
};
