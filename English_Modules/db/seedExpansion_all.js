// Import vocabulary from pdfs/mywords.xlsx and auto-generate only
// VOCAB_MEANING questions for those words.
// Idempotent behavior:
// 1) skips vocabulary duplicates by (lemma, pos, thai_meaning)
// 2) skips question duplicates by (skill_id, vocabulary_id)

const path = require('node:path');
const XLSX = require('xlsx');
const db = require('./connection');

const XLSX_PATH = path.join(__dirname, '..', 'pdfs', 'mywords.xlsx');

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

function deterministicShuffle(arr, seedText) {
  const out = arr.slice();
  let seed = hashString(seedText || 'seed');
  for (let i = out.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function normalizePos(value) {
  const raw = normalizeText(value).toLowerCase();
  if (!raw) return null;

  const map = {
    n: 'noun',
    'n.': 'noun',
    noun: 'noun',
    v: 'verb',
    'v.': 'verb',
    vt: 'verb',
    vi: 'verb',
    verb: 'verb',
    adj: 'adjective',
    'adj.': 'adjective',
    adjective: 'adjective',
    adv: 'adverb',
    'adv.': 'adverb',
    adverb: 'adverb',
    prep: 'preposition',
    'prep.': 'preposition',
    preposition: 'preposition',
    pron: 'pronoun',
    'pron.': 'pronoun',
    pronoun: 'pronoun',
    conj: 'conjunction',
    'conj.': 'conjunction',
    conjunction: 'conjunction',
    det: 'determiner',
    'det.': 'determiner',
    determiner: 'determiner',
    article: 'article',
    'indefinite article': 'article',
    'definite article': 'article',
    aux: 'auxiliary',
    'aux.': 'auxiliary',
    auxiliary: 'auxiliary',
    modal: 'modal',
    number: 'number',
    numeral: 'number',
    exclamation: 'interjection',
    interjection: 'interjection',
  };

  // Handle comma-separated tags like "prep., adv.".
  const firstToken = raw.split(',')[0].trim();
  return map[firstToken] || map[raw] || firstToken || null;
}

function loadRows() {
  const workbook = XLSX.readFile(XLSX_PATH);
  const firstSheet = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheet];
  return XLSX.utils.sheet_to_json(sheet, { defval: '' });
}

function guessFamilyForm(lemma, pos) {
  const w = lemma.toLowerCase();
  if (pos === 'verb') {
    if (w.endsWith('e') && !w.endsWith('ee')) return `${w.slice(0, -1)}ing`;
    return `${w}ing`;
  }
  if (pos === 'noun') return `${w}s`;
  if (pos === 'adjective') return `${w}ly`;
  if (pos === 'adverb') return w.endsWith('ly') ? w.slice(0, -2) || w : `${w}ly`;
  return `${w}ing`;
}

function buildMeaningOptions(vocab, pool, seedKey) {
  const distractors = deterministicShuffle(
    pool
      .filter((p) => p.id !== vocab.id)
      .map((p) => normalizeText(p.thai_meaning))
      .filter(Boolean),
    seedKey
  );
  const choices = uniq([normalizeText(vocab.thai_meaning), ...distractors]).slice(0, 4);
  if (choices.length < 2) {
    choices.push(`${vocab.lemma} (word meaning)`);
  }
  const options = deterministicShuffle(choices, `${seedKey}:opt`);
  const correctIndex = options.indexOf(normalizeText(vocab.thai_meaning));
  return { options, correctIndex: correctIndex >= 0 ? correctIndex : 0 };
}

function buildPosOptions(pos, seedKey) {
  const all = ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'pronoun', 'conjunction', 'determiner'];
  const normalized = normalizeText(pos).toLowerCase() || 'noun';
  const distractors = deterministicShuffle(all.filter((p) => p !== normalized), seedKey).slice(0, 3);
  const options = deterministicShuffle([normalized, ...distractors], `${seedKey}:pos`);
  return { options, correctIndex: options.indexOf(normalized) };
}

function buildSkillQuestion(skillCode, vocab, pool) {
  const lemma = vocab.lemma;
  const pos = normalizeText(vocab.pos).toLowerCase();
  const cefr = normalizeText(vocab.cefr) || 'A1';
  const thai = normalizeText(vocab.thai_meaning);
  const seedKey = `${skillCode}|${lemma}|${thai}`;

  if (skillCode === 'VOCAB_MEANING') {
    const { options, correctIndex } = buildMeaningOptions(vocab, pool, seedKey);
    return {
      type: 'single_choice',
      prompt: `What is the best Thai meaning of "${lemma}"?`,
      correctAnswer: null,
      hint: `Part of speech: ${pos || 'unknown'} | CEFR: ${cefr}`,
      explanation: `"${lemma}" means "${thai}".`,
      difficulty: 2,
      options: options.map((label, i) => ({ label, isCorrect: i === correctIndex ? 1 : 0, sortOrder: i })),
    };
  }

  if (skillCode === 'WORD_PATTERN') {
    const { options, correctIndex } = buildPosOptions(pos, seedKey);
    return {
      type: 'single_choice',
      prompt: `Which part of speech best matches "${lemma}"?`,
      correctAnswer: null,
      hint: 'Use the most common function of this word.',
      explanation: `"${lemma}" is commonly used as ${pos || 'noun'}.`,
      difficulty: 2,
      options: options.map((label, i) => ({ label, isCorrect: i === correctIndex ? 1 : 0, sortOrder: i })),
    };
  }

  if (skillCode === 'PREFIX_SUFFIX') {
    const suffix = lemma.length >= 3 ? lemma.slice(-3).toLowerCase() : lemma.toLowerCase();
    const candidateWords = deterministicShuffle(
      pool.filter((p) => p.id !== vocab.id).map((p) => p.lemma),
      seedKey
    );
    const sameSuffix = candidateWords.find((w) => w.toLowerCase().endsWith(suffix) && w.toLowerCase() !== lemma.toLowerCase());
    const correct = sameSuffix || `${lemma}${suffix === 'e' ? 'd' : 's'}`;
    const distractors = candidateWords.filter((w) => w.toLowerCase() !== correct.toLowerCase()).slice(0, 3);
    const options = deterministicShuffle(uniq([correct, ...distractors]).slice(0, 4), `${seedKey}:suffix`);
    return {
      type: 'single_choice',
      prompt: `Which word shares the same ending pattern as "${lemma}"?`,
      correctAnswer: null,
      hint: `Focus on the suffix ending "-${suffix}".`,
      explanation: `"${correct}" shares the same ending pattern with "${lemma}".`,
      difficulty: 2,
      options: options.map((label, i) => ({ label, isCorrect: label === correct ? 1 : 0, sortOrder: i })),
    };
  }

  if (skillCode === 'ROOT_WORDS') {
    const root = (lemma.length >= 3 ? lemma.slice(0, 3) : lemma).toLowerCase();
    const a = root;
    const b = (lemma.length >= 3 ? lemma.slice(-3) : `${root}x`).toLowerCase();
    const c = (lemma.length >= 4 ? lemma.slice(1, 4) : `${root}y`).toLowerCase();
    const d = (lemma.length >= 2 ? lemma.slice(0, 2) : `${root}z`).toLowerCase();
    const options = deterministicShuffle(uniq([a, b, c, d]).slice(0, 4), `${seedKey}:root`);
    return {
      type: 'single_choice',
      prompt: `For the word "${lemma}", which fragment is the best root chunk to start from?`,
      correctAnswer: null,
      hint: 'Use the beginning chunk learners usually memorize first.',
      explanation: `A practical root chunk for "${lemma}" is "${root}".`,
      difficulty: 2,
      options: options.map((label, i) => ({ label, isCorrect: label === root ? 1 : 0, sortOrder: i })),
    };
  }

  if (skillCode === 'WORD_FAMILY') {
    const correct = guessFamilyForm(lemma, pos);
    const fake1 = `${lemma}ness`;
    const fake2 = `${lemma}tion`;
    const fake3 = `${lemma}ment`;
    const options = deterministicShuffle(uniq([correct, fake1, fake2, fake3]).slice(0, 4), `${seedKey}:family`);
    return {
      type: 'single_choice',
      prompt: `Which option is the best word-family form of "${lemma}"?`,
      correctAnswer: null,
      hint: 'Look for a natural derivative based on common English patterns.',
      explanation: `A usable derived form from "${lemma}" is "${correct}".`,
      difficulty: 2,
      options: options.map((label, i) => ({ label, isCorrect: label === correct ? 1 : 0, sortOrder: i })),
    };
  }

  if (skillCode === 'GRAMMAR_FORMULA') {
    const promptByPos = {
      verb: `Fill in the blank with the target word: "Students ____ this topic every day."`,
      noun: `Fill in the blank with the target word: "The teacher explained the ____ clearly."`,
      adjective: `Fill in the blank with the target word: "It was a very ____ lesson."`,
      adverb: `Fill in the blank with the target word: "She answered ____ during practice."`,
    };
    return {
      type: 'fill_blank',
      prompt: promptByPos[pos] || `Fill in the blank with the target word: "The key term is ____."`,
      correctAnswer: `${lemma}|${lemma.toLowerCase()}`,
      hint: `Target word: ${lemma}`,
      explanation: `The blank should be filled with "${lemma}".`,
      difficulty: 2,
      options: [],
    };
  }

  if (skillCode === 'SENTENCE_EQUATION') {
    const tokensByPos = {
      verb: ['Students', lemma, 'every', 'day'],
      noun: ['The', lemma, 'is', 'important'],
      adjective: ['This', 'is', 'a', lemma, 'example'],
      adverb: ['She', 'studies', lemma, 'at', 'home'],
    };
    const tokens = tokensByPos[pos] || ['The', 'word', lemma, 'is', 'useful'];
    return {
      type: 'ordering',
      prompt: 'Arrange the words to form a correct sentence.',
      correctAnswer: null,
      hint: `Use "${lemma}" in a natural sentence order.`,
      explanation: `Correct order: ${tokens.join(' ')}.`,
      difficulty: 2,
      options: tokens.map((label, i) => ({ label, isCorrect: 0, sortOrder: i })),
    };
  }

  if (skillCode === 'CONTEXT_DETECTIVE') {
    const contextByPos = {
      verb: `In context: "Students ${lemma} key words before exams." What does "${lemma}" most likely mean?`,
      noun: `In context: "The teacher explained the ${lemma} in class." What does "${lemma}" most likely mean?`,
      adjective: `In context: "It was a ${lemma} strategy for exam prep." What does "${lemma}" most likely mean?`,
      adverb: `In context: "She answered ${lemma} during the discussion." What does "${lemma}" most likely mean?`,
    };
    const { options, correctIndex } = buildMeaningOptions(vocab, pool, seedKey);
    return {
      type: 'single_choice',
      prompt: contextByPos[pos] || `In context: "The key term was ${lemma}." What does "${lemma}" most likely mean?`,
      correctAnswer: null,
      hint: 'Use context and overall sentence meaning.',
      explanation: `In this context, "${lemma}" matches "${thai}".`,
      difficulty: 3,
      options: options.map((label, i) => ({ label, isCorrect: i === correctIndex ? 1 : 0, sortOrder: i })),
    };
  }

  if (skillCode === 'READING_BITE') {
    const passage = `Mini passage: During exam week, students reviewed the word "${lemma}" and used it in short reading notes.`;
    const { options, correctIndex } = buildMeaningOptions(vocab, pool, seedKey);
    return {
      type: 'single_choice',
      prompt: `${passage}\n\nIn this passage, what is the best Thai meaning of "${lemma}"?`,
      correctAnswer: null,
      hint: 'Read the passage and choose the closest meaning.',
      explanation: `The best answer is "${thai}".`,
      difficulty: 3,
      options: options.map((label, i) => ({ label, isCorrect: i === correctIndex ? 1 : 0, sortOrder: i })),
    };
  }

  if (skillCode === 'ERROR_DETECTION') {
    const options = [
      `The word "${lemma}" appears in many exam passages.`,
      `Students often review "${lemma}" before tests.`,
      `She have studied "${lemma}" carefully.`,
      `Understanding "${lemma}" can improve reading scores.`,
    ];
    return {
      type: 'error_detection',
      prompt: `Find the sentence with a grammar error (focus on sentence structure, not vocabulary meaning).`,
      correctAnswer: null,
      hint: 'Check subject-verb agreement first.',
      explanation: '"She have..." is incorrect; it should be "She has...".',
      difficulty: 3,
      options: options.map((label, i) => ({ label, isCorrect: i === 2 ? 1 : 0, sortOrder: i })),
    };
  }

  // Fallback for any custom skill codes: generate a meaning question.
  const { options, correctIndex } = buildMeaningOptions(vocab, pool, `${seedKey}:fallback`);
  return {
    type: 'single_choice',
    prompt: `What does "${lemma}" mean?`,
    correctAnswer: null,
    hint: null,
    explanation: `"${lemma}" means "${thai}".`,
    difficulty: 2,
    options: options.map((label, i) => ({ label, isCorrect: i === correctIndex ? 1 : 0, sortOrder: i })),
  };
}

function run() {
  const rows = loadRows();
  if (!rows.length) {
    console.log('seedExpansion_all: no rows found in mywords.xlsx');
    return;
  }

  const insertVocab = db.prepare(
    'INSERT INTO vocabulary_entries (lemma, pos, cefr, thai_meaning, status) VALUES (?, ?, ?, ?, ?)'
  );

  const existing = new Set(
    db
      .prepare('SELECT lemma, pos, thai_meaning FROM vocabulary_entries')
      .all()
      .map((r) => `${normalizeText(r.lemma).toLowerCase()}|${normalizeText(r.pos).toLowerCase()}|${normalizeText(r.thai_meaning)}`)
  );

  let inserted = 0;
  let skippedInvalid = 0;
  let skippedDuplicate = 0;

  try {
    db.exec('BEGIN');
    for (const row of rows) {
      const lemma = normalizeText(row.English);
      const pos = normalizePos(row['Part of Speech']);
      const cefr = normalizeText(row.CEFR) || null;
      const thai = normalizeText(row['คำแปลภาษาไทย']);

      if (!lemma || !thai) {
        skippedInvalid += 1;
        continue;
      }

      const key = `${lemma.toLowerCase()}|${normalizeText(pos).toLowerCase()}|${thai}`;
      if (existing.has(key)) {
        skippedDuplicate += 1;
        continue;
      }

      insertVocab.run(lemma, pos, cefr, thai, 'PUBLISHED');
      existing.add(key);
      inserted += 1;
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  console.log(
    `seedExpansion_all complete: inserted=${inserted}, skipped_duplicate=${skippedDuplicate}, skipped_invalid=${skippedInvalid}, source_rows=${rows.length}`
  );

  // Build the source vocabulary pool from the current Excel rows.
  const sourceKeys = new Set();
  for (const row of rows) {
    const lemma = normalizeText(row.English);
    const pos = normalizePos(row['Part of Speech']);
    const thai = normalizeText(row['คำแปลภาษาไทย']);
    if (!lemma || !thai) continue;
    sourceKeys.add(`${lemma.toLowerCase()}|${normalizeText(pos).toLowerCase()}|${thai}`);
  }

  const vocabPool = db
    .prepare('SELECT id, lemma, pos, cefr, thai_meaning FROM vocabulary_entries')
    .all()
    .filter((v) =>
      sourceKeys.has(
        `${normalizeText(v.lemma).toLowerCase()}|${normalizeText(v.pos).toLowerCase()}|${normalizeText(v.thai_meaning)}`
      )
    );

  if (!vocabPool.length) {
    console.log('Question generation skipped: no source vocabulary rows matched in DB.');
    return;
  }

  const skills = db.prepare("SELECT id, code FROM skills WHERE code = 'VOCAB_MEANING'").all();
  if (!skills.length) {
    console.log('Question generation skipped: VOCAB_MEANING skill not found. Run the base seed first.');
    return;
  }

  const existingPair = new Set(
    db
      .prepare('SELECT skill_id, vocabulary_id FROM questions WHERE vocabulary_id IS NOT NULL')
      .all()
      .map((r) => `${r.skill_id}|${r.vocabulary_id}`)
  );

  const insertQuestion = db.prepare(
    `INSERT INTO questions (skill_id, vocabulary_id, type, prompt, correct_answer, hint, explanation, difficulty, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertOption = db.prepare(
    'INSERT INTO question_options (question_id, sort_order, label, match_value, is_correct) VALUES (?, ?, ?, ?, ?)'
  );

  let insertedQuestionCount = 0;
  let skippedQuestionDuplicate = 0;

  try {
    db.exec('BEGIN');
    for (const vocab of vocabPool) {
      for (const skill of skills) {
        const pairKey = `${skill.id}|${vocab.id}`;
        if (existingPair.has(pairKey)) {
          skippedQuestionDuplicate += 1;
          continue;
        }

        const q = buildSkillQuestion(skill.code, vocab, vocabPool);
        const qid = Number(
          insertQuestion.run(
            skill.id,
            vocab.id,
            q.type,
            q.prompt,
            q.correctAnswer,
            q.hint,
            q.explanation,
            q.difficulty,
            'PUBLISHED'
          ).lastInsertRowid
        );

        for (const opt of q.options) {
          insertOption.run(qid, opt.sortOrder, opt.label, null, opt.isCorrect);
        }

        existingPair.add(pairKey);
        insertedQuestionCount += 1;
      }
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  console.log(
    `Question generation complete (VOCAB_MEANING only): inserted_questions=${insertedQuestionCount}, skipped_existing=${skippedQuestionDuplicate}, vocab_used=${vocabPool.length}, skills_used=${skills.length}`
  );
}

run();
