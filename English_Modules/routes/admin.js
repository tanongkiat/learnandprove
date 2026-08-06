const express = require('express');
const multer = require('multer');
const router = express.Router();
const db = require('../db/connection');
const { extractPdfText } = require('../lib/pdfExtract');
const { parseVocabCandidates } = require('../lib/pdfImport');
const { requireAdmin } = require('../lib/auth');

const QUESTION_TYPES = ['single_choice', 'multiple_choice', 'fill_blank', 'cloze', 'ordering', 'error_detection'];
const MAX_OPTION_ROWS = 8;
const MAX_USERS = 10;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, file.mimetype === 'application/pdf'),
});

router.use(requireAdmin);

router.get('/', (req, res) => {
  const stats = {
    vocabCount: db.prepare('SELECT COUNT(*) AS c FROM vocabulary_entries').get().c,
    questionCount: db.prepare('SELECT COUNT(*) AS c FROM questions').get().c,
    skillCount: db.prepare('SELECT COUNT(*) AS c FROM skills').get().c,
    attemptCount: db.prepare('SELECT COUNT(*) AS c FROM attempts').get().c,
    unresolvedErrors: db.prepare('SELECT COUNT(*) AS c FROM error_notebook WHERE resolved = 0').get().c,
    userCount: db.prepare('SELECT COUNT(*) AS c FROM users').get().c,
  };
  res.render('admin/dashboard', { title: 'Admin', stats });
});

// ---------- Users (internal login, max 10 people) ----------

router.get('/users', (req, res) => {
  const users = db
    .prepare(
      `SELECT u.*, p.xp, p.streak, p.last_active_date,
              (SELECT COUNT(*) FROM attempts a WHERE a.user_id = u.id) AS attempt_count
         FROM users u
         LEFT JOIN student_profile p ON p.user_id = u.id
        ORDER BY u.role DESC, u.name`
    )
    .all();
  res.render('admin/users', { title: 'Users', users, maxUsers: MAX_USERS, error: null });
});

router.post('/users', (req, res) => {
  const count = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  if (count >= MAX_USERS) {
    const users = db.prepare('SELECT u.*, p.xp, p.streak FROM users u LEFT JOIN student_profile p ON p.user_id = u.id ORDER BY u.role DESC, u.name').all();
    return res.status(400).render('admin/users', {
      title: 'Users',
      users,
      maxUsers: MAX_USERS,
      error: `You already have ${MAX_USERS} accounts, the limit for this internal tool. Delete one first.`,
    });
  }

  const { name, pin, role } = req.body;
  const info = db
    .prepare('INSERT INTO users (name, pin, role) VALUES (?, ?, ?)')
    .run(name.trim(), pin && pin.trim() ? pin.trim() : null, role === 'admin' ? 'admin' : 'student');
  const userId = Number(info.lastInsertRowid);
  db.prepare(
    "INSERT INTO student_profile (user_id, exam_date, start_date, xp, streak) VALUES (?, NULL, date('now'), 0, 0)"
  ).run(userId);

  res.redirect('/admin/users');
});

router.post('/users/:id/delete', (req, res) => {
  const remaining = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  if (remaining <= 1) {
    return res.redirect('/admin/users');
  }
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.redirect('/admin/users');
});

// Wipes one person's score and learning progress (mastery, word state, attempts,
// mistakes, mock history) but keeps their login intact.
router.post('/users/:id/reset', (req, res) => {
  const userId = Number(req.params.id);
  db.prepare('DELETE FROM student_word_state WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM student_skill_mastery WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM attempts WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM error_notebook WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM mock_sessions WHERE user_id = ?').run(userId);
  db.prepare(
    "UPDATE student_profile SET xp = 0, streak = 0, last_active_date = NULL, start_date = date('now') WHERE user_id = ?"
  ).run(userId);
  res.redirect('/admin/users');
});

// ---------- Vocabulary ----------

router.get('/vocabulary', (req, res) => {
  const q = (req.query.q || '').trim();
  const rows = q
    ? db
        .prepare(
          `SELECT * FROM vocabulary_entries WHERE lemma LIKE ? OR thai_meaning LIKE ? ORDER BY lemma`
        )
        .all(`%${q}%`, `%${q}%`)
    : db.prepare('SELECT * FROM vocabulary_entries ORDER BY lemma').all();
  const imported = req.query.imported !== undefined ? Number(req.query.imported) : null;
  res.render('admin/vocabulary-list', { title: 'Vocabulary', rows, q, imported });
});

router.get('/vocabulary/new', (req, res) => {
  res.render('admin/vocabulary-form', { title: 'New Vocabulary', entry: null, examples: [] });
});

router.post('/vocabulary', (req, res) => {
  const { lemma, pos, cefr, thai_meaning, status, example_en, example_th } = req.body;
  const info = db
    .prepare('INSERT INTO vocabulary_entries (lemma, pos, cefr, thai_meaning, status) VALUES (?, ?, ?, ?, ?)')
    .run(lemma.trim(), pos || null, cefr || null, thai_meaning.trim(), status || 'DRAFT');
  const id = Number(info.lastInsertRowid);
  if (example_en && example_en.trim()) {
    db.prepare('INSERT INTO vocabulary_examples (vocabulary_id, sentence_en, sentence_th) VALUES (?, ?, ?)').run(
      id,
      example_en.trim(),
      example_th ? example_th.trim() : null
    );
  }
  res.redirect('/admin/vocabulary');
});

router.get('/vocabulary/:id/edit', (req, res) => {
  const entry = db.prepare('SELECT * FROM vocabulary_entries WHERE id = ?').get(req.params.id);
  if (!entry) return res.status(404).render('404', { title: 'Not found' });
  const examples = db.prepare('SELECT * FROM vocabulary_examples WHERE vocabulary_id = ?').all(entry.id);
  res.render('admin/vocabulary-form', { title: `Edit ${entry.lemma}`, entry, examples });
});

router.post('/vocabulary/:id', (req, res) => {
  const { lemma, pos, cefr, thai_meaning, status } = req.body;
  db.prepare(
    'UPDATE vocabulary_entries SET lemma = ?, pos = ?, cefr = ?, thai_meaning = ?, status = ? WHERE id = ?'
  ).run(lemma.trim(), pos || null, cefr || null, thai_meaning.trim(), status || 'DRAFT', req.params.id);
  res.redirect(`/admin/vocabulary/${req.params.id}/edit`);
});

router.post('/vocabulary/:id/delete', (req, res) => {
  db.prepare('DELETE FROM vocabulary_entries WHERE id = ?').run(req.params.id);
  res.redirect('/admin/vocabulary');
});

router.post('/vocabulary/:id/examples', (req, res) => {
  const { sentence_en, sentence_th } = req.body;
  if (sentence_en && sentence_en.trim()) {
    db.prepare('INSERT INTO vocabulary_examples (vocabulary_id, sentence_en, sentence_th) VALUES (?, ?, ?)').run(
      req.params.id,
      sentence_en.trim(),
      sentence_th ? sentence_th.trim() : null
    );
  }
  res.redirect(`/admin/vocabulary/${req.params.id}/edit`);
});

router.post('/vocabulary/:id/examples/:exampleId/delete', (req, res) => {
  db.prepare('DELETE FROM vocabulary_examples WHERE id = ? AND vocabulary_id = ?').run(
    req.params.exampleId,
    req.params.id
  );
  res.redirect(`/admin/vocabulary/${req.params.id}/edit`);
});

// ---------- Skills ----------

router.get('/skills', (req, res) => {
  const skills = db
    .prepare(
      `SELECT sk.*, COUNT(q.id) AS question_count
         FROM skills sk LEFT JOIN questions q ON q.skill_id = sk.id
        GROUP BY sk.id ORDER BY sk.category, sk.name`
    )
    .all();
  res.render('admin/skills', { title: 'Skills', skills });
});

router.post('/skills', (req, res) => {
  const { code, name, category } = req.body;
  db.prepare('INSERT INTO skills (code, name, category) VALUES (?, ?, ?)').run(
    code.trim().toUpperCase().replace(/\s+/g, '_'),
    name.trim(),
    category.trim()
  );
  res.redirect('/admin/skills');
});

// ---------- Questions ----------

router.get('/questions', (req, res) => {
  const { skill, type } = req.query;
  let sql = `SELECT q.*, sk.name AS skill_name, sk.code AS skill_code FROM questions q JOIN skills sk ON sk.id = q.skill_id WHERE 1=1`;
  const params = [];
  if (skill) {
    sql += ' AND sk.code = ?';
    params.push(skill);
  }
  if (type) {
    sql += ' AND q.type = ?';
    params.push(type);
  }
  sql += ' ORDER BY q.id DESC';
  const rows = db.prepare(sql).all(...params);
  const skills = db.prepare('SELECT * FROM skills ORDER BY name').all();
  res.render('admin/questions-list', { title: 'Questions', rows, skills, QUESTION_TYPES, filterSkill: skill || '', filterType: type || '' });
});

router.get('/questions/new', (req, res) => {
  const skills = db.prepare('SELECT * FROM skills ORDER BY name').all();
  const vocabulary = db.prepare('SELECT id, lemma FROM vocabulary_entries ORDER BY lemma').all();
  res.render('admin/question-form', {
    title: 'New Question',
    question: null,
    options: [],
    skills,
    vocabulary,
    QUESTION_TYPES,
    MAX_OPTION_ROWS,
    presetSkill: req.query.skill || '',
  });
});

function readOptionRows(body) {
  const rows = [];
  for (let i = 1; i <= MAX_OPTION_ROWS; i++) {
    const label = body[`opt_label_${i}`];
    if (label && label.trim()) {
      rows.push({ label: label.trim(), isCorrect: body[`opt_correct_${i}`] ? 1 : 0 });
    }
  }
  return rows;
}

router.post('/questions', (req, res) => {
  const { skill_id, vocabulary_id, type, prompt, correct_answer, hint, explanation, difficulty, status } = req.body;
  const info = db
    .prepare(
      `INSERT INTO questions (skill_id, vocabulary_id, type, prompt, correct_answer, hint, explanation, difficulty, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      skill_id,
      vocabulary_id || null,
      type,
      prompt.trim(),
      correct_answer ? correct_answer.trim() : null,
      hint ? hint.trim() : null,
      explanation ? explanation.trim() : null,
      Number(difficulty) || 2,
      status || 'DRAFT'
    );
  const questionId = Number(info.lastInsertRowid);
  const insertOption = db.prepare(
    'INSERT INTO question_options (question_id, sort_order, label, is_correct) VALUES (?, ?, ?, ?)'
  );
  readOptionRows(req.body).forEach((row, i) => insertOption.run(questionId, i, row.label, row.isCorrect));
  res.redirect('/admin/questions');
});

router.get('/questions/:id/edit', (req, res) => {
  const question = db.prepare('SELECT * FROM questions WHERE id = ?').get(req.params.id);
  if (!question) return res.status(404).render('404', { title: 'Not found' });
  const options = db.prepare('SELECT * FROM question_options WHERE question_id = ? ORDER BY sort_order').all(question.id);
  const skills = db.prepare('SELECT * FROM skills ORDER BY name').all();
  const vocabulary = db.prepare('SELECT id, lemma FROM vocabulary_entries ORDER BY lemma').all();
  res.render('admin/question-form', {
    title: 'Edit Question',
    question,
    options,
    skills,
    vocabulary,
    QUESTION_TYPES,
    MAX_OPTION_ROWS,
    presetSkill: '',
  });
});

router.post('/questions/:id', (req, res) => {
  const { skill_id, vocabulary_id, type, prompt, correct_answer, hint, explanation, difficulty, status } = req.body;
  db.prepare(
    `UPDATE questions SET skill_id = ?, vocabulary_id = ?, type = ?, prompt = ?, correct_answer = ?,
        hint = ?, explanation = ?, difficulty = ?, status = ? WHERE id = ?`
  ).run(
    skill_id,
    vocabulary_id || null,
    type,
    prompt.trim(),
    correct_answer ? correct_answer.trim() : null,
    hint ? hint.trim() : null,
    explanation ? explanation.trim() : null,
    Number(difficulty) || 2,
    status || 'DRAFT',
    req.params.id
  );

  db.prepare('DELETE FROM question_options WHERE question_id = ?').run(req.params.id);
  const insertOption = db.prepare(
    'INSERT INTO question_options (question_id, sort_order, label, is_correct) VALUES (?, ?, ?, ?)'
  );
  readOptionRows(req.body).forEach((row, i) => insertOption.run(req.params.id, i, row.label, row.isCorrect));

  res.redirect(`/admin/questions/${req.params.id}/edit`);
});

router.post('/questions/:id/delete', (req, res) => {
  db.prepare('DELETE FROM questions WHERE id = ?').run(req.params.id);
  res.redirect('/admin/questions');
});

// ---------- PDF Import (admin-uploaded source, never auto-published) ----------

router.get('/import', (req, res) => {
  const batches = db.prepare('SELECT * FROM import_batches ORDER BY created_at DESC LIMIT 20').all();
  res.render('admin/import', { title: 'Import from PDF', batches, error: null });
});

router.post('/import/upload', (req, res) => {
  upload.single('pdf')(req, res, async (err) => {
    if (err || !req.file) {
      const batches = db.prepare('SELECT * FROM import_batches ORDER BY created_at DESC LIMIT 20').all();
      return res.status(400).render('admin/import', {
        title: 'Import from PDF',
        batches,
        error: err ? err.message : 'Please choose a PDF file.',
      });
    }

    try {
      const text = await extractPdfText(req.file.buffer);
      const info = db
        .prepare('INSERT INTO import_batches (filename, raw_text) VALUES (?, ?)')
        .run(req.file.originalname, text);
      res.redirect(`/admin/import/${Number(info.lastInsertRowid)}/review`);
    } catch (e) {
      const batches = db.prepare('SELECT * FROM import_batches ORDER BY created_at DESC LIMIT 20').all();
      res.status(400).render('admin/import', {
        title: 'Import from PDF',
        batches,
        error: `Could not read that PDF: ${e.message}`,
      });
    }
  });
});

router.get('/import/:id/review', (req, res) => {
  const batch = db.prepare('SELECT * FROM import_batches WHERE id = ?').get(req.params.id);
  if (!batch) return res.status(404).render('404', { title: 'Not found' });
  const candidates = parseVocabCandidates(batch.raw_text);
  res.render('admin/import-review', { title: 'Review Import', batch, candidates });
});

router.post('/import/:id/commit', (req, res) => {
  const batch = db.prepare('SELECT * FROM import_batches WHERE id = ?').get(req.params.id);
  if (!batch) return res.status(404).render('404', { title: 'Not found' });

  const includeRaw = req.body.include || [];
  const included = new Set((Array.isArray(includeRaw) ? includeRaw : [includeRaw]).map(Number));
  const lemmas = Array.isArray(req.body.lemma) ? req.body.lemma : [req.body.lemma];
  const meanings = Array.isArray(req.body.thai_meaning) ? req.body.thai_meaning : [req.body.thai_meaning];
  const poss = Array.isArray(req.body.pos) ? req.body.pos : [req.body.pos];

  const insertVocab = db.prepare(
    'INSERT INTO vocabulary_entries (lemma, pos, thai_meaning, status) VALUES (?, ?, ?, ?)'
  );

  let created = 0;
  for (let i = 0; i < lemmas.length; i++) {
    if (!included.has(i)) continue;
    const lemma = (lemmas[i] || '').trim();
    const thaiMeaning = (meanings[i] || '').trim();
    if (!lemma || !thaiMeaning) continue;
    insertVocab.run(lemma, (poss[i] || '').trim() || null, thaiMeaning, 'DRAFT');
    created += 1;
  }

  res.redirect(`/admin/vocabulary?imported=${created}`);
});

module.exports = router;
