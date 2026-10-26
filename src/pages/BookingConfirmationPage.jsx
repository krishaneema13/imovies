import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { bookingApi } from '../api/bookingApi.js';
import { showApi } from '../api/showApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import TicketReceipt from '../components/TicketReceipt.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function BookingConfirmationPage() {
  const { showId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bookingDetails, setBookingDetails] = useState(location.state || null);
  const [show, setShow] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!bookingDetails);

  // If page was reloaded or state missing, fetch show and restore
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(location.pathname));
      return;
    }

    const restoreShow = async () => {
      try {
        const res = await showApi.getShowById(showId);
        if (res.success) {
          setShow(res.data.show);
          // If no state passed from navigation, check session
          if (!bookingDetails) {
            const saved = sessionStorage.getItem('pending_booking');
            if (saved) {
              const parsed = JSON.parse(saved);
              setBookingDetails({
                showId,
                seats: parsed.seats || ['D4'],
                totalAmount: (parsed.seats?.length || 1) * 200 + 30,
                subtotal: (parsed.seats?.length || 1) * 200,
                convenienceFee: 30,
                tax: Math.round(((parsed.seats?.length || 1) * 200) * 0.05),
              });
            } else {
              // Default fallback
              navigate(`/seats/${showId}`);
            }
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to retrieve show info');
      } finally {
        setLoading(false);
      }
    };

    restoreShow();
  }, [showId, user]);

  const handlePayAndConfirm = async (e) => {
    e.preventDefault();
    if (!bookingDetails || !bookingDetails.seats || bookingDetails.seats.length === 0) {
      setError('No seats selected.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const res = await bookingApi.createBooking({
        showId,
        seats: bookingDetails.seats,
        paymentMethod,
      });

      if (res.success) {
        setConfirmedBooking(res.data);
        sessionStorage.removeItem('pending_booking');
      }
    } catch (err) {
      setError(
        err.message ||
          'Failed to complete booking. Another user may have just purchased these seats. Please select different seats.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <LoadingSpinner message="Preparing checkout..." />;

  // If already confirmed, render ticket receipt view
  if (confirmedBooking) {
    return (
      <div className="confirmation-success-page">
        <div className="success-banner">
          <div className="confetti-emoji">🎉</div>
          <h1>Booking Confirmed!</h1>
          <p>
            Your tickets for <strong>{confirmedBooking.movie?.title}</strong> have been secured.
            A confirmation notification has been sent to your account.
          </p>
        </div>

        <div className="ticket-display-container">
          <TicketReceipt booking={confirmedBooking} />
        </div>

        <div className="confirmation-nav-actions">
          <Link to="/dashboard" className="primary-button">
            View in Dashboard <span>→</span>
          </Link>
          <Link to="/" className="secondary-button">
            Explore More Movies
          </Link>
        </div>
      </div>
    );
  }

  const seatsList = bookingDetails?.seats || [];
  const totalAmount = bookingDetails?.totalAmount || seatsList.length * 200 + 30;

  return (
    <div className="booking-confirmation-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <span className="eyebrow">FINAL STEP</span>
          <h2>Payment & Confirmation</h2>
          <p>Review your booking details and select your preferred payment mode.</p>
        </div>

        {error && (
          <div className="mb-4">
            <ErrorMessage
              message={error}
              onRetry={() => navigate(`/seats/${showId}`)}
            />
          </div>
        )}

        <div className="checkout-content-grid">
          {/* Payment Selection Box */}
          <div className="payment-options-card">
            <h3>Choose Payment Method</h3>
            <form onSubmit={handlePayAndConfirm}>
              <div className="payment-modes-list">
                {/* Credit / Debit Card */}
                <label className={`payment-mode-label ${paymentMethod === 'card' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="mode-info">
                    <span className="mode-title">💳 Credit / Debit Card</span>
                    <small>Instant approval, Visa, MasterCard, RuPay</small>
                  </div>
                </label>

                {/* UPI */}
                <label className={`payment-mode-label ${paymentMethod === 'upi' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="mode-info">
                    <span className="mode-title">📱 UPI (Google Pay / PhonePe / Paytm)</span>
                    <small>Zero surcharge instant UPI transfer</small>
                  </div>
                </label>

                {/* Net Banking */}
                <label className={`payment-mode-label ${paymentMethod === 'netbanking' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="netbanking"
                    checked={paymentMethod === 'netbanking'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="mode-info">
                    <span className="mode-title">🏦 Net Banking</span>
                    <small>All major Indian banks supported</small>
                  </div>
                </label>

                {/* Digital Wallet */}
                <label className={`payment-mode-label ${paymentMethod === 'wallet' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="wallet"
                    checked={paymentMethod === 'wallet'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="mode-info">
                    <span className="mode-title">👛 IMovies Cinema Wallet</span>
                    <small>One-click instant payment</small>
                  </div>
                </label>
              </div>

              {/* Payment Details Input Mock */}
              {paymentMethod === 'card' && (
                <div className="card-input-mock">
                  <div className="mock-input-row">
                    <input
                      type="text"
                      placeholder="Card Number (e.g. 4242 •••• •••• 4242)"
                      defaultValue="4242 •••• •••• 4242"
                      readOnly
                    />
                  </div>
                  <div className="mock-input-split">
                    <input type="text" placeholder="MM/YY" defaultValue="12/28" readOnly />
                    <input type="password" placeholder="CVV" defaultValue="999" readOnly />
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="upi-input-mock">
                  <input
                    type="text"
                    placeholder="Enter UPI ID (e.g. user@okaxis)"
                    defaultValue="demo@okhdfcbank"
                    readOnly
                  />
                </div>
              )}

              <button
                type="submit"
                className="confirm-booking-btn"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing Transaction...' : `Pay ₹${totalAmount} & Confirm Booking`}
              </button>
              <small className="demo-notice">
                * Simulated secure sandbox transaction. No actual bank charge will occur.
              </small>
            </form>
          </div>

          {/* Booking Summary Box */}
          <div className="checkout-summary-card">
            <h3>Review Booking</h3>
            <div className="checkout-meta-line">
              <span>Customer:</span>
              <strong>{user?.name} ({user?.email})</strong>
            </div>
            <div className="checkout-meta-line">
              <span>Selected Seats:</span>
              <div className="seat-badge-group">
                {seatsList.map((s) => (
                  <span key={s} className="seat-tag">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="summary-divider"></div>

            <div className="checkout-pricing">
              <div className="price-row">
                <span>Subtotal ({seatsList.length} seats)</span>
                <span>₹{bookingDetails?.subtotal || seatsList.length * 200}</span>
              </div>
              <div className="price-row">
                <span>Convenience Fee</span>
                <span>₹{bookingDetails?.convenienceFee || 30}</span>
              </div>
              <div className="price-row">
                <span>GST (5%)</span>
                <span>₹{bookingDetails?.tax || 0}</span>
              </div>
              <div className="price-row total-highlight-row">
                <strong>Total Payable</strong>
                <strong>₹{totalAmount}</strong>
              </div>
            </div>

            <div className="booking-cancellation-policy">
              <strong>Cancellation Policy:</strong>
              <small>
                Free cancellation available before show starts with instant refund to original
                payment method.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
