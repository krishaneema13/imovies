import { Link } from 'react-router-dom';

export default function HeroSection({ movieCount = 6 }) {
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <span className="eyebrow">YOUR NEXT MOVIE NIGHT STARTS HERE</span>
        <h1>
          Big Screen.
          <br />
          <span>Big Emotions.</span>
        </h1>
        <p>
          Discover your next favourite movie and book your seats in just a few clicks.
          Experience Dolby Atmos, IMAX 3D, and luxurious recliner seating.
        </p>
        <div className="hero-actions">
          <a className="primary-button" href="#movies">
            Explore Movies <span>→</span>
          </a>
          <Link
            className="secondary-button"
            to="/dashboard"
            style={{
              padding: '12px 20px',
              borderRadius: '9px',
              border: '1px solid #3b3552',
              color: '#d1cce5',
              fontWeight: 600,
              fontSize: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.03)',
            }}
          >
            My Bookings
          </Link>
        </div>
        <div className="hero-stats">
          <div>
            <strong>{movieCount}+</strong>
            <small>Featured Movies</small>
          </div>
          <div>
            <strong>Live</strong>
            <small>Seat Selection</small>
          </div>
          <div>
            <strong>₹200</strong>
            <small>Starting Ticket Price</small>
          </div>
        </div>
      </div>
      <div className="hero-art" aria-label="Movie night illustration">
        <div className="orbit orbit-one"></div>
        <div className="orbit orbit-two"></div>
        <div className="hero-clapper">🎬</div>
        <div className="floating-star star-one">✦</div>
        <div className="floating-star star-two">✦</div>
        <div className="hero-caption">LIGHTS. CAMERA. ACTION.</div>
      </div>
    </section>
  );
}
