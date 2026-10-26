import { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection.jsx';
import MovieCard from '../components/MovieCard.jsx';
import FilterBar from '../components/FilterBar.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { movieApi } from '../api/movieApi.js';

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    genres: ['All'],
    languages: ['All'],
    cities: ['All'],
    theatres: [],
  });

  const [filters, setFilters] = useState({
    search: '',
    genre: 'All',
    language: 'All',
    location: 'All',
    theatre: 'All',
    date: 'All',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch filter options once
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await movieApi.getFilterOptions();
        if (res.success) {
          setFilterOptions(res.data);
        }
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    };
    fetchOptions();
  }, []);

  // Fetch movies whenever filters change
  const fetchMovies = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await movieApi.getMovies(filters);
      if (res.success) {
        setMovies(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load movies. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      genre: 'All',
      language: 'All',
      location: 'All',
      theatre: 'All',
      date: 'All',
    });
  };

  return (
    <div className="home-page">
      <HeroSection movieCount={movies.length} />

      <section className="movies-section" id="movies">
        <div className="section-heading">
          <div>
            <span className="eyebrow">NOW SHOWING</span>
            <h2>Find Your Movie</h2>
            <p>Pick a film. Choose your show. Enjoy the magic.</p>
          </div>
        </div>

        {/* Responsive Search & Filters */}
        <FilterBar
          filters={filters}
          options={filterOptions}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        {/* Content States */}
        {loading ? (
          <LoadingSpinner message="Fetching cinema listings..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={fetchMovies} />
        ) : movies.length === 0 ? (
          <EmptyState
            title="No movies found"
            message="No movies matched your filter criteria. Try clearing some filters or searching for something else."
            onReset={handleResetFilters}
          />
        ) : (
          <div className="movie-grid">
            {movies.map((movie) => (
              <MovieCard key={movie._id || movie.id} movie={movie} />
            ))}
          </div>
        )}
      </section>

      {/* About Section Preserved */}
      <section className="about-section" id="about">
        <span className="eyebrow">WHY IMOVIES?</span>
        <h2>Your Movie Plans, Made Simple.</h2>
        <div className="benefits">
          <div>
            <span>🎟️</span>
            <h3>Easy Booking</h3>
            <p>Choose a movie and book your tickets with real-time seat reservation.</p>
          </div>
          <div>
            <span>🍿</span>
            <h3>Cinema Discovery</h3>
            <p>Explore films across action, comedy, sci-fi, and IMAX formats in your city.</p>
          </div>
          <div>
            <span>⚡</span>
            <h3>Zero Double-Booking</h3>
            <p>Instant seat locking and atomic reservation guarantee your seats are reserved.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
