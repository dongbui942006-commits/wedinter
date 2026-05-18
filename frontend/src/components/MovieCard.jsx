import React from 'react';

const MovieCard = ({ movie, onClick }) => {
  return (
    <div className="movie-card glass" onClick={() => onClick(movie)}>
      <div className="movie-poster">
        <img src={movie.image} alt={movie.title} />

        <div className="movie-rating">
          <span>★</span> {movie.rating}
        </div>
      </div>

      <div className="movie-info">
        <h3>{movie.title}</h3>

        <p className="genre">
          Thể loại: {movie.genre}
        </p>

        <div className="movie-footer">
          <span className="duration">
            Thời lượng: {movie.duration}
          </span>

          <button
            className="btn btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              onClick(movie);
            }}
          >
            Đặt vé
          </button>
        </div>
      </div>

      <style>{`
        .movie-card {
          overflow: hidden;
          transition: var(--transition);
          cursor: pointer;
        }

        .movie-card:hover {
          transform: translateY(-10px);
          border-color: var(--accent-gold);
        }

        .movie-poster {
          position: relative;
          height: 350px;
          overflow: hidden;
        }

        .movie-poster img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: var(--transition);
        }

        .movie-card:hover .movie-poster img {
          transform: scale(1.1);
        }

        .movie-rating {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          padding: 0.3rem 0.6rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--accent-gold);
        }

        .movie-info {
          padding: 1.5rem;
        }

        .movie-info h3 {
          margin-bottom: 0.5rem;
          font-size: 1.2rem;
        }

        .genre {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .movie-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .duration {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .btn {
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
};

export default MovieCard;