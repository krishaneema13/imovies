import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { movieApi } from '../api/movieApi.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function MovieDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generate 5 days of dates
  const dateTabs = [];
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dateTabs.push({ dateStr, dayName, formatted });
  }

  useEffect(() => {
    if (!selectedDate && dateTabs.length > 0) {
      setSelectedDate(dateTabs[0].dateStr);
    }
  }, []);

  const fetchMovieDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await movieApi.getMovieById(id);
      if (res.success) {
        setMovie(res.data.movie);
        setShows(res.data.shows || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load movie details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading movie details and showtimes..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchMovieDetails} />;
  if (!movie) return <EmptyState title="Movie not found" message="The requested movie could not be found." />;

  // Filter shows by selected date & city
  const filteredShows = shows.filter((show) => {
    const matchDate = selectedDate ? show.showDate === selectedDate : true;
    const matchCity =
      selectedCity === 'All' ||
      show.theatre?.city?.toLowerCase() === selectedCity.toLowerCase();
    return matchDate && matchCity;
  });

  // Unique cities from available shows
  const availableCities = Array.from(
    new Set(shows.map((s) => s.theatre?.city).filter(Boolean))
  );

  // Group filtered shows by Theatre
  const showsByTheatre = filteredShows.reduce((acc, show) => {
    const theatreId = show.theatre?._id || 'unknown';
    if (!acc[theatreId]) {
      acc[theatreId] = {
        theatre: show.theatre,
        shows: [],
      };
    }
    acc[theatreId].shows.push(show);
    return acc;
  }, {});

  const genreText = Array.isArray(movie.genre) ? movie.genre.join(' • ') : movie.genre;
  const languagesText = Array.isArray(movie.language) ? movie.language.join(', ') : 'English';
  const castText = Array.isArray(movie.cast) ? movie.cast.join(', ') : '';

  return (
    <div className="movie-details-page">
      {/* Movie Hero Banner */}
      <section className="movie-hero-banner">
        <div className="movie-hero-backdrop" style={{ backgroundImage: `url(${movie.bannerUrl || ''})` }}>
          <div className="backdrop-overlay"></div>
        </div>

        <div className="movie-hero-content">
          <div className={`poster ${movie.color || 'space'} detail-poster`}>
            <span className="poster-tag">NOW SHOWING</span>
            <span className="poster-emoji">{movie.emoji || '🎬'}</span>
            <span className="poster-title">{movie.title}</span>
            <span className="poster-bottom">IMOVIES</span>
            <span className="rating">★ {movie.rating || '8.0'}</span>
          </div>

          <div className="movie-hero-text">
            <div className="breadcrumbs">
              <Link to="/">Home</Link> <span>/</span> <span>Movies</span> <span>/</span>{' '}
              <span className="current">{movie.title}</span>
            </div>

            <h1 className="movie-title-large">{movie.title}</h1>
            <p className="movie-genre-large">{genreText}</p>

            <div className="movie-meta-tags">
              <span className="meta-tag">⭐ {movie.rating || '8.0'} / 10</span>
              <span className="meta-tag">⏱️ {movie.duration || '2h 15m'}</span>
              <span className="meta-tag">🌐 {languagesText}</span>
              <span className="meta-tag">📅 {new Date(movie.releaseDate).getFullYear()}</span>
            </div>

            <p className="movie-synopsis">{movie.description}</p>

            {movie.director && (
              <p className="movie-crew">
                <strong>Director:</strong> {movie.director}
              </p>
            )}
            {castText && (
              <p className="movie-crew">
                <strong>Cast:</strong> {castText}
              </p>
            )}

            {movie.trailerUrl && (
              <div className="movie-actions-bar">
                <a
                  href={movie.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="watch-trailer-btn"
                >
                  ▶ Watch Trailer
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Showtimes Selection Section */}
      <section className="showtimes-section" id="showtimes">
        <div className="showtimes-header">
          <div>
            <span className="eyebrow">RESERVE YOUR SEATS</span>
            <h2>Showtimes & Theatres</h2>
            <p>Select your preferred date, cinema hall, and showtime.</p>
          </div>

          {/* City Selector */}
          {availableCities.length > 0 && (
            <div className="city-filter-wrapper">
              <label htmlFor="city-select">Select City:</label>
              <select
                id="city-select"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="All">All Cities</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    📍 {city}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Date Tabs */}
        <div className="date-tabs-container">
          {dateTabs.map((tab) => {
            const isSelected = selectedDate === tab.dateStr;
            return (
              <button
                key={tab.dateStr}
                className={`date-tab-btn ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedDate(tab.dateStr)}
              >
                <span className="tab-day">{tab.dayName}</span>
                <span className="tab-date">{tab.formatted}</span>
              </button>
            );
          })}
        </div>

        {/* Theatres and Shows List */}
        <div className="theatres-shows-list">
          {Object.keys(showsByTheatre).length === 0 ? (
            <EmptyState
              title="No shows scheduled"
              message={`No screenings available for ${selectedDate} in the selected city. Please choose another date or city.`}
              icon="🎟️"
            />
          ) : (
            Object.values(showsByTheatre).map(({ theatre, shows: tShows }) => (
              <div key={theatre?._id} className="theatre-show-card">
                <div className="theatre-meta-info">
                  <div className="theatre-title-wrap">
                    <h3>{theatre?.name || 'IMovies Cinema'}</h3>
                    <span className="theatre-city-badge">📍 {theatre?.city}</span>
                  </div>
                  <p className="theatre-address">{theatre?.address}</p>
                </div>

                <div className="showtimes-grid">
                  {tShows.map((show) => {
                    const bookedCount = show.bookedSeats?.length || 0;
                    const totalCount = show.totalSeats || 80;
                    const isAlmostFull = totalCount - bookedCount <= 15;

                    return (
                      <button
                        key={show._id}
                        className="showtime-card-btn"
                        onClick={() => navigate(`/seats/${show._id}`)}
                      >
                        <span className="show-time-text">{show.showTime}</span>
                        <div className="show-format-badge">{show.format || 'Dolby Atmos'}</div>
                        <div className="show-price-tag">From ₹{show.pricing?.standard || 200}</div>
                        {isAlmostFull && (
                          <span className="filling-fast-badge">Filling Fast!</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
