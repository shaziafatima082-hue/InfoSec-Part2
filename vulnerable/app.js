const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.set('view engine', 'ejs');

const db = new sqlite3.Database('./database.db');

// Middleware to check if logged in
const checkAuth = (req, res, next) => {
    if (req.session.user) return next();
    res.redirect('/login');
};

app.get('/', (req, res) => res.redirect('/login'));

// --- LOGIN (SQL Injection Easy) ---
app.get('/login', (req, res) => res.render('login'));
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // VULNERABLE TO SQL INJECTION
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    db.get(query, (err, row) => {
        if (row) {
            req.session.user = row;
            res.redirect('/dashboard');
        } else {
            res.send('Invalid credentials. <a href="/login">Try again</a>');
        }
    });
});

// --- DASHBOARD ---
app.get('/dashboard', checkAuth, (req, res) => {
    res.render('dashboard', { user: req.session.user });
});

// --- REFLECTED XSS ---
app.get('/welcome', (req, res) => {
    const name = req.query.name || 'Guest';
    // VULNERABLE TO REFLECTED XSS (res.send does not escape)
    res.send(`<h1>Welcome ${name}!</h1><a href="/dashboard">Back to Dashboard</a>`);
});

// --- STORED XSS (Comments) ---
app.get('/comments', (req, res) => {
    db.all('SELECT * FROM comments', [], (err, rows) => {
        res.render('comments', { comments: rows });
    });
});
app.post('/comments', checkAuth, (req, res) => {
    const { content } = req.body;
    // VULNERABLE TO STORED XSS (no sanitization)
    db.run(`INSERT INTO comments (username, content) VALUES ('${req.session.user.username}', '${content}')`, () => {
        res.redirect('/comments');
    });
});

// --- DOM-BASED XSS ---
app.get('/dom-xss', (req, res) => {
    res.render('dom-xss');
});

// --- CSRF (Update Profile) ---
app.get('/profile', checkAuth, (req, res) => {
    res.render('profile', { user: req.session.user });
});
app.post('/update-profile', checkAuth, (req, res) => {
    const { email } = req.body;
    // VULNERABLE TO CSRF (no token check)
    req.session.user.email = email;
    res.send('Profile updated successfully! <a href="/dashboard">Back</a>');
});

// --- SQL INJECTION (Advanced) - Search ---
app.get('/search', checkAuth, (req, res) => {
    res.render('search', { results: null });
});
app.post('/search', checkAuth, (req, res) => {
    const { q } = req.body;
    // VULNERABLE TO SQL INJECTION
    const query = `SELECT id, username, role FROM users WHERE username LIKE '%${q}%'`;
    db.all(query, [], (err, rows) => {
        if (err) return res.send("Error: " + err.message);
        res.render('search', { results: rows });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
