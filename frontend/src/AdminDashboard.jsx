import React, { useEffect, useState } from 'react';

const API_URL = 'http://localhost:5000/api';

const AdminDashboard = ({ goHome, user }) => {
    const [activeTab, setActiveTab] = useState('stats');
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({
        totalMovies: 0,
        totalBookings: 0,
        totalTickets: 0,
        totalRevenue: 0,
    });

    const [bookings, setBookings] = useState([]);
    const [movies, setMovies] = useState([]);
    const [staffs, setStaffs] = useState([]);

    const [showMovieModal, setShowMovieModal] = useState(false);
    const [movieForm, setMovieForm] = useState({
        id: null,
        title: '',
        genre: '',
        rating: '',
        duration: '',
        image: '',
        description: '',
        price: '',
    });

    const [showStaffModal, setShowStaffModal] = useState(false);
    const [staffForm, setStaffForm] = useState({
        id: null,
        name: '',
        email: '',
        phone: '',
        password: '',
    });

    const safeArray = (data) => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.data)) return data.data;
        if (Array.isArray(data?.movies)) return data.movies;
        if (Array.isArray(data?.bookings)) return data.bookings;
        if (Array.isArray(data?.staffs)) return data.staffs;
        return [];
    };

    const cleanNumber = (value) => {
        if (value === null || value === undefined || value === '') return 0;

        if (typeof value === 'number') {
            return Number.isNaN(value) ? 0 : value;
        }

        const cleanValue = String(value).replace(/[^\d]/g, '');
        const numberValue = Number(cleanValue);

        return Number.isNaN(numberValue) ? 0 : numberValue;
    };

    const cleanPrice = (value) => {
        const price = cleanNumber(value);

        if (price > 0 && price < 1000) {
            return price * 1000;
        }

        return price;
    };

    const getSeatCount = (booking) => {
        if (Array.isArray(booking.seats)) {
            return booking.seats.length;
        }

        if (typeof booking.seats === 'string' && booking.seats.trim()) {
            return booking.seats.split(',').filter(Boolean).length;
        }

        return cleanNumber(booking.quantity || booking.ticketQuantity || booking.totalTickets);
    };

    const getBookingTotal = (booking) => {
        const directTotal = cleanNumber(
            booking.totalAmount ||
            booking.total_amount ||
            booking.totalPrice ||
            booking.total_price ||
            booking.amount ||
            booking.total
        );

        if (directTotal > 0) {
            return directTotal;
        }

        let ticketPrice = cleanPrice(
            booking.ticketPrice ||
            booking.ticket_price ||
            booking.price ||
            booking.moviePrice ||
            booking.movie_price
        );

        if (ticketPrice === 0) {
            ticketPrice = 80000;
        }

        const seatCount = getSeatCount(booking);

        return ticketPrice * seatCount;
    };

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/stats`);
            const data = await res.json();

            if (data?.success && data?.data) {
                setStats(data.data);
            } else if (data && typeof data === 'object') {
                setStats({
                    totalMovies: data.totalMovies || 0,
                    totalBookings: data.totalBookings || 0,
                    totalTickets: data.totalTickets || 0,
                    totalRevenue: data.totalRevenue || 0,
                });
            }
        } catch (error) {
            console.error('Lỗi tải thống kê:', error);
        }
    };

    const fetchBookings = async () => {
        try {
            const res = await fetch(`${API_URL}/bookings`);
            const data = await res.json();
            setBookings(safeArray(data));
        } catch (error) {
            console.error('Lỗi tải vé đặt:', error);
            setBookings([]);
        }
    };

    const fetchMovies = async () => {
        try {
            const res = await fetch(`${API_URL}/movies`);
            const data = await res.json();
            setMovies(safeArray(data));
        } catch (error) {
            console.error('Lỗi tải danh sách phim:', error);
            setMovies([]);
        }
    };

    const fetchStaffs = async () => {
        try {
            const res = await fetch(`${API_URL}/admin/staff`);
            const data = await res.json();
            setStaffs(safeArray(data));
        } catch (error) {
            console.error('Lỗi tải nhân viên:', error);
            setStaffs([]);
        }
    };

    const loadAllData = async () => {
        setLoading(true);

        await Promise.all([
            fetchStats(),
            fetchBookings(),
            fetchMovies(),
            user?.role === 'admin' ? fetchStaffs() : Promise.resolve(),
        ]);

        setLoading(false);
    };

    useEffect(() => {
        loadAllData();
    }, [user?.role]);

    const openAddMovie = () => {
        setMovieForm({
            id: null,
            title: '',
            genre: '',
            rating: '8.5',
            duration: '2 giờ',
            image: '',
            description: '',
            price: '100000',
        });

        setShowMovieModal(true);
    };

    const openEditMovie = (movie) => {
        setMovieForm({
            id: movie.id,
            title: movie.title || '',
            genre: movie.genre || '',
            rating: movie.rating || '8.5',
            duration: movie.duration || '',
            image: movie.image || '',
            description: movie.description || '',
            price: movie.price || '100000',
        });

        setShowMovieModal(true);
    };

    const handleMovieSubmit = async (e) => {
        e.preventDefault();

        if (!movieForm.title || !movieForm.genre || !movieForm.price) {
            alert('Vui lòng nhập đủ tên phim, thể loại và giá vé');
            return;
        }

        const url = movieForm.id
            ? `${API_URL}/movies/${movieForm.id}`
            : `${API_URL}/movies`;

        const method = movieForm.id ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...movieForm,
                    price: cleanPrice(movieForm.price),
                    rating: Number(movieForm.rating || 0),
                }),
            });

            const data = await res.json();

            if (data?.success === false) {
                alert(data.message || 'Thao tác thất bại');
                return;
            }

            alert(movieForm.id ? 'Cập nhật phim thành công' : 'Thêm phim thành công');
            setShowMovieModal(false);
            await fetchMovies();
            await fetchStats();
        } catch (error) {
            console.error('Lỗi lưu phim:', error);
            alert('Lỗi kết nối backend khi lưu phim');
        }
    };

    const handleDeleteMovie = async (id, title) => {
        if (!window.confirm(`Bạn có chắc muốn xóa phim "${title}" không?`)) {
            return;
        }

        try {
            const res = await fetch(`${API_URL}/movies/${id}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (data?.success === false) {
                alert(data.message || 'Xóa thất bại');
                return;
            }

            alert('Xóa phim thành công');
            await fetchMovies();
            await fetchStats();
        } catch (error) {
            console.error('Lỗi xóa phim:', error);
            alert('Lỗi kết nối backend khi xóa phim');
        }
    };

    const openAddStaff = () => {
        setStaffForm({
            id: null,
            name: '',
            email: '',
            phone: '',
            password: '',
        });

        setShowStaffModal(true);
    };

    const openEditStaff = (staff) => {
        setStaffForm({
            id: staff.id,
            name: staff.name || '',
            email: staff.email || '',
            phone: staff.phone || '',
            password: '',
        });

        setShowStaffModal(true);
    };

    const handleStaffSubmit = async (e) => {
        e.preventDefault();

        if (!staffForm.name || !staffForm.email) {
            alert('Vui lòng nhập họ tên và email nhân viên');
            return;
        }

        if (!staffForm.id && !staffForm.password) {
            alert('Vui lòng nhập mật khẩu cho nhân viên mới');
            return;
        }

        const url = staffForm.id
            ? `${API_URL}/admin/staff/${staffForm.id}`
            : `${API_URL}/admin/staff`;

        const method = staffForm.id ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(staffForm),
            });

            const data = await res.json();

            if (data?.success === false) {
                alert(data.message || 'Thao tác thất bại');
                return;
            }

            alert(staffForm.id ? 'Cập nhật nhân viên thành công' : 'Thêm nhân viên thành công');
            setShowStaffModal(false);
            await fetchStaffs();
        } catch (error) {
            console.error('Lỗi lưu nhân viên:', error);
            alert('Lỗi kết nối backend khi lưu nhân viên');
        }
    };

    const handleDeleteStaff = async (id, name) => {
        if (!window.confirm(`Bạn có chắc muốn xóa nhân viên "${name}" không?`)) {
            return;
        }

        try {
            const res = await fetch(`${API_URL}/admin/staff/${id}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (data?.success === false) {
                alert(data.message || 'Xóa thất bại');
                return;
            }

            alert('Xóa nhân viên thành công');
            await fetchStaffs();
        } catch (error) {
            console.error('Lỗi xóa nhân viên:', error);
            alert('Lỗi kết nối backend khi xóa nhân viên');
        }
    };

    const tabs = [
        {
            id: 'stats',
            label: '📊 Thống kê & Đặt vé',
            show: true,
        },
        {
            id: 'movies',
            label: '🎬 Quản lý phim',
            show: true,
        },
        {
            id: 'staff',
            label: '👥 Quản lý nhân viên',
            show: user?.role === 'admin',
        },
    ];

    if (loading) {
        return <div className="loading">Đang tải trang quản trị...</div>;
    }

    return (
        <section className="admin-dashboard animate-fade-in">
            <button className="btn btn-outline mb-2" onClick={goHome}>
                ← Quay lại trang chủ
            </button>

            <div className="admin-header glass">
                <h2>Trang quản trị CineFlow</h2>
                <p>
                    Chào mừng, <strong>{user?.name || user?.email || 'Admin'}</strong> (
                    {user?.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'})
                </p>
            </div>

            <div className="admin-tabs glass">
                {tabs
                    .filter((tab) => tab.show)
                    .map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            className={`tab-link ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
            </div>

            {activeTab === 'stats' && (
                <>
                    <div className="stats-grid animate-fade-in">
                        <div className="stat-card glass">
                            <span>Tổng phim</span>
                            <strong>{Number(stats.totalMovies || 0)}</strong>
                        </div>

                        <div className="stat-card glass">
                            <span>Lượt đặt vé</span>
                            <strong>{Number(stats.totalBookings || 0)}</strong>
                        </div>

                        <div className="stat-card glass">
                            <span>Số vé đã bán</span>
                            <strong>{Number(stats.totalTickets || 0)}</strong>
                        </div>

                        <div className="stat-card glass">
                            <span>Doanh thu</span>
                            <strong>{cleanNumber(stats.totalRevenue).toLocaleString('vi-VN')} VND</strong>
                        </div>
                    </div>

                    <div className="admin-table glass animate-fade-in">
                        <h3>Danh sách vé đã đặt</h3>

                        {bookings.length === 0 ? (
                            <p className="empty-text">Chưa có vé nào được đặt.</p>
                        ) : (
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Phim</th>
                                            <th>Rạp</th>
                                            <th>Khách hàng</th>
                                            <th>SĐT</th>
                                            <th>Ghế</th>
                                            <th>Ngày xem</th>
                                            <th>Giờ chiếu</th>
                                            <th>Tổng tiền</th>
                                            <th>Trạng thái</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {bookings.map((booking, index) => (
                                            <tr key={booking.id || index}>
                                                <td>{booking.id || index + 1}</td>
                                                <td>{booking.movie || booking.movieTitle || 'Không có'}</td>
                                                <td>{booking.cinema || 'Không có'}</td>
                                                <td>{booking.customer_name || booking.customerName || 'Không có'}</td>
                                                <td>{booking.phone || 'Không có'}</td>
                                                <td>
                                                    {Array.isArray(booking.seats)
                                                        ? booking.seats.join(', ')
                                                        : booking.seats || 'Không có'}
                                                </td>
                                                <td>{booking.show_date || booking.showDate || 'Không có'}</td>
                                                <td>{booking.show_time || booking.showTime || 'Không có'}</td>
                                                <td>{getBookingTotal(booking).toLocaleString('vi-VN')} VND</td>
                                                <td>
                                                    <span className="badge-status">
                                                        {booking.status || 'Đã đặt'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {activeTab === 'movies' && (
                <div className="admin-table glass animate-fade-in">
                    <div className="table-header">
                        <h3>Danh sách phim hiện tại</h3>

                        <button className="btn btn-primary" onClick={openAddMovie}>
                            ＋ Thêm phim mới
                        </button>
                    </div>

                    {movies.length === 0 ? (
                        <p className="empty-text">Chưa có phim nào trong database.</p>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Ảnh</th>
                                        <th>Tiêu đề</th>
                                        <th>Thể loại</th>
                                        <th>Đánh giá</th>
                                        <th>Thời lượng</th>
                                        <th>Giá vé</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {movies.map((movie, index) => (
                                        <tr key={movie.id || index}>
                                            <td>
                                                <img
                                                    src={
                                                        movie.image ||
                                                        'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=400'
                                                    }
                                                    alt={movie.title || 'movie'}
                                                    className="movie-thumbnail"
                                                    onError={(e) => {
                                                        e.currentTarget.src =
                                                            'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=400';
                                                    }}
                                                />
                                            </td>

                                            <td className="movie-title-cell">{movie.title || 'Không có'}</td>
                                            <td>{movie.genre || 'Không có'}</td>
                                            <td className="rating-cell">★ {movie.rating || 'N/A'}</td>
                                            <td>{movie.duration || 'Không có'}</td>
                                            <td>{cleanPrice(movie.price).toLocaleString('vi-VN')} VND</td>

                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn btn-outline btn-sm"
                                                        onClick={() => openEditMovie(movie)}
                                                    >
                                                        Sửa
                                                    </button>

                                                    <button
                                                        className="btn btn-outline btn-sm btn-delete"
                                                        onClick={() => handleDeleteMovie(movie.id, movie.title)}
                                                        disabled={!movie.id}
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'staff' && user?.role === 'admin' && (
                <div className="admin-table glass animate-fade-in">
                    <div className="table-header">
                        <h3>Quản lý danh sách nhân viên</h3>

                        <button className="btn btn-primary" onClick={openAddStaff}>
                            ＋ Thêm nhân viên
                        </button>
                    </div>

                    {staffs.length === 0 ? (
                        <p className="empty-text">Chưa có tài khoản nhân viên nào.</p>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Họ tên</th>
                                        <th>Email</th>
                                        <th>Số điện thoại</th>
                                        <th>Vai trò</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {staffs.map((staff, index) => (
                                        <tr key={staff.id || index}>
                                            <td>{staff.id || index + 1}</td>
                                            <td className="movie-title-cell">{staff.name || 'Không có'}</td>
                                            <td>{staff.email || 'Không có'}</td>
                                            <td>{staff.phone || 'Chưa cung cấp'}</td>
                                            <td>
                                                <span className="badge-role">{staff.role || 'staff'}</span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn btn-outline btn-sm"
                                                        onClick={() => openEditStaff(staff)}
                                                    >
                                                        Sửa
                                                    </button>

                                                    <button
                                                        className="btn btn-outline btn-sm btn-delete"
                                                        onClick={() => handleDeleteStaff(staff.id, staff.name)}
                                                        disabled={!staff.id}
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {showMovieModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass animate-fade-in">
                        <div className="modal-header">
                            <h3>{movieForm.id ? 'Cập nhật phim' : 'Thêm phim mới'}</h3>

                            <button
                                type="button"
                                className="close-btn"
                                onClick={() => setShowMovieModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleMovieSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Tiêu đề phim *</label>
                                    <input
                                        type="text"
                                        value={movieForm.title}
                                        onChange={(e) =>
                                            setMovieForm({ ...movieForm, title: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Thể loại *</label>
                                    <input
                                        type="text"
                                        value={movieForm.genre}
                                        onChange={(e) =>
                                            setMovieForm({ ...movieForm, genre: e.target.value })
                                        }
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Đánh giá</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="10"
                                        value={movieForm.rating}
                                        onChange={(e) =>
                                            setMovieForm({ ...movieForm, rating: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Thời lượng</label>
                                    <input
                                        type="text"
                                        value={movieForm.duration}
                                        onChange={(e) =>
                                            setMovieForm({ ...movieForm, duration: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Giá vé *</label>
                                    <input
                                        type="text"
                                        value={movieForm.price}
                                        onChange={(e) =>
                                            setMovieForm({ ...movieForm, price: e.target.value })
                                        }
                                        placeholder="Ví dụ: 100000 hoặc 100.000"
                                        required
                                    />
                                </div>

                                <div className="form-group span-2">
                                    <label>URL poster</label>
                                    <input
                                        type="text"
                                        value={movieForm.image}
                                        onChange={(e) =>
                                            setMovieForm({ ...movieForm, image: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="form-group span-2">
                                    <label>Mô tả phim</label>
                                    <textarea
                                        rows="4"
                                        value={movieForm.description}
                                        onChange={(e) =>
                                            setMovieForm({
                                                ...movieForm,
                                                description: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => setShowMovieModal(false)}
                                >
                                    Hủy
                                </button>

                                <button type="submit" className="btn btn-primary">
                                    Lưu phim
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showStaffModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass animate-fade-in small-modal">
                        <div className="modal-header">
                            <h3>{staffForm.id ? 'Cập nhật nhân viên' : 'Thêm nhân viên'}</h3>

                            <button
                                type="button"
                                className="close-btn"
                                onClick={() => setShowStaffModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleStaffSubmit}>
                            <div className="form-group">
                                <label>Họ tên *</label>
                                <input
                                    type="text"
                                    value={staffForm.name}
                                    onChange={(e) =>
                                        setStaffForm({ ...staffForm, name: e.target.value })
                                    }
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    value={staffForm.email}
                                    onChange={(e) =>
                                        setStaffForm({ ...staffForm, email: e.target.value })
                                    }
                                    required
                                    disabled={!!staffForm.id}
                                />
                            </div>

                            <div className="form-group">
                                <label>Số điện thoại</label>
                                <input
                                    type="tel"
                                    value={staffForm.phone}
                                    onChange={(e) =>
                                        setStaffForm({ ...staffForm, phone: e.target.value })
                                    }
                                />
                            </div>

                            <div className="form-group">
                                <label>{staffForm.id ? 'Mật khẩu mới' : 'Mật khẩu *'}</label>
                                <input
                                    type="password"
                                    value={staffForm.password}
                                    onChange={(e) =>
                                        setStaffForm({ ...staffForm, password: e.target.value })
                                    }
                                    required={!staffForm.id}
                                />
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => setShowStaffModal(false)}
                                >
                                    Hủy
                                </button>

                                <button type="submit" className="btn btn-primary">
                                    Lưu nhân viên
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .admin-dashboard {
                    padding: 2rem 0 4rem;
                }

                .admin-header {
                    padding: 2rem;
                    border-radius: 20px;
                    margin-bottom: 2rem;
                }

                .admin-header h2 {
                    font-size: 2rem;
                    margin-bottom: 0.8rem;
                }

                .admin-tabs {
                    display: flex;
                    gap: 1rem;
                    padding: 0.8rem;
                    border-radius: 16px;
                    margin-bottom: 2rem;
                    overflow-x: auto;
                }

                .tab-link {
                    background: transparent;
                    border: 1px solid transparent;
                    color: var(--text-muted);
                    font-weight: 600;
                    padding: 0.8rem 1.5rem;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: var(--transition);
                    font-size: 1rem;
                    white-space: nowrap;
                    font-family: inherit;
                }

                .tab-link:hover {
                    color: #000;
                    background: rgba(255, 193, 7, 0.75);
                }

                .tab-link.active {
                    color: #000 !important;
                    background: var(--accent-gold) !important;
                    border-color: var(--accent-gold);
                    font-weight: 800;
                    box-shadow: 0 0 18px rgba(255, 193, 7, 0.35);
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .stat-card {
                    padding: 1.5rem;
                    border-radius: 18px;
                    display: flex;
                    flex-direction: column;
                    gap: 0.7rem;
                }

                .stat-card span {
                    color: var(--text-muted);
                }

                .stat-card strong {
                    color: var(--accent-gold);
                    font-size: 1.8rem;
                }

                .admin-table {
                    padding: 2rem;
                    border-radius: 20px;
                }

                .table-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .table-wrapper {
                    overflow-x: auto;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    min-width: 950px;
                }

                th,
                td {
                    padding: 1rem;
                    text-align: left;
                    border-bottom: 1px solid var(--glass-border);
                    font-size: 0.9rem;
                    vertical-align: middle;
                }

                th {
                    color: var(--accent-gold);
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                }

                td {
                    color: var(--text-muted);
                }

                .movie-title-cell {
                    font-weight: 700;
                    color: white;
                }

                .rating-cell {
                    color: var(--accent-gold);
                    font-weight: 700;
                }

                .movie-thumbnail {
                    width: 50px;
                    height: 70px;
                    object-fit: cover;
                    border-radius: 6px;
                    border: 1px solid var(--glass-border);
                }

                .badge-status,
                .badge-role {
                    padding: 0.3rem 0.6rem;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .badge-status {
                    background: rgba(255, 193, 7, 0.15);
                    color: var(--accent-gold);
                    border: 1px solid rgba(255, 193, 7, 0.25);
                }

                .badge-role {
                    background: rgba(0, 123, 255, 0.15);
                    color: #4da3ff;
                    border: 1px solid rgba(0, 123, 255, 0.25);
                }

                .action-buttons {
                    display: flex;
                    gap: 0.5rem;
                }

                .btn-sm {
                    padding: 0.45rem 0.8rem;
                    font-size: 0.85rem;
                    border-radius: 8px;
                }

                .btn-delete:hover:not(:disabled) {
                    border-color: var(--accent-crimson);
                    color: var(--accent-crimson);
                }

                .empty-text {
                    color: var(--text-muted);
                    padding: 2rem 0;
                }

                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(8px);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    padding: 1.5rem;
                }

                .modal-content {
                    width: 100%;
                    max-width: 650px;
                    padding: 2rem;
                    border-radius: 20px;
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .small-modal {
                    max-width: 500px;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid var(--glass-border);
                    padding-bottom: 1rem;
                    margin-bottom: 1.5rem;
                }

                .modal-header h3 {
                    color: var(--accent-gold);
                }

                .close-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    font-size: 2rem;
                    cursor: pointer;
                    line-height: 1;
                }

                .close-btn:hover {
                    color: var(--accent-crimson);
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.2rem;
                }

                .span-2 {
                    grid-column: span 2;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                }

                .form-group label {
                    font-weight: 600;
                    color: var(--text-main);
                }

                .form-group input,
                .form-group textarea {
                    padding: 0.85rem;
                    border-radius: 10px;
                    border: 1px solid var(--glass-border);
                    background: var(--glass-bg);
                    color: white;
                    outline: none;
                    font-family: inherit;
                }

                .form-group input:focus,
                .form-group textarea:focus {
                    border-color: var(--accent-gold);
                }

                .form-group input:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    border-top: 1px solid var(--glass-border);
                    padding-top: 1.2rem;
                    margin-top: 1.5rem;
                }

                @media (max-width: 968px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 600px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }

                    .form-grid {
                        grid-template-columns: 1fr;
                    }

                    .span-2 {
                        grid-column: span 1;
                    }

                    .modal-footer {
                        flex-direction: column;
                    }
                }
            `}</style>
        </section>
    );
};

export default AdminDashboard;