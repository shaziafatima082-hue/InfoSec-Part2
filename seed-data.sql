-- Database Schema and Seed Data for Education Portal

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT,
    role TEXT
);

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    content TEXT
);

-- Seed Users
INSERT INTO users (username, password, role) VALUES ('admin', 'admin123', 'admin');
INSERT INTO users (username, password, role) VALUES ('student', 'student123', 'student');

-- Seed Comments
INSERT INTO comments (username, content) VALUES ('admin', 'Welcome to the Education Portal!');
