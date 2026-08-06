const express = require('express');
const router = express.Router();
const db = require('../db/connection');

router.get('/login', (req, res) => {
  if (req.currentUser) return res.redirect('/');
  const users = db.prepare('SELECT id, name, role, pin FROM users ORDER BY role DESC, name').all();
  res.render('login', { title: 'Log in', users, error: req.query.error || null });
});

router.post('/login/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.redirect('/login?error=' + encodeURIComponent('User not found.'));

  if (user.pin) {
    if ((req.body.pin || '') !== user.pin) {
      return res.redirect('/login?error=' + encodeURIComponent(`Wrong PIN for ${user.name}.`));
    }
  }

  req.session.userId = user.id;
  res.redirect('/');
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;
