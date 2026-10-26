import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="not-found-page py-5 my-5 text-center">
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎬</div>
      <h1 style={{ fontSize: '48px', fontWeight: 700, color: '#f7f5ff' }}>404</h1>
      <h2 style={{ fontSize: '22px', color: '#a78bfa', marginBottom: '16px' }}>Page Not Found</h2>
      <p style={{ color: '#94a3b8', maxWidth: '420px', margin: '0 auto 24px' }}>
        The cinema screen you are looking for does not exist or has been moved to another auditorium.
      </p>
      <Link to="/" className="primary-button">
        Return to Home <span>→</span>
      </Link>
    </div>
  );
}
