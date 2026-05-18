import React, { useState, useEffect } from 'react';
import MovieCard from './components/MovieCard';
import SeatMap from './components/SeatMap';
import './index.css';

const App = () => {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [view, setView] = useState('home');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCinema, setSelectedCinema] = useState('');
  const [user, setUser] = useState(null);

  const cinemas = [
    {
      id: 1,
      name: 'CGV Vincom',
      address: 'Vincom Center, Hà Nội'
    },
    {
      id: 2,
      name: 'Lotte Cinema',
      address: 'Lotte Mall, Hà Nội'
    },
    {
      id: 3,
      name: 'Galaxy Cinema',
      address: 'Tràng Thi, Hà Nội'
    },
    {
      id: 4,
      name: 'BHD Star',
      address: 'Phạm Ngọc Thạch, Hà Nội'
    }
  ];

  useEffect(() => {
    fetch('http://localhost:5000/api/movies', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        setMovies(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch movies:', err);
        setLoading(false);
      });
  }, []);

  const goHome = () => {
    setView('home');
    setSelectedMovie(null);
    setSelectedSeats([]);
    window.scrollTo(0, 0);
  };

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
    setSelectedSeats([]);
    setView('details');
    window.scrollTo(0, 0);
  };

  const handleCinemaClick = (cinemaName) => {
    setSelectedCinema(cinemaName);
    alert(`Bạn đã chọn rạp: ${cinemaName}`);
    setView('home');
    window.scrollTo(0, 0);
  };

  const handleLogin = (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    if (!email || !password) {
      alert('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setUser({
      email
    });

    alert('Đăng nhập thành công!');
    setView('home');
  };

  const startBooking = () => {
    if (!selectedCinema) {
      alert('Vui lòng chọn rạp chiếu phim trước khi đặt vé');
      setView('cinemas');
      return;
    }

    setView('booking');
    window.scrollTo(0, 0);
  };

  const confirmBooking = () => {
    if (!user) {
      alert('Vui lòng đăng nhập trước khi đặt vé');
      setView('login');
      return;
    }

    if (!selectedMovie) {
      alert('Vui lòng chọn phim');
      setView('home');
      return;
    }

    if (!selectedCinema) {
      alert('Vui lòng chọn rạp chiếu phim');
      setView('cinemas');
      return;
    }

    if (selectedSeats.length === 0) {
      alert('Vui lòng chọn ghế');
      return;
    }

    const bookingData = {
      movie: selectedMovie.title,
      movieId: selectedMovie.id,
      cinema: selectedCinema,
      seats: selectedSeats,
      quantity: selectedSeats.length,
      totalAmount: selectedSeats.length * selectedMovie.price,
      email: user.email
    };

    fetch('http://localhost:5000/api/book', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    })
      .then((res) => res.json())
      .then((data) => {
        alert(`Đặt vé thành công!\nGhế đã chọn: ${selectedSeats.join(', ')}\nTổng tiền: ${(selectedSeats.length * selectedMovie.price).toLocaleString()} VND`);

        setView('home');
        setSelectedSeats([]);
        setSelectedMovie(null);
      })
      .catch((err) => {
        console.error('Booking error:', err);
        alert('Đặt vé thất bại. Vui lòng kiểm tra backend.');
      });
  };

  if (loading) {
    return <div className="loading">Loading CineFlow...</div>;
  }

  return (
    <div className="app">
      <header className="glass">
        <div className="container nav-content">
          <h1
            className="gradient-text"
            onClick={goHome}
            style={{ cursor: 'pointer' }}
          >
            CineFlow
          </h1>

          <nav>
            <button className="nav-link" onClick={goHome}>
              Movies
            </button>

            <button className="nav-link" onClick={() => setView('cinemas')}>
              Cinemas
            </button>

            {user ? (
              <button
                className="btn btn-outline"
                onClick={() => {
                  setUser(null);
                  alert('Đã đăng xuất');
                }}
              >
                Logout
              </button>
            ) : (
              <button className="btn btn-outline" onClick={() => setView('login')}>
                Login
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="container">
        {view === 'home' && (
          <section className="hero animate-fade-in">
            <h2>Experience Cinema Like Never Before</h2>
            <p>Book tickets for the latest blockbusters in premium theaters.</p>

            {selectedCinema && (
              <div className="selected-cinema glass">
                Rạp đang chọn: <strong>{selectedCinema}</strong>
              </div>
            )}

            <div className="movie-grid">
              {movies.length > 0 ? (
                movies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onClick={handleMovieClick}
                  />
                ))
              ) : (
                <p>Không có phim nào. Kiểm tra lại API /api/movies.</p>
              )}
            </div>
          </section>
        )}

        {view === 'cinemas' && (
          <section className="cinema-section animate-fade-in">
            <button className="btn btn-outline mb-2" onClick={goHome}>
              ← Back
            </button>

            <h2>Chọn rạp chiếu phim</h2>
            <p>Vui lòng chọn rạp bạn muốn xem phim.</p>

            <div className="cinema-grid">
              {cinemas.map((cinema) => (
                <div
                  key={cinema.id}
                  className="cinema-card glass"
                  onClick={() => handleCinemaClick(cinema.name)}
                >
                  <h3>{cinema.name}</h3>
                  <p>{cinema.address}</p>

                  <button
                    className="btn btn-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCinemaClick(cinema.name);
                    }}
                  >
                    Chọn rạp
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {view === 'login' && (
          <section className="login-section animate-fade-in">
            <button className="btn btn-outline mb-2" onClick={goHome}>
              ← Back
            </button>

            <div className="login-box glass">
              <h2>Đăng nhập</h2>
              <p>Đăng nhập để đặt vé và quản lý lịch sử mua vé.</p>

              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Nhập email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Mật khẩu</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Nhập mật khẩu"
                    required
                  />
                </div>

                <button className="btn btn-primary btn-full" type="submit">
                  Đăng nhập
                </button>
              </form>
            </div>
          </section>
        )}

        {view === 'details' && selectedMovie && (
          <section className="movie-details animate-fade-in">
            <button className="btn btn-outline mb-2" onClick={goHome}>
              ← Back
            </button>

            <div className="details-content glass">
              <div className="details-poster">
                <img src={selectedMovie.image} alt={selectedMovie.title} />
              </div>

              <div className="details-info">
                <h1>{selectedMovie.title}</h1>

                <div className="meta">
                  <span className="badge">{selectedMovie.genre}</span>
                  <span className="badge">★ {selectedMovie.rating}</span>
                  <span className="badge">{selectedMovie.duration}</span>
                </div>

                <p className="description">{selectedMovie.description}</p>

                <div className="price-tag">
                  Price:{' '}
                  <span>{selectedMovie.price.toLocaleString()} VND</span>
                </div>

                <div className="price-tag">
                  Cinema:{' '}
                  <span>{selectedCinema || 'Chưa chọn rạp'}</span>
                </div>

                <button
                  className="btn btn-primary btn-large"
                  onClick={startBooking}
                >
                  Select Seats
                </button>
              </div>
            </div>
          </section>
        )}

        {view === 'booking' && selectedMovie && (
          <section className="booking-section animate-fade-in">
            <button
              className="btn btn-outline mb-2"
              onClick={() => setView('details')}
            >
              ← Back to Details
            </button>

            <div className="booking-layout">
              <div className="seat-selection">
                <h3>Select Your Seats</h3>
                <SeatMap onSelectionChange={setSelectedSeats} />
              </div>

              <div className="booking-summary glass">
                <h3>Booking Summary</h3>

                <div className="summary-item">
                  <span>Movie:</span>
                  <strong>{selectedMovie.title}</strong>
                </div>

                <div className="summary-item">
                  <span>Cinema:</span>
                  <strong>{selectedCinema}</strong>
                </div>

                <div className="summary-item">
                  <span>User:</span>
                  <strong>{user ? user.email : 'Chưa đăng nhập'}</strong>
                </div>

                <div className="summary-item">
                  <span>Seats:</span>
                  <strong key={`seats-${selectedSeats.length}`}>
                    {selectedSeats.length > 0
                      ? selectedSeats.join(', ')
                      : 'None selected'}
                  </strong>
                </div>

                <div className="summary-item total">
                  <span>Tổng cộng:</span>
                  <strong key={`total-${selectedSeats.length}`}>
                    {(selectedSeats.length * (selectedMovie?.price || 0)).toLocaleString()} VND
                  </strong>
                </div>

                <button
                  className="btn btn-primary btn-full"
                  disabled={selectedSeats.length === 0}
                  onClick={confirmBooking}
                >
                  Xác nhận đặt vé
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      <style>{`
        header {
          position: sticky;
          top: 0;
          z-index: 100;
          margin-bottom: 3rem;
          border-radius: 0 0 20px 20px;
        }

        .nav-content {
          height: 80px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        nav {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .nav-link {
          background: transparent;
          border: none;
          color: var(--text-muted);
          text-decoration: none;
          font-weight: 500;
          font-size: 1rem;
          cursor: pointer;
          transition: var(--transition);
        }

        .nav-link:hover {
          color: var(--accent-gold);
        }

        .hero {
          padding: 2rem 0;
        }

        .hero h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .hero p {
          color: var(--text-muted);
          margin-bottom: 3rem;
        }

        .selected-cinema {
          padding: 1rem 1.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          color: var(--text-muted);
        }

        .selected-cinema strong {
          color: var(--accent-gold);
        }

        .movie-details {
          padding: 2rem 0;
        }

        .details-content {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 3rem;
          padding: 2rem;
          margin-top: 1rem;
        }

        .details-poster img {
          width: 100%;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }

        .meta {
          display: flex;
          gap: 1rem;
          margin: 1.5rem 0;
          flex-wrap: wrap;
        }

        .badge {
          background: var(--glass-bg);
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          font-size: 0.9rem;
          border: 1px solid var(--glass-border);
        }

        .description {
          font-size: 1.1rem;
          color: var(--text-muted);
          margin-bottom: 2rem;
        }

        .price-tag {
          font-size: 1.2rem;
          margin-bottom: 1rem;
        }

        .price-tag span {
          color: var(--accent-gold);
          font-weight: 700;
        }

        .btn-large {
          padding: 1.2rem 3rem;
          font-size: 1.1rem;
        }

        .booking-layout {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 2rem;
          margin-top: 1rem;
        }

        .booking-summary {
          padding: 2rem;
          height: fit-content;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          margin: 1.5rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--glass-border);
        }

        .summary-item.total {
          border-bottom: none;
          font-size: 1.3rem;
          color: var(--accent-gold);
        }

        .btn-full {
          width: 100%;
          justify-content: center;
          margin-top: 1rem;
        }

        .mb-2 {
          margin-bottom: 1rem;
        }

        .loading {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 1.5rem;
          color: var(--accent-gold);
        }

        .cinema-section,
        .login-section {
          padding: 2rem 0;
        }

        .cinema-section h2,
        .login-section h2 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .cinema-section p,
        .login-section p {
          color: var(--text-muted);
        }

        .cinema-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .cinema-card {
          padding: 2rem;
          border-radius: 16px;
          cursor: pointer;
          transition: 0.3s ease;
        }

        .cinema-card:hover {
          transform: translateY(-5px);
        }

        .cinema-card h3 {
          margin-bottom: 0.8rem;
        }

        .cinema-card p {
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }

        .login-box {
          max-width: 450px;
          margin: 0 auto;
          padding: 2rem;
          border-radius: 20px;
        }

        .login-box h2 {
          margin-bottom: 0.5rem;
        }

        .login-box p {
          color: var(--text-muted);
          margin-bottom: 2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.2rem;
        }

        .form-group label {
          font-weight: 600;
        }

        .form-group input {
          padding: 0.9rem 1rem;
          border-radius: 10px;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          color: white;
          outline: none;
        }

        @media (max-width: 968px) {
          .details-content,
          .booking-layout {
            grid-template-columns: 1fr;
          }

          nav {
            gap: 1rem;
          }
        }

        @media (max-width: 600px) {
          .nav-content {
            height: auto;
            padding: 1rem 0;
            flex-direction: column;
            gap: 1rem;
          }

          nav {
            flex-wrap: wrap;
            justify-content: center;
          }

          .hero h2 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default App;