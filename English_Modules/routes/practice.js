const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { selectPracticeQuestions } = require('../lib/missionSelector');
const { loadQuestionsByIds, gradeAndRecordSession } = require('../lib/sessionEngine');
const { parseSubmission, shuffle } = require('../lib/formParsing');

const MISSION_SIZE = 10;

router.get('/', (req, res) => {
  const picked = selectPracticeQuestions(db, req.currentUser.id, { limit: MISSION_SIZE });
  const ids = picked.map((q) => q.id);
  const questionSet = loadQuestionsByIds(db, ids).map((qo) => ({
    question: qo.question,
    options: shuffle(qo.options),
  }));

  if (questionSet.length === 0) {
    return res.render('practice/session', { title: 'Practice', questionSet: [] });
  }

  res.render('practice/session', { title: 'Practice', questionSet });
});

router.post('/', (req, res) => {
  const idsRaw = req.body.questionIds || [];
  const questionIds = (Array.isArray(idsRaw) ? idsRaw : [idsRaw]).map(Number);
  const loaded = loadQuestionsByIds(db, questionIds);

  const entries = loaded.map((qo) => ({
    questionId: qo.question.id,
    submitted: parseSubmission(qo.question, qo.options, req.body),
  }));

  const summary = gradeAndRecordSession(db, req.currentUser.id, 'practice', entries);
  res.render('practice/result', { title: 'Practice — Result', summary });
});

module.exports = router;
