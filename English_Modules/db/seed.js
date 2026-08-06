// Idempotent seed data for the TriamQuest 90 MVP.
// Run directly with `npm run seed`, or it runs automatically on first server start.

const db = require('./connection');

const SKILLS = [
  { code: 'VOCAB_MEANING', name: 'Vocabulary Meaning', category: 'vocabulary' },
  { code: 'WORD_PATTERN', name: 'Word Pattern', category: 'training' },
  { code: 'PREFIX_SUFFIX', name: 'Prefix & Suffix', category: 'training' },
  { code: 'ROOT_WORDS', name: 'Root Words', category: 'training' },
  { code: 'WORD_FAMILY', name: 'Word Family', category: 'training' },
  { code: 'GRAMMAR_FORMULA', name: 'Grammar Formula', category: 'grammar' },
  { code: 'SENTENCE_EQUATION', name: 'Sentence Equation', category: 'grammar' },
  { code: 'CONTEXT_DETECTIVE', name: 'Context Detective', category: 'reading' },
  { code: 'READING_BITE', name: 'Reading Bite', category: 'reading' },
  { code: 'ERROR_DETECTION', name: 'Error Detection Tutorial', category: 'grammar' },
];

const VOCAB = [
  { lemma: 'abundant', pos: 'adjective', cefr: 'B2', thai: 'อุดมสมบูรณ์, มากมาย', ex: 'The region has abundant rainfall, more than enough for all the crops.', exTh: 'ภูมิภาคนี้มีฝนตกอุดมสมบูรณ์ มากเกินพอสำหรับพืชผลทั้งหมด' },
  { lemma: 'benevolent', pos: 'adjective', cefr: 'C1', thai: 'ใจดี, มีเมตตา', ex: 'The benevolent donor gave scholarships to hundreds of students.', exTh: 'ผู้บริจาคใจดีมอบทุนการศึกษาให้นักเรียนหลายร้อยคน' },
  { lemma: 'candid', pos: 'adjective', cefr: 'B2', thai: 'ตรงไปตรงมา, จริงใจ', ex: 'She gave a candid answer about the company’s problems.', exTh: 'เธอตอบอย่างตรงไปตรงมาเกี่ยวกับปัญหาของบริษัท' },
  { lemma: 'diligent', pos: 'adjective', cefr: 'B1', thai: 'ขยัน, มุ่งมั่น', ex: 'A diligent student reviews notes every single day.', exTh: 'นักเรียนที่ขยันจะทบทวนโน้ตทุกวัน' },
  { lemma: 'eloquent', pos: 'adjective', cefr: 'C1', thai: 'พูดจาไพเราะ, คารมคมคาย', ex: 'The eloquent speaker convinced the entire audience.', exTh: 'ผู้พูดที่คารมคมคายโน้มน้าวผู้ฟังทั้งหมดได้' },
  { lemma: 'feasible', pos: 'adjective', cefr: 'B2', thai: 'ที่เป็นไปได้, ทำได้จริง', ex: 'Is it feasible to finish the project by Friday?', exTh: 'เป็นไปได้ไหมที่จะทำโครงการเสร็จภายในวันศุกร์' },
  { lemma: 'gratitude', pos: 'noun', cefr: 'B1', thai: 'ความกตัญญู, ความรู้สึกขอบคุณ', ex: 'He expressed his gratitude by writing a thank-you letter.', exTh: 'เขาแสดงความขอบคุณด้วยการเขียนจดหมายขอบคุณ' },
  { lemma: 'hesitant', pos: 'adjective', cefr: 'B1', thai: 'ลังเล, ไม่แน่ใจ', ex: 'She was hesitant to accept the job offer at first.', exTh: 'ในตอนแรกเธอลังเลที่จะรับข้อเสนองาน' },
  { lemma: 'integrity', pos: 'noun', cefr: 'B2', thai: 'ความซื่อสัตย์, ความมีคุณธรรม', ex: 'A good leader acts with integrity even when no one is watching.', exTh: 'ผู้นำที่ดีกระทำด้วยความซื่อสัตย์แม้ไม่มีใครมองอยู่' },
  { lemma: 'jubilant', pos: 'adjective', cefr: 'C1', thai: 'ปีติยินดี, ดีใจมาก', ex: 'The team was jubilant after winning the championship.', exTh: 'ทีมดีใจมากหลังจากชนะเลิศการแข่งขัน' },
  { lemma: 'keen', pos: 'adjective', cefr: 'B1', thai: 'กระตือรือร้น, สนใจมาก', ex: 'He is keen on learning new languages.', exTh: 'เขากระตือรือร้นที่จะเรียนภาษาใหม่ ๆ' },
  { lemma: 'legitimate', pos: 'adjective', cefr: 'B2', thai: 'ถูกต้องตามกฎหมาย, ชอบธรรม', ex: 'The company uses only legitimate business practices.', exTh: 'บริษัทใช้แนวปฏิบัติทางธุรกิจที่ถูกต้องตามกฎหมายเท่านั้น' },
  { lemma: 'meticulous', pos: 'adjective', cefr: 'C1', thai: 'พิถีพิถัน, ละเอียดรอบคอบ', ex: 'The editor is meticulous about checking every detail.', exTh: 'บรรณาธิการพิถีพิถันในการตรวจสอบทุกรายละเอียด' },
  { lemma: 'notorious', pos: 'adjective', cefr: 'B2', thai: 'ฉาวโฉ่, มีชื่อเสียงในทางไม่ดี', ex: 'The city is notorious for its heavy traffic.', exTh: 'เมืองนี้ขึ้นชื่อ (ในทางไม่ดี) เรื่องการจราจรที่หนาแน่น' },
  { lemma: 'optimistic', pos: 'adjective', cefr: 'B1', thai: 'มองโลกในแง่ดี', ex: 'Despite the setback, she remained optimistic about the future.', exTh: 'แม้จะเจออุปสรรค เธอก็ยังมองโลกในแง่ดีเกี่ยวกับอนาคต' },
  { lemma: 'plausible', pos: 'adjective', cefr: 'C1', thai: 'ที่ดูสมเหตุสมผล, น่าเชื่อถือ', ex: 'His explanation sounded plausible, so we believed him.', exTh: 'คำอธิบายของเขาฟังดูสมเหตุสมผล เราจึงเชื่อเขา' },
];

