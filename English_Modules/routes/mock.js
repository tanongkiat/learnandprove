const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { loadQuestionsByIds, gradeAndRecordSession } = require('../lib/sessionEngine');
const { parseSubmission, shuffle } = require('../lib/formParsing');

const MINI_MOCK_SIZE = 10;

router.get('/', (req, res) => {
  const history = db
    .prepare('SELECT * FROM mock_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10')
    .all(req.currentUser.id);
  res.render('mock/index', { title: 'Mock Exam', history });
});

router.get('/start', (req, res) => {
  const ids = db
    .prepare("SELECT id FROM questions WHERE status = 'PUBLISHED'")
    .all()
    .map((r) => r.id);
  const chosenIds = shuffle(ids).slice(0, MINI_MOCK_SIZE);
  const questionSet = loadQuestionsByIds(db, chosenIds).map((qo) => ({
    question: qo.question,
    options: shuffle(qo.options),
  }));
  res.render('mock/session', { title: 'Mini Mock', questionSet });
});

router.post('/submit', (req, res) => {
  const idsRaw = req.body.questionIds || [];
  const questionIds = (Array.isArray(idsRaw) ? idsRaw : [idsRaw]).map(Number);
  const loaded = loadQuestionsByIds(db, questionIds);

  const entries = loaded.map((qo) => ({
    questionId: qo.question.id,
    submitted: parseSubmission(qo.question, qo.options, req.body),
  }));

  const summary = gradeAndRecordSession(db, req.currentUser.id, 'mock', entries);

  db.prepare('INSERT INTO mock_sessions (user_id, type, total, correct) VALUES (?, ?, ?, ?)').run(
    req.currentUser.id,
    'MINI_MOCK',
    summary.totalCount,
    summary.correctCount
  );

  const bySkill = new Map();
  for (const r of summary.results) {
    const key = r.question.skill_id;
    if (!bySkill.has(key)) bySkill.set(key, { correct: 0, total: 0 });
    const entry = bySkill.get(key);
    entry.total += 1;
    entry.correct += r.isCorrect ? 1 : 0;
  }
  const skillRows = db.prepare('SELECT id, name FROM skills').all();
  const skillBreakdown = skillRows
    .filter((s) => bySkill.has(s.id))
    .map((s) => ({ name: s.name, ...bySkill.get(s.id) }));

  res.render('mock/result', { title: 'Mock Result', summary, skillBreakdown });
});

module.exports = router;
