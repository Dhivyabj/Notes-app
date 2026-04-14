const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5000;
const SECRET = 'secretkey';

app.use(cors());
app.use(bodyParser.json());

// Database setup
const db = new sqlite3.Database('./notes.db', (err) => {
  if (err) console.error('DB connection error:', err.message);
  else console.log('Connected to SQLite database.');
});

// Tables
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  content TEXT,
  tags TEXT,
  user_id INTEGER
)`);

db.run(`CREATE TABLE IF NOT EXISTS note_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  note_id INTEGER,
  title TEXT,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`);

// Middleware: auth
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token' });

  const token = authHeader.split(' ')[1]; // get the part after "Bearer"
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.userId = decoded.id;
    next();
  });
}


// Auth APIs
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashed], function(err) {
    if (err) return res.status(400).json({ error: 'User exists' });
    res.json({ id: this.lastID, username });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id }, SECRET);
    res.json({ token });
  });
});

// Notes APIs
app.get('/notes', authenticate, (req, res) => {
  const { page = 1, limit = 5 } = req.query;
  const offset = (page - 1) * limit;
  db.all('SELECT * FROM notes WHERE user_id = ? ORDER BY id DESC LIMIT ? OFFSET ?', [req.userId, limit, offset], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/notes', authenticate, (req, res) => {
  const { title, content, tags } = req.body;
  db.run('INSERT INTO notes (title, content, tags, user_id) VALUES (?, ?, ?, ?)', [title, content, tags, req.userId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, title, content, tags });
  });
});

app.put('/notes/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { title, content, tags } = req.body;
  db.run('UPDATE notes SET title = ?, content = ?, tags = ? WHERE id = ? AND user_id = ?', [title, content, tags, id, req.userId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    db.run('INSERT INTO note_versions (note_id, title, content) VALUES (?, ?, ?)', [id, title, content]);
    res.json({ updated: this.changes });
  });
});

app.delete('/notes/:id', authenticate, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM notes WHERE id = ? AND user_id = ?', [id, req.userId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});

// Search
app.get('/search', authenticate, (req, res) => {
  const { q } = req.query;
  db.all('SELECT * FROM notes WHERE user_id = ? AND (title LIKE ? OR content LIKE ?)', [req.userId, `%${q}%`, `%${q}%`], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Versions
app.get('/note_versions/:id', authenticate, (req, res) => {
  const { id } = req.params;
  db.all('SELECT * FROM note_versions WHERE note_id = ?', [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
