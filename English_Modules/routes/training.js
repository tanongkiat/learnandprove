const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { loadQuestionsByIds, gradeAndRecordSession } = require('../lib/sessionEngine');
const { parseSubmission, shuffle } = require('../lib/formParsing');
const { createSession, getSession, endSession } = require('../lib/trainingSession');

const SESSION_SIZE = 8;

router.get('/', (req, res) => {
  const skills = db
    .prepare(
      `SELECT sk.*, COUNT(q.id) AS question_count, COALESCE(m.mastery, 0) AS mastery
         FROM skills sk
         LEFT JOIN questions q ON q.skill_id = sk.id AND q.status = 'PUBLISHED'
         LEFT JOIN student_skill_mastery m ON m.skill_id = sk.id AND m.user_id = ?
        GROUP BY sk.id
        ORDER BY sk.category, sk.name`
    )
    .all(req.currentUser.id);
  res.render('training/index', { title: 'Training', skills });
});

// Starts a fresh one-question-at-a-time session and hands off to /play.
router.get('/:code', (req, res) => {
  const skill = db.prepare('SELECT * FROM skills WHERE code = ?').get(req.params.code);
  if (!skill) return res.status(404).render('404', { title: 'Not found' });

  const questionIds = db
    .prepare("SELECT id FROM questions WHERE skill_id = ? AND status = 'PUBLISHED'")
    .all(skill.id)
    .map((r) => r.id);

  if (questionIds.length === 0) {
    return res.render('training/empty', { title: skill.name, skill });
  }

  const chosenIds = shuffle(questionIds).slice(0, SESSION_SIZE);
  const sid = createSession(skill.code, chosenIds);
  res.redirect(`/training/${skill.code}/play?sid=${sid}`);
});

// Shows the current step: the next question, feedback on the last answer, or the final summary.
router.get('/:code/play', (req, res) => {
  const skill = db.prepare('SELECT * FROM skills WHERE code = ?').get(req.params.code);
  if (!skill) return res.status(404).render('404', { title: 'Not found' });

  const sid = req.query.sid;
  const session = sid && getSession(sid);
  if (!session || session.skillCode !== skill.code) {
    return res.redirect(`/training/${skill.code}`);
  }

  const total = session.questionIds.length;

  if (session.index >= total) {
    const summary = {
      results: session.results,
      correctCount: session.results.filter((r) => r.isCorrect).length,
      totalCount: session.results.length,
      xpGain: session.xpTotal,
      streak: session.streak,
    };
    endSession(sid);
    return res.render('training/result', { title: `${skill.name} — Result`, skill, summary });
  }

  if (session.awaitingContinue) {
    const r = session.results[session.results.length - 1];
    return res.render('training/feedback', {
      title: skill.name,
      skill,
      r,
      index: session.index + 1,
      total,
      sid,
    });
  }

  const qid = session.questionIds[session.index];
  const [qo] = loadQuestionsByIds(db, [qid]);
  res.render('training/play', {
    title: skill.name,
    skill,
    qo: { question: qo.question, options: shuffle(qo.options) },
    index: session.index + 1,
    total,
    sid,
  });
});

// Grades the current question and stores feedback; does not advance yet.
router.post('/:code/answer', (req, res) => {
  const skill = db.prepare('SELECT * FROM skills WHERE code = ?').get(req.params.code);
  if (!skill) return res.status(404).render('404', { title: 'Not found' });

  const sid = req.body.sid;
  const session = sid && getSession(sid);
  if (!session || session.skillCode !== skill.code || session.awaitingContinue) {
    return res.redirect(`/training/${skill.code}/play?sid=${sid || ''}`);
  }

  const qid = session.questionIds[session.index];
  const [qo] = loadQuestionsByIds(db, [qid]);
  const submitted = parseSubmission(qo.question, qo.options, req.body);

  const { results, xpGain, streak } = gradeAndRecordSession(db, req.currentUser.id, 'training', [
    { questionId: qid, submitted },
  ]);

  session.results.push(results[0]);
  session.xpTotal += xpGain;
  session.streak = streak;
  session.awaitingContinue = true;

  res.redirect(`/training/${skill.code}/play?sid=${sid}`);
});

// Moves from feedback to the next question (or final summary).
router.post('/:code/continue', (req, res) => {
  const sid = req.body.sid;
  const session = sid && getSession(sid);
  if (session) {
    session.index += 1;
    session.awaitingContinue = false;
  }
  res.redirect(`/training/${req.params.code}/play?sid=${sid || ''}`);
});

module.exports = router;
