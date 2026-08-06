// Practice Mode mix per Speckits.md section 4:
// 40% due review, 30% weak skills, 20% new content, 10% confidence-building. Configurable.
const DEFAULT_RATIOS = { due: 0.4, weak: 0.3, fresh: 0.2, confidence: 0.1 };

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function selectPracticeQuestions(db, userId, { limit = 10, ratios = DEFAULT_RATIOS } = {}) {
  const today = new Date().toISOString().slice(0, 10);

  const allQuestions = db
    .prepare(
      `SELECT q.*, s.mastery AS skill_mastery, s.next_review_at AS skill_next_review,
              w.next_review_at AS word_next_review, w.familiarity AS word_familiarity
         FROM questions q
         LEFT JOIN student_skill_mastery s ON s.skill_id = q.skill_id AND s.user_id = ?
         LEFT JOIN student_word_state w ON w.vocabulary_id = q.vocabulary_id AND w.user_id = ?
        WHERE q.status = 'PUBLISHED'`
    )
    .all(userId, userId);

  const attempted = new Set(
    db.prepare('SELECT DISTINCT question_id FROM attempts WHERE user_id = ?').all(userId).map((r) => r.question_id)
  );

  const due = allQuestions.filter(
    (q) =>
      (q.word_next_review && q.word_next_review <= today) ||
      (q.skill_next_review && q.skill_next_review <= today)
  );
  const weak = allQuestions.filter((q) => q.skill_mastery != null && q.skill_mastery < 0.6);
  const fresh = allQuestions.filter((q) => !attempted.has(q.id));
  const confidence = allQuestions.filter((q) => q.skill_mastery != null && q.skill_mastery >= 0.8);

  const pools = {
    due: shuffle(due),
    weak: shuffle(weak),
    fresh: shuffle(fresh),
    confidence: shuffle(confidence),
  };

  const picked = [];
  const pickedIds = new Set();

  function takeFrom(pool, count) {
    let taken = 0;
    for (const q of pool) {
      if (taken >= count) break;
      if (pickedIds.has(q.id)) continue;
      picked.push(q);
      pickedIds.add(q.id);
      taken += 1;
    }
  }

  takeFrom(pools.due, Math.round(limit * ratios.due));
  takeFrom(pools.weak, Math.round(limit * ratios.weak));
  takeFrom(pools.fresh, Math.round(limit * ratios.fresh));
  takeFrom(pools.confidence, Math.round(limit * ratios.confidence));

  // Fill any remainder from the full pool so a mission is never short.
  if (picked.length < limit) {
    takeFrom(shuffle(allQuestions), limit - picked.length);
  }

  return shuffle(picked).slice(0, limit);
}

module.exports = { selectPracticeQuestions, DEFAULT_RATIOS };
