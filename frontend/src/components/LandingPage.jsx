import React from 'react';
import MovieCard from './MovieCard.jsx';

const LandingPage = ({ setView, movies, handleMovieClick }) => {
  return (
    <>
      <div className="landing-page">
        <div className="landing-bg"></div>
        <div className="landing-overlay"></div>
        
        <div className="landing-content">
          <h1 className="landing-title gradient-text">CineFlow</h1>
          <p className="landing-desc">
            Trải nghiệm điện ảnh đỉnh cao. Đặt vé dễ dàng, chọn ghế siêu tốc, thưởng thức phim không giới hạn.
          </p>
          
          <div className="landing-actions">
            <button 
              type="button" 
              className="btn btn-primary btn-glow"
              onClick={() => {
                const moviesSection = document.getElementById('movies-section');
                if(moviesSection) {
                  moviesSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                  setView('home');
                }
              }}
            >
              Khám Phá Phim Ngay
            </button>
            <button 
              type="button" 
              className="btn btn-outline btn-glow"
              style={{ borderColor: 'var(--accent-gold)', color: 'var(--accent-gold)' }}
              onClick={() => setView('login')}
            >
              Đăng Nhập
            </button>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <div className="feature-title">Đặt Vé Siêu Tốc</div>
              <div className="feature-text">Chỉ với 3 bước đơn giản, bạn đã có ngay vị trí đẹp nhất trong rạp.</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🍿</div>
              <div className="feature-title">Combo Ưu Đãi</div>
              <div className="feature-text">Tiết kiệm lên đến 20% khi mua kèm bắp nước trực tuyến.</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎬</div>
              <div className="feature-title">Phim Bom Tấn</div>
              <div className="feature-text">Cập nhật liên tục những tác phẩm điện ảnh hot nhất toàn cầu.</div>
            </div>
          </div>
        </div>
      </div>

      <div id="movies-section" style={{ marginTop: '4rem', paddingBottom: '4rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center', fontWeight: '800' }}>Phim Đang Chiếu</h2>
        <div className="movie-grid">
          {movies && movies.length > 0 ? (
            movies.map((m, i) => (
              <MovieCard key={m.id || i} movie={m} onClick={() => handleMovieClick(m)} />
            ))
          ) : (
            <p style={{ textAlign: 'center', width: '100%' }}>Không có phim nào hoặc đang tải...</p>
          )}
        </div>
      </div>
    </>
  );
};

export default LandingPage;
