const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

db.serialize(() => {
    // Users table for login and SQL injection testing
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        password TEXT,
        role TEXT
    )`);

    // Comments table for Stored XSS testing
    db.run(`CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        content TEXT
    )`);

    // Seed data (test users and a comment)
    db.run(`INSERT INTO users (username, password, role) VALUES ('admin', 'admin123', 'admin')`);
    db.run(`INSERT INTO users (username, password, role) VALUES ('student', 'student123', 'student')`);
    db.run(`INSERT INTO comments (username, content) VALUES ('admin', 'Welcome to the Education Portal!')`);
    
    console.log("Database setup complete. Tables created and seeded.");
});

db.close();
