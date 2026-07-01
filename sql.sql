USE master;
GO

-- Nếu database đã tồn tại thì xóa database cũ
IF DB_ID('cineflow_db') IS NOT NULL
BEGIN
    ALTER DATABASE cineflow_db SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE cineflow_db;
END
GO

-- Tạo database mới
CREATE DATABASE cineflow_db;
GO

USE cineflow_db;
GO

-- Tạo bảng movies
CREATE TABLE dbo.movies (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    genre NVARCHAR(255),
    rating DECIMAL(3,1),
    duration NVARCHAR(100),
    image NVARCHAR(MAX),
    description NVARCHAR(MAX),
    price INT
);
GO

-- Tạo bảng users
CREATE TABLE dbo.users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name NVARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'customer'
);
GO

-- Tạo bảng bookings
CREATE TABLE dbo.bookings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    movie NVARCHAR(255) NOT NULL,
    movie_id INT NULL,
    show_date DATE NOT NULL,
    show_time NVARCHAR(20) NOT NULL,
    cinema NVARCHAR(255) NOT NULL,
    seats NVARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    customer_name NVARCHAR(255) NOT NULL,
    phone NVARCHAR(20) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    note NVARCHAR(MAX),
    total INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- Kiểm tra bảng
SELECT * FROM dbo.movies;
SELECT * FROM dbo.users;
SELECT * FROM dbo.bookings;
GO