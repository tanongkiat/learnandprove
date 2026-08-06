const { gradeQuestion } = require('./grading');
const { recordWordAttempt, recordSkillAttempt, recordSessionActivity } = require('./adaptive');

function loadQuestionsByIds(db, ids) {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(',');
  const questions = db
    .prepare(`SELECT * FROM questions WHERE id IN (${placeholders})`)
    .all(...ids);
  const order = new Map(ids.map((id, i) => [id, i]));
  questions.sort((a, b) => order.get(a.id) - order.get(b.id));

  const optionStmt = db.prepare('SELECT * FROM question_options WHERE question_id = ? ORDER BY sort_order');
  return questions.map((q) => ({ question: q, options: optionStmt.all(q.id) }));
}

// entries: [{ questionId, submitted }]
function gradeAndRecordSession(db, userId, mode, entries) {
  const ids = entries.map((e) => Number(e.questionId));
  const byId = new Map(loadQuestionsByIds(db, ids).map((qo) => [qo.question.id, qo]));

  const insertAttempt = db.prepare(
    `INSERT INTO attempts (user_id, question_id, skill_id, vocabulary_id, mode, is_correct, response_ms)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  const insertError = db.prepare(
    `INSERT INTO error_notebook (user_id, question_id, vocabulary_id, skill_id) VALUES (?, ?, ?, ?)`
  );

  const results = [];
  let correctCount = 0;

  for (const entry of entries) {
    const qo = byId.get(Number(entry.questionId));
    if (!qo) continue;
    const { question, options } = qo;
    const { isCorrect, correctLabel } = gradeQuestion(question, options, entry.submitted);

    insertAttempt.run(userId, question.id, question.skill_id, question.vocabulary_id, mode, isCorrect ? 1 : 0, entry.responseMs || null);
    recordWordAttempt(db, userId, question.vocabulary_id, isCorrect);
    recordSkillAttempt(db, userId, question.skill_id, isCorrect, entry.responseMs || 0);
    if (!isCorrect) {
      insertError.run(userId, question.id, question.vocabulary_id, question.skill_id);
      correctCount += 0;
    } else {
      correctCount += 1;
    }

    results.push({ question, options, submitted: entry.submitted, isCorrect, correctLabel });
  }

  const activity = recordSessionActivity(db, userId, { correctCount, totalCount: results.length });

  return { results, correctCount, totalCount: results.length, ...activity };
}

module.exports = { loadQuestionsByIds, gradeAndRecordSession };
