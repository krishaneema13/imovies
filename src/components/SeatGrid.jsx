export default function SeatGrid({
  screenLayout,
  pricing = { standard: 200, premium: 320, vip: 450 },
  bookedSeats = [],
  lockedSeats = [], // [{ seatNumber, userId }]
  selectedSeats = [], // [seatNumber]
  currentUserId,
  onSeatToggle,
  maxSeats = 8,
}) {
  const rows = screenLayout?.rows || ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const cols = screenLayout?.cols || 10;
  const vipRows = screenLayout?.vipRows || ['A', 'B'];
  const premiumRows = screenLayout?.premiumRows || ['C', 'D', 'E'];
  const standardRows = screenLayout?.standardRows || ['F', 'G', 'H'];

  const getSeatCategory = (row) => {
    if (vipRows.includes(row)) return { type: 'VIP Recliner', price: pricing.vip || 450, code: 'vip' };
    if (premiumRows.includes(row)) return { type: 'Premium', price: pricing.premium || 320, code: 'premium' };
    return { type: 'Standard', price: pricing.standard || 200, code: 'standard' };
  };

  const getSeatStatus = (seatNumber) => {
    // 1. Is it already confirmed booked?
    if (bookedSeats.includes(seatNumber)) {
      return 'booked';
    }

    // 2. Is it selected by current user?
    if (selectedSeats.includes(seatNumber)) {
      return 'selected';
    }

    // 3. Is it locked by another user?
    const lock = lockedSeats.find((l) => l.seatNumber === seatNumber);
    if (lock) {
      if (lock.userId && lock.userId !== currentUserId) {
        return 'locked';
      }
    }

    return 'available';
  };

  const handleSeatClick = (seatNumber) => {
    const status = getSeatStatus(seatNumber);
    if (status === 'booked' || status === 'locked') return;

    if (!selectedSeats.includes(seatNumber) && selectedSeats.length >= maxSeats) {
      alert(`You can select a maximum of ${maxSeats} seats per booking.`);
      return;
    }

    onSeatToggle(seatNumber);
  };

  // Group rows by tier for clear section headers
  const tiers = [
    { name: 'VIP Recliner', rows: vipRows, price: pricing.vip || 450, badge: '⭐' },
    { name: 'Premium Club', rows: premiumRows, price: pricing.premium || 320, badge: '✨' },
    { name: 'Standard Classic', rows: standardRows, price: pricing.standard || 200, badge: '🎟️' },
  ];

  return (
    <div className="seat-grid-wrapper">
      {/* Curved Screen Banner */}
      <div className="cinema-screen-container">
        <div className="cinema-screen-curve"></div>
        <span className="screen-label">SCREEN THIS WAY 👁️</span>
      </div>

      {/* Legend */}
      <div className="seat-legend-bar">
        <div className="legend-item">
          <span className="seat-sample seat-available"></span>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <span className="seat-sample seat-selected"></span>
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <span className="seat-sample seat-locked"></span>
          <span>Reserved (Live)</span>
        </div>
        <div className="legend-item">
          <span className="seat-sample seat-booked"></span>
          <span>Sold Out</span>
        </div>
      </div>

      {/* Seat Sections */}
      <div className="seats-hall">
        {tiers.map((tier) => (
          <div key={tier.name} className="tier-section">
            <div className="tier-header">
              <span className="tier-name">
                {tier.badge} {tier.name}
              </span>
              <span className="tier-price">₹{tier.price}</span>
            </div>

            <div className="tier-rows">
              {tier.rows.map((row) => (
                <div key={row} className="seat-row">
                  <span className="row-label left">{row}</span>
                  <div className="row-seats">
                    {Array.from({ length: cols }, (_, i) => {
                      const colNumber = i + 1;
                      const seatNumber = `${row}${colNumber}`;
                      const status = getSeatStatus(seatNumber);
                      const isAisleGap = colNumber === Math.floor(cols / 2);

                      return (
                        <div key={seatNumber} className={`seat-unit-container ${isAisleGap ? 'aisle-after' : ''}`}>
                          <button
                            type="button"
                            className={`seat-btn seat-${status}`}
                            onClick={() => handleSeatClick(seatNumber)}
                            disabled={status === 'booked' || status === 'locked'}
                            title={`Seat ${seatNumber} (${tier.name} - ₹${tier.price}) ${status !== 'available' ? `[${status.toUpperCase()}]` : ''}`}
                            aria-label={`Seat ${seatNumber}, ${status}`}
                          >
                            <span className="seat-num">{colNumber}</span>
                            {status === 'locked' && <span className="seat-lock-icon">🔒</span>}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <span className="row-label right">{row}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
