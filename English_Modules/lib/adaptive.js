// MVP spaced-repetition per Speckits.md section 6:
// retry in-session after a mistake, then 1, 3, 7, 14, 30 days after successful reviews.
const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30];

function addDays(dateStr, days) {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function nextIntervalDays(reviewCount) {
  const idx = Math.min(reviewCount, REVIEW_INTERVALS_DAYS.length - 1);
  return REVIEW_INTERVALS_DAYS[idx];
}

function recordWordAttempt(db, userId, vocabularyId, isCorrect) {
  if (!vocabularyId) return;

  const existing = db
    .prepare('SELECT * FROM student_word_state WHERE user_id = ? AND vocabulary_id = ?')
    .get(userId, vocabularyId);

  if (!existing) {
    db.prepare(
      `INSERT INTO student_word_state
         (user_id, vocabulary_id, familiarity, review_count, lapse_count, recognition_mastery, next_review_at, last_result)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      userId,
      vocabularyId,
      isCorrect ? 0.2 : 0,
      isCorrect ? 1 : 0,
      isCorrect ? 0 : 1,
      isCorrect ? 1 : 0,
      isCorrect ? addDays(todayStr(), nextIntervalDays(0)) : null,
      isCorrect ? 'pass' : 'fail'
    );
    return;
  }

  if (isCorrect) {
    const reviewCount = existing.review_count + 1;
    const familiarity = Math.min(1, existing.familiarity + 0.2);
    db.prepare(
      `UPDATE student_word_state
         SET familiarity = ?, review_count = ?, recognition_mastery = 1,
             next_review_at = ?, last_result = 'pass'
       WHERE user_id = ? AND vocabulary_id = ?`
    ).run(familiarity, reviewCount, addDays(todayStr(), nextIntervalDays(reviewCount)), userId, vocabularyId);
  } else {
    db.prepare(
      `UPDATE student_word_state
         SET review_count = 0, lapse_count = lapse_count + 1,
             familiarity = MAX(0, familiarity - 0.15),
             next_review_at = NULL, last_result = 'fail'
       WHERE user_id = ? AND vocabulary_id = ?`
    ).run(userId, vocabularyId);
  }
}

function recordSkillAttempt(db, userId, skillId, isCorrect, responseMs) {
  const existing = db
    .prepare('SELECT * FROM student_skill_mastery WHERE user_id = ? AND skill_id = ?')
    .get(userId, skillId);

  if (!existing) {
    db.prepare(
      `INSERT INTO student_skill_mastery
         (user_id, skill_id, mastery, confidence, attempt_count, correct_count, avg_response_ms, last_practiced_at, next_review_at)
       VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?)`
    ).run(
      userId,
      skillId,
      isCorrect ? 1 : 0,
      isCorrect ? 1 : 0,
      isCorrect ? 1 : 0,
      responseMs || 0,
      todayStr(),
      addDays(todayStr(), isCorrect ? 3 : 0)
    );
    return;
  }

  const attemptCount = existing.attempt_count + 1;
  const correctCount = existing.correct_count + (isCorrect ? 1 : 0);
  const mastery = correctCount / attemptCount;
  const avgResponseMs = Math.round(
    (existing.avg_response_ms * existing.attempt_count + (responseMs || 0)) / attemptCount
  );

  db.prepare(
    `UPDATE student_skill_mastery
       SET mastery = ?, confidence = ?, attempt_count = ?, correct_count = ?,
           avg_response_ms = ?, last_practiced_at = ?, next_review_at = ?
     WHERE user_id = ? AND skill_id = ?`
  ).run(
    mastery,
    mastery,
    attemptCount,
    correctCount,
    avgResponseMs,
    todayStr(),
    isCorrect ? addDays(todayStr(), Math.max(1, Math.round(mastery * 7))) : todayStr(),
    userId,
    skillId
  );
}

// XP + streak bookkeeping. Called once per completed session (training/practice/mock).
function recordSessionActivity(db, userId, { correctCount, totalCount }) {
  const profile = db.prepare('SELECT * FROM student_profile WHERE user_id = ?').get(userId);
  const today = todayStr();
  const xpGain = correctCount * 10 + Math.max(0, totalCount - correctCount) * 2;

  let streak = profile.streak;
  if (profile.last_active_date === today) {
    // already active today, streak unchanged
  } else {
    const yesterday = addDays(today, -1);
    streak = profile.last_active_date === yesterday ? streak + 1 : 1;
  }

  db.prepare(
    'UPDATE student_profile SET xp = xp + ?, streak = ?, last_active_date = ? WHERE user_id = ?'
  ).run(xpGain, streak, today, userId);

  return { xpGain, streak };
}

module.exports = {
  REVIEW_INTERVALS_DAYS,
  todayStr,
  addDays,
  recordWordAttempt,
  recordSkillAttempt,
  recordSessionActivity,
};
