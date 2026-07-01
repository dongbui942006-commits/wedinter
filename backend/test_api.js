const http = require('http');

const bookingData = JSON.stringify({
  movie: 'Interstellar',
  movieId: 1,
  cinema: 'CGV Vincom',
  seats: ['A5', 'A6'],
  quantity: 2,
  totalAmount: 240000,
  email: 'customer@cineflow.com',
  customer_name: 'Nguyễn Văn A',
  phone: '0987654321',
  show_date: '2026-05-21',
  show_time: '19:30',
  note: 'Không có ghi chú'
});

// Gửi yêu cầu POST đặt vé
const postOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/bookings',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(bookingData)
  }
};

console.log('--- Đang test POST /api/bookings ---');
const postReq = http.request(postOptions, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('POST status:', res.statusCode);
    console.log('POST response:', body);

    // Sau khi đặt vé, gửi yêu cầu GET để lấy danh sách
    console.log('\n--- Đang test GET /api/bookings ---');
    http.get('http://localhost:5000/api/bookings', (getRes) => {
      let getBody = '';
      getRes.on('data', chunk => getBody += chunk);
      getRes.on('end', () => {
        console.log('GET status:', getRes.statusCode);
        try {
          const parsed = JSON.parse(getBody);
          console.log('Danh sách vé trong DB:');
          console.dir(parsed.data, { depth: null });
        } catch (e) {
          console.log('Phản hồi không phải JSON:', getBody);
        }
      });
    });
  });
});

postReq.on('error', (e) => {
  console.error('Lỗi kết nối tới server:', e.message);
});

postReq.write(bookingData);
postReq.end();
