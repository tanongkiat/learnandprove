const express = require('express');
const session = require('express-session');
const path = require('node:path');

require('./db/connection'); // opens/creates the SQLite DB and applies schema
require('./db/seed'); // no-op if already seeded

const { attachUser, requireLogin } = require('./lib/auth');
const loginRoutes = require('./routes/login');
const homeRoutes = require('./routes/home');
const trainingRoutes = require('./routes/training');
const practiceRoutes = require('./routes/practice');
const mockRoutes = require('./routes/mock');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 4100;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'triamquest90-internal-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days — "easy login" for a small internal team
  })
);
app.use(attachUser);

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

app.use(loginRoutes);
app.use(requireLogin);

app.use('/', homeRoutes);
app.use('/training', trainingRoutes);
app.use('/practice', practiceRoutes);
app.use('/mock', mockRoutes);
app.use('/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).render('404', { title: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`TriamQuest 90 (MVP) running at http://localhost:${PORT}`);
});
