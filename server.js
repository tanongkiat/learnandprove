const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const VIEWS = path.join(__dirname, 'views');

// Block any direct access to private file types
app.use((req, res, next) => {
  if (/\.(pdf|md)$/i.test(req.path)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
});

// Serve public static assets (CSS, JS, images)
app.use('/public', express.static(path.join(__dirname, 'public')));

// ── Routes ────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.sendFile(path.join(VIEWS, 'home.html')));

app.get('/training', (req, res) => res.sendFile(path.join(VIEWS, 'training.html')));
app.get('/training/study-plan',      (req, res) => res.sendFile(path.join(VIEWS, 'study-plan.html')));
app.get('/training/circle-problem',  (req, res) => res.sendFile(path.join(VIEWS, 'circle-problem.html')));
app.get('/training/drawing',         (req, res) => res.sendFile(path.join(VIEWS, 'drawing.html')));

app.get('/practice', (req, res) => res.sendFile(path.join(VIEWS, 'practice.html')));

app.get('/mockup', (req, res) => res.sendFile(path.join(VIEWS, 'mockup.html')));

// ── 404 ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).sendFile(path.join(VIEWS, '404.html'));
});

app.listen(PORT, () => {
  console.log(`LearnAndProve running at http://localhost:${PORT}`);
});
