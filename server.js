const express = require('express');
const path    = require('path');
const fs      = require('fs');

const app   = express();
const PORT  = process.env.PORT || 5000;
const VIEWS = path.join(__dirname, 'views');
const DRAWINGS_DIR = path.join(__dirname, 'public', 'drawings');

// Ensure drawings directory exists
if (!fs.existsSync(DRAWINGS_DIR)) fs.mkdirSync(DRAWINGS_DIR, { recursive: true });

// Block any direct access to private file types
app.use((req, res, next) => {
  if (/\.(pdf|md)$/i.test(req.path)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
});

// Serve public static assets (CSS, JS, images)
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '2mb' }));

// ── Drawing save / load ───────────────────────────────────────────────
function safeSlug(name) {
  return name.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 80) || 'drawing';
}

app.get('/api/drawings', (req, res) => {
  const files = fs.readdirSync(DRAWINGS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
  res.json(files);
});

app.post('/api/drawings/:name', (req, res) => {
  const slug = safeSlug(req.params.name);
  const filePath = path.join(DRAWINGS_DIR, slug + '.json');
  fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2) + '\n');
  res.json({ ok: true, name: slug });
});

app.get('/api/drawings/:name', (req, res) => {
  const slug = safeSlug(req.params.name);
  const filePath = path.join(DRAWINGS_DIR, slug + '.json');
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
  res.json(JSON.parse(fs.readFileSync(filePath, 'utf8')));
});

app.delete('/api/drawings/:name', (req, res) => {
  const slug = safeSlug(req.params.name);
  const filePath = path.join(DRAWINGS_DIR, slug + '.json');
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  res.json({ ok: true });
});

// ── Playback API ──────────────────────────────────────────────────────
const PLAYBACKS_DIR = path.join(__dirname, 'geom_playbacks_json');

app.get('/api/playbacks', (req, res) => {
  if (!fs.existsSync(PLAYBACKS_DIR)) return res.json([]);
  const files = fs.readdirSync(PLAYBACKS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
  res.json(files);
});

app.get('/api/playbacks/:name', (req, res) => {
  const name = req.params.name.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
  const filePath = path.join(PLAYBACKS_DIR, name + '.json');
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
  res.json(JSON.parse(fs.readFileSync(filePath, 'utf8')));
});

// ── Routes ────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.sendFile(path.join(VIEWS, 'home.html')));

app.get('/training', (req, res) => res.sendFile(path.join(VIEWS, 'training.html')));
app.get('/training/study-plan',      (req, res) => res.sendFile(path.join(VIEWS, 'study-plan.html')));
app.get('/training/circle-problem',  (req, res) => res.sendFile(path.join(VIEWS, 'circle-problem.html')));
app.get('/training/drawing',         (req, res) => res.sendFile(path.join(VIEWS, 'drawing.html')));
app.get('/circle-problem', (req, res) => res.redirect(302, '/training/circle-problem'));

app.get('/practice', (req, res) => res.sendFile(path.join(VIEWS, 'practice.html')));

app.get('/mockup', (req, res) => res.sendFile(path.join(VIEWS, 'mockup.html')));

// ── 404 ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).sendFile(path.join(VIEWS, '404.html'));
});

function startServer(port) {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`LearnAndProve running at http://0.0.0.0:${port}`);
    console.log(`Open http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && port < 3010) {
      console.warn(`Port ${port} is busy, trying ${port + 1}...`);
      server.close(() => startServer(port + 1));
      return;
    }

    console.error(err);
    process.exit(1);
  });
}

startServer(Number(process.env.PORT || 5000));
