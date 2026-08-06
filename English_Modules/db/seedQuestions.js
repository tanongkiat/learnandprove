// Imports questions from pdfs/questions.json into the app DB.
// It maps external category names to existing app skills and question types.
// Idempotent behavior: skips a row if (skill_id + prompt) already exists.

const fs = require('node:fs');
const path = require('node:path');
const db = require('./connection');

const QUESTIONS_JSON_PATH = path.join(__dirname, '..', 'pdfs', 'questions.json');

const TYPE_TO_SKILL_CODE = {
  vocabulary_in_context: 'CONTEXT_DETECTIVE',
  synonym_antonym: 'WORD_FAMILY',
  grammar: 'GRAMMAR_FORMULA',
  error_identification: 'ERROR_DETECTION',
  conversation: 'SENTENCE_EQUATION',
  cloze_test: 'READING_BITE',
  reading_comprehension: 'READING_BITE',
};

const TYPE_TO_QUESTION_TYPE = {
  vocabulary_in_context: 'single_choice',
  synonym_antonym: 'single_choice',
  grammar: 'single_choice',
  error_identification: 'error_detection',
  conversation: 'single_choice',
  cloze_test: 'single_choice',
  reading_comprehension: 'single_choice',
};

const DIFFICULTY_TO_SCORE = {
  easy: 1,
  medium: 2,
  hard: 3,
};

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function loadQuestionPayload() {
  const raw = fs.readFileSync(QUESTIONS_JSON_PATH, 'utf8');
  return JSON.parse(raw);
}

function buildPassageMap(passages) {
  const map = new Map();
  for (const p of passages || []) {
    if (!p || !p.id) continue;
    map.set(String(p.id), {
      title: normalizeText(p.title),
      text: normalizeText(p.text),
    });
  }
  return map;
}

function maybeBuildPromptWithPassage(originalPrompt, q, passageMap) {
  if (!q.passageId) return originalPrompt;
  const p = passageMap.get(String(q.passageId));
  if (!p) return originalPrompt;

  const passageHeader = p.title ? `Passage: ${p.title}` : `Passage: ${q.passageId}`;
  const passageText = p.text || '';
  return `${passageHeader}\n${passageText}\n\n${originalPrompt}`;
}

function findVocabularyId(vocabTag, vocabIndex) {
  const key = normalizeText(vocabTag).toLowerCase();
  if (!key) return null;
  return vocabIndex.get(key) || null;
}

function buildHint(q, jsonType) {
  const topic = normalizeText(q.topic);
  const cefr = normalizeText(q.cefr).toUpperCase();
  const tag = Array.isArray(q.vocabularyTags) && q.vocabularyTags.length > 0
    ? normalizeText(q.vocabularyTags[0])
    : '';

  const byType = {
    vocabulary_in_context: 'Use context clues in the sentence to choose the most natural meaning.',
    synonym_antonym: 'Decide whether you need a similar meaning or an opposite meaning from the options.',
    grammar: topic ? `Focus on this grammar point: ${topic.replace(/_/g, ' ')}.` : 'Focus on grammar structure and tense agreement.',
    error_identification: 'Find the single underlined part with a grammar pattern error.',
    conversation: 'Choose the most natural and polite response for the situation.',
    cloze_test: 'Use the passage context, not just one word, to fill the blank.',
    reading_comprehension: 'Answer based on evidence in the passage, not outside knowledge.',
  };

  const base = byType[jsonType] || 'Read carefully and pick the best-supported option.';
  const extras = [];
  if (tag) extras.push(`Key word: ${tag}`);
  if (cefr) extras.push(`Level: ${cefr}`);
  return extras.length ? `${base} ${extras.join(' | ')}` : base;
}

function run() {
  const payload = loadQuestionPayload();
  const questions = Array.isArray(payload.questions) ? payload.questions : [];
  const passageMap = buildPassageMap(payload.passages);

  if (!questions.length) {
    console.log('seedQuestions: no questions found in questions.json');
    return;
  }

  const skillRows = db.prepare('SELECT id, code FROM skills').all();
  const skillIdByCode = new Map(skillRows.map((s) => [s.code, s.id]));

  const vocabRows = db.prepare('SELECT id, lemma FROM vocabulary_entries').all();
  const vocabIndex = new Map(vocabRows.map((v) => [normalizeText(v.lemma).toLowerCase(), v.id]));

  const existingPromptBySkill = new Set(
    db
      .prepare('SELECT skill_id, prompt FROM questions')
      .all()
      .map((r) => `${r.skill_id}|${normalizeText(r.prompt)}`)
  );
  const existingQuestionBySkillPrompt = new Map(
    db
      .prepare('SELECT id, skill_id, prompt, hint FROM questions')
      .all()
      .map((r) => [`${r.skill_id}|${normalizeText(r.prompt)}`, { id: r.id, hint: r.hint }])
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
  let skippedUnknownType = 0;
  let skippedMissingSkill = 0;
  let skippedDuplicate = 0;
  let skippedInvalid = 0;
  let updatedHints = 0;

  try {
    db.exec('BEGIN');

    for (const q of questions) {
      const jsonType = normalizeText(q.type);
      const promptRaw = normalizeText(q.question);
      const choices = Array.isArray(q.choices) ? q.choices.map(normalizeText).filter(Boolean) : [];
      const answerIndex = Number(q.answerIndex);

      if (!jsonType || !promptRaw || choices.length < 2 || Number.isNaN(answerIndex) || answerIndex < 0 || answerIndex >= choices.length) {
        skippedInvalid += 1;
        continue;
      }

      const skillCode = TYPE_TO_SKILL_CODE[jsonType];
      const questionType = TYPE_TO_QUESTION_TYPE[jsonType];
      if (!skillCode || !questionType) {
        skippedUnknownType += 1;
        continue;
      }

      const skillId = skillIdByCode.get(skillCode);
      if (!skillId) {
        skippedMissingSkill += 1;
        continue;
      }

      const prompt = maybeBuildPromptWithPassage(promptRaw, q, passageMap);
      const duplicateKey = `${skillId}|${normalizeText(prompt)}`;
      const hint = buildHint(q, jsonType);
      if (existingPromptBySkill.has(duplicateKey)) {
        const existingQuestion = existingQuestionBySkillPrompt.get(duplicateKey);
        if (existingQuestion && !normalizeText(existingQuestion.hint) && hint) {
          updateHint.run(hint, existingQuestion.id);
          updatedHints += 1;
        }
        skippedDuplicate += 1;
        continue;
      }

      const firstTag = Array.isArray(q.vocabularyTags) ? q.vocabularyTags[0] : '';
      const vocabularyId = findVocabularyId(firstTag, vocabIndex);

      const explanation = normalizeText(q.explanationThai || q.explanation || '') || null;
      const difficulty = DIFFICULTY_TO_SCORE[normalizeText(q.difficulty).toLowerCase()] || 2;

      const qid = Number(
        insertQuestion.run(
          skillId,
          vocabularyId,
          questionType,
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

      existingPromptBySkill.add(duplicateKey);
      existingQuestionBySkillPrompt.set(duplicateKey, { id: qid, hint });
      inserted += 1;
    }

    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  console.log(
    `seedQuestions complete: inserted=${inserted}, updated_hints=${updatedHints}, skipped_duplicate=${skippedDuplicate}, skipped_unknown_type=${skippedUnknownType}, skipped_missing_skill=${skippedMissingSkill}, skipped_invalid=${skippedInvalid}, source_rows=${questions.length}`
  );
}

run();
