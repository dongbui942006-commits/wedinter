import React, { useState } from 'react';

const Login = ({ setUser, setView, goHome }) => {
    const [activeTab, setActiveTab] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const resetPasswordFields = () => {
        setPassword('');
        setConfirmPassword('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            alert('Vui lòng nhập đầy đủ email và mật khẩu');
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password: password.trim(),
                }),
            });

            const result = await res.json();

            if (result.success === false) {
                alert(result.message || 'Đăng nhập thất bại');
                return;
            }

            const userData = result.data || result.user || result;

            const loggedUser = {
                id: userData.id || Date.now(),
                name: userData.name || email.split('@')[0],
                email: userData.email || email,
                phone: userData.phone || '',
                role: userData.role || 'customer',
            };

            setUser(loggedUser);
            alert(`Chào mừng ${loggedUser.name} quay lại!`);
            setView('home');
        } catch (error) {
            console.error('Lỗi đăng nhập:', error);

            const mockUser = {
                id: Date.now(),
                email: email.trim(),
                name: email.split('@')[0],
                phone: '',
                role: email.toLowerCase().includes('admin') ? 'admin' : 'customer',
            };

            setUser(mockUser);
            alert('Không kết nối được backend. Đã đăng nhập chế độ giả lập.');
            setView('home');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!name.trim() || !email.trim() || !password.trim()) {
            alert('Vui lòng nhập đầy đủ họ tên, email và mật khẩu');
            return;
        }

        if (password !== confirmPassword) {
            alert('Mật khẩu xác nhận không khớp');
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    password: password.trim(),
                    phone: phone.trim(),
                }),
            });

            const result = await res.json();

            if (result.success === false) {
                alert(result.message || 'Đăng ký thất bại');
                return;
            }

            alert('Đăng ký tài khoản thành công! Hãy đăng nhập lại.');
            setActiveTab('login');
            resetPasswordFields();
        } catch (error) {
            console.error('Lỗi đăng ký:', error);
            alert('Không thể kết nối đến máy chủ để đăng ký.');
        }
    };

    return (
        <section className="login-section animate-fade-in">
            <button className="btn btn-outline mb-2" onClick={goHome}>
                ← Quay lại trang chủ
            </button>

            <div className="login-box glass">
                <div className="tab-header">
                    <button
                        type="button"
                        className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('login');
                            resetPasswordFields();
                        }}
                    >
                        Đăng nhập
                    </button>

                    <button
                        type="button"
                        className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('register');
                            resetPasswordFields();
                        }}
                    >
                        Đăng ký
                    </button>
                </div>

                {activeTab === 'login' ? (
                    <form onSubmit={handleLogin} className="animate-fade-in">
                        <h3>Chào mừng quay lại</h3>
                        <p className="subtitle">
                            Đăng nhập để đặt vé và quản lý lịch chiếu.
                        </p>

                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="Nhập email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Mật khẩu</label>
                            <input
                                type="password"
                                placeholder="Nhập mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button className="btn btn-primary btn-full" type="submit">
                            Đăng nhập
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRegister} className="animate-fade-in">
                        <h3>Đăng ký tài khoản</h3>
                        <p className="subtitle">
                            Tạo tài khoản mới để nhận nhiều ưu đãi và quản lý vé đặt.
                        </p>

                        <div className="form-group">
                            <label>Họ và tên *</label>
                            <input
                                type="text"
                                placeholder="Nhập họ và tên"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Email *</label>
                            <input
                                type="email"
                                placeholder="Nhập email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Số điện thoại</label>
                            <input
                                type="tel"
                                placeholder="Nhập số điện thoại"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Mật khẩu *</label>
                            <input
                                type="password"
                                placeholder="Tạo mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Xác nhận mật khẩu *</label>
                            <input
                                type="password"
                                placeholder="Nhập lại mật khẩu"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button className="btn btn-primary btn-full" type="submit">
                            Đăng ký ngay
                        </button>
                    </form>
                )}

                <div className="login-note">
                    <p>
                        💡 Gợi ý kiểm thử:
                        <br />
                        Admin: admin@cineflow.com / admin123
                    </p>
                </div>
            </div>

            <style>{`
        .login-section {
          padding: 2rem 0;
        }

        .login-box {
          max-width: 480px;
          margin: 0 auto;
          padding: 2.5rem;
          border-radius: 20px;
        }

        .tab-header {
          display: flex;
          border-bottom: 1px solid var(--glass-border);
          margin-bottom: 2rem;
          gap: 1rem;
        }

        .tab-btn {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 1.1rem;
          font-weight: 600;
          padding: 0.8rem;
          cursor: pointer;
          transition: var(--transition);
          position: relative;
          font-family: inherit;
        }

        .tab-btn.active {
          color: var(--accent-gold);
        }

        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--accent-gold);
          box-shadow: 0 0 10px var(--accent-gold);
        }

        .login-box h3 {
          font-size: 1.6rem;
          margin-bottom: 0.3rem;
        }

        .subtitle {
          color: var(--text-muted);
          font-size: 0.95rem;
          margin-bottom: 2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.3rem;
          text-align: left;
        }

        .form-group label {
          font-weight: 600;
          font-size: 0.95rem;
        }

        .form-group input {
          padding: 0.9rem 1rem;
          border-radius: 10px;
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          color: white;
          outline: none;
          font-size: 1rem;
          transition: var(--transition);
        }

        .form-group input:focus {
          border-color: var(--accent-gold);
          box-shadow: 0 0 8px rgba(255, 193, 7, 0.2);
        }

        .form-group input::placeholder {
          color: #888;
        }

        .btn-full {
          width: 100%;
          justify-content: center;
          margin-top: 1.5rem;
          padding: 1rem;
          font-size: 1.05rem;
        }

        .login-note {
          margin-top: 2rem;
          background: rgba(255, 255, 255, 0.04);
          padding: 1rem;
          border-radius: 10px;
          border: 1px dashed var(--glass-border);
        }

        .login-note p {
          font-size: 0.85rem;
          line-height: 1.6;
          color: var(--text-muted);
          margin: 0;
        }
      `}</style>
        </section>
    );
};

export default Login;