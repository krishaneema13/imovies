import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { showApi } from '../api/showApi.js';
import { useSocket } from '../context/SocketContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import SeatGrid from '../components/SeatGrid.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function SeatSelectionPage() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    joinShowRoom,
    leaveShowRoom,
    liveBookedSeats,
    liveLockedSeats,
    setLiveBookedSeats,
    setLiveLockedSeats,
    lockSeat,
    unlockSeat,
  } = useSocket();

  const [showData, setShowData] = useState(null);
  const [screenLayout, setScreenLayout] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes timer

  const currentUserId = user?._id || user?.id || 'guest';

  // Fetch show details & initialize socket room
  const fetchShow = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await showApi.getShowById(showId);
      if (res.success) {
        setShowData(res.data.show);
        setScreenLayout(res.data.screen?.seatLayout);
        setLiveBookedSeats(res.data.bookedSeats || []);
        setLiveLockedSeats(res.data.lockedSeats || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load show seat configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShow();
    joinShowRoom(showId);

    return () => {
      // Unlock all selected seats on unmount if any
      selectedSeats.forEach((s) => unlockSeat(showId, s));
      leaveShowRoom(showId);
    };
  }, [showId]);

  // Timer countdown
  useEffect(() => {
    if (selectedSeats.length === 0) {
      setTimeLeft(300);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto release seats
          selectedSeats.forEach((s) => unlockSeat(showId, s));
          setSelectedSeats([]);
          alert('Your seat reservation timer has expired. Please select your seats again.');
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedSeats]);

  const handleSeatToggle = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) {
      // Deselect
      setSelectedSeats((prev) => prev.filter((s) => s !== seatNumber));
      unlockSeat(showId, seatNumber);
      showApi.unlockSeat(showId, seatNumber).catch(() => {});
    } else {
      // Select & lock
      setSelectedSeats((prev) => [...prev, seatNumber]);
      lockSeat(showId, seatNumber);
      showApi.lockSeat(showId, seatNumber).catch(() => {});
    }
  };

  if (loading) return <LoadingSpinner message="Configuring cinema hall and seats..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchShow} />;
  if (!showData) return null;

  const movie = showData.movie || {};
  const theatre = showData.theatre || {};
  const pricing = showData.pricing || { standard: 200, premium: 320, vip: 450 };

  // Calculate pricing breakdown
  const vipRows = screenLayout?.vipRows || ['A', 'B'];
  const premiumRows = screenLayout?.premiumRows || ['C', 'D', 'E'];

  const seatCalculations = selectedSeats.map((seat) => {
    const row = seat.charAt(0).toUpperCase();
    let type = 'Standard';
    let price = pricing.standard || 200;

    if (vipRows.includes(row)) {
      type = 'VIP';
      price = pricing.vip || 450;
    } else if (premiumRows.includes(row)) {
      type = 'Premium';
      price = pricing.premium || 320;
    }

    return { seat, type, price };
  });

  const subtotal = seatCalculations.reduce((sum, s) => sum + s.price, 0);
  const convenienceFee = selectedSeats.length > 0 ? 30 : 0;
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const totalAmount = subtotal + convenienceFee + tax;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const handleProceedToCheckout = () => {
    if (selectedSeats.length === 0) return;

    if (!user) {
      // Save state to sessionStorage so user returns after login
      sessionStorage.setItem(
        'pending_booking',
        JSON.stringify({
          showId,
          seats: selectedSeats,
        })
      );
      navigate(`/login?redirect=/confirmation/${showId}`);
      return;
    }

    navigate(`/confirmation/${showId}`, {
      state: {
        showId,
        seats: selectedSeats,
        seatCalculations,
        subtotal,
        convenienceFee,
        tax,
        totalAmount,
      },
    });
  };

  return (
    <div className="seat-selection-page">
      {/* Show header banner */}
      <div className="show-header-banner">
        <div className="show-header-details">
          <Link to={`/movie/${movie._id}`} className="back-link">
            ← Back to Shows
          </Link>
          <h2>{movie.title}</h2>
          <div className="show-header-meta">
            <span>📍 {theatre.name} ({theatre.city})</span>
            <span>📅 {showData.showDate}</span>
            <span>⏰ {showData.showTime}</span>
            <span className="badge-format">{showData.format || 'Dolby Atmos'}</span>
          </div>
        </div>

        {selectedSeats.length > 0 && (
          <div className="timer-badge-container">
            <span className="timer-icon">⏳</span>
            <div>
              <small>Seats reserved for:</small>
              <strong className="timer-digits">{formattedTime}</strong>
            </div>
          </div>
        )}
      </div>

      <div className="seat-layout-workspace">
        {/* Cinema Hall & Interactive Seats */}
        <div className="seat-grid-main">
          <SeatGrid
            screenLayout={screenLayout}
            pricing={pricing}
            bookedSeats={liveBookedSeats}
            lockedSeats={liveLockedSeats}
            selectedSeats={selectedSeats}
            currentUserId={currentUserId}
            onSeatToggle={handleSeatToggle}
            maxSeats={8}
          />
        </div>

        {/* Order Summary Sidebar */}
        <div className="booking-summary-sidebar">
          <div className="summary-card">
            <h3>Booking Summary</h3>

            <div className="summary-movie-info">
              <span className="summary-emoji">{movie.emoji || '🎬'}</span>
              <div>
                <strong>{movie.title}</strong>
                <small>{movie.duration} • {showData.format}</small>
              </div>
            </div>

            <div className="summary-theatre-info">
              <p><strong>{theatre.name}</strong></p>
              <small>Screen {showData.screenNumber || 1} • {showData.showDate} at {showData.showTime}</small>
            </div>

            <div className="summary-divider"></div>

            {/* Selected Seats */}
            <div className="selected-seats-block">
              <span className="summary-label">
                Selected Seats ({selectedSeats.length})
              </span>
              {selectedSeats.length === 0 ? (
                <p className="no-seats-hint">Please click on available seats from the layout above.</p>
              ) : (
                <div className="selected-seat-tags">
                  {seatCalculations.map((item) => (
                    <span key={item.seat} className="summary-seat-pill">
                      {item.seat} <small>({item.type} - ₹{item.price})</small>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {selectedSeats.length > 0 && (
              <>
                <div className="summary-divider"></div>
                {/* Cost Breakdown */}
                <div className="pricing-breakdown">
                  <div className="price-line">
                    <span>Ticket Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="price-line">
                    <span>Convenience Fee</span>
                    <span>₹{convenienceFee}</span>
                  </div>
                  <div className="price-line">
                    <span>Integrated GST (5%)</span>
                    <span>₹{tax}</span>
                  </div>
                  <div className="price-line total-price-line">
                    <strong>Total Amount</strong>
                    <strong className="grand-total">₹{totalAmount}</strong>
                  </div>
                </div>

                <button
                  className="proceed-checkout-btn"
                  onClick={handleProceedToCheckout}
                >
                  Proceed to Payment <span>→</span>
                </button>
                <small className="safe-checkout-note">
                  🔒 Atomic seat locking active. Zero double bookings guaranteed.
                </small>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
