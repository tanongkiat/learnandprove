// Deliberately minimal auth for a small internal team (spec: "internal use only",
// max ~10 people): pick your name, optional 4-digit PIN, long-lived session. No
// password hashing/MFA — this is about telling teammates apart, not defending
// against an outside attacker.
const db = require('../db/connection');

function attachUser(req, res, next) {
  req.currentUser = null;
  const userId = req.session && req.session.userId;
  if (userId) {
    req.currentUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) || null;
  }
  res.locals.currentUser = req.currentUser;
  next();
}

function requireLogin(req, res, next) {
  if (!req.currentUser) return res.redirect('/login');
  next();
}

function requireAdmin(req, res, next) {
  if (!req.currentUser) return res.redirect('/login');
  if (req.currentUser.role !== 'admin') {
    return res.status(403).render('404', { title: 'Not allowed' });
  }
  next();
}

module.exports = { attachUser, requireLogin, requireAdmin };