// [prompt, [options...correct marked with *], explanation]
function buildQuestions(vocabId) {
  return vocabId;
}

function run() {
  const existing = db.prepare('SELECT COUNT(*) AS c FROM skills').get();
  if (existing.c > 0) {
    console.log('Seed skipped: data already present.');
    return;
  }

  const insertSkill = db.prepare('INSERT INTO skills (code, name, category) VALUES (?, ?, ?)');
  const skillId = {};
  for (const s of SKILLS) {
    const info = insertSkill.run(s.code, s.name, s.category);
    skillId[s.code] = Number(info.lastInsertRowid);
  }

  const insertVocab = db.prepare(
    'INSERT INTO vocabulary_entries (lemma, pos, cefr, thai_meaning, status) VALUES (?, ?, ?, ?, ?)'
  );
  const insertExample = db.prepare(
    'INSERT INTO vocabulary_examples (vocabulary_id, sentence_en, sentence_th) VALUES (?, ?, ?)'
  );
  const vocabId = {};
  for (const v of VOCAB) {
    const info = insertVocab.run(v.lemma, v.pos, v.cefr, v.thai, 'PUBLISHED');
    const id = Number(info.lastInsertRowid);
    vocabId[v.lemma] = id;
    insertExample.run(id, v.ex, v.exTh);
  }

  const insertQuestion = db.prepare(
    `INSERT INTO questions (skill_id, vocabulary_id, type, prompt, correct_answer, explanation, difficulty, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertOption = db.prepare(
    'INSERT INTO question_options (question_id, sort_order, label, match_value, is_correct) VALUES (?, ?, ?, ?, ?)'
  );

  function addSingleChoice({ skill, vocab, prompt, options, correctIndex, explanation, difficulty = 2 }) {
    const qId = Number(
      insertQuestion.run(skillId[skill], vocab ? vocabId[vocab] : null, 'single_choice', prompt, null, explanation, difficulty, 'PUBLISHED')
        .lastInsertRowid
    );
    options.forEach((label, i) => insertOption.run(qId, i, label, null, i === correctIndex ? 1 : 0));
    return qId;
  }

  function addFillBlank({ skill, vocab, prompt, answer, explanation, difficulty = 2 }) {
    insertQuestion.run(skillId[skill], vocab ? vocabId[vocab] : null, 'fill_blank', prompt, answer, explanation, difficulty, 'PUBLISHED');
  }

  function addOrdering({ skill, prompt, items, explanation, difficulty = 3 }) {
    const qId = Number(
      insertQuestion.run(skillId[skill], null, 'ordering', prompt, null, explanation, difficulty, 'PUBLISHED').lastInsertRowid
    );
    items.forEach((label, i) => insertOption.run(qId, i, label, null, 0));
    return qId;
  }

  function addErrorDetection({ skill, prompt, options, correctIndex, explanation, difficulty = 3 }) {
    const qId = Number(
      insertQuestion.run(skillId[skill], null, 'error_detection', prompt, null, explanation, difficulty, 'PUBLISHED')
        .lastInsertRowid
    );
    options.forEach((label, i) => insertOption.run(qId, i, label, null, i === correctIndex ? 1 : 0));
    return qId;
  }

  // --- Vocabulary Meaning ---
  const meaningWords = ['abundant', 'benevolent', 'candid', 'diligent', 'eloquent', 'feasible', 'gratitude', 'hesitant', 'integrity', 'jubilant'];
  for (const word of meaningWords) {
    const correctMeaning = VOCAB.find((v) => v.lemma === word).thai;
    const distractors = VOCAB.filter((v) => v.lemma !== word)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((v) => v.thai);
    const options = [correctMeaning, ...distractors].sort(() => Math.random() - 0.5);
    addSingleChoice({
      skill: 'VOCAB_MEANING',
      vocab: word,
      prompt: `What does "${word}" mean?`,
      options,
      correctIndex: options.indexOf(correctMeaning),
      explanation: `"${word}" means ${correctMeaning}.`,
      difficulty: 2,
    });
  }

  // --- Word Pattern ---
  addSingleChoice({
    skill: 'WORD_PATTERN',
    prompt: 'Which prefix means "not" in words like "unhappy" and "unfair"?',
    options: ['un-', 're-', 'pre-', 'mis-'],
    correctIndex: 0,
    explanation: '"un-" is a negative prefix meaning "not".',
  });
  addSingleChoice({
    skill: 'WORD_PATTERN',
    prompt: 'The pattern re- + verb usually means:',
    options: ['to do again', 'to do before', 'to do badly', 'to stop doing'],
    correctIndex: 0,
    explanation: '"re-" means "again", as in "rewrite" (write again).',
  });
  addSingleChoice({
    skill: 'WORD_PATTERN',
    prompt: 'Which word follows the same "over + adjective = too much" pattern as "overconfident"?',
    options: ['overreact', 'oversee', 'override', 'overcoat'],
    correctIndex: 0,
    explanation: '"overreact" = to react too much, matching the "too much" pattern.',
  });

  // --- Prefix & Suffix ---
  addSingleChoice({
    skill: 'PREFIX_SUFFIX',
    prompt: 'Which suffix turns the verb "act" into a noun meaning "the process of doing"?',
    options: ['-ion', '-ness', '-able', '-ful'],
    correctIndex: 0,
    explanation: '"act" + "-ion" = "action".',
  });
  addSingleChoice({
    skill: 'PREFIX_SUFFIX',
    prompt: 'Which suffix means "able to be done"?',
    options: ['-able', '-less', '-ist', '-hood'],
    correctIndex: 0,
    explanation: '"-able" means "capable of", as in "feasible" and "readable".',
  });
  addSingleChoice({
    skill: 'PREFIX_SUFFIX',
    prompt: 'The prefix "mis-" in "misunderstand" means:',
    options: ['wrongly', 'again', 'before', 'together'],
    correctIndex: 0,
    explanation: '"mis-" means "wrongly" or "badly".',
  });

  // --- Root Words ---
  addSingleChoice({
    skill: 'ROOT_WORDS',
    prompt: 'The root "dict" (as in "predict", "dictionary") relates to which meaning?',
    options: ['speak / say', 'see', 'carry', 'write'],
    correctIndex: 0,
    explanation: '"dict" comes from Latin "dicere", to speak or say.',
  });
  addSingleChoice({
    skill: 'ROOT_WORDS',
    prompt: 'The root "port" (as in "transport", "portable") relates to which meaning?',
    options: ['carry', 'see', 'write', 'break'],
    correctIndex: 0,
    explanation: '"port" comes from Latin "portare", to carry.',
  });
  addSingleChoice({
    skill: 'ROOT_WORDS',
    prompt: 'The root "spect" (as in "inspect", "spectator") relates to which meaning?',
    options: ['look / see', 'hear', 'move', 'build'],
    correctIndex: 0,
    explanation: '"spect" comes from Latin "specere", to look or see.',
  });

  // --- Word Family ---
  addSingleChoice({
    skill: 'WORD_FAMILY',
    vocab: 'diligent',
    prompt: 'Which word is the noun form of "diligent"?',
    options: ['diligence', 'diligently', 'diligenting', 'diligible'],
    correctIndex: 0,
    explanation: '"diligent" (adj.) -> "diligence" (noun).',
  });
  addSingleChoice({
    skill: 'WORD_FAMILY',
    vocab: 'eloquent',
    prompt: 'Which word is the adverb form of "eloquent"?',
    options: ['eloquently', 'eloquence', 'eloquenting', 'eloquentness'],
    correctIndex: 0,
    explanation: '"eloquent" (adj.) -> "eloquently" (adverb).',
  });
  addSingleChoice({
    skill: 'WORD_FAMILY',
    vocab: 'optimistic',
    prompt: 'Which word is the noun form of "optimistic"?',
    options: ['optimism', 'optimize', 'optimally', 'optimist-ly'],
    correctIndex: 0,
    explanation: '"optimistic" (adj.) relates to the noun "optimism".',
  });

  // --- Grammar Formula ---
  addFillBlank({
    skill: 'GRAMMAR_FORMULA',
    prompt: 'She ___ (go) to school every day.',
    answer: 'goes',
    explanation: 'Simple present, third-person singular: subject + verb-s.',
  });
  addFillBlank({
    skill: 'GRAMMAR_FORMULA',
    prompt: 'They ___ (not / finish) the homework yet.',
    answer: 'have not finished|haven\'t finished',
    explanation: 'Present perfect negative: have/has + not + past participle.',
  });
  addFillBlank({
    skill: 'GRAMMAR_FORMULA',
    prompt: 'If it rains tomorrow, we ___ (stay) at home.',
    answer: 'will stay',
    explanation: 'First conditional: If + present simple, ... will + base verb.',
  });

  // --- Sentence Equation (ordering) ---
  addOrdering({
    skill: 'SENTENCE_EQUATION',
    prompt: 'Arrange the words to form a correct sentence.',
    items: ['She', 'always', 'drinks', 'coffee', 'in', 'the', 'morning'],
    explanation: 'Correct order: She always drinks coffee in the morning.',
  });
  addOrdering({
    skill: 'SENTENCE_EQUATION',
    prompt: 'Arrange the words to form a correct sentence.',
    items: ['Although', 'it', 'was', 'raining', 'we', 'went', 'outside'],
    explanation: 'Correct order: Although it was raining, we went outside.',
  });

  // --- Context Detective ---
  addSingleChoice({
    skill: 'CONTEXT_DETECTIVE',
    vocab: 'abundant',
    prompt: 'Based on context, what does "abundant" mean in: "The region has abundant rainfall, more than enough for all the crops."?',
    options: ['plentiful', 'scarce', 'dangerous', 'expensive'],
    correctIndex: 0,
    explanation: '"more than enough" signals "plentiful", which is what "abundant" means.',
  });
  addSingleChoice({
    skill: 'CONTEXT_DETECTIVE',
    vocab: 'candid',
    prompt: 'Based on context, what does "candid" mean in: "She gave a candid answer about the company’s problems, holding nothing back."?',
    options: ['honest and direct', 'vague and confusing', 'angry', 'formal'],
    correctIndex: 0,
    explanation: '"holding nothing back" signals honesty and directness.',
  });
  addSingleChoice({
    skill: 'CONTEXT_DETECTIVE',
    vocab: 'notorious',
    prompt: 'Based on context, what does "notorious" mean in: "The city is notorious for its heavy traffic, and locals complain about it daily."?',
    options: ['famous for something bad', 'famous for something good', 'unknown', 'peaceful'],
    correctIndex: 0,
    explanation: 'Complaints about traffic signal a negative reputation, i.e. "notorious".',
  });

  // --- Reading Bite ---
  addSingleChoice({
    skill: 'READING_BITE',
    prompt:
      'Read the passage, then answer the question.\n\n' +
      '"Many students avoid reading because it feels slow and boring. But short, game-like practice, done daily for just a few minutes, ' +
      'can build real reading speed over time. The key is consistency, not long study sessions."\n\n' +
      'What is the main idea of the passage?',
    options: [
      'Short, consistent practice builds reading speed better than long sessions.',
      'Reading is always boring for students.',
      'Long study sessions are the only way to improve.',
      'Game-like practice has no real benefit.',
    ],
    correctIndex: 0,
    explanation: 'The passage emphasizes consistency over long study sessions.',
  });
  addSingleChoice({
    skill: 'READING_BITE',
    prompt:
      'Read the passage, then answer the question.\n\n' +
      '"A benevolent local business owner donated books to every school in the district. Teachers said the gesture would ' +
      'encourage more students to read for fun instead of only for exams."\n\n' +
      'What does the passage suggest about the business owner?',
    options: [
      'The owner is kind and generous.',
      'The owner dislikes reading.',
      'The owner is only interested in exams.',
      'The owner is a teacher.',
    ],
    correctIndex: 0,
    explanation: 'Donating books to every school shows kindness and generosity ("benevolent").',
  });

  // --- Error Detection Tutorial ---
  addErrorDetection({
    skill: 'ERROR_DETECTION',
    prompt: 'Identify the part with an error: (A) She (B) don’t (C) like (D) coffee.',
    options: ['(A) She', '(B) don’t', '(C) like', '(D) coffee'],
    correctIndex: 1,
    explanation: 'Third-person singular "she" requires "doesn’t", not "don’t".',
  });
  addErrorDetection({
    skill: 'ERROR_DETECTION',
    prompt: 'Identify the part with an error: (A) Yesterday (B) I go (C) to the (D) market.',
    options: ['(A) Yesterday', '(B) I go', '(C) to the', '(D) market'],
    correctIndex: 1,
    explanation: '"Yesterday" requires the past tense: "I went", not "I go".',
  });
  addErrorDetection({
    skill: 'ERROR_DETECTION',
    prompt: 'Identify the part with an error: (A) Each of the students (B) have (C) submitted (D) their essay.',
    options: ['(A) Each of the students', '(B) have', '(C) submitted', '(D) their essay'],
    correctIndex: 1,
    explanation: '"Each" is singular and takes "has", not "have".',
  });

  console.log('Seed complete: 10 skills, 16 vocabulary entries, questions across all skills.');
}

// Runs independently of the skills guard above, so it also applies to DBs that already
// had content seeded before multi-user login existed.
function ensureDefaultAdmin() {
  const existing = db.prepare('SELECT COUNT(*) AS c FROM users').get();
  if (existing.c > 0) return;

  const info = db
    .prepare("INSERT INTO users (name, pin, role) VALUES (?, NULL, 'admin')")
    .run('Admin');
  const userId = Number(info.lastInsertRowid);
  db.prepare(
    "INSERT INTO student_profile (user_id, exam_date, start_date, xp, streak) VALUES (?, NULL, date('now'), 0, 0)"
  ).run(userId);
  console.log('Created default admin account: "Admin" (no PIN). Add more people from Admin > Users.');
}

run();
ensureDefaultAdmin();

if (require.main === module) {
  process.exit(0);
}
