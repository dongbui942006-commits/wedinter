const express = require('express');
const cors = require('cors');
require('dotenv').config();

let sql = null;
let poolPromise = null;

try {
  const db = require('./db');
  sql = db.sql;
  poolPromise = db.poolPromise;
  console.log('Đã kết nối file db.js');
} catch (error) {
  console.log('Không tìm thấy db.js, dùng dữ liệu mẫu');
}

const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function initDatabase() {
  if (!poolPromise || !sql) {
    console.log('Không có kết nối SQL Server, chạy chế độ mock data.');
    return;
  }

  try {
    const pool = await poolPromise;
    console.log('Đã kết nối SQL Server thành công. Đang đồng bộ hóa cấu trúc bảng...');

    // 1. Tạo bảng users
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
      BEGIN
          CREATE TABLE users (
              id INT IDENTITY(1,1) PRIMARY KEY,
              email VARCHAR(255) NOT NULL UNIQUE,
              password VARCHAR(255) NOT NULL,
              name NVARCHAR(255),
              phone VARCHAR(50),
              role VARCHAR(50) DEFAULT 'customer'
          );
      END
    `);
    console.log('Đã xác thực bảng [users]');

    // Tạo tài khoản admin mặc định nếu chưa có
    const adminCheck = await pool.request()
      .input('adminEmail', sql.VarChar, 'admin@cineflow.com')
      .query(`SELECT COUNT(*) AS count FROM users WHERE email = @adminEmail`);
    
    if (adminCheck.recordset[0].count === 0) {
      const adminPass = hashPassword('admin123');
      await pool.request()
        .input('email', sql.VarChar, 'admin@cineflow.com')
        .input('password', sql.VarChar, adminPass)
        .input('name', sql.NVarChar, 'Quản trị viên')
        .input('phone', sql.VarChar, '0999999999')
        .input('role', sql.VarChar, 'admin')
        .query(`
          INSERT INTO users (email, password, name, phone, role)
          VALUES (@email, @password, @name, @phone, @role)
        `);
      console.log('Đã tạo tài khoản admin mặc định: admin@cineflow.com / admin123');
    }

    // 2. Tạo bảng movies
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='movies' AND xtype='U')
      BEGIN
          CREATE TABLE movies (
              id INT IDENTITY(1,1) PRIMARY KEY,
              title NVARCHAR(255) NOT NULL,
              genre NVARCHAR(255),
              rating DECIMAL(3,1),
              duration NVARCHAR(100),
              image NVARCHAR(MAX),
              description NVARCHAR(MAX),
              price INT
          );
      END
    `);
    console.log('Đã xác thực bảng [movies]');

    // Cập nhật lại kho phim mẫu nếu số lượng trong DB ít hơn số lượng phim trong code
    const moviesCheck = await pool.request().query(`SELECT COUNT(*) AS count FROM movies`);
    if (moviesCheck.recordset[0].count < moviesMock.length) {
      console.log('Phát hiện có thêm phim mới. Đang đồng bộ phim vào database...');
      // Xóa dữ liệu cũ và reset ID
      await pool.request().query(`DELETE FROM movies; DBCC CHECKIDENT ('movies', RESEED, 0);`);
      for (const m of moviesMock) {
        await pool.request()
          .input('title', sql.NVarChar, m.title)
          .input('genre', sql.NVarChar, m.genre)
          .input('rating', sql.Decimal(3, 1), m.rating)
          .input('duration', sql.NVarChar, m.duration)
          .input('image', sql.NVarChar, m.image)
          .input('description', sql.NVarChar, m.description)
          .input('price', sql.Int, m.price)
          .query(`
            INSERT INTO movies (title, genre, rating, duration, image, description, price)
            VALUES (@title, @genre, @rating, @duration, @image, @description, @price)
          `);
      }
      console.log('Đã đồng bộ phim mẫu thành công.');
    }

    // 3. Tạo bảng bookings
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='bookings' AND xtype='U')
      BEGIN
          CREATE TABLE bookings (
              id INT IDENTITY(1,1) PRIMARY KEY,
              movie NVARCHAR(255) NOT NULL,
              movie_id INT,
              cinema NVARCHAR(255),
              seats NVARCHAR(MAX),
              quantity INT,
              total_amount INT,
              email VARCHAR(255),
              customer_name NVARCHAR(255),
              phone VARCHAR(50),
              show_date DATE,
              show_time VARCHAR(50),
              note NVARCHAR(MAX),
              status NVARCHAR(100) DEFAULT N'Đã đặt',
              payment_status NVARCHAR(100) DEFAULT N'Chưa thanh toán',
              qr_code VARCHAR(255),
              created_at DATETIME DEFAULT GETDATE()
          );
      END
    `);
    console.log('Đã xác thực bảng [bookings]');

  } catch (err) {
    console.error('Lỗi khi tự động khởi tạo cơ sở dữ liệu:', err.message);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const moviesMock = [
  {
    id: 1,
    title: 'Interstellar',
    genre: 'Khoa học viễn tưởng, Tâm lý',
    rating: 8.7,
    duration: '2 giờ 49 phút',
    image: '/images/m1.jpg',
    description: 'Khi Trái Đất dần không còn phù hợp để sinh sống, một nhóm phi hành gia phải du hành qua hố đen để tìm kiếm hành tinh mới cho nhân loại.',
    price: 120000
  },
  {
    id: 2,
    title: 'The Dark Knight',
    genre: 'Hành động, Tội phạm',
    rating: 9.0,
    duration: '2 giờ 32 phút',
    image: '/images/m2.jpg',
    description: 'Batman phải đối đầu với Joker, kẻ gieo rắc hỗn loạn khắp Gotham và đẩy anh vào thử thách lớn nhất.',
    price: 100000
  },
  {
    id: 3,
    title: 'Avengers: Endgame',
    genre: 'Siêu anh hùng, Hành động',
    rating: 8.4,
    duration: '3 giờ 1 phút',
    image: '/images/m3.jpg',
    description: 'Sau cú búng tay của Thanos, các Avengers còn sống sót phải tập hợp lại để cứu lấy vũ trụ.',
    price: 130000
  },
  {
    id: 4,
    title: 'Spider-Man: No Way Home',
    genre: 'Hành động, Phiêu lưu',
    rating: 8.2,
    duration: '2 giờ 28 phút',
    image: '/images/m4.jpg',
    description: 'Peter Parker phải đối mặt với hậu quả khi danh tính Spider-Man bị lộ và đa vũ trụ bắt đầu hỗn loạn.',
    price: 115000
  },
  {
    id: 5,
    title: 'Dune: Part Two',
    genre: 'Khoa học viễn tưởng, Phiêu lưu',
    rating: 8.6,
    duration: '2 giờ 46 phút',
    image: '/images/m5.jpg',
    description: 'Paul Atreides tiếp tục hành trình trên Arrakis, đối mặt với định mệnh và tương lai của nhân loại.',
    price: 125000
  },
  {
    id: 6,
    title: 'Oppenheimer',
    genre: 'Tiểu sử, Lịch sử',
    rating: 8.5,
    duration: '3 giờ',
    image: '/images/m6.jpg',
    description: 'Câu chuyện về J. Robert Oppenheimer và quá trình tạo ra quả bom nguyên tử đầu tiên.',
    price: 110000
  },
  {
    id: 7,
    title: 'Avatar: The Way of Water',
    genre: 'Hành động, Phiêu lưu, Khoa học viễn tưởng',
    rating: 7.6,
    duration: '3 giờ 12 phút',
    image: '/images/m7.jpg',
    description: 'Jake Sully sống cùng gia đình mới của mình trên hành tinh Pandora. Khi một mối đe dọa quen thuộc trở lại, anh phải hợp tác cùng Neytiri và đội quân người Na\'vi để bảo vệ hành tinh.',
    price: 135000
  },
  {
    id: 8,
    title: 'The Batman',
    genre: 'Hành động, Tội phạm, Chính kịch',
    rating: 7.8,
    duration: '2 giờ 56 phút',
    image: '/images/m8.jpg',
    description: 'Khi một kẻ giết người hàng loạt có nhắm vào giới tinh hoa của Gotham, Batman bị cuốn vào một cuộc điều tra đưa anh tới bóng tối của thành phố.',
    price: 110000
  },
  {
    id: 9,
    title: 'Top Gun: Maverick',
    genre: 'Hành động, Chính kịch',
    rating: 8.3,
    duration: '2 giờ 10 phút',
    image: '/images/m9.jpg',
    description: 'Sau hơn 30 năm phục vụ, Pete "Maverick" Mitchell phải đối mặt với bóng ma quá khứ của mình khi dẫn dắt các phi công tốt nghiệp cho một nhiệm vụ nguy hiểm.',
    price: 120000
  },
  {
    id: 10,
    title: 'Mission: Impossible - Dead Reckoning',
    genre: 'Hành động, Phiêu lưu',
    rating: 7.7,
    duration: '2 giờ 43 phút',
    image: '/images/m10.jpg',
    description: 'Ethan Hunt và nhóm IMF theo dõi một vũ khí nguy hiểm mới có khả năng đe dọa toàn nhân loại nếu rơi vào tay kẻ xấu.',
    price: 125000
  },
  {
    id: 11,
    title: 'John Wick: Chapter 4',
    genre: 'Hành động, Tội phạm, Giật gân',
    rating: 8.0,
    duration: '2 giờ 49 phút',
    image: '/images/m11.jpg',
    description: 'John Wick tìm ra cách đánh bại High Table. Nhưng trước khi có thể giành được tự do, anh phải đối đầu với một kẻ thù mới có liên minh hùng mạnh.',
    price: 115000
  },
  {
    id: 12,
    title: 'Fast X',
    genre: 'Hành động, Tội phạm',
    rating: 6.9,
    duration: '2 giờ 21 phút',
    image: '/images/m12.jpg',
    description: 'Dominic Toretto và gia đình phải đối mặt với đối thủ đáng sợ nhất từ trước đến nay, kẻ bị thúc đẩy bởi sự báo thù tàn nhẫn.',
    price: 100000
  },
  {
    id: 13,
    title: 'The Matrix',
    genre: 'Hành động, Khoa học viễn tưởng',
    rating: 8.7,
    duration: '2 giờ 16 phút',
    image: '/images/m13.jpg',
    description: 'Một hacker máy tính khám phá ra bản chất thực sự của thực tại và vai trò của anh trong cuộc chiến chống lại những cỗ máy điều khiển nó.',
    price: 110000
  },
  {
    id: 14,
    title: 'Gladiator',
    genre: 'Hành động, Phiêu lưu, Chính kịch',
    rating: 8.5,
    duration: '2 giờ 35 phút',
    image: '/images/m14.jpg',
    description: 'Một vị tướng La Mã bị phản bội, gia đình bị sát hại và trở thành đấu sĩ để tìm cách báo thù vị hoàng đế độc ác.',
    price: 115000
  },
  {
    id: 15,
    title: 'Inception',
    genre: 'Hành động, Khoa học viễn tưởng, Giật gân',
    rating: 8.8,
    duration: '2 giờ 28 phút',
    image: '/images/m15.jpg',
    description: 'Một tên trộm chuyên trộm cắp thông tin nhạy cảm thông qua việc xâm nhập vào tiềm thức của mục tiêu được giao nhiệm vụ cấy ghép ý tưởng.',
    price: 120000
  },
  {
    id: 16,
    title: 'The Shawshank Redemption',
    genre: 'Chính kịch',
    rating: 9.3,
    duration: '2 giờ 22 phút',
    image: '/images/m16.jpg',
    description: 'Một nhân viên ngân hàng bị kết án oan vì tội giết vợ và người tình của cô ta, phải làm quen với cuộc sống khắc nghiệt trong tù.',
    price: 100000
  },
  {
    id: 17,
    title: 'The Godfather',
    genre: 'Tội phạm, Chính kịch',
    rating: 9.2,
    duration: '2 giờ 55 phút',
    image: '/images/m17.jpg',
    description: 'Vị tộc trưởng già của một gia tộc tội phạm có tổ chức chuyển giao quyền điều hành thế giới ngầm cho người con trai út bất đắc dĩ của mình.',
    price: 110000
  },
  {
    id: 18,
    title: 'The Dark Knight Rises',
    genre: 'Hành động, Tội phạm',
    rating: 8.4,
    duration: '2 giờ 44 phút',
    image: '/images/m18.jpg',
    description: 'Tám năm sau sự kiện Joker, Batman phải trở lại để cứu Gotham từ tên khủng bố tàn bạo Bane.',
    price: 105000
  }
,
  {
    id: 19,
    title: 'The Lord of the Rings: The Return of the King',
    genre: 'Hành động, Phiêu lưu, Kỳ ảo',
    rating: 9.0,
    duration: '3 giờ 21 phút',
    image: '/images/m19.jpg',
    description: 'Trận chiến cuối cùng giành quyền kiểm soát Trung Địa bắt đầu.',
    price: 130000
  }
,
  {
    id: 20,
    title: 'Titanic',
    genre: 'Lãng mạn, Chính kịch',
    rating: 8.9,
    duration: '3 giờ 14 phút',
    image: '/images/m20.jpg',
    description: 'Một câu chuyện tình yêu bất diệt trên chuyến tàu định mệnh Titanic.',
    price: 150000
  }
];
let bookingsMock = [];

initDatabase();

app.get('/', (req, res) => {
  res.send('CineFlow backend is running');
});

app.get('/api/movies', async (req, res) => {
  console.log('--- Yêu cầu GET /api/movies ---');
  try {
    if (poolPromise && sql) {
      const pool = await poolPromise;
      console.log('Đang truy vấn phim từ SQL Server...');

      const result = await pool.request().query(`
        SELECT 
          id,
          title,
          genre,
          rating,
          duration,
          image,
          description,
          price
        FROM movies
        ORDER BY id DESC
      `);

      console.log(`Lấy thành công ${result.recordset.length} phim từ SQL Server.`);
      return res.json(result.recordset);
    }

    console.log('Không có kết nối SQL Server, đang dùng phim giả lập (mock)...');
    return res.json(moviesMock);
  } catch (err) {
    console.error('Lỗi khi truy vấn SQL Server, chuyển sang dùng phim giả lập (mock). Chi tiết lỗi:', err.message);
    return res.json(moviesMock);
  }
});

app.get('/api/movies/:id', async (req, res) => {
  const id = Number(req.params.id);

  try {
    if (poolPromise && sql) {
      const pool = await poolPromise;

      const result = await pool
        .request()
        .input('id', sql.Int, id)
        .query(`
          SELECT 
            id,
            title,
            genre,
            rating,
            duration,
            image,
            description,
            price
          FROM movies
          WHERE id = @id
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy phim'
        });
      }

      return res.json(result.recordset[0]);
    }

    const movie = moviesMock.find((item) => item.id === id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phim'
      });
    }

    return res.json(movie);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const {
      movie,
      movieId,
      cinema,
      seats,
      quantity,
      totalAmount,
      email,
      customer_name,
      phone,
      show_date,
      show_time,
      note
    } = req.body;

    if (!movie || !movieId || !cinema || !seats || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin đặt vé'
      });
    }

    if (!customer_name || !phone || !show_date || !show_time) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ họ tên, số điện thoại, ngày xem và giờ chiếu'
      });
    }

    const bookingData = {
      id: bookingsMock.length + 1,
      movie,
      movieId,
      cinema,
      seats,
      quantity,
      totalAmount,
      email,
      customer_name,
      phone,
      show_date,
      show_time,
      note: note || '',
      status: 'Đã đặt',
      payment_status: 'Chưa thanh toán',
      qr_code: `CINEFLOW-${Date.now()}`,
      created_at: new Date()
    };

    bookingsMock.push(bookingData);

    if (poolPromise && sql) {
      try {
        const pool = await poolPromise;

        const result = await pool
          .request()
          .input('movie', sql.NVarChar, movie)
          .input('movie_id', sql.Int, Number(movieId))
          .input('cinema', sql.NVarChar, cinema)
          .input('seats', sql.NVarChar, JSON.stringify(seats))
          .input('quantity', sql.Int, Number(quantity))
          .input('total_amount', sql.Int, Number(totalAmount))
          .input('email', sql.NVarChar, email || '')
          .input('customer_name', sql.NVarChar, customer_name)
          .input('phone', sql.NVarChar, phone)
          .input('show_date', sql.Date, show_date)
          .input('show_time', sql.NVarChar, show_time)
          .input('note', sql.NVarChar, note || '')
          .input('status', sql.NVarChar, 'Đã đặt')
          .input('payment_status', sql.NVarChar, 'Chưa thanh toán')
          .input('qr_code', sql.NVarChar, bookingData.qr_code)
          .query(`
            INSERT INTO bookings
            (
              movie,
              movie_id,
              cinema,
              seats,
              quantity,
              total_amount,
              email,
              customer_name,
              phone,
              show_date,
              show_time,
              note,
              status,
              payment_status,
              qr_code
            )
            OUTPUT INSERTED.id
            VALUES
            (
              @movie,
              @movie_id,
              @cinema,
              @seats,
              @quantity,
              @total_amount,
              @email,
              @customer_name,
              @phone,
              @show_date,
              @show_time,
              @note,
              @status,
              @payment_status,
              @qr_code
            )
          `);

        bookingData.id = result.recordset[0].id;
      } catch (dbError) {
        console.error('Không lưu được vào SQL Server, chỉ lưu tạm:', dbError.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Đặt vé thành công',
      data: bookingData
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi đặt vé',
      error: err.message
    });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    if (poolPromise && sql) {
      try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
          SELECT *
          FROM bookings
          ORDER BY id DESC
        `);

        // Chuẩn hóa dữ liệu seats (JSON string sang array) và show_date (Date sang string YYYY-MM-DD)
        const processedBookings = result.recordset.map(row => {
          let parsedSeats = row.seats;
          try {
            parsedSeats = JSON.parse(row.seats);
          } catch (e) {}

          let formattedDate = row.show_date;
          if (row.show_date instanceof Date) {
            formattedDate = row.show_date.toISOString().split('T')[0];
          } else if (row.show_date && typeof row.show_date === 'string' && row.show_date.includes('T')) {
            formattedDate = row.show_date.split('T')[0];
          }

          return {
            ...row,
            seats: parsedSeats,
            show_date: formattedDate
          };
        });

        return res.json({
          success: true,
          data: processedBookings
        });
      } catch (dbError) {
        console.error('Không lấy được bookings từ SQL Server:', dbError.message);
      }
    }

    return res.json({
      success: true,
      data: bookingsMock
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

app.get('/api/admin/stats', async (req, res) => {
  try {
    if (poolPromise && sql) {
      try {
        const pool = await poolPromise;

        const movieResult = await pool.request().query(`
          SELECT COUNT(*) AS totalMovies
          FROM movies
        `);

        const bookingResult = await pool.request().query(`
          SELECT 
            COUNT(*) AS totalBookings,
            ISNULL(SUM(quantity), 0) AS totalTickets,
            ISNULL(SUM(total_amount), 0) AS totalRevenue
          FROM bookings
        `);

        return res.json({
          success: true,
          data: {
            totalMovies: movieResult.recordset[0].totalMovies,
            totalBookings: bookingResult.recordset[0].totalBookings,
            totalTickets: bookingResult.recordset[0].totalTickets,
            totalRevenue: bookingResult.recordset[0].totalRevenue
          }
        });
      } catch (dbError) {
        console.error('Không lấy được thống kê từ SQL Server:', dbError.message);
      }
    }

    const totalTickets = bookingsMock.reduce((sum, item) => {
      return sum + Number(item.quantity || 0);
    }, 0);

    const totalRevenue = bookingsMock.reduce((sum, item) => {
      return sum + Number(item.totalAmount || item.total_amount || 0);
    }, 0);

    return res.json({
      success: true,
      data: {
        totalMovies: moviesMock.length,
        totalBookings: bookingsMock.length,
        totalTickets,
        totalRevenue
      }
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// ==========================================
// NEW API ENDPOINTS: AUTH, MOVIES CRUD, STAFF CRUD
// ==========================================

// Đăng ký tài khoản (POST /api/register)
app.post('/api/register', async (req, res) => {
  const { email, password, name, phone } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ email, mật khẩu và họ tên' });
  }

  try {
    const hashedPassword = hashPassword(password);

    if (poolPromise && sql) {
      const pool = await poolPromise;

      // Check if user exists
      const userCheck = await pool.request()
        .input('email', sql.VarChar, email)
        .query(`SELECT COUNT(*) AS count FROM users WHERE email = @email`);

      if (userCheck.recordset[0].count > 0) {
        return res.status(400).json({ success: false, message: 'Email này đã được sử dụng!' });
      }

      await pool.request()
        .input('email', sql.VarChar, email)
        .input('password', sql.VarChar, hashedPassword)
        .input('name', sql.NVarChar, name)
        .input('phone', sql.VarChar, phone || '')
        .input('role', sql.VarChar, 'customer')
        .query(`
          INSERT INTO users (email, password, name, phone, role)
          VALUES (@email, @password, @name, @phone, @role)
        `);

      return res.status(201).json({
        success: true,
        message: 'Đăng ký tài khoản thành công!',
        data: { email, name, role: 'customer' }
      });
    }

    // Mock fallback
    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công! (Chế độ giả lập)',
      data: { email, name, role: 'customer' }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Đăng nhập (POST /api/login)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập email và mật khẩu' });
  }

  try {
    const hashedPassword = hashPassword(password);

    if (poolPromise && sql) {
      const pool = await poolPromise;

      const result = await pool.request()
        .input('email', sql.VarChar, email)
        .input('password', sql.VarChar, hashedPassword)
        .query(`SELECT id, email, name, phone, role FROM users WHERE email = @email AND password = @password`);

      if (result.recordset.length === 0) {
        return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác' });
      }

      return res.json({
        success: true,
        message: 'Đăng nhập thành công!',
        data: result.recordset[0]
      });
    }

    // Mock fallback for testing
    if (email === 'admin@cineflow.com' && password === 'admin123') {
      return res.json({
        success: true,
        message: 'Đăng nhập thành công! (Chế độ giả lập)',
        data: { email, name: 'Quản trị viên', role: 'admin' }
      });
    }
    
    return res.json({
      success: true,
      message: 'Đăng nhập thành công! (Chế độ giả lập)',
      data: { email, name: 'Khách hàng giả lập', role: 'customer' }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Thêm phim mới (POST /api/movies)
app.post('/api/movies', async (req, res) => {
  const { title, genre, rating, duration, image, description, price } = req.body;
  if (!title || !genre || !price) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền tiêu đề, thể loại và giá vé' });
  }

  try {
    if (poolPromise && sql) {
      const pool = await poolPromise;

      const result = await pool.request()
        .input('title', sql.NVarChar, title)
        .input('genre', sql.NVarChar, genre)
        .input('rating', sql.Decimal(3, 1), Number(rating) || 8.0)
        .input('duration', sql.NVarChar, duration || '2 giờ')
        .input('image', sql.NVarChar, image || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1925&auto=format&fit=crop')
        .input('description', sql.NVarChar, description || '')
        .input('price', sql.Int, Number(price))
        .query(`
          INSERT INTO movies (title, genre, rating, duration, image, description, price)
          OUTPUT INSERTED.id
          VALUES (@title, @genre, @rating, @duration, @image, @description, @price)
        `);

      const newMovieId = result.recordset[0].id;
      return res.status(201).json({
        success: true,
        message: 'Thêm phim mới thành công!',
        data: { id: newMovieId, title, genre, rating, duration, image, description, price }
      });
    }

    // Mock Fallback
    const newMovie = {
      id: moviesMock.length + 1,
      title,
      genre,
      rating: Number(rating) || 8.0,
      duration: duration || '2 giờ',
      image: image || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1925&auto=format&fit=crop',
      description: description || '',
      price: Number(price)
    };
    moviesMock.push(newMovie);
    return res.status(201).json({ success: true, message: 'Thêm phim mới thành công (Chế độ giả lập)', data: newMovie });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Sửa phim (PUT /api/movies/:id)
app.put('/api/movies/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { title, genre, rating, duration, image, description, price } = req.body;

  if (!title || !genre || !price) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền tiêu đề, thể loại và giá vé' });
  }

  try {
    if (poolPromise && sql) {
      const pool = await poolPromise;

      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('title', sql.NVarChar, title)
        .input('genre', sql.NVarChar, genre)
        .input('rating', sql.Decimal(3, 1), Number(rating))
        .input('duration', sql.NVarChar, duration)
        .input('image', sql.NVarChar, image)
        .input('description', sql.NVarChar, description)
        .input('price', sql.Int, Number(price))
        .query(`
          UPDATE movies
          SET 
            title = @title,
            genre = @genre,
            rating = @rating,
            duration = @duration,
            image = @image,
            description = @description,
            price = @price
          WHERE id = @id
        `);

      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy phim để cập nhật' });
      }

      return res.json({
        success: true,
        message: 'Cập nhật phim thành công!',
        data: { id, title, genre, rating, duration, image, description, price }
      });
    }

    // Mock Fallback
    const movieIdx = moviesMock.findIndex(m => m.id === id);
    if (movieIdx === -1) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phim để cập nhật' });
    }

    moviesMock[movieIdx] = { id, title, genre, rating: Number(rating), duration, image, description, price: Number(price) };
    return res.json({ success: true, message: 'Cập nhật phim thành công (Chế độ giả lập)', data: moviesMock[movieIdx] });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Xóa phim (DELETE /api/movies/:id)
app.delete('/api/movies/:id', async (req, res) => {
  const id = Number(req.params.id);

  try {
    if (poolPromise && sql) {
      const pool = await poolPromise;

      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`DELETE FROM movies WHERE id = @id`);

      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy phim để xóa' });
      }

      return res.json({ success: true, message: 'Xóa phim thành công!' });
    }

    // Mock Fallback
    const movieIdx = moviesMock.findIndex(m => m.id === id);
    if (movieIdx === -1) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phim để xóa' });
    }

    moviesMock.splice(movieIdx, 1);
    return res.json({ success: true, message: 'Xóa phim thành công (Chế độ giả lập)' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Lấy danh sách nhân viên (GET /api/admin/staff)
app.get('/api/admin/staff', async (req, res) => {
  try {
    if (poolPromise && sql) {
      const pool = await poolPromise;
      const result = await pool.request().query(`
        SELECT id, email, name, phone, role
        FROM users
        WHERE role = 'staff'
        ORDER BY id DESC
      `);
      return res.json({ success: true, data: result.recordset });
    }

    // Mock Fallback
    const staffMock = [
      { id: 101, email: 'nv1@cineflow.com', name: 'Nguyễn Văn A', phone: '0987654321', role: 'staff' },
      { id: 102, email: 'nv2@cineflow.com', name: 'Trần Thị B', phone: '0912345678', role: 'staff' }
    ];
    return res.json({ success: true, data: staffMock });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Thêm nhân viên mới (POST /api/admin/staff)
app.post('/api/admin/staff', async (req, res) => {
  const { email, password, name, phone } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ email, mật khẩu và họ tên nhân viên' });
  }

  try {
    const hashedPassword = hashPassword(password);

    if (poolPromise && sql) {
      const pool = await poolPromise;

      // Check if user exists
      const userCheck = await pool.request()
        .input('email', sql.VarChar, email)
        .query(`SELECT COUNT(*) AS count FROM users WHERE email = @email`);

      if (userCheck.recordset[0].count > 0) {
        return res.status(400).json({ success: false, message: 'Email này đã được sử dụng!' });
      }

      const result = await pool.request()
        .input('email', sql.VarChar, email)
        .input('password', sql.VarChar, hashedPassword)
        .input('name', sql.NVarChar, name)
        .input('phone', sql.VarChar, phone || '')
        .input('role', sql.VarChar, 'staff')
        .query(`
          INSERT INTO users (email, password, name, phone, role)
          OUTPUT INSERTED.id
          VALUES (@email, @password, @name, @phone, @role)
        `);

      const newId = result.recordset[0].id;
      return res.status(201).json({
        success: true,
        message: 'Thêm tài khoản nhân viên thành công!',
        data: { id: newId, email, name, phone, role: 'staff' }
      });
    }

    // Mock Fallback
    const newStaff = { id: Date.now(), email, name, phone, role: 'staff' };
    return res.status(201).json({ success: true, message: 'Thêm tài khoản nhân viên thành công (Chế độ giả lập)', data: newStaff });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Cập nhật thông tin nhân viên (PUT /api/admin/staff/:id)
app.put('/api/admin/staff/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { name, phone, password } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp họ tên nhân viên' });
  }

  try {
    if (poolPromise && sql) {
      const pool = await poolPromise;

      let query = `
        UPDATE users
        SET name = @name, phone = @phone
      `;

      const request = pool.request()
        .input('id', sql.Int, id)
        .input('name', sql.NVarChar, name)
        .input('phone', sql.VarChar, phone || '');

      if (password) {
        const hashedPassword = hashPassword(password);
        request.input('password', sql.VarChar, hashedPassword);
        query += `, password = @password`;
      }

      query += ` WHERE id = @id AND role = 'staff'`;

      const result = await request.query(query);

      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên để cập nhật' });
      }

      return res.json({
        success: true,
        message: 'Cập nhật tài khoản nhân viên thành công!',
        data: { id, name, phone }
      });
    }

    // Mock Fallback
    return res.json({ success: true, message: 'Cập nhật tài khoản nhân viên thành công (Chế độ giả lập)', data: { id, name, phone } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Xóa nhân viên (DELETE /api/admin/staff/:id)
app.delete('/api/admin/staff/:id', async (req, res) => {
  const id = Number(req.params.id);

  try {
    if (poolPromise && sql) {
      const pool = await poolPromise;

      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`DELETE FROM users WHERE id = @id AND role = 'staff'`);

      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên để xóa' });
      }

      return res.json({ success: true, message: 'Xóa tài khoản nhân viên thành công!' });
    }

    // Mock Fallback
    return res.json({ success: true, message: 'Xóa tài khoản nhân viên thành công (Chế độ giả lập)' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});