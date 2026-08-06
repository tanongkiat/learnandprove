const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { todayStr } = require('../lib/adaptive');

router.get('/', (req, res) => {
  const userId = req.currentUser.id;
  const profile = db.prepare('SELECT * FROM student_profile WHERE user_id = ?').get(userId);
  const start = new Date(profile.start_date);
  const today = new Date(todayStr());
  const dayNumber = Math.min(90, Math.max(1, Math.round((today - start) / 86400000) + 1));

  const masteryRow = db
    .prepare('SELECT AVG(mastery) AS avg FROM student_skill_mastery WHERE user_id = ?')
    .get(userId);
  const avgMastery = masteryRow.avg || 0;
  const expectedScore = Math.round(50 + avgMastery * 50);

  const dueCount = db
    .prepare(
      "SELECT COUNT(*) AS c FROM student_word_state WHERE user_id = ? AND next_review_at IS NOT NULL AND next_review_at <= date('now')"
    )
    .get(userId).c;

  const vocabCount = db.prepare('SELECT COUNT(*) AS c FROM vocabulary_entries').get().c;
  const questionCount = db.prepare('SELECT COUNT(*) AS c FROM questions').get().c;
  const errorCount = db
    .prepare('SELECT COUNT(*) AS c FROM error_notebook WHERE user_id = ? AND resolved = 0')
    .get(userId).c;

  res.render('home', {
    title: 'Home',
    profile,
    dayNumber,
    expectedScore,
    dueCount,
    vocabCount,
    questionCount,
    errorCount,
  });
});

router.get('/skill-map', (req, res) => {
  const skills = db
    .prepare(
      `SELECT sk.id, sk.name, sk.category, COALESCE(m.mastery, 0) AS mastery,
              COALESCE(m.attempt_count, 0) AS attempt_count, m.next_review_at
         FROM skills sk
         LEFT JOIN student_skill_mastery m ON m.skill_id = sk.id AND m.user_id = ?
        ORDER BY sk.category, sk.name`
    )
    .all(req.currentUser.id);
  res.render('skill-map', { title: 'Skill Map', skills });
});

router.get('/error-notebook', (req, res) => {
  const errors = db
    .prepare(
      `SELECT e.id, e.created_at, e.resolved, q.prompt, q.explanation, sk.name AS skill_name
         FROM error_notebook e
         JOIN questions q ON q.id = e.question_id
         JOIN skills sk ON sk.id = e.skill_id
        WHERE e.user_id = ?
        ORDER BY e.created_at DESC
        LIMIT 50`
    )
    .all(req.currentUser.id);
  res.render('error-notebook', { title: 'Error Notebook', errors });
});

router.post('/error-notebook/:id/resolve', (req, res) => {
  db.prepare('UPDATE error_notebook SET resolved = 1 WHERE id = ? AND user_id = ?').run(
    req.params.id,
    req.currentUser.id
  );
  res.redirect('/error-notebook');
});

module.exports = router;
