const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const crypto = require('crypto'); // For CSRF tokens
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.set('view engine', 'ejs');

const db = new sqlite3.Database('./database.db');

// --- CSRF TOKEN MIDDLEWARE ---
app.use((req, res, next) => {
    if (!req.session.csrfToken) {
        req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    }
    res.locals.csrfToken = req.session.csrfToken;
    next();
});

const checkAuth = (req, res, next) => {
    if (req.session.user) return next();
    res.redirect('/login');
};

// --- CSRF VALIDATION MIDDLEWARE ---
const checkCSRF = (req, res, next) => {
    const token = req.body.csrfToken || req.query.csrfToken;
    if (token === req.session.csrfToken) return next();
    res.status(403).send('CSRF Token Validation Failed. Attack Blocked!');
};

// --- XSS ESCAPING FUNCTION ---
const escapeHtml = (text) => {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
};

app.get('/', (req, res) => res.redirect('/login'));

// --- LOGIN (SQLi FIXED - Parameterized Query) ---
app.get('/login', (req, res) => res.render('login'));
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // FIXED: Using ? placeholders
    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
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

// --- REFLECTED XSS FIXED ---
app.get('/welcome', (req, res) => {
    const name = req.query.name || 'Guest';
    // FIXED: Escaping HTML characters
    res.send(`<h1>Welcome ${escapeHtml(name)}!</h1><a href="/dashboard">Back to Dashboard</a>`);
});

// --- STORED XSS (Frontend fixed in comments.ejs, backend fixed using parameterized query) ---
app.get('/comments', (req, res) => {
    db.all('SELECT * FROM comments', [], (err, rows) => {
        res.render('comments', { comments: rows });
    });
});
app.post('/comments', checkAuth, checkCSRF, (req, res) => {
    const { content } = req.body;
    // FIXED: Parameterized query prevents SQLi
    db.run('INSERT INTO comments (username, content) VALUES (?, ?)', [req.session.user.username, content], () => {
        res.redirect('/comments');
    });
});

// --- DOM-BASED XSS FIXED ---
app.get('/dom-xss', (req, res) => {
    res.render('dom-xss'); // We will update the ejs file next
});

// --- CSRF FIXED ---
app.get('/profile', checkAuth, (req, res) => {
    res.render('profile', { user: req.session.user });
});
app.post('/update-profile', checkAuth, checkCSRF, (req, res) => {
    const { email } = req.body;
    req.session.user.email = email;
    res.send('Profile updated successfully! <a href="/dashboard">Back</a>');
});

// --- SQL INJECTION ADVANCED FIXED ---
app.get('/search', checkAuth, (req, res) => {
    res.render('search', { results: null });
});
app.post('/search', checkAuth, (req, res) => {
    const { q } = req.body;
    // FIXED: Parameterized query
    db.all('SELECT id, username, role FROM users WHERE username LIKE ?', [`%${q}%`], (err, rows) => {
        if (err) return res.send("Error occurred.");
        res.render('search', { results: rows });
    });
});

app.listen(port, () => {
    console.log(`Safe Server running at http://localhost:${port}`);
});
