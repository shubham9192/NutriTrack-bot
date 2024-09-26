const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Initialize the SQLite database
const db = new sqlite3.Database('./mydatabase.db', (err) => {
    if (err) {
        console.error('Could not connect to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes

// Home page (Login)
app.get('/', (req, res) => {
    res.render('login', { message: null });
});

// Sign-up page
app.get('/signup', (req, res) => {
    res.render('signup', { message: null });
});

// Sign-up form submission
app.post('/signup', (req, res) => {
    const { name, email, password, height, weight } = req.body;

    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert new user into the database
    db.run('INSERT INTO users (name, email, password, height, weight) VALUES (?, ?, ?, ?, ?)', [name, email, hashedPassword, height, weight], function(err) {
        if (err) {
            console.error('Error inserting data:', err.message);
            return res.render('signup', { message: 'Email already exists!' });
        }
        res.redirect('/');
    });
});

// Login form submission
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Check if user exists in the database
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) {
            console.error('Error querying database:', err.message);
            return res.render('login', { message: 'An error occurred. Please try again later.' });
        }

        if (user && bcrypt.compareSync(password, user.password)) {
            // Password is correct
            res.render('dashboard', { name: user.name });
        } else {
            // Invalid credentials
            res.render('login', { message: 'Invalid email or password!' });
        }
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
