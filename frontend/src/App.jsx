import React, { useEffect, useMemo, useState } from 'react';
import MovieCard from './components/MovieCard.jsx';
import SeatMap from './components/SeatMap.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import Login from './login.jsx';
import LandingPage from './components/LandingPage.jsx';
import './index.css';

const API_URL = 'http://localhost:5000/api';

// ---- Menu đồ ăn uống ----
const FOOD_MENU = [
  { id: 'solo',    name: 'Combo Solo',         desc: '1 Bắp ngọt lớn + 1 Nước ngọt L',        price: 65000,  icon: '🍿🥤' },
  { id: 'couple',  name: 'Cặp đôi kết hợp',    desc: '1 Bắp ngọt lớn + 2 Nước ngọt L',        price: 85000,  icon: '🍿🥤🥤' },
  { id: 'family',  name: 'Combo Gia đình',      desc: '2 Bắp ngọt lớn + 3 Nước ngọt L',        price: 140000, icon: '🍿🍿🥤🥤🥤' },
  { id: 'popcorn', name: 'Bắp rang bơ Phô mai', desc: '1 Hộp bắp rang vị phô mai',             price: 45000,  icon: '🍿' },
  { id: 'drink',   name: 'Nước Pepsi',          desc: '1 Ly Pepsi mát lạnh cỡ L',              price: 30000,  icon: '🥤' },
  { id: 'snack',   name: 'Snack Khoai tây',     desc: '1 Gói snack khoai tây giòn rụm',         price: 25000,  icon: '🥔' },
  { id: 'hotdog',  name: 'Hotdog Phô mai',      desc: '1 Hotdog phủ phô mai béo ngậy',          price: 50000,  icon: '🌭' },
];

// ---- Helper: lấy giá vé từ object phim ----
function getMoviePrice(movie) {
  if (!movie) return 80000;
  const raw = movie.price ?? movie.ticketPrice ?? movie.ticket_price ?? movie.giaVe;
  if (raw === undefined || raw === null || raw === '') return 80000;
  const numStr = String(raw).replace(/[^\d]/g, ''); // chỉ lấy số, bỏ cả dấu chấm/phẩy
  const num = parseInt(numStr, 10);
  if (isNaN(num) || num <= 0) return 80000;
  // nếu người dùng nhập '100' (ý là 100k) thì nhân 1000
  if (num < 1000) return num * 1000;
  // nếu người dùng nhập '100.000' thì numStr là '100000', hợp lệ luôn
  return num;
}

// ---- Helper: format tiền VND ----
function formatMoney(value) {
  if (value === null || value === undefined) return '0';
  const num = Number(value);
  if (isNaN(num)) return '0';
  return Math.round(num).toLocaleString('vi-VN');
}

