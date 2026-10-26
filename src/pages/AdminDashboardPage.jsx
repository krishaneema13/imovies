import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { adminApi } from '../api/adminApi.js';
import { movieApi } from '../api/movieApi.js';
import { theatreApi } from '../api/theatreApi.js';
import { showApi } from '../api/showApi.js';
import { bookingApi } from '../api/bookingApi.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    genre: 'Action, Sci-Fi',
    language: 'English, Hindi',
    duration: '2h 15m',
    rating: 8.0,
    emoji: '🎬',
    color: 'space',
    status: 'now_showing',
    director: '',
    trailerUrl: '',
  });
  const [editingMovieId, setEditingMovieId] = useState(null);

  const [showTheatreModal, setShowTheatreModal] = useState(false);
  const [theatreForm, setTheatreForm] = useState({
    name: '',
    city: 'Mumbai',
    address: '',
  });

  const [showShowModal, setShowShowModal] = useState(false);
  const [showForm, setShowForm] = useState({
    movie: '',
    theatre: '',
    screenNumber: 1,
    format: 'Dolby Cinema',
    language: 'English',
    showDate: new Date().toISOString().split('T')[0],
    showTime: '06:00 PM',
    pricing: {
      standard: 200,
      premium: 320,
      vip: 450,
    },
  });

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/admin');
      return;
    }
    if (!isAdmin) {
      navigate('/');
      return;
    }

    fetchAdminData();
  }, [user, isAdmin]);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, moviesRes, theatresRes, showsRes, bookingsRes] = await Promise.all([
        adminApi.getStats(),
        movieApi.getMovies(),
        theatreApi.getTheatres(),
        showApi.getShows(),
        bookingApi.getAllBookings(),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (moviesRes.success) setMovies(moviesRes.data);
      if (theatresRes.success) setTheatres(theatresRes.data);
      if (showsRes.success) setShows(showsRes.data);
      if (bookingsRes.success) setBookings(bookingsRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load admin management data');
    } finally {
      setLoading(false);
    }
  };

  // Movie Handlers
  const handleSaveMovie = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...movieForm,
        genre: Array.isArray(movieForm.genre)
          ? movieForm.genre
          : movieForm.genre.split(',').map((g) => g.trim()),
        language: Array.isArray(movieForm.language)
          ? movieForm.language
          : movieForm.language.split(',').map((l) => l.trim()),
      };

      if (editingMovieId) {
        await movieApi.updateMovie(editingMovieId, payload);
      } else {
        await movieApi.createMovie(payload);
      }

      setShowMovieModal(false);
      setEditingMovieId(null);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to save movie');
    }
  };

  const handleDeleteMovie = async (id) => {
    if (!window.confirm('Are you sure you want to delete this movie and its shows?')) return;
    try {
      await movieApi.deleteMovie(id);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to delete movie');
    }
  };

  // Theatre Handlers
  const handleSaveTheatre = async (e) => {
    e.preventDefault();
    try {
      await theatreApi.createTheatre({
        ...theatreForm,
        screens: [
          {
            screenNumber: 1,
            name: 'Screen 1',
            format: 'Dolby Cinema',
            soundSystem: 'Dolby Atmos',
          },
        ],
      });
      setShowTheatreModal(false);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to create theatre');
    }
  };

  const handleDeleteTheatre = async (id) => {
    if (!window.confirm('Are you sure you want to delete this theatre?')) return;
    try {
      await theatreApi.deleteTheatre(id);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to delete theatre');
    }
  };

  // Show Handlers
  const handleSaveShow = async (e) => {
    e.preventDefault();
    try {
      if (!showForm.movie || !showForm.theatre) {
        alert('Please select both a movie and a theatre.');
        return;
      }
      await showApi.createShow(showForm);
      setShowShowModal(false);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to schedule show');
    }
  };

  const handleDeleteShow = async (id) => {
    if (!window.confirm('Delete this scheduled show?')) return;
    try {
      await showApi.deleteShow(id);
      fetchAdminData();
    } catch (err) {
      alert(err.message || 'Failed to delete show');
    }
  };

  if (loading) return <LoadingSpinner message="Loading Admin Management Console..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchAdminData} />;

  return (
    <div className="admin-dashboard-page">
      {/* Admin Header */}
      <div className="admin-header-banner">
        <div>
          <span className="eyebrow text-warning">MANAGEMENT CONSOLE</span>
          <h1>Admin Control Panel</h1>
          <p>Full control over cinema movies, theatres, screenings, and customer bookings.</p>
        </div>
        <div className="admin-header-actions">
          <Link to="/" className="btn-return-home">
            ← View Customer Site
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      {stats && (
        <div className="admin-stats-grid">
          <div className="stat-card">
            <span className="stat-icon">💰</span>
            <div>
              <small>Total Revenue</small>
              <strong>₹{stats.totalRevenue.toLocaleString()}</strong>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🎟️</span>
            <div>
              <small>Total Bookings</small>
              <strong>{stats.totalBookings}</strong>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🎬</span>
            <div>
              <small>Movies in Catalog</small>
              <strong>{stats.totalMovies}</strong>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🏛️</span>
            <div>
              <small>Active Theatres</small>
              <strong>{stats.totalTheatres}</strong>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🕒</span>
            <div>
              <small>Scheduled Shows</small>
              <strong>{stats.totalShows}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs-nav">
        <button
          className={`admin-tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          📊 Overview
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'movies' ? 'active' : ''}`}
          onClick={() => setActiveTab('movies')}
        >
          🎬 Movies ({movies.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'theatres' ? 'active' : ''}`}
          onClick={() => setActiveTab('theatres')}
        >
          🏛️ Theatres ({theatres.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'shows' ? 'active' : ''}`}
          onClick={() => setActiveTab('shows')}
        >
          🕒 Shows ({shows.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          🎟️ All Bookings ({bookings.length})
        </button>
      </div>

      {/* Tab 1: Stats Overview */}
      {activeTab === 'stats' && (
        <div className="admin-overview-section">
          <div className="admin-recent-bookings-card">
            <div className="card-header-flex">
              <h3>Recent Customer Bookings</h3>
              <button onClick={() => setActiveTab('bookings')} className="btn-link">
                View all →
              </button>
            </div>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Customer</th>
                    <th>Movie</th>
                    <th>Seats</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentBookings?.map((b) => (
                    <tr key={b._id}>
                      <td className="code-font">{b.bookingReference}</td>
                      <td>{b.user?.name || 'Customer'}</td>
                      <td>{b.movie?.title}</td>
                      <td>{b.seats?.join(', ')}</td>
                      <td>₹{b.totalAmount}</td>
                      <td>
                        <span className={`status-pill ${b.bookingStatus}`}>
                          {b.bookingStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Movies Management */}
      {activeTab === 'movies' && (
        <div className="admin-management-section">
          <div className="section-toolbar">
            <h3>Movie Catalog</h3>
            <button
              className="primary-button btn-sm"
              onClick={() => {
                setEditingMovieId(null);
                setMovieForm({
                  title: '',
                  description: '',
                  genre: 'Action, Sci-Fi',
                  language: 'English, Hindi',
                  duration: '2h 15m',
                  rating: 8.0,
                  emoji: '🎬',
                  color: 'space',
                  status: 'now_showing',
                  director: '',
                  trailerUrl: '',
                });
                setShowMovieModal(true);
              }}
            >
              + Add New Movie
            </button>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Poster</th>
                  <th>Title</th>
                  <th>Genre</th>
                  <th>Language</th>
                  <th>Duration</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((m) => (
                  <tr key={m._id}>
                    <td>
                      <span className="movie-emoji-td">{m.emoji || '🎬'}</span>
                    </td>
                    <td>
                      <strong>{m.title}</strong>
                    </td>
                    <td>{Array.isArray(m.genre) ? m.genre.join(', ') : m.genre}</td>
                    <td>{Array.isArray(m.language) ? m.language.join(', ') : m.language}</td>
                    <td>{m.duration}</td>
                    <td>★ {m.rating}</td>
                    <td>
                      <div className="action-buttons-cell">
                        <button
                          className="btn-action edit"
                          onClick={() => {
                            setEditingMovieId(m._id);
                            setMovieForm({
                              title: m.title,
                              description: m.description,
                              genre: Array.isArray(m.genre) ? m.genre.join(', ') : m.genre,
                              language: Array.isArray(m.language) ? m.language.join(', ') : m.language,
                              duration: m.duration,
                              rating: m.rating,
                              emoji: m.emoji || '🎬',
                              color: m.color || 'space',
                              status: m.status || 'now_showing',
                              director: m.director || '',
                              trailerUrl: m.trailerUrl || '',
                            });
                            setShowMovieModal(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-action delete"
                          onClick={() => handleDeleteMovie(m._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Theatres Management */}
      {activeTab === 'theatres' && (
        <div className="admin-management-section">
          <div className="section-toolbar">
            <h3>Cinema Theatres</h3>
            <button
              className="primary-button btn-sm"
              onClick={() => {
                setTheatreForm({ name: '', city: 'Mumbai', address: '' });
                setShowTheatreModal(true);
              }}
            >
              + Add Theatre
            </button>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Theatre Name</th>
                  <th>City</th>
                  <th>Address</th>
                  <th>Screens</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {theatres.map((t) => (
                  <tr key={t._id}>
                    <td><strong>{t.name}</strong></td>
                    <td>📍 {t.city}</td>
                    <td>{t.address}</td>
                    <td>{t.screens?.length || 1} Screen(s)</td>
                    <td>
                      <button
                        className="btn-action delete"
                        onClick={() => handleDeleteTheatre(t._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Shows Management */}
      {activeTab === 'shows' && (
        <div className="admin-management-section">
          <div className="section-toolbar">
            <h3>Scheduled Screenings</h3>
            <button
              className="primary-button btn-sm"
              onClick={() => {
                setShowForm({
                  movie: movies[0]?._id || '',
                  theatre: theatres[0]?._id || '',
                  screenNumber: 1,
                  format: 'Dolby Cinema',
                  language: 'English',
                  showDate: new Date().toISOString().split('T')[0],
                  showTime: '06:00 PM',
                  pricing: { standard: 200, premium: 320, vip: 450 },
                });
                setShowShowModal(true);
              }}
            >
              + Schedule Show
            </button>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Movie</th>
                  <th>Theatre</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Format</th>
                  <th>Pricing</th>
                  <th>Occupancy</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shows.map((s) => {
                  const booked = s.bookedSeats?.length || 0;
                  const total = s.totalSeats || 80;
                  return (
                    <tr key={s._id}>
                      <td><strong>{s.movie?.title}</strong></td>
                      <td>{s.theatre?.name} ({s.theatre?.city})</td>
                      <td>{s.showDate}</td>
                      <td>{s.showTime}</td>
                      <td>{s.format || 'Dolby Cinema'}</td>
                      <td>₹{s.pricing?.standard} / ₹{s.pricing?.premium} / ₹{s.pricing?.vip}</td>
                      <td>{booked} / {total} seats</td>
                      <td>
                        <button
                          className="btn-action delete"
                          onClick={() => handleDeleteShow(s._id)}
                        >
                          Cancel Show
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: All Bookings */}
      {activeTab === 'bookings' && (
        <div className="admin-management-section">
          <div className="section-toolbar">
            <h3>All Customer Bookings</h3>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Movie</th>
                  <th>Theatre</th>
                  <th>Showtime</th>
                  <th>Seats</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td className="code-font">{b.bookingReference}</td>
                    <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                    <td>{b.user?.name}</td>
                    <td>{b.movie?.title}</td>
                    <td>{b.theatre?.name}</td>
                    <td>{b.showDate} {b.showTime}</td>
                    <td>{b.seats?.join(', ')}</td>
                    <td>₹{b.totalAmount}</td>
                    <td>
                      <span className={`status-pill ${b.bookingStatus}`}>
                        {b.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Movie Modal */}
      {showMovieModal && (
        <div className="modal-backdrop" onClick={() => setShowMovieModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowMovieModal(false)}>
              ×
            </button>
            <h2>{editingMovieId ? 'Edit Movie' : 'Add New Movie'}</h2>
            <form onSubmit={handleSaveMovie}>
              <div className="form-group">
                <label>Movie Title</label>
                <input
                  type="text"
                  value={movieForm.title}
                  onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description / Synopsis</label>
                <textarea
                  rows="3"
                  value={movieForm.description}
                  onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                  required
                ></textarea>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Genres (comma separated)</label>
                  <input
                    type="text"
                    value={movieForm.genre}
                    onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Languages (comma separated)</label>
                  <input
                    type="text"
                    value={movieForm.language}
                    onChange={(e) => setMovieForm({ ...movieForm, language: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    value={movieForm.duration}
                    onChange={(e) => setMovieForm({ ...movieForm, duration: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Rating (0-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={movieForm.rating}
                    onChange={(e) => setMovieForm({ ...movieForm, rating: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Emoji Icon</label>
                  <input
                    type="text"
                    value={movieForm.emoji}
                    onChange={(e) => setMovieForm({ ...movieForm, emoji: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Poster Theme Color</label>
                  <select
                    value={movieForm.color}
                    onChange={(e) => setMovieForm({ ...movieForm, color: e.target.value })}
                  >
                    <option value="space">Space (Purple / Indigo)</option>
                    <option value="night">Night (Dark Blue / Slate)</option>
                    <option value="dune">Dune (Warm Amber / Sand)</option>
                    <option value="spider">Spider (Red / Crimson)</option>
                    <option value="inside">Inside (Coral / Yellow)</option>
                    <option value="avatar">Avatar (Cyan / Deep Teal)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Director</label>
                  <input
                    type="text"
                    value={movieForm.director}
                    onChange={(e) => setMovieForm({ ...movieForm, director: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions-row">
                <button type="submit" className="primary-button">
                  {editingMovieId ? 'Update Movie' : 'Create Movie'}
                </button>
                <button
                  type="button"
                  className="btn-secondary-cancel"
                  onClick={() => setShowMovieModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Theatre Modal */}
      {showTheatreModal && (
        <div className="modal-backdrop" onClick={() => setShowTheatreModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowTheatreModal(false)}>
              ×
            </button>
            <h2>Add Cinema Theatre</h2>
            <form onSubmit={handleSaveTheatre}>
              <div className="form-group">
                <label>Theatre Name</label>
                <input
                  type="text"
                  placeholder="e.g. IMovies Cinema City - Andheri"
                  value={theatreForm.name}
                  onChange={(e) => setTheatreForm({ ...theatreForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>City / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, Bengaluru, Delhi NCR"
                  value={theatreForm.city}
                  onChange={(e) => setTheatreForm({ ...theatreForm, city: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  placeholder="Street address, Mall name, Area"
                  value={theatreForm.address}
                  onChange={(e) => setTheatreForm({ ...theatreForm, address: e.target.value })}
                  required
                />
              </div>

              <div className="modal-actions-row">
                <button type="submit" className="primary-button">
                  Save Theatre
                </button>
                <button
                  type="button"
                  className="btn-secondary-cancel"
                  onClick={() => setShowTheatreModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Show Modal */}
      {showShowModal && (
        <div className="modal-backdrop" onClick={() => setShowShowModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowShowModal(false)}>
              ×
            </button>
            <h2>Schedule New Screening</h2>
            <form onSubmit={handleSaveShow}>
              <div className="form-group">
                <label>Select Movie</label>
                <select
                  value={showForm.movie}
                  onChange={(e) => setShowForm({ ...showForm, movie: e.target.value })}
                  required
                >
                  {movies.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title} ({m.duration})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Select Theatre</label>
                <select
                  value={showForm.theatre}
                  onChange={(e) => setShowForm({ ...showForm, theatre: e.target.value })}
                  required
                >
                  {theatres.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Show Date</label>
                  <input
                    type="date"
                    value={showForm.showDate}
                    onChange={(e) => setShowForm({ ...showForm, showDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Show Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 06:00 PM"
                    value={showForm.showTime}
                    onChange={(e) => setShowForm({ ...showForm, showTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label>Standard Price (₹)</label>
                  <input
                    type="number"
                    value={showForm.pricing.standard}
                    onChange={(e) =>
                      setShowForm({
                        ...showForm,
                        pricing: { ...showForm.pricing, standard: Number(e.target.value) },
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Premium Price (₹)</label>
                  <input
                    type="number"
                    value={showForm.pricing.premium}
                    onChange={(e) =>
                      setShowForm({
                        ...showForm,
                        pricing: { ...showForm.pricing, premium: Number(e.target.value) },
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>VIP Recliner Price (₹)</label>
                  <input
                    type="number"
                    value={showForm.pricing.vip}
                    onChange={(e) =>
                      setShowForm({
                        ...showForm,
                        pricing: { ...showForm.pricing, vip: Number(e.target.value) },
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="modal-actions-row">
                <button type="submit" className="primary-button">
                  Publish Show
                </button>
                <button
                  type="button"
                  className="btn-secondary-cancel"
                  onClick={() => setShowShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
