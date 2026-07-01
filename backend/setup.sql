CREATE DATABASE IF NOT EXISTS cineflow_db;
USE cineflow_db;

CREATE TABLE IF NOT EXISTS movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(100),
    rating DECIMAL(3,1),
    duration VARCHAR(50),
    image TEXT,
    description TEXT,
    price INT
);
