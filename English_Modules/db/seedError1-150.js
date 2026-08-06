// Imports 150 error-identification questions from pdfs/erroridentification1_150.json
// into the ERROR_DETECTION skill as error_detection questions.
// Idempotent behavior: skips duplicates by (skill_id + normalized prompt).

const fs = require('node:fs');
const path = require('node:path');
const db = require('./connection');

const CANDIDATE_JSON_PATHS = [
  path.join(__dirname, '..', 'pdfs', 'erroridentification1_150.json'),
  path.join(__dirname, '..', 'pdfs', 'erroridernfication1_150.json'),
];

const DIFFICULTY_TO_SCORE = {
  easy: 1,
  medium: 2,
  hard: 3,
};

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function resolveJsonPath() {
  for (const p of CANDIDATE_JSON_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(
    `Source JSON not found. Expected one of: ${CANDIDATE_JSON_PATHS.map((p) => path.basename(p)).join(', ')}`
  );
}

function loadQuestions() {
  const jsonPath = resolveJsonPath();
  const payload = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const questions = Array.isArray(payload.questions) ? payload.questions : (Array.isArray(payload) ? payload : []);
  return { jsonPath, questions };
}

function toDifficultyScore(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(1, Math.min(3, Math.round(value)));
  }
  const key = normalizeText(value).toLowerCase();
  return DIFFICULTY_TO_SCORE[key] || 2;
}

function buildHint(q) {
  const topic = normalizeText(q.topic).replace(/_/g, ' ');
  const cefr = normalizeText(q.cefr).toUpperCase();
  const parts = ['Find the single incorrect part and think about grammar pattern mismatch.'];
  if (topic) parts.push(`Topic: ${topic}`);
  if (cefr) parts.push(`Level: ${cefr}`);
  return parts.join(' | ');
}

function run() {
  const { jsonPath, questions } = loadQuestions();
  if (!questions.length) {
    console.log(`seedError1-150: no questions found in ${path.basename(jsonPath)}`);
    return;
  }

  const skill = db.prepare("SELECT id, code FROM skills WHERE code = 'ERROR_DETECTION'").get();
  if (!skill) {
    console.log('seedError1-150 skipped: ERROR_DETECTION skill not found. Run npm run seed first.');
    return;
  }

  const existingPrompt = new Set(
    db
      .prepare('SELECT prompt FROM questions WHERE skill_id = ?')
      .all(skill.id)
      .map((r) => normalizeText(r.prompt))
  );

  const existingQuestionByPrompt = new Map(
    db
      .prepare('SELECT id, prompt, hint FROM questions WHERE skill_id = ?')
      .all(skill.id)
      .map((r) => [normalizeText(r.prompt), { id: r.id, hint: r.hint }])
  );

  const insertQuestion = db.prepare(
    `INSERT INTO questions (skill_id, vocabulary_id, type, prompt, correct_answer, hint, explanation, difficulty, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertOption = db.prepare(
    'INSERT INTO question_options (question_id, sort_order, label, match_value, is_correct) VALUES (?, ?, ?, ?, ?)'
  );
  const updateHint = db.prepare('UPDATE questions SET hint = ? WHERE id = ?');

  let inserted = 0;
  let updatedHints = 0;
  let skippedDuplicate = 0;
  let skippedInvalid = 0;

  try {
    db.exec('BEGIN');

    for (const q of questions) {
      const prompt = normalizeText(q.question);
      const choices = Array.isArray(q.choices) ? q.choices.map(normalizeText).filter(Boolean) : [];
      const answerIndex = Number(q.answerIndex);

      if (!prompt || choices.length < 2 || Number.isNaN(answerIndex) || answerIndex < 0 || answerIndex >= choices.length) {
        skippedInvalid += 1;
        continue;
      }

      const hint = buildHint(q);
      if (existingPrompt.has(prompt)) {
        const existing = existingQuestionByPrompt.get(prompt);
        if (existing && !normalizeText(existing.hint) && hint) {
          updateHint.run(hint, existing.id);
          updatedHints += 1;
        }
        skippedDuplicate += 1;
        continue;
      }

      const explanation = normalizeText(q.explanationThai || q.explanation || '') || null;
      const difficulty = toDifficultyScore(q.difficulty);
      const qid = Number(
        insertQuestion.run(
          skill.id,
          null,
          'error_detection',
          prompt,
          null,
          hint,
          explanation,
          difficulty,
          'PUBLISHED'
        ).lastInsertRowid
      );

      for (let i = 0; i < choices.length; i++) {
        insertOption.run(qid, i, choices[i], null, i === answerIndex ? 1 : 0);
      }

      existingPrompt.add(prompt);
      existingQuestionByPrompt.set(prompt, { id: qid, hint });
      inserted += 1;
    }

    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  console.log(
    `seedError1-150 complete: inserted=${inserted}, updated_hints=${updatedHints}, skipped_duplicate=${skippedDuplicate}, skipped_invalid=${skippedInvalid}, source_rows=${questions.length}, source_file=${path.basename(jsonPath)}`
  );
}

run();
