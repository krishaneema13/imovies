import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const redirect = query.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate(redirect);
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFillUser = () => {
    setEmail('user@imovies.com');
    setPassword('UserPassword123!');
  };

  const handleQuickFillAdmin = () => {
    setEmail('admin@imovies.com');
    setPassword('AdminPassword123!');
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="logo-icon">▶</span>
          <h2>Welcome Back</h2>
          <p>Sign in to your IMovies account to manage tickets and bookings.</p>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* Demo Quick-Fill Bar */}
        <div className="demo-credentials-helper">
          <small className="demo-helper-title">Quick Demo Login:</small>
          <div className="demo-buttons-row">
            <button
              type="button"
              className="btn-demo-pill"
              onClick={handleQuickFillUser}
            >
              👤 Demo Customer
            </button>
            <button
              type="button"
              className="btn-demo-pill admin"
              onClick={handleQuickFillAdmin}
            >
              👑 Demo Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              placeholder="e.g. user@imovies.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="primary-button auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'} <span>→</span>
          </button>
        </form>

        <div className="auth-footer-link">
          <span>Don't have an account?</span>{' '}
          <Link to={`/register${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