const App = () => {
  // ---- State chính ----
  const [movies,         setMovies]         = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [view,           setView]           = useState('landing');
  const [selectedMovie,  setSelectedMovie]  = useState(null);
  const [selectedCinema, setSelectedCinema] = useState('');
  const [selectedSeats,  setSelectedSeats]  = useState([]);
  const [selectedFood,   setSelectedFood]   = useState({});

  // ---- State form đặt vé ----
  const [customerName, setCustomerName] = useState('');
  const [phone,        setPhone]        = useState('');
  const [showDate,     setShowDate]     = useState('');
  const [showTime,     setShowTime]     = useState('');
  const [note,         setNote]         = useState('');

  // ---- State lịch sử ----
  const [myBookings,     setMyBookings]     = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // ---- State user ----
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cineflow_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem('cineflow_user');
      return null;
    }
  });

  // ---- Dữ liệu tĩnh ----
  const cinemas = [
    { id: 1, name: 'CGV Vincom',    address: 'Vincom Center, Hà Nội' },
    { id: 2, name: 'Lotte Cinema',  address: 'Lotte Mall, Hà Nội' },
    { id: 3, name: 'Galaxy Cinema', address: 'Tràng Thi, Hà Nội' },
    { id: 4, name: 'BHD Star',      address: 'Phạm Ngọc Thạch, Hà Nội' },
    { id: 5, name: 'Beta Cinemas',  address: 'Thanh Xuân, Hà Nội' },
    { id: 6, name: 'Mega GS',       address: 'Cầu Giấy, Hà Nội' },
  ];

  const showTimes = ['08:30','10:00','11:30','13:00','14:30','16:00','17:30','18:00','19:30','20:15','21:00','22:30','23:45'];

  const showDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const value = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
      return { value, label: i === 0 ? `Hôm nay, ${label}` : label };
    });
  }, []);

  // ---- Tính toán tiền (reactive theo state) ----
  const seatCount   = selectedSeats.length;
  const ticketPrice = getMoviePrice(selectedMovie);
  const ticketTotal = ticketPrice * seatCount;

  const foodTotal = FOOD_MENU.reduce((sum, item) => {
    const qty = parseInt(selectedFood[item.id], 10) || 0;
    return sum + item.price * qty;
  }, 0);

  const totalPrice = ticketTotal + foodTotal;

  // ---- Effects ----
  useEffect(() => { fetchMovies(); }, []);

  useEffect(() => {
    try {
      if (user) localStorage.setItem('cineflow_user', JSON.stringify(user));
      else       localStorage.removeItem('cineflow_user');
    } catch {}
  }, [user]);

  // debug
  useEffect(() => {
    console.log('💰 TIỀN:', { ticketPrice, seatCount, ticketTotal, foodTotal, totalPrice });
  }, [ticketPrice, seatCount, ticketTotal, foodTotal, totalPrice]);

  // ---- API ----
  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res  = await fetch(`${API_URL}/movies`, { cache: 'no-store' });
      const data = await res.json();
      if      (Array.isArray(data))         setMovies(data);
      else if (Array.isArray(data?.data))   setMovies(data.data);
      else if (Array.isArray(data?.movies)) setMovies(data.movies);
      else                                  setMovies([]);
    } catch (err) {
      console.error('Lỗi tải phim:', err);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const res = await fetch('http://localhost:5000/api/bookings');
      const data = await res.json();
      if (data?.success && Array.isArray(data.data)) {
        const userBookings = data.data.filter(b => b.email === user.email);
        setMyBookings(userBookings);
      }
    } catch (err) {
      console.error('Lỗi tải lịch sử đặt vé:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (view === 'history') {
      fetchMyBookings();
    }
  }, [view, user]);

  // ---- Helpers điều hướng ----
  const resetForm = () => {
    setSelectedSeats([]);
    setSelectedFood({});
    setCustomerName('');
    setPhone('');
    setShowDate('');
    setShowTime('');
    setNote('');
  };

  const goHome = () => {
    setView('landing');
    setSelectedMovie(null);
    resetForm();
    window.scrollTo(0, 0);
  };

  const handleMovieClick = (movie) => {
    if (!movie) return;
    if (!user) {
      alert('Vui lòng đăng nhập để xem chi tiết và đặt vé phim này.');
      setView('landing');
      window.scrollTo(0, 0);
      return;
    }
    setSelectedMovie(movie);
    resetForm();
    setCustomerName(user?.name || (user?.email ? user.email.split('@')[0] : ''));
    setPhone(user?.phone || '');
    setView('details');
    window.scrollTo(0, 0);
  };

  const handleCinemaClick = (name) => {
    setSelectedCinema(name);
    alert(`Đã chọn rạp: ${name}`);
    setView('home');
    window.scrollTo(0, 0);
  };

  const startBooking = () => {
    if (!selectedMovie) { alert('Vui lòng chọn phim'); setView('home'); return; }
    if (!selectedCinema) { alert('Vui lòng chọn rạp chiếu phim'); setView('cinemas'); return; }
    setView('booking');
    window.scrollTo(0, 0);
  };

  // ---- Xử lý ghế từ SeatMap ----
  const handleSeatChange = (newSeats) => {
    console.log('📌 Ghế nhận từ SeatMap:', newSeats);
    setSelectedSeats(Array.isArray(newSeats) ? [...newSeats] : []);
  };

  // ---- Xử lý đồ ăn ----
  const changeFood = (id, delta) => {
    setSelectedFood(prev => {
      const cur = parseInt(prev[id], 10) || 0;
      const next = Math.max(0, cur + delta);
      return { ...prev, [id]: next };
    });
  };

  // ---- Đặt vé ----
  const confirmBooking = async () => {
    // validate
    if (!user)          { alert('Vui lòng đăng nhập trước'); setView('login'); return; }
    if (!selectedMovie) { alert('Vui lòng chọn phim'); setView('home'); return; }
    if (!selectedCinema){ alert('Vui lòng chọn rạp'); setView('cinemas'); return; }
    if (seatCount === 0){ alert('Vui lòng chọn ghế'); return; }
    if (!customerName.trim() || !phone.trim() || !showDate || !showTime) {
      alert('Vui lòng điền đầy đủ: Họ tên, Số điện thoại, Ngày xem, Giờ chiếu');
      return;
    }

    // ghi chú đồ ăn
    const foodText = FOOD_MENU
      .filter(item => (parseInt(selectedFood[item.id], 10) || 0) > 0)
      .map(item => `${item.name} x${selectedFood[item.id]}`)
      .join(', ');

    const finalNote = [note.trim(), foodText ? `Đồ ăn: ${foodText}` : '']
      .filter(Boolean).join(' | ');

    const payload = {
      movie:         selectedMovie.title,
      movieId:       selectedMovie.id,
      cinema:        selectedCinema,
      seats:         selectedSeats,
      quantity:      seatCount,
      ticketPrice,
      ticket_price:  ticketPrice,
      totalAmount:   totalPrice,
      total_amount:  totalPrice,
      email:         user.email,
      customer_name: customerName.trim(),
      phone:         phone.trim(),
      show_date:     showDate,
      show_time:     showTime,
      note:          finalNote,
    };

    console.log('📤 Gửi đặt vé:', payload);

    const successMsg = `✅ Đặt vé thành công!
Phim: ${selectedMovie.title}
Rạp: ${selectedCinema}
Ngày: ${showDate} | Giờ: ${showTime}
Ghế: ${selectedSeats.join(', ')}
Giá vé: ${formatMoney(ticketPrice)} VND × ${seatCount} = ${formatMoney(ticketTotal)} VND
${foodText ? `Đồ ăn: ${foodText} = ${formatMoney(foodTotal)} VND\n` : ''}Tổng tiền: ${formatMoney(totalPrice)} VND`;

    try {
      const res  = await fetch(`${API_URL}/bookings`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (data?.success === false) { alert(data.message || 'Đặt vé thất bại'); return; }
      alert(successMsg);
    } catch {
      alert(successMsg + '\n(Lưu offline - chưa kết nối server)');
    }

    goHome();
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cineflow_user');
    setView('home');
  };

  if (loading) return <div className="loading">⏳ Đang tải CineFlow...</div>;

  // ===================== RENDER =====================
  return (
    <div className="app">
      {/* ---- HEADER ---- */}
      <header className="glass">
        <div className="container nav-content">
          <h1 className="gradient-text" onClick={goHome} style={{ cursor: 'pointer' }}>
            🎬 CineFlow
          </h1>
          <nav>
            <button type="button" className="nav-link" onClick={goHome}>Phim</button>
            <button type="button" className="nav-link" onClick={() => setView('cinemas')}>Chọn rạp</button>
            {(user?.role === 'admin' || user?.role === 'staff') && (
              <button type="button" className="nav-link" onClick={() => { setView('admin'); window.scrollTo(0, 0); }}>
                Quản trị
              </button>
            )}
            {user ? (
              <>
                <button type="button" className="nav-link" onClick={() => { setView('history'); window.scrollTo(0, 0); }}>Lịch sử vé</button>
                <span className="user-info">{user.name || user.email}</span>
                <button type="button" className="btn btn-outline" onClick={logout}>Đăng xuất</button>
              </>
            ) : (
              <button type="button" className="btn btn-outline" onClick={() => setView('login')}>Đăng nhập</button>
            )}
          </nav>
        </div>
      </header>

      <main className="container">

        {/* ---- LANDING PAGE ---- */}
        {view === 'landing' && <LandingPage setView={setView} movies={movies} handleMovieClick={handleMovieClick} />}

        {/* ---- HOME ---- */}
        {view === 'home' && (
          <section className="hero animate-fade-in">
            <h2>Trải nghiệm đặt vé xem phim hiện đại</h2>
            <p>Đặt vé nhanh chóng, chọn rạp, chọn ghế yêu thích.</p>
            {selectedCinema && (
              <div className="selected-cinema glass">
                Rạp đang chọn: <strong>{selectedCinema}</strong>
              </div>
            )}
            <div className="movie-grid">
              {movies.length > 0
                ? movies.map((m, i) => (
                    <MovieCard key={m.id || i} movie={m} onClick={() => handleMovieClick(m)} />
                  ))
                : <p>Không có phim nào từ server.</p>
              }
            </div>
          </section>
        )}

        {/* ---- CINEMAS ---- */}
        {view === 'cinemas' && (
          <section className="cinema-section animate-fade-in">
            <button type="button" className="btn btn-outline mb-2" onClick={goHome}>← Quay lại</button>
            <h2>Chọn rạp chiếu phim</h2>
            <div className="cinema-grid">
              {cinemas.map(c => (
                <div key={c.id} className="cinema-card glass" onClick={() => handleCinemaClick(c.name)}>
                  <h3>{c.name}</h3>
                  <p>{c.address}</p>
                  <button type="button" className="btn btn-primary"
                    onClick={e => { e.stopPropagation(); handleCinemaClick(c.name); }}>
                    Chọn rạp
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ---- LOGIN ---- */}
        {view === 'login' && <Login setUser={setUser} setView={setView} goHome={goHome} />}

        {/* ---- ADMIN ---- */}
        {view === 'admin' && (
          user?.role === 'admin' || user?.role === 'staff'
            ? <AdminDashboard goHome={goHome} user={user} />
            : (
              <div className="glass access-denied">
                <h2>Quyền truy cập bị từ chối</h2>
                <p>Bạn cần đăng nhập bằng tài khoản quản trị viên hoặc nhân viên.</p>
                <button type="button" className="btn btn-primary" onClick={() => setView('login')}>Đăng nhập</button>
              </div>
            )
        )}

        {/* ---- CHI TIẾT PHIM ---- */}
        {view === 'details' && selectedMovie && (
          <section className="movie-details animate-fade-in">
            <button type="button" className="btn btn-outline mb-2" onClick={goHome}>← Quay lại</button>
            <div className="details-content glass">
              <div className="details-poster">
                <img
                  src={selectedMovie.image || 'https://via.placeholder.com/400x600?text=No+Image'}
                  alt={selectedMovie.title}
                />
              </div>
              <div className="details-info">
                <h1>{selectedMovie.title}</h1>
                <div className="meta">
                  <span className="badge">{selectedMovie.genre || 'Đang cập nhật'}</span>
                  <span className="badge">★ {selectedMovie.rating || 'N/A'}</span>
                  <span className="badge">{selectedMovie.duration || 'Đang cập nhật'}</span>
                </div>
                <p className="description">{selectedMovie.description || 'Chưa có mô tả.'}</p>
                <div className="price-tag">
                  Giá vé: <span>{formatMoney(ticketPrice)} VND</span>
                </div>
                <div className="price-tag">
                  Rạp: <span>{selectedCinema || 'Chưa chọn rạp'}</span>
                </div>
                <button type="button" className="btn btn-primary btn-large" onClick={startBooking}>
                  Chọn chỗ ngồi
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ---- ĐẶT VÉ ---- */}
        {view === 'booking' && selectedMovie && (
          <section className="booking-section animate-fade-in">
            <button type="button" className="btn btn-outline mb-2" onClick={() => setView('details')}>
              ← Quay lại chi tiết phim
            </button>

            <div className="booking-layout">
              {/* CỘT TRÁI: Ghế + Đồ ăn */}
              <div className="seat-selection">
                <h3>Chọn ghế ngồi</h3>
                <SeatMap selectedSeats={selectedSeats} onSelectionChange={handleSeatChange} />

                {/* ---- ĐỒ ĂN UỐNG ---- */}
                <div className="food-selection glass mt-3">
                  <h3>🍿 Chọn đồ ăn &amp; thức uống</h3>
                  <p className="section-desc">Tiết kiệm hơn khi mua combo cùng vé xem phim</p>
                  <div className="food-menu-list">
                    {FOOD_MENU.map(item => {
                      const qty = parseInt(selectedFood[item.id], 10) || 0;
                      return (
                        <div key={item.id} className={`food-item ${qty > 0 ? 'food-item--active' : ''}`}>
                          <div className="food-icon">{item.icon}</div>
                          <div className="food-details">
                            <span className="food-name">{item.name}</span>
                            <span className="food-desc">{item.desc}</span>
                            <span className="food-price">{formatMoney(item.price)} VND</span>
                          </div>
                          <div className="food-counter">
                            <button
                              type="button"
                              className="counter-btn"
                              onClick={() => changeFood(item.id, -1)}
                              disabled={qty === 0}
                            >−</button>
                            <span className="counter-value">{qty}</span>
                            <button
                              type="button"
                              className="counter-btn"
                              onClick={() => changeFood(item.id, +1)}
                            >+</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* CỘT PHẢI: Form + Thanh toán */}
              <div className="booking-summary glass">
                <h3>Thông tin đặt vé</h3>

                <div className="summary-item">
                  <span>Phim:</span>
                  <strong>{selectedMovie.title}</strong>
                </div>
                <div className="summary-item">
                  <span>Rạp:</span>
                  <strong>{selectedCinema}</strong>
                </div>
                <div className="summary-item">
                  <span>Tài khoản:</span>
                  <strong>{user?.email || 'Chưa đăng nhập'}</strong>
                </div>
                <div className="summary-item">
                  <span>Ghế đã chọn:</span>
                  <strong style={{ color: 'var(--accent-gold)' }}>
                    {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'Chưa chọn ghế'}
                  </strong>
                </div>

                <div className="form-group">
                  <label>Họ và tên</label>
                  <input type="text" value={customerName}
                    onChange={e => setCustomerName(e.target.value)} placeholder="Nhập họ và tên" />
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input type="tel" value={phone}
                    onChange={e => setPhone(e.target.value)} placeholder="Nhập số điện thoại" />
                </div>

                <div className="form-group">
                  <label>Ngày xem</label>
                  <div className="date-options">
                    {showDates.map(d => (
                      <button key={d.value} type="button"
                        className={`option-btn ${showDate === d.value ? 'active' : ''}`}
                        onClick={() => setShowDate(d.value)}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Giờ chiếu</label>
                  <div className="time-options">
                    {showTimes.map(t => (
                      <button key={t} type="button"
                        className={`option-btn ${showTime === t ? 'active' : ''}`}
                        onClick={() => setShowTime(t)}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Ghi chú</label>
                  <input type="text" value={note}
                    onChange={e => setNote(e.target.value)} placeholder="Nhập ghi chú nếu có" />
                </div>

                {/* ======== THANH TOÁN ======== */}
                <div className="payment-box">
                  <h4>💳 Thanh toán</h4>

                  <div className="pay-row">
                    <span>Giá vé / ghế:</span>
                    <strong>{formatMoney(ticketPrice)} VND</strong>
                  </div>

                  <div className="pay-row">
                    <span>Số ghế đã chọn:</span>
                    <strong>{seatCount} ghế</strong>
                  </div>

                  <div className="pay-row">
                    <span>Tiền vé ({seatCount} × {formatMoney(ticketPrice)}):</span>
                    <strong style={{ color: 'var(--accent-gold)' }}>
                      {formatMoney(ticketTotal)} VND
                    </strong>
                  </div>

                  {foodTotal > 0 && (
                    <div className="pay-row animate-fade-in">
                      <span>Tiền đồ ăn uống:</span>
                      <strong style={{ color: 'var(--accent-gold)' }}>
                        {formatMoney(foodTotal)} VND
                      </strong>
                    </div>
                  )}

                  <div className="pay-total">
                    <span>Tổng tiền:</span>
                    <strong>{formatMoney(totalPrice)} VND</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary btn-full"
                  disabled={seatCount === 0}
                  onClick={confirmBooking}
                >
                  {seatCount === 0 ? 'Vui lòng chọn ghế' : `Đặt vé — ${formatMoney(totalPrice)} VND`}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ======== VIEW LỊCH SỬ ======== */}
        {view === 'history' && (
          <section className="history-section animate-fade-in">
            <h2>Lịch sử đặt vé của bạn</h2>
            {loadingHistory ? (
              <p>Đang tải dữ liệu...</p>
            ) : myBookings.length === 0 ? (
              <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
                <p>Bạn chưa đặt vé nào.</p>
                <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={goHome}>
                  Khám phá phim ngay
                </button>
              </div>
            ) : (
              <div className="history-grid">
                {myBookings.map((b, i) => (
                  <div key={b.id || i} className="history-card glass">
                    <div className="history-header">
                      <h3>{b.movie || b.movieTitle}</h3>
                      <span className="status-badge">{b.status || 'Đã đặt'}</span>
                    </div>
                    <div className="history-body">
                      <p><strong>Rạp:</strong> {b.cinema}</p>
                      <p><strong>Ghế:</strong> {Array.isArray(b.seats) ? b.seats.join(', ') : b.seats}</p>
                      <p><strong>Ngày xem:</strong> {b.show_date} | <strong>Giờ chiếu:</strong> {b.show_time}</p>
                      <p><strong>Tổng tiền:</strong> {formatMoney(b.totalAmount || b.total_amount || b.amount)} VND</p>
                      <p><strong>Mã QR:</strong> <span style={{ fontFamily: 'monospace', color: 'var(--accent-gold)' }}>{b.qr_code}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* ===================== CSS ===================== */}
      <style>{`
        header {
          position: sticky;
          top: 0;
          z-index: 100;
          margin-bottom: 3rem;
          border-radius: 0 0 20px 20px;
        }

        .nav-content {
          min-height: 80px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        nav {
          display: flex;
          gap: 1.5rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .nav-link {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-weight: 500;
          font-size: 1rem;
          cursor: pointer;
          transition: var(--transition);
        }

        .nav-link:hover { color: var(--accent-gold); }

        .user-info {
          color: var(--accent-gold);
          font-weight: 700;
          font-size: 0.9rem;
        }

        /* LỊCH SỬ ĐẶT VÉ */
        .history-section h2 { margin-bottom: 1.5rem; }
        .history-grid { display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); margin-top: 1rem; }
        .history-card { padding: 1.5rem; border-radius: 16px; border-left: 4px solid var(--accent-gold); }
        .history-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem; margin-bottom: 1rem; }
        .history-header h3 { margin: 0; font-size: 1.2rem; color: var(--accent-gold); }
        .status-badge { background: rgba(250, 204, 21, 0.15); color: var(--accent-gold); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; }
        .history-body p { margin: 0.5rem 0; color: var(--text-light); font-size: 0.95rem; }
        .history-body strong { color: white; display: inline-block; width: 90px; }

        /* HOME */
        .hero { padding: 2rem 0; }
        .hero h2 { font-size: 2.5rem; margin-bottom: 1rem; }
        .hero p  { color: var(--text-muted); margin-bottom: 3rem; }

        .selected-cinema {
          padding: 1rem 1.5rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          color: var(--text-muted);
        }
        .selected-cinema strong { color: var(--accent-gold); }

        /* CINEMAS */
        .cinema-section { padding: 2rem 0; }
        .cinema-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }
        .cinema-card { padding: 2rem; border-radius: 16px; cursor: pointer; transition: 0.3s ease; }
        .cinema-card:hover { transform: translateY(-5px); }
        .cinema-card p { color: var(--text-muted); margin: 0.8rem 0 1.5rem; }

        /* DETAILS */
        .movie-details { padding: 2rem 0; }
        .details-content {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 3rem;
          padding: 2rem;
          margin-top: 1rem;
        }
        .details-poster img { width: 100%; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,.5); }
        .meta { display: flex; gap: 1rem; margin: 1.5rem 0; flex-wrap: wrap; }
        .badge {
          background: var(--glass-bg);
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          font-size: 0.9rem;
          border: 1px solid var(--glass-border);
        }
        .description { font-size: 1.1rem; color: var(--text-muted); margin-bottom: 2rem; }
        .price-tag { font-size: 1.2rem; margin-bottom: 1rem; }
        .price-tag span { color: var(--accent-gold); font-weight: 700; }
        .btn-large { padding: 1.2rem 3rem; font-size: 1.1rem; }

        /* BOOKING LAYOUT */
        .booking-layout {
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 2rem;
          margin-top: 1rem;
          align-items: start;
        }

        .booking-summary { padding: 2rem; border-radius: 20px; }

        .summary-item {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          margin: 0.8rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--glass-border);
          font-size: 0.95rem;
        }
        .summary-item strong { text-align: right; }

        /* FORM */
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.2rem; }
        .form-group label { font-weight: 600; }
        .form-group input {
          padding: 0.9rem 1rem;
          border-radius: 10px;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          color: white;
          outline: none;
          transition: var(--transition);
        }
        .form-group input:focus { border-color: var(--accent-gold); }

        .date-options { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
        .time-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }

        .option-btn {
          padding: 0.7rem;
          border-radius: 10px;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          color: var(--text-muted);
          cursor: pointer;
          font-weight: 600;
          transition: var(--transition);
          font-size: 0.85rem;
        }
        .option-btn:hover  { border-color: var(--accent-gold); color: var(--accent-gold); }
        .option-btn.active { background: var(--accent-gold); border-color: var(--accent-gold); color: black; }

        /* PAYMENT BOX */
        .payment-box {
          margin-top: 1.5rem;
          padding: 1.25rem 1.5rem;
          border-radius: 16px;
          border: 1px solid rgba(255, 193, 7, 0.35);
          background: rgba(255, 193, 7, 0.05);
        }
        .payment-box h4 {
          margin-bottom: 1rem;
          color: var(--accent-gold);
          font-size: 1.05rem;
        }

        .pay-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          padding: 0.55rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .pay-row strong { color: white; }

        .pay-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
          padding-top: 0.75rem;
          border-top: 2px solid rgba(255, 193, 7, 0.4);
          font-size: 1.2rem;
          font-weight: 700;
        }
        .pay-total span   { color: var(--text-muted); }
        .pay-total strong { color: var(--accent-gold); font-size: 1.35rem; }

        /* BUTTONS */
        .btn-full { width: 100%; justify-content: center; margin-top: 1.25rem; }
        .mb-2 { margin-bottom: 1rem; }
        .mt-3 { margin-top: 2rem; }

        /* FOOD */
        .food-selection {
          padding: 2rem;
          border-radius: 20px;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
        }
        .food-menu-list { display: flex; flex-direction: column; gap: 0.85rem; }

        .food-item {
          display: flex;
          align-items: center;
          gap: 1.2rem;
          padding: 1rem 1.2rem;
          border-radius: 14px;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--glass-border);
          transition: var(--transition);
        }
        .food-item:hover        { border-color: var(--accent-gold); transform: translateX(4px); background: rgba(255,193,7,0.04); }
        .food-item--active      { border-color: var(--accent-gold); background: rgba(255,193,7,0.07); }

        .food-icon {
          font-size: 2rem;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,193,7,0.1);
          border-radius: 12px;
          flex-shrink: 0;
        }
        .food-details { display: flex; flex-direction: column; flex-grow: 1; gap: 0.15rem; }
        .food-name    { font-weight: 700; font-size: 1rem; color: var(--text-main); }
        .food-desc    { font-size: 0.82rem; color: var(--text-muted); }
        .food-price   { font-weight: 700; color: var(--accent-gold); font-size: 0.92rem; margin-top: 0.15rem; }

        .food-counter {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          background: rgba(0,0,0,0.25);
          padding: 0.35rem 0.6rem;
          border-radius: 30px;
          border: 1px solid var(--glass-border);
          flex-shrink: 0;
        }
        .counter-btn {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: none;
          background: rgba(255,255,255,0.1);
          color: white;
          font-weight: bold;
          font-size: 1.1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
          line-height: 1;
        }
        .counter-btn:hover:not(:disabled) { background: var(--accent-gold); color: black; transform: scale(1.1); }
        .counter-btn:disabled  { opacity: 0.25; cursor: not-allowed; }
        .counter-value { font-weight: 700; font-size: 1rem; min-width: 20px; text-align: center; }

        /* MISC */
        .section-desc  { color: var(--text-muted); font-size: 0.88rem; margin: -0.3rem 0 1.2rem; }
        .access-denied { padding: 3rem; border-radius: 20px; text-align: center; margin-top: 2rem; }
        .access-denied p { color: var(--text-muted); margin: 1rem 0 1.5rem; }

        /* RESPONSIVE */
        @media (max-width: 968px) {
          .details-content, .booking-layout { grid-template-columns: 1fr; }
          nav { gap: 1rem; }
        }

        @media (max-width: 600px) {
          .nav-content { flex-direction: column; padding: 1rem 0; height: auto; gap: 1rem; }
          nav           { justify-content: center; }
          .hero h2      { font-size: 2rem; }
          .date-options, .time-options { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
};

export default App;