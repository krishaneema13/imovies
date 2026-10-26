export default function TicketReceipt({ booking, onCancel }) {
  if (!booking) return null;

  const movie = booking.movie || {};
  const theatre = booking.theatre || {};
  const isCancelled = booking.bookingStatus === 'cancelled';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="ticket-receipt-card">
      <div className={`ticket-status-ribbon ${isCancelled ? 'cancelled' : 'confirmed'}`}>
        {isCancelled ? 'CANCELLED / REFUNDED' : 'CONFIRMED ADMISSION'}
      </div>

      <div className="ticket-header">
        <div className="ticket-brand">
          <span className="logo-icon">▶</span>
          <strong>IMOVIES CINEMA</strong>
        </div>
        <div className="ticket-ref">
          <small>BOOKING REF</small>
          <span className="ref-code">{booking.bookingReference}</span>
        </div>
      </div>

      <div className="ticket-body">
        <div className="ticket-movie-details">
          <div className="ticket-movie-emoji">{movie.emoji || '🎬'}</div>
          <div>
            <h2 className="ticket-movie-title">{movie.title || 'Movie'}</h2>
            <p className="ticket-movie-genre">
              {Array.isArray(movie.genre) ? movie.genre.join(' • ') : movie.genre || 'Cinema'}
            </p>
          </div>
        </div>

        <div className="ticket-info-grid">
          <div className="ticket-info-item">
            <span className="info-label">THEATRE</span>
            <strong>{theatre.name || 'IMovies Cinema'}</strong>
            <small>{theatre.city || ''}</small>
          </div>

          <div className="ticket-info-item">
            <span className="info-label">DATE & TIME</span>
            <strong>{booking.showDate}</strong>
            <small>{booking.showTime}</small>
          </div>

          <div className="ticket-info-item">
            <span className="info-label">SCREEN & FORMAT</span>
            <strong>Screen {booking.screenNumber || 1}</strong>
            <small>Dolby Atmos</small>
          </div>

          <div className="ticket-info-item">
            <span className="info-label">SEATS</span>
            <div className="ticket-seats-list">
              {booking.seats?.map((seat) => (
                <span key={seat} className="ticket-seat-pill">
                  {seat}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="ticket-pricing-summary">
          <div className="pricing-row">
            <span>Ticket Price ({booking.seats?.length} seats)</span>
            <strong>₹{booking.subtotal}</strong>
          </div>
          <div className="pricing-row">
            <span>Convenience Fee & GST</span>
            <strong>₹{(booking.convenienceFee || 30) + (booking.tax || 0)}</strong>
          </div>
          <div className="pricing-row total">
            <span>Total Paid</span>
            <strong className="total-highlight">₹{booking.totalAmount}</strong>
          </div>
        </div>

        {/* QR Code Graphic Box */}
        <div className="ticket-qr-section">
          <div className="qr-box">
            {/* Elegant SVG QR code simulation */}
            <svg width="110" height="110" viewBox="0 0 100 100" fill="#0b0a12">
              <rect width="100" height="100" fill="#ffffff" rx="8" />
              {/* Corner boxes */}
              <rect x="10" y="10" width="24" height="24" fill="#000" />
              <rect x="14" y="14" width="16" height="16" fill="#fff" />
              <rect x="18" y="18" width="8" height="8" fill="#000" />

              <rect x="66" y="10" width="24" height="24" fill="#000" />
              <rect x="70" y="14" width="16" height="16" fill="#fff" />
              <rect x="74" y="18" width="8" height="8" fill="#000" />

              <rect x="10" y="66" width="24" height="24" fill="#000" />
              <rect x="14" y="70" width="16" height="16" fill="#fff" />
              <rect x="18" y="74" width="8" height="8" fill="#000" />

              {/* Data dots */}
              <rect x="42" y="15" width="6" height="6" fill="#000" />
              <rect x="52" y="15" width="6" height="6" fill="#000" />
              <rect x="42" y="27" width="6" height="6" fill="#000" />
              <rect x="52" y="38" width="6" height="6" fill="#000" />
              <rect x="15" y="44" width="6" height="6" fill="#000" />
              <rect x="25" y="44" width="6" height="6" fill="#000" />
              <rect x="42" y="52" width="6" height="6" fill="#000" />
              <rect x="65" y="52" width="6" height="6" fill="#000" />
              <rect x="78" y="52" width="6" height="6" fill="#000" />
              <rect x="44" y="68" width="6" height="6" fill="#000" />
              <rect x="58" y="76" width="6" height="6" fill="#000" />
              <rect x="70" y="76" width="6" height="6" fill="#000" />
              <rect x="82" y="76" width="6" height="6" fill="#000" />
            </svg>
          </div>
          <div className="qr-instruction">
            <strong>Scan at Cinema Entrance</strong>
            <small>Show this digital ticket or printout at the usher check-in point.</small>
          </div>
        </div>
      </div>

      <div className="ticket-actions no-print">
        <button onClick={handlePrint} className="print-ticket-btn">
          🖨️ Print Ticket / Save PDF
        </button>
        {!isCancelled && onCancel && (
          <button onClick={() => onCancel(booking._id)} className="cancel-ticket-btn">
            Cancel Booking
          </button>
        )}
      </div>
    </div>
  );
}
