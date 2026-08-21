import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { CreditCard, Smartphone, Wallet, ShieldCheck, Loader2, Timer } from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import { bookingService } from '../../services/bookingService';
import { useToast } from '../../context/ToastContext';

export const PaymentModal = ({ isOpen, onClose, booking, onPaymentCompleted }) => {
  const { addToast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [useWallet, setUseWallet] = useState(true);
  const [loading, setLoading] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(300);
  const [walletBalance, setWalletBalance] = useState(null);

  useEffect(() => {
    if (!isOpen || !booking) return;

    // Fetch wallet balance
    bookingService.getWalletBalance()
      .then(res => {
        if (res?.success && res?.data) {
          const bal = parseFloat(res.data.walletBalance || 0);
          setWalletBalance(bal);
          setUseWallet(bal > 0);
        }
      })
      .catch(() => {});

    let initialSeconds = 300;
    if (booking.lockExpiresAt) {
      const expires = new Date(booking.lockExpiresAt).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((expires - now) / 1000));
      initialSeconds = diff > 0 ? diff : 300;
    }
    setSecondsRemaining(initialSeconds);

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          addToast('Redis lock expired for this booking. Please try booking again.', 'error');
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, booking]);

  if (!booking) return null;

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const totalPrice = parseFloat(booking.totalPrice || booking.amount || 0);
  const availableWallet = parseFloat(walletBalance || 0);
  const walletDeduction = useWallet && availableWallet > 0 ? Math.min(availableWallet, totalPrice) : 0;
  const payableAmount = Math.max(0, totalPrice - walletDeduction);
  const isFullyPaidByWallet = walletDeduction > 0 && payableAmount === 0;

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create Razorpay order (or process 100% wallet payment)
      const res = await paymentService.createRazorpayOrder({
        bookingId: booking.id,
        useWallet: useWallet && walletDeduction > 0,
      });

      if (!res.success || !res.data) {
        throw new Error(res.message || 'Failed to initialize payment');
      }

      const orderData = res.data;

      // CASE A: 100% Paid via Wallet
      if (orderData.fullyPaidByWallet) {
        addToast(`₹${totalPrice.toFixed(2)} paid from SmartPark Wallet! Booking confirmed.`, 'success');
        onPaymentCompleted(orderData);
        return;
      }

      // CASE B: Payment via Razorpay
      const isRealRazorpayKey = orderData.keyId && !orderData.keyId.startsWith('rzp_test_sample');

      if (typeof window.Razorpay !== 'undefined' && isRealRazorpayKey) {
        const options = {
          key: orderData.keyId,
          amount: Math.round(orderData.payableAmount * 100),
          currency: orderData.currency || 'INR',
          name: 'SmartPark Marketplace',
          description: `Booking ${booking.bookingReference || `#BK-${booking.id}`}`,
          order_id: orderData.razorpayOrderId && !orderData.razorpayOrderId.startsWith('order_dev') && !orderData.razorpayOrderId.startsWith('order_mock')
            ? orderData.razorpayOrderId
            : undefined,
          handler: async function (response) {
            try {
              const verifyRes = await paymentService.verifyRazorpayPayment({
                bookingId: booking.id,
                razorpayPaymentId: response.razorpay_payment_id || `rzp_pay_${Date.now()}`,
                razorpayOrderId: response.razorpay_order_id || orderData.razorpayOrderId,
                razorpaySignature: response.razorpay_signature || 'mock_sig',
                walletDeducted: orderData.walletDeducted,
                payableAmount: orderData.payableAmount,
                paymentMethod,
              });

              if (verifyRes.success && verifyRes.data) {
                addToast('Razorpay payment verified & booking confirmed!', 'success');
                onPaymentCompleted(verifyRes.data);
              } else {
                addToast(verifyRes.message || 'Payment verification failed', 'error');
              }
            } catch (err) {
              addToast(err.message || 'Error processing payment verification', 'error');
            }
          },
          prefill: {
            name: booking.driverName || '',
            email: booking.driverEmail || '',
          },
          theme: { color: '#0d9488' },
          modal: {
            ondismiss: function () {
              addToast('Razorpay popup closed. Your wallet balance was NOT touched.', 'info');
              setLoading(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          addToast(resp.error.description || 'Razorpay payment failed', 'error');
          setLoading(false);
        });
        rzp.open();
      } else {
        // Test / Sandbox Mode: Process simulated Razorpay payment cleanly
        addToast(`Simulating ${paymentMethod} payment of ₹${orderData.payableAmount.toFixed(2)} via Razorpay Test Gateway...`, 'info');

        setTimeout(async () => {
          try {
            const verifyRes = await paymentService.verifyRazorpayPayment({
              bookingId: booking.id,
              razorpayPaymentId: `rzp_test_pay_${Date.now()}`,
              razorpayOrderId: orderData.razorpayOrderId || `order_test_${Date.now()}`,
              razorpaySignature: 'test_signature_valid',
              walletDeducted: orderData.walletDeducted,
              payableAmount: orderData.payableAmount,
              paymentMethod,
            });

            if (verifyRes.success && verifyRes.data) {
              addToast('Razorpay Test Payment successful! Booking confirmed.', 'success');
              onPaymentCompleted(verifyRes.data);
            } else {
              addToast(verifyRes.message || 'Payment verification failed', 'error');
            }
          } catch (err) {
            addToast(err.message || 'Error executing test payment', 'error');
          } finally {
            setLoading(false);
          }
        }, 1200);
      }
    } catch (err) {
      addToast(err.message || 'Payment initialization failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Secure Payment" maxWidth="500px">
      <div className="payment-modal-body">
        {/* 5-Minute Redis Lock Timer Header */}
        <div className="redis-timer-header">
          <div className="timer-title-row">
            <span className="flex items-center gap-1">
              <Timer size={16} className="text-amber-600 animate-spin" /> Spot Held on Redis Lock
            </span>
            <span className="timer-clock">{formatTimer(secondsRemaining)}</span>
          </div>
          <div className="timer-bar-bg">
            <div
              className="timer-bar-fill"
              style={{ width: `${(secondsRemaining / 300) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Wallet Balance Apply Option */}
        {availableWallet > 0 && (
          <div className="wallet-apply-box">
            <label className="wallet-apply-label">
              <input
                type="checkbox"
                checked={useWallet}
                onChange={(e) => setUseWallet(e.target.checked)}
                className="wallet-checkbox"
              />
              <div className="wallet-apply-text">
                <strong>Apply SmartPark Wallet Balance</strong>
                <span className="wallet-avail-sm">₹{availableWallet.toFixed(2)} available</span>
              </div>
            </label>
            {useWallet && (
              <div className="wallet-deduct-chip">
                -₹{walletDeduction.toFixed(2)}
              </div>
            )}
          </div>
        )}

        {/* Booking & Split Payment Summary */}
        <div className="booking-summary-box">
          <div className="summary-row">
            <span>Booking Ref:</span>
            <strong>{booking.bookingReference || `#BK-${booking.id}`}</strong>
          </div>
          <div className="summary-row">
            <span>Total Booking Amount:</span>
            <strong>₹{totalPrice.toFixed(2)}</strong>
          </div>
          {useWallet && walletDeduction > 0 && (
            <div className="summary-row text-teal-600">
              <span>SmartPark Wallet Applied:</span>
              <strong>- ₹{walletDeduction.toFixed(2)}</strong>
            </div>
          )}
          <div className="breakdown-divider"></div>
          <div className="summary-row total-payable-row">
            <span>Payable Amount:</span>
            <strong className="text-teal-600 text-lg">
              {isFullyPaidByWallet ? '₹0.00 (Fully Paid from Wallet)' : `₹${payableAmount.toFixed(2)}`}
            </strong>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handlePaySubmit}>
          {!isFullyPaidByWallet && (
            <>
              <label className="input-label">Select Razorpay Payment Method</label>
              <div className="payment-methods-grid">
                <button
                  type="button"
                  className={`method-card ${paymentMethod === 'UPI' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('UPI')}
                >
                  <Smartphone size={20} />
                  <span>UPI / GPay / PhonePe</span>
                </button>

                <button
                  type="button"
                  className={`method-card ${paymentMethod === 'CREDIT_CARD' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('CREDIT_CARD')}
                >
                  <CreditCard size={20} />
                  <span>Cards / NetBanking</span>
                </button>
              </div>
            </>
          )}

          <div className="security-trust-badge">
            <ShieldCheck size={16} className="text-emerald-500" /> 256-Bit SSL Encrypted & Instant Confirmation
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : isFullyPaidByWallet ? (
              'Pay ₹0.00 from Wallet & Confirm'
            ) : (
              `Proceed to Pay ₹${payableAmount.toFixed(2)} via Razorpay`
            )}
          </button>
        </form>
      </div>

      <style>{`
        .payment-modal-body {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .wallet-apply-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f0fdfa;
          border: 1px solid var(--primary-border);
          border-radius: var(--radius-md);
          padding: 0.85rem 1rem;
        }
        .wallet-apply-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }
        .wallet-checkbox {
          width: 18px;
          height: 18px;
          accent-color: var(--primary);
          cursor: pointer;
        }
        .wallet-apply-text {
          display: flex;
          flex-direction: column;
          font-size: 0.88rem;
          color: var(--secondary);
        }
        .wallet-avail-sm {
          font-size: 0.75rem;
          color: var(--primary);
          font-weight: 600;
        }
        .wallet-deduct-chip {
          background: var(--primary);
          color: white;
          font-size: 0.85rem;
          font-weight: 800;
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-full);
        }
        .breakdown-divider {
          height: 1px;
          background: var(--border-light);
          margin: 0.5rem 0;
        }
        .total-payable-row {
          font-size: 1.05rem;
          font-weight: 700;
        }
        .redis-timer-header {
          background: #fef3c7;
          border: 1px solid #fde68a;
          border-radius: var(--radius-md);
          padding: 0.85rem 1rem;
        }
        .timer-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
          font-weight: 700;
          color: #92400e;
          margin-bottom: 0.4rem;
        }
        .timer-clock {
          font-size: 1rem;
          font-weight: 800;
          color: #b45309;
        }
        .timer-bar-bg {
          height: 6px;
          background: #fef9c3;
          border-radius: 3px;
          overflow: hidden;
        }
        .timer-bar-fill {
          height: 100%;
          background: #f59e0b;
          transition: width 1s linear;
        }
        .booking-summary-box {
          background: #f8fafc;
          border: 1px solid var(--border-light);
          padding: 1rem;
          border-radius: var(--radius-md);
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }
        .payment-methods-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          margin: 0.5rem 0 1.25rem;
        }
        .method-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem 0.5rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-light);
          background: #ffffff;
          cursor: pointer;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--secondary-muted);
          transition: all 0.2s;
        }
        .method-card.active {
          background: var(--primary-soft);
          border-color: var(--primary);
          color: var(--primary);
        }
        .security-trust-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          color: var(--secondary-muted);
          margin-bottom: 1.25rem;
        }
      `}</style>
    </Modal>
  );
};
