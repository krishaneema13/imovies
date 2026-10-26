import { Link } from 'react-router-dom';

export default function MovieCard({ movie }) {
  const genreText = Array.isArray(movie.genre) ? movie.genre.join(' • ') : movie.genre;
  const languagesText = Array.isArray(movie.language) ? movie.language.join(', ') : 'English';

  return (
    <article className="movie-card">
      <Link to={`/movie/${movie._id || movie.id}`} style={{ textDecoration: 'none' }}>
        <div className={`poster ${movie.color || 'space'}`}>
          <span className="poster-tag">NOW SHOWING</span>
          <span className="poster-emoji">{movie.emoji || '🎬'}</span>
          <span className="poster-title">{movie.title}</span>
          <span className="poster-bottom">IMOVIES CINEMA</span>
          <span className="rating">★ {movie.rating || '8.0'}</span>
        </div>
      </Link>
      <div className="movie-info">
        <h3 title={movie.title}>{movie.title}</h3>
        <p className="movie-genre">{genreText}</p>
        <div className="movie-meta">
          <span>{movie.duration || '2h 15m'}</span>
          <span className="badge-lang">{languagesText}</span>
          <span className="movie-price">From ₹200</span>
        </div>
        <Link to={`/movie/${movie._id || movie.id}`} className="book-button">
          Book Tickets <span>→</span>
        </Link>
      </div>
    </article>
  );
}
