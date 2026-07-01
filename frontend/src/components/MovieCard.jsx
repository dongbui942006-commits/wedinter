import React from 'react';

const MovieCard = ({ movie, onClick }) => {
  if (!movie) {
    return null;
  }

  const image =
    movie.image ||
    'https://via.placeholder.com/400x600?text=No+Image';

  const title = movie.title || 'Chưa có tên phim';
  const genre = movie.genre || 'Đang cập nhật';
  const duration = movie.duration || 'Đang cập nhật';
  const rating = movie.rating || 'N/A';

  const handleClick = () => {
    if (onClick) {
      onClick(movie);
    }
  };

  return (
    <div className="movie-card glass" onClick={handleClick}>
      <div className="movie-poster">
        <img src={image} alt={title} />

        <div className="movie-rating">
          <span>★</span> {rating}
        </div>
      </div>

      <div className="movie-info">
        <h3>{title}</h3>

        <p className="genre">Thể loại: {genre}</p>

        <div className="movie-footer">
          <span className="duration">Thời lượng: {duration}</span>

          <button
            type="button"
            className="btn btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
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
          border-radius: 18px;
        }

        .movie-card:hover {
          transform: translateY(-10px);
          border-color: var(--accent-gold);
        }

        .movie-poster {
          position: relative;
          height: 350px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.04);
        }

        .movie-poster img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: var(--transition);
        }

        .movie-card:hover .movie-poster img {
          transform: scale(1.08);
        }

        .movie-rating {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(4px);
          padding: 0.35rem 0.65rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--accent-gold);
        }

        .movie-info {
          padding: 1.5rem;
        }

        .movie-info h3 {
          margin-bottom: 0.5rem;
          font-size: 1.2rem;
          line-height: 1.3;
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

        .movie-footer .btn {
          white-space: nowrap;
        }

        @media (max-width: 600px) {
          .movie-poster {
            height: 300px;
          }

          .movie-footer {
            flex-direction: column;
            align-items: flex-start;
          }

          .movie-footer .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default MovieCard;