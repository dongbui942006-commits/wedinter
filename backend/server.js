const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const mockMovies = [
  {
    id: 1,
    title: "Interstellar",
    genre: "Khoa học viễn tưởng, Tâm lý",
    rating: 8.7,
    duration: "2 giờ 49 phút",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop",
    description: "Khi Trái Đất dần không còn phù hợp để sinh sống, một nhóm phi hành gia phải du hành qua hố đen để tìm kiếm hành tinh mới cho nhân loại.",
    price: 120000
  },
  {
    id: 2,
    title: "The Dark Knight",
    genre: "Hành động, Tội phạm",
    rating: 9.0,
    duration: "2 giờ 32 phút",
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=2070&auto=format&fit=crop",
    description: "Batman phải đối đầu với Joker, kẻ gieo rắc hỗn loạn khắp Gotham và đẩy anh vào thử thách lớn nhất về cả thể chất lẫn tinh thần.",
    price: 100000
  },
  {
    id: 3,
    title: "Avengers: Endgame",
    genre: "Siêu anh hùng, Hành động",
    rating: 8.4,
    duration: "3 giờ 1 phút",
    image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop",
    description: "Sau cú búng tay của Thanos, các Avengers còn sống sót phải tập hợp lại để đảo ngược thảm họa và cứu lấy vũ trụ.",
    price: 130000
  },
  {
    id: 4,
    title: "Spider-Man: No Way Home",
    genre: "Hành động, Phiêu lưu",
    rating: 8.2,
    duration: "2 giờ 28 phút",
    image: "https://images.unsplash.com/photo-1608889476561-6242cfdbf622?q=80&w=1974&auto=format&fit=crop",
    description: "Peter Parker phải đối mặt với hậu quả khi danh tính Spider-Man bị lộ và những rắc rối từ đa vũ trụ bắt đầu xuất hiện.",
    price: 115000
  },
  {
    id: 5,
    title: "Dune: Part Two",
    genre: "Khoa học viễn tưởng, Phiêu lưu",
    rating: 8.6,
    duration: "2 giờ 46 phút",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2070&auto=format&fit=crop",
    description: "Paul Atreides tiếp tục hành trình trên hành tinh Arrakis, nơi anh phải lựa chọn giữa tình yêu, định mệnh và tương lai của nhân loại.",
    price: 125000
  },
  {
    id: 6,
    title: "Your Name",
    genre: "Hoạt hình, Tình cảm",
    rating: 8.4,
    duration: "1 giờ 46 phút",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop",
    description: "Hai học sinh xa lạ bỗng nhiên hoán đổi cơ thể cho nhau và dần khám phá mối liên kết kỳ lạ vượt qua thời gian.",
    price: 90000
  },
  {
    id: 7,
    title: "Conan Movie 2026",
    genre: "Hoạt hình, Trinh thám",
    rating: 8.1,
    duration: "1 giờ 50 phút",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop",
    description: "Thám tử Conan tiếp tục phá giải một vụ án bí ẩn liên quan đến tổ chức nguy hiểm và những âm mưu được che giấu.",
    price: 95000
  },
  {
    id: 8,
    title: "Lật Mặt 8",
    genre: "Hành động, Gia đình",
    rating: 7.8,
    duration: "2 giờ 10 phút",
    image: "https://images.unsplash.com/photo-1517602302552-471fe67acf66?q=80&w=1974&auto=format&fit=crop",
    description: "Một câu chuyện kịch tính xoay quanh gia đình, tình thân và những biến cố bất ngờ khiến các nhân vật phải đối mặt với lựa chọn khó khăn.",
    price: 90000
  },
  {
    id: 9,
    title: "Godzilla x Kong",
    genre: "Quái vật, Hành động",
    rating: 7.2,
    duration: "1 giờ 55 phút",
    image: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=1974&auto=format&fit=crop",
    description: "Godzilla và Kong tiếp tục đối mặt với một thế lực khổng lồ mới đe dọa sự cân bằng giữa loài người và các Titan.",
    price: 120000
  }
];

app.get('/api/movies', (req, res) => {
  res.json(mockMovies);
});

app.get('/api/movies/:id', (req, res) => {
  const movieId = Number(req.params.id);

  const movie = mockMovies.find(item => item.id === movieId);

  if (!movie) {
    return res.status(404).json({
      message: 'Movie not found'
    });
  }

  res.json(movie);
});

app.post('/api/book', (req, res) => {
  const { movieId, seats, totalAmount } = req.body;

  console.log(
    `Booking confirmed for Movie ID ${movieId}: Seats [${seats.join(', ')}] - Total: ${totalAmount} VND`
  );

  res.json({
    success: true,
    message: "Booking successful!"
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});