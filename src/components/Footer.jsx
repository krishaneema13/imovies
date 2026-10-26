import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <Link className="logo" to="/">
          <span className="logo-icon">▶</span> IMOVIES
        </Link>
        <p className="footer-tagline">Made for movie lovers. Your next story awaits.</p>
        <div className="footer-links">
          <Link to="/">Now Showing</Link>
          <Link to="/#about">About Us</Link>
          <Link to="/dashboard">My Bookings</Link>
        </div>
        <small className="footer-copyright">
          © 2026 IMovies — Autonomous Cinema Ticket Booking & Management System.
        </small>
      </div>
    </footer>
  );
}
