// Additive content expansion — original vocabulary + questions, independent of any
// third-party document. Idempotent: safe to run multiple times (checks a marker word
// before inserting) and only adds to whatever already exists in the DB.

const db = require('./connection');

const NEW_VOCAB = [
  { lemma: 'abandon', pos: 'verb', cefr: 'B1', thai: 'ละทิ้ง, เลิก', ex: 'The sailors had to abandon the sinking ship.', exTh: 'ลูกเรือต้องละทิ้งเรือที่กำลังจม' },
  { lemma: 'accumulate', pos: 'verb', cefr: 'B2', thai: 'สะสม, พอกพูน', ex: 'Dust had accumulated on the shelves after months of neglect.', exTh: 'ฝุ่นสะสมอยู่บนชั้นวางหลังจากถูกละเลยมาหลายเดือน' },
  { lemma: 'adequate', pos: 'adjective', cefr: 'B1', thai: 'เพียงพอ, พอเหมาะ', ex: "She didn't have adequate time to prepare for the exam.", exTh: 'เธอไม่มีเวลาเพียงพอในการเตรียมสอบ' },
  { lemma: 'ambiguous', pos: 'adjective', cefr: 'C1', thai: 'กำกวม, คลุมเครือ', ex: 'His answer was ambiguous, so nobody knew what he really meant.', exTh: 'คำตอบของเขากำกวม จึงไม่มีใครรู้ว่าเขาหมายความว่าอย่างไรจริง ๆ' },
  { lemma: 'apparent', pos: 'adjective', cefr: 'B1', thai: 'ชัดเจน, ปรากฏชัด', ex: 'It was apparent that she had not slept well.', exTh: 'เห็นได้ชัดว่าเธอนอนหลับไม่เพียงพอ' },
  { lemma: 'arbitrary', pos: 'adjective', cefr: 'C1', thai: 'ตามอำเภอใจ, ไม่มีเหตุผล', ex: "The manager's decision seemed arbitrary and unfair to the staff.", exTh: 'การตัดสินใจของผู้จัดการดูเหมือนตามอำเภอใจและไม่ยุติธรรมต่อพนักงาน' },
  { lemma: 'coherent', pos: 'adjective', cefr: 'B2', thai: 'เชื่อมโยงกันอย่างมีเหตุผล', ex: 'Write a coherent paragraph that connects each idea clearly.', exTh: 'เขียนย่อหน้าที่เชื่อมโยงกันอย่างมีเหตุผลและชัดเจน' },
  { lemma: 'comprehensive', pos: 'adjective', cefr: 'B2', thai: 'ครอบคลุม, ครบถ้วน', ex: 'The textbook offers a comprehensive review of grammar rules.', exTh: 'หนังสือเรียนเล่มนี้ให้การทบทวนกฎไวยากรณ์อย่างครอบคลุม' },
  { lemma: 'conscientious', pos: 'adjective', cefr: 'C1', thai: 'มีจิตสำนึก, รับผิดชอบ, ละเอียดรอบคอบ', ex: 'A conscientious worker double-checks every detail before submitting a report.', exTh: 'คนทำงานที่มีความรับผิดชอบจะตรวจสอบทุกรายละเอียดก่อนส่งรายงาน' },
  { lemma: 'contradict', pos: 'verb', cefr: 'B2', thai: 'ขัดแย้ง, พูดค้าน', ex: 'His new statement seemed to contradict what he had said earlier.', exTh: 'คำพูดใหม่ของเขาดูเหมือนจะขัดแย้งกับสิ่งที่เขาพูดไว้ก่อนหน้านี้' },
  { lemma: 'deteriorate', pos: 'verb', cefr: 'C1', thai: 'เสื่อมลง, แย่ลง', ex: 'The old bridge continued to deteriorate without regular maintenance.', exTh: 'สะพานเก่ายังคงเสื่อมสภาพลงเรื่อย ๆ เพราะขาดการบำรุงรักษา' },
  { lemma: 'diminish', pos: 'verb', cefr: 'B2', thai: 'ลดลง, บั่นทอน', ex: 'His enthusiasm for the project began to diminish after several setbacks.', exTh: 'ความกระตือรือร้นของเขาที่มีต่อโครงการเริ่มลดลงหลังจากเจออุปสรรคหลายครั้ง' },
  { lemma: 'distinct', pos: 'adjective', cefr: 'B1', thai: 'แตกต่างชัดเจน, เด่นชัด', ex: 'The two proposals have distinct advantages and disadvantages.', exTh: 'ข้อเสนอทั้งสองมีข้อดีและข้อเสียที่แตกต่างกันอย่างชัดเจน' },
  { lemma: 'elaborate', pos: 'verb', cefr: 'B2', thai: 'อธิบายอย่างละเอียด', ex: 'Could you elaborate on your plan for the project?', exTh: 'คุณช่วยอธิบายแผนงานของโครงการอย่างละเอียดได้ไหม' },
  { lemma: 'endure', pos: 'verb', cefr: 'B2', thai: 'อดทน, ทนต่อ', ex: 'The old building has endured many storms over the decades.', exTh: 'อาคารเก่าหลังนี้ทนต่อพายุมามากมายตลอดหลายทศวรรษ' },
  { lemma: 'enhance', pos: 'verb', cefr: 'B2', thai: 'เพิ่มพูน, ยกระดับ', ex: 'Regular practice can enhance your reading speed significantly.', exTh: 'การฝึกฝนอย่างสม่ำเสมอสามารถเพิ่มพูนความเร็วในการอ่านของคุณได้อย่างมาก' },
  { lemma: 'exceed', pos: 'verb', cefr: 'B1', thai: 'เกิน, เกินกว่า', ex: "The results exceeded everyone's expectations.", exTh: 'ผลลัพธ์เกินความคาดหวังของทุกคน' },
  { lemma: 'fluctuate', pos: 'verb', cefr: 'C1', thai: 'ผันผวน, เปลี่ยนแปลงขึ้นลง', ex: 'Prices in the market tend to fluctuate throughout the year.', exTh: 'ราคาสินค้าในตลาดมักผันผวนตลอดทั้งปี' },
  { lemma: 'fundamental', pos: 'adjective', cefr: 'B1', thai: 'พื้นฐาน, สำคัญยิ่ง', ex: 'Reading comprehension is a fundamental skill for the exam.', exTh: 'ความเข้าใจในการอ่านเป็นทักษะพื้นฐานที่สำคัญสำหรับการสอบ' },
  { lemma: 'generate', pos: 'verb', cefr: 'B1', thai: 'สร้าง, ก่อให้เกิด', ex: 'The new policy is expected to generate more job opportunities.', exTh: 'นโยบายใหม่นี้คาดว่าจะสร้างโอกาสในการทำงานมากขึ้น' },
  { lemma: 'hostile', pos: 'adjective', cefr: 'B2', thai: 'เป็นปรปักษ์, ไม่เป็นมิตร', ex: "The crowd grew hostile after the referee's controversial decision.", exTh: 'ฝูงชนเริ่มเป็นปรปักษ์หลังจากคำตัดสินที่ก่อให้เกิดข้อโต้แย้งของกรรมการ' },
  { lemma: 'inevitable', pos: 'adjective', cefr: 'B2', thai: 'หลีกเลี่ยงไม่ได้', ex: "Change is inevitable, so it's better to prepare for it.", exTh: 'การเปลี่ยนแปลงเป็นสิ่งที่หลีกเลี่ยงไม่ได้ ดังนั้นควรเตรียมตัวรับมือไว้ดีกว่า' },
  { lemma: 'inhibit', pos: 'verb', cefr: 'C1', thai: 'ยับยั้ง, ขัดขวาง', ex: 'Fear of failure can inhibit students from trying new things.', exTh: 'ความกลัวความล้มเหลวสามารถขัดขวางนักเรียนจากการลองสิ่งใหม่ ๆ' },
  { lemma: 'innovative', pos: 'adjective', cefr: 'B2', thai: 'สร้างสรรค์, แปลกใหม่', ex: 'The school introduced an innovative way to teach vocabulary.', exTh: 'โรงเรียนได้นำวิธีการสอนคำศัพท์แบบสร้างสรรค์มาใช้' },
  { lemma: 'intricate', pos: 'adjective', cefr: 'C1', thai: 'ซับซ้อน, ประณีต', ex: 'The novel has an intricate plot with many unexpected twists.', exTh: 'นวนิยายเรื่องนี้มีโครงเรื่องที่ซับซ้อนพร้อมจุดหักมุมที่คาดไม่ถึงมากมาย' },
  { lemma: 'mediocre', pos: 'adjective', cefr: 'C1', thai: 'ปานกลาง, ธรรมดาไม่โดดเด่น', ex: 'He was disappointed by his mediocre performance on the mock exam.', exTh: 'เขาผิดหวังกับผลการสอบที่ธรรมดาไม่โดดเด่นในการสอบจำลอง' },
  { lemma: 'obscure', pos: 'adjective', cefr: 'C1', thai: 'คลุมเครือ, ไม่ค่อยมีคนรู้จัก', ex: 'The meaning of the old poem remains obscure to most readers.', exTh: 'ความหมายของบทกวีเก่าเรื่องนี้ยังคงคลุมเครือสำหรับผู้อ่านส่วนใหญ่' },
  { lemma: 'persistent', pos: 'adjective', cefr: 'B2', thai: 'พากเพียร, ไม่ย่อท้อ', ex: 'Persistent practice is the key to mastering a new language.', exTh: 'การฝึกฝนอย่างไม่ย่อท้อคือกุญแจสำคัญในการเชี่ยวชาญภาษาใหม่' },
  { lemma: 'precise', pos: 'adjective', cefr: 'B1', thai: 'แม่นยำ, ชัดเจน', ex: 'Please give precise instructions so there is no confusion.', exTh: 'กรุณาให้คำแนะนำที่แม่นยำเพื่อไม่ให้เกิดความสับสน' },
  { lemma: 'reluctant', pos: 'adjective', cefr: 'B2', thai: 'ไม่เต็มใจ, ลังเล', ex: 'He was reluctant to ask for help even when he needed it.', exTh: 'เขาไม่เต็มใจที่จะขอความช่วยเหลือแม้ในตอนที่เขาต้องการมันจริง ๆ' },
];

function run() {
  const marker = db.prepare('SELECT id FROM vocabulary_entries WHERE lemma = ?').get('reluctant');
  if (marker) {
    console.log('Expansion skipped: already applied.');
    return;
  }

  const skillRows = db.prepare('SELECT id, code FROM skills').all();
  const skillId = Object.fromEntries(skillRows.map((s) => [s.code, s.id]));

  const insertVocab = db.prepare(
    'INSERT INTO vocabulary_entries (lemma, pos, cefr, thai_meaning, status) VALUES (?, ?, ?, ?, ?)'
  );
  const insertExample = db.prepare(
    'INSERT INTO vocabulary_examples (vocabulary_id, sentence_en, sentence_th) VALUES (?, ?, ?)'
  );
  const vocabId = {};
  for (const v of NEW_VOCAB) {
    const info = insertVocab.run(v.lemma, v.pos, v.cefr, v.thai, 'PUBLISHED');
    const id = Number(info.lastInsertRowid);
    vocabId[v.lemma] = id;
    insertExample.run(id, v.ex, v.exTh);
  }

  const insertQuestion = db.prepare(
    `INSERT INTO questions (skill_id, vocabulary_id, type, prompt, correct_answer, hint, explanation, difficulty, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertOption = db.prepare(
    'INSERT INTO question_options (question_id, sort_order, label, match_value, is_correct) VALUES (?, ?, ?, ?, ?)'
  );

  function addSingleChoice({ skill, vocab, prompt, options, correctIndex, hint, explanation, difficulty = 2 }) {
    const qId = Number(
      insertQuestion.run(
        skillId[skill],
        vocab ? vocabId[vocab] : null,
        'single_choice',
        prompt,
        null,
        hint || null,
        explanation,
        difficulty,
        'PUBLISHED'
      ).lastInsertRowid
    );
    options.forEach((label, i) => insertOption.run(qId, i, label, null, i === correctIndex ? 1 : 0));
    return qId;
  }

  function addFillBlank({ skill, vocab, prompt, answer, hint, explanation, difficulty = 2 }) {
    insertQuestion.run(
      skillId[skill],
      vocab ? vocabId[vocab] : null,
      'fill_blank',
      prompt,
      answer,
      hint || null,
      explanation,
      difficulty,
      'PUBLISHED'
    );
  }

  function addOrdering({ skill, prompt, items, hint, explanation, difficulty = 3 }) {
    const qId = Number(
      insertQuestion.run(skillId[skill], null, 'ordering', prompt, null, hint || null, explanation, difficulty, 'PUBLISHED')
        .lastInsertRowid
    );
    items.forEach((label, i) => insertOption.run(qId, i, label, null, 0));
    return qId;
  }

  function addErrorDetection({ skill, prompt, options, correctIndex, hint, explanation, difficulty = 3 }) {
    const qId = Number(
      insertQuestion.run(skillId[skill], null, 'error_detection', prompt, null, hint || null, explanation, difficulty, 'PUBLISHED')
        .lastInsertRowid
    );
    options.forEach((label, i) => insertOption.run(qId, i, label, null, i === correctIndex ? 1 : 0));
    return qId;
  }

  // ---------------- Vocabulary Meaning (15) ----------------
  const meaningWords = [
    'abandon', 'accumulate', 'adequate', 'ambiguous', 'apparent', 'arbitrary', 'coherent',
    'comprehensive', 'conscientious', 'contradict', 'deteriorate', 'diminish', 'distinct',
    'elaborate', 'endure',
  ];
  for (const word of meaningWords) {
    const entry = NEW_VOCAB.find((v) => v.lemma === word);
    const distractors = NEW_VOCAB.filter((v) => v.lemma !== word)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((v) => v.thai);
    const options = [entry.thai, ...distractors].sort(() => Math.random() - 0.5);
    addSingleChoice({
      skill: 'VOCAB_MEANING',
      vocab: word,
      prompt: `What does "${word}" mean?`,
      options,
      correctIndex: options.indexOf(entry.thai),
      explanation: `"${word}" means ${entry.thai}.`,
      difficulty: 2,
    });
  }

  // ---------------- Word Pattern (12) ----------------
  addSingleChoice({ skill: 'WORD_PATTERN', prompt: "Which suffix commonly turns a verb into a noun meaning \"a person who does something\", as in \"teacher\"?", options: ['-er', '-ish', '-ous', '-ful'], correctIndex: 0, explanation: '"-er" forms an agent noun: teach + -er = teacher.' });
  addSingleChoice({ skill: 'WORD_PATTERN', prompt: 'Which prefix means "against" or "opposite", as in "counterattack"?', options: ['counter-', 'semi-', 'multi-', 'uni-'], correctIndex: 0, explanation: '"counter-" means against or in opposition.' });
  addSingleChoice({ skill: 'WORD_PATTERN', prompt: 'The pattern "in- + adjective" usually creates the opposite meaning, as in "inaccurate". Which word follows this pattern?', options: ['inactive', 'interact', 'internal', 'interview'], correctIndex: 0, explanation: '"inactive" = not active, following the negative "in-" pattern.' });
  addSingleChoice({ skill: 'WORD_PATTERN', prompt: 'Which word follows the same "over + verb = too much" pattern as "overeat"?', options: ['overwork', 'oversee', 'overcoat', 'override'], correctIndex: 0, explanation: '"overwork" = to work too much, matching the pattern.' });
  addSingleChoice({ skill: 'WORD_PATTERN', prompt: 'Adding "-less" to a noun usually means:', options: ['without something', 'full of something', 'related to something', 'before something'], correctIndex: 0, explanation: '"-less" means "without", as in "careless" (without care).' });
  addSingleChoice({ skill: 'WORD_PATTERN', prompt: 'Which pair shows the same irregular plural pattern as "child → children"?', options: ['man → men', 'book → books', 'cat → cats', 'dog → dogs'], correctIndex: 0, explanation: '"man → men" is an irregular plural, like "child → children".' });
  addSingleChoice({ skill: 'WORD_PATTERN', prompt: 'The pattern "self- + noun/adjective" as in "self-taught" means:', options: ['done by oneself', 'done by others', 'done twice', 'done rarely'], correctIndex: 0, explanation: '"self-" means "by oneself".' });
  addSingleChoice({ skill: 'WORD_PATTERN', prompt: 'Which word follows the "mis- + verb = wrongly" pattern?', options: ['misplace', 'mission', 'missile', 'mistletoe'], correctIndex: 0, explanation: '"misplace" = to place wrongly.' });
  addSingleChoice({ skill: 'WORD_PATTERN', prompt: 'Doubling the final consonant before adding "-ing" happens in which word?', options: ['running (run)', 'walking (walk)', 'reading (read)', 'playing (play)'], correctIndex: 0, explanation: 'Short vowel + single consonant verbs like "run" double the consonant: running.' });
  addSingleChoice({ skill: 'WORD_PATTERN', prompt: 'Which word shows the regular comparative pattern for one-syllable adjectives (add "-er")?', options: ['faster', 'more beautiful', 'most difficult', 'less careful'], correctIndex: 0, explanation: 'One-syllable adjectives usually take "-er": fast → faster.' });
  addSingleChoice({ skill: 'WORD_PATTERN', prompt: 'The prefix "bi-" as in "bicycle" and "bilingual" means:', options: ['two', 'many', 'half', 'none'], correctIndex: 0, explanation: '"bi-" means "two".' });
  addSingleChoice({ skill: 'WORD_PATTERN', prompt: 'Which word follows the "adjective/noun + -ify = to make" pattern, as in "simplify"?', options: ['beautify', 'beauty', 'beautiful', 'beautifully'], correctIndex: 0, explanation: '"beautify" = to make beautiful, following the "-ify" pattern.' });

  // ---------------- Prefix & Suffix (12) ----------------
  addSingleChoice({ skill: 'PREFIX_SUFFIX', prompt: 'Which prefix means "before", as in "preview" and "prehistoric"?', options: ['pre-', 'post-', 'anti-', 'de-'], correctIndex: 0, explanation: '"pre-" means "before".' });
  addSingleChoice({ skill: 'PREFIX_SUFFIX', prompt: 'Which prefix means "after", as in "postpone" and "postwar"?', options: ['post-', 'pre-', 'sub-', 'super-'], correctIndex: 0, explanation: '"post-" means "after".' });
  addSingleChoice({ skill: 'PREFIX_SUFFIX', prompt: 'Which suffix means "the state or quality of being", as in "happiness"?', options: ['-ness', '-ish', '-ate', '-ory'], correctIndex: 0, explanation: '"-ness" forms abstract nouns of quality.' });
  addSingleChoice({ skill: 'PREFIX_SUFFIX', prompt: 'Which suffix means "full of", as in "careful" and "joyful"?', options: ['-ful', '-less', '-ism', '-ity'], correctIndex: 0, explanation: '"-ful" means "full of".' });
  addSingleChoice({ skill: 'PREFIX_SUFFIX', prompt: 'Which prefix means "not" or "opposite of", as in "impossible"?', options: ['im-', 'en-', 'out-', 'up-'], correctIndex: 0, explanation: '"im-" is a form of the negative prefix "in-" used before "p", "b", "m".' });
  addSingleChoice({ skill: 'PREFIX_SUFFIX', prompt: 'Which suffix turns an adjective into an adverb, as in "quickly"?', options: ['-ly', '-ish', '-en', '-ous'], correctIndex: 0, explanation: '"-ly" is the most common adverb-forming suffix.' });
  addSingleChoice({ skill: 'PREFIX_SUFFIX', prompt: 'Which prefix means "under", as in "underground"?', options: ['under-', 'over-', 'out-', 'up-'], correctIndex: 0, explanation: '"under-" means "below" or "beneath".' });
  addSingleChoice({ skill: 'PREFIX_SUFFIX', prompt: 'Which suffix means "one who performs an action", as in "actor"?', options: ['-or', '-ish', '-ive', '-al'], correctIndex: 0, explanation: '"-or" forms agent nouns, like "-er".' });
  addSingleChoice({ skill: 'PREFIX_SUFFIX', prompt: 'Which prefix means "across" or "through", as in "transport"?', options: ['trans-', 'inter-', 'intra-', 'extra-'], correctIndex: 0, explanation: '"trans-" means "across".' });
  addSingleChoice({ skill: 'PREFIX_SUFFIX', prompt: 'Which suffix means "capable of being", as in "visible"?', options: ['-ible', '-ful', '-less', '-hood'], correctIndex: 0, explanation: '"-ible" (a variant of "-able") means "capable of being".' });
  addSingleChoice({ skill: 'PREFIX_SUFFIX', prompt: 'Which prefix means "together" or "with", as in "cooperate"?', options: ['co-', 'de-', 'dis-', 're-'], correctIndex: 0, explanation: '"co-" means "together" or "jointly".' });
  addSingleChoice({ skill: 'PREFIX_SUFFIX', prompt: 'Which suffix means "the act or process of", as in "discussion"?', options: ['-sion', '-ish', '-en', '-some'], correctIndex: 0, explanation: '"-sion" (like "-tion") forms nouns of action or process.' });

  // ---------------- Root Words (12) ----------------
  addSingleChoice({ skill: 'ROOT_WORDS', prompt: 'The root "bene" (as in "benefit", "benevolent") relates to:', options: ['good', 'bad', 'life', 'time'], correctIndex: 0, explanation: '"bene" comes from Latin for "good" or "well".' });
  addSingleChoice({ skill: 'ROOT_WORDS', prompt: 'The root "mal" (as in "malfunction", "malnutrition") relates to:', options: ['bad', 'good', 'big', 'small'], correctIndex: 0, explanation: '"mal" comes from Latin for "bad".' });
  addSingleChoice({ skill: 'ROOT_WORDS', prompt: 'The root "tele" (as in "telephone", "television") relates to:', options: ['far / distant', 'near', 'fast', 'loud'], correctIndex: 0, explanation: '"tele" comes from Greek for "far" or "distant".' });
  addSingleChoice({ skill: 'ROOT_WORDS', prompt: 'The root "phon" (as in "telephone", "symphony") relates to:', options: ['sound', 'light', 'water', 'earth'], correctIndex: 0, explanation: '"phon" comes from Greek for "sound".' });
  addSingleChoice({ skill: 'ROOT_WORDS', prompt: 'The root "graph" (as in "photograph", "autograph") relates to:', options: ['writing / drawing', 'speaking', 'listening', 'running'], correctIndex: 0, explanation: '"graph" comes from Greek for "writing" or "drawing".' });
  addSingleChoice({ skill: 'ROOT_WORDS', prompt: 'The root "chrono" (as in "chronology", "synchronize") relates to:', options: ['time', 'space', 'color', 'number'], correctIndex: 0, explanation: '"chrono" comes from Greek for "time".' });
  addSingleChoice({ skill: 'ROOT_WORDS', prompt: 'The root "bio" (as in "biology", "biography") relates to:', options: ['life', 'death', 'mind', 'body-shape'], correctIndex: 0, explanation: '"bio" comes from Greek for "life".' });
  addSingleChoice({ skill: 'ROOT_WORDS', prompt: 'The root "geo" (as in "geography", "geology") relates to:', options: ['earth', 'sky', 'sea', 'fire'], correctIndex: 0, explanation: '"geo" comes from Greek for "earth".' });
  addSingleChoice({ skill: 'ROOT_WORDS', prompt: 'The root "auto" (as in "automatic", "autobiography") relates to:', options: ['self', 'other', 'machine', 'human'], correctIndex: 0, explanation: '"auto" comes from Greek for "self".' });
  addSingleChoice({ skill: 'ROOT_WORDS', prompt: 'The root "micro" (as in "microscope", "microphone") relates to:', options: ['small', 'large', 'fast', 'slow'], correctIndex: 0, explanation: '"micro" comes from Greek for "small".' });
  addSingleChoice({ skill: 'ROOT_WORDS', prompt: 'The root "ject" (as in "reject", "project") relates to:', options: ['throw', 'hold', 'break', 'build'], correctIndex: 0, explanation: '"ject" comes from Latin "jacere", to throw.' });
  addSingleChoice({ skill: 'ROOT_WORDS', prompt: 'The root "scrib/script" (as in "describe", "manuscript") relates to:', options: ['write', 'read', 'see', 'hear'], correctIndex: 0, explanation: '"scrib/script" comes from Latin "scribere", to write.' });

  // ---------------- Word Family (12) ----------------
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'adequate', prompt: 'Which word is the noun form of "adequate"?', options: ['adequacy', 'adequateness', 'adequatement', 'adequatly'], correctIndex: 0, explanation: '"adequate" (adj.) -> "adequacy" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'ambiguous', prompt: 'Which word is the noun form of "ambiguous"?', options: ['ambiguity', 'ambiguousness', 'ambiguate', 'ambiguously'], correctIndex: 0, explanation: '"ambiguous" (adj.) -> "ambiguity" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'coherent', prompt: 'Which word is the noun form of "coherent"?', options: ['coherence', 'coherency-ness', 'cohere-ation', 'coherentness'], correctIndex: 0, explanation: '"coherent" (adj.) -> "coherence" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'distinct', prompt: 'Which word is the noun form of "distinct"?', options: ['distinction', 'distinctness-ity', 'distinctify', 'distincted'], correctIndex: 0, explanation: '"distinct" (adj.) -> "distinction" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'persistent', prompt: 'Which word is the noun form of "persistent"?', options: ['persistence', 'persistency-ism', 'persist-ation', 'persistently-ness'], correctIndex: 0, explanation: '"persistent" (adj.) -> "persistence" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'precise', prompt: 'Which word is the noun form of "precise"?', options: ['precision', 'preciseness-ity', 'precisify', 'precisely-hood'], correctIndex: 0, explanation: '"precise" (adj.) -> "precision" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'reluctant', prompt: 'Which word is the noun form of "reluctant"?', options: ['reluctance', 'reluctantness', 'reluctivity', 'reluctify'], correctIndex: 0, explanation: '"reluctant" (adj.) -> "reluctance" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'innovative', prompt: 'Which word is the noun form related to "innovative"?', options: ['innovation', 'innovativeness-ity', 'innovate-ment', 'innovatingly'], correctIndex: 0, explanation: '"innovate" (verb) -> "innovation" (noun) -> "innovative" (adj.).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'generate', prompt: 'Which word is the noun form of "generate"?', options: ['generation', 'generatement', 'generature', 'generativity'], correctIndex: 0, explanation: '"generate" (verb) -> "generation" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'hostile', prompt: 'Which word is the noun form of "hostile"?', options: ['hostility', 'hostileness', 'hostilify', 'hostilion'], correctIndex: 0, explanation: '"hostile" (adj.) -> "hostility" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'fundamental', prompt: 'Which word is the adverb form of "fundamental"?', options: ['fundamentally', 'fundamentalness', 'fundamentalize', 'fundamentity'], correctIndex: 0, explanation: '"fundamental" (adj.) -> "fundamentally" (adverb).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'obscure', prompt: 'Which word is the noun form of "obscure"?', options: ['obscurity', 'obscureness-ity', 'obscurify', 'obscuration'], correctIndex: 0, explanation: '"obscure" (adj.) -> "obscurity" (noun).' });

  // ---------------- Grammar Formula (12) ----------------
  addFillBlank({ skill: 'GRAMMAR_FORMULA', prompt: 'By the time we arrived, the movie ___ (already / start).', answer: 'had already started', explanation: 'Past perfect: an earlier past action completed before another past action.' });
  addFillBlank({ skill: 'GRAMMAR_FORMULA', prompt: 'I wish I ___ (know) the answer yesterday.', answer: 'had known', explanation: '"wish + past perfect" expresses regret about the past.' });
  addFillBlank({ skill: 'GRAMMAR_FORMULA', prompt: 'The report ___ (write) by the committee before the meeting.', answer: 'was written', explanation: 'Passive voice, past simple: subject + was/were + past participle.' });
  addFillBlank({ skill: 'GRAMMAR_FORMULA', prompt: 'She suggested that he ___ (see) a doctor immediately.', answer: 'see', explanation: 'After "suggest that", use the base form (subjunctive).' });
  addFillBlank({ skill: 'GRAMMAR_FORMULA', prompt: 'If I ___ (be) you, I would study harder for the exam.', answer: 'were', explanation: 'Second conditional uses "were" for all subjects in the if-clause.' });
  addFillBlank({ skill: 'GRAMMAR_FORMULA', prompt: 'The students ___ (work) on the project since last Monday.', answer: 'have been working', explanation: 'Present perfect continuous: action started in the past and continuing now.' });
  addFillBlank({ skill: 'GRAMMAR_FORMULA', prompt: 'You ___ (not / need) to bring a pen; we will provide one.', answer: "don't need|do not need", explanation: '"don\'t need to" expresses lack of necessity.' });
  addFillBlank({ skill: 'GRAMMAR_FORMULA', prompt: 'This is the book ___ I told you about.', answer: 'that|which', explanation: 'Relative pronoun introducing a defining relative clause for a thing.' });
  addFillBlank({ skill: 'GRAMMAR_FORMULA', prompt: 'He ran so fast that he ___ (win) the race.', answer: 'won', explanation: '"so...that" clause with a completed past result: past simple.' });
  addFillBlank({ skill: 'GRAMMAR_FORMULA', prompt: 'Neither of the answers ___ (be) correct.', answer: 'is', explanation: '"neither of + plural noun" takes a singular verb.' });
  addFillBlank({ skill: 'GRAMMAR_FORMULA', prompt: 'The more you practice, the ___ (good) you become.', answer: 'better', explanation: '"The more..., the + comparative..." structure; "good" -> "better".' });
  addFillBlank({ skill: 'GRAMMAR_FORMULA', prompt: 'By next year, she ___ (study) English for ten years.', answer: 'will have studied', explanation: 'Future perfect: an action completed before a specific point in the future.' });

  // ---------------- Sentence Equation / ordering (10) ----------------
  addOrdering({ skill: 'SENTENCE_EQUATION', prompt: 'Arrange the words to form a correct sentence.', items: ['The', 'students', 'who', 'study', 'every', 'day', 'usually', 'get', 'better', 'scores'], explanation: 'Correct order: The students who study every day usually get better scores.' });
  addOrdering({ skill: 'SENTENCE_EQUATION', prompt: 'Arrange the words to form a correct sentence.', items: ['Although', 'the', 'exam', 'was', 'difficult', 'many', 'students', 'passed', 'it'], explanation: 'Correct order: Although the exam was difficult, many students passed it.' });
  addOrdering({ skill: 'SENTENCE_EQUATION', prompt: 'Arrange the words to form a correct sentence.', items: ['If', 'you', 'practice', 'regularly', 'you', 'will', 'improve', 'quickly'], explanation: 'Correct order: If you practice regularly, you will improve quickly.' });
  addOrdering({ skill: 'SENTENCE_EQUATION', prompt: 'Arrange the words to form a correct sentence.', items: ['The', 'book', 'that', 'I', 'borrowed', 'from', 'the', 'library', 'was', 'interesting'], explanation: 'Correct order: The book that I borrowed from the library was interesting.' });
  addOrdering({ skill: 'SENTENCE_EQUATION', prompt: 'Arrange the words to form a correct sentence.', items: ['By', 'the', 'time', 'the', 'teacher', 'arrived', 'the', 'class', 'had', 'already', 'started'], explanation: 'Correct order: By the time the teacher arrived, the class had already started.' });
  addOrdering({ skill: 'SENTENCE_EQUATION', prompt: 'Arrange the words to form a correct sentence.', items: ['Neither', 'the', 'students', 'nor', 'the', 'teacher', 'was', 'ready', 'for', 'the', 'test'], explanation: 'Correct order: Neither the students nor the teacher was ready for the test.' });
  addOrdering({ skill: 'SENTENCE_EQUATION', prompt: 'Arrange the words to form a correct sentence.', items: ['Not', 'only', 'did', 'she', 'pass', 'but', 'she', 'also', 'got', 'the', 'highest', 'score'], explanation: 'Correct order: Not only did she pass, but she also got the highest score.' });
  addOrdering({ skill: 'SENTENCE_EQUATION', prompt: 'Arrange the words to form a correct sentence.', items: ['The', 'more', 'you', 'read', 'the', 'more', 'vocabulary', 'you', 'learn'], explanation: 'Correct order: The more you read, the more vocabulary you learn.' });
  addOrdering({ skill: 'SENTENCE_EQUATION', prompt: 'Arrange the words to form a correct sentence.', items: ['Whoever', 'finishes', 'first', 'should', 'wait', 'for', 'the', 'others'], explanation: 'Correct order: Whoever finishes first should wait for the others.' });
  addOrdering({ skill: 'SENTENCE_EQUATION', prompt: 'Arrange the words to form a correct sentence.', items: ['Despite', 'the', 'heavy', 'rain', 'the', 'match', 'continued', 'as', 'planned'], explanation: 'Correct order: Despite the heavy rain, the match continued as planned.' });

  // ---------------- Context Detective (12) ----------------
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'ambiguous', prompt: 'Based on context, what does "ambiguous" mean in: "His instructions were ambiguous, so half the class did the task differently."?', options: ['unclear, open to more than one meaning', 'very detailed and specific', 'written in a foreign language', 'extremely short'], correctIndex: 0, explanation: 'Different interpretations by the class signal unclear, "ambiguous" instructions.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'hostile', prompt: 'Based on context, what does "hostile" mean in: "The negotiations turned hostile, with both sides shouting and refusing to compromise."?', options: ['unfriendly and aggressive', 'calm and cooperative', 'boring and slow', 'formal and polite'], correctIndex: 0, explanation: 'Shouting and refusing to compromise signal an unfriendly, "hostile" tone.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'inevitable', prompt: 'Based on context, what does "inevitable" mean in: "Once the storm formed offshore, flooding in the low-lying town became inevitable."?', options: ['certain to happen', 'unlikely to happen', 'already finished', 'a matter of choice'], correctIndex: 0, explanation: 'Nothing could stop it once the storm formed — "inevitable" means certain to happen.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'mediocre', prompt: 'Based on context, what does "mediocre" mean in: "The food was mediocre — not bad, but nothing you would ever order again."?', options: ['average, not impressive', 'excellent', 'terrible', 'extremely expensive'], correctIndex: 0, explanation: '"Not bad, but nothing special" signals an average, "mediocre" quality.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'obscure', prompt: 'Based on context, what does "obscure" mean in: "He quoted such an obscure historical fact that even the professor had to look it up."?', options: ['little-known', 'very famous', 'recently discovered', 'incorrect'], correctIndex: 0, explanation: 'Even the professor needed to look it up, signaling a little-known, "obscure" fact.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'persistent', prompt: 'Based on context, what does "persistent" mean in: "Despite being rejected three times, she remained persistent and applied again."?', options: ['continuing firmly despite difficulty', 'giving up quickly', 'feeling embarrassed', 'changing her mind'], correctIndex: 0, explanation: 'Applying again after rejection shows firm continuation — "persistent".' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'reluctant', prompt: 'Based on context, what does "reluctant" mean in: "He was reluctant to speak in front of the class, hesitating before every sentence."?', options: ['unwilling or hesitant', 'excited and eager', 'confident and loud', 'well-prepared'], correctIndex: 0, explanation: 'Hesitating before every sentence signals unwillingness — "reluctant".' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'fluctuate', prompt: 'Based on context, what does "fluctuate" mean in: "Her mood seemed to fluctuate throughout the day, cheerful one hour and irritable the next."?', options: ['change repeatedly, up and down', 'stay exactly the same', 'improve steadily', 'disappear completely'], correctIndex: 0, explanation: 'Cheerful then irritable shows repeated change — "fluctuate".' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'deteriorate', prompt: 'Based on context, what does "deteriorate" mean in: "Without treatment, his condition began to deteriorate rapidly."?', options: ['get worse', 'get better', 'stay stable', 'become funny'], correctIndex: 0, explanation: '"Without treatment" and "rapidly" signal a decline — "deteriorate" means to get worse.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'diminish', prompt: 'Based on context, what does "diminish" mean in: "As the medicine took effect, the pain began to diminish."?', options: ['decrease', 'increase', 'move location', 'multiply'], correctIndex: 0, explanation: 'Medicine taking effect on pain implies it is decreasing — "diminish".' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'exceed', prompt: 'Based on context, what does "exceed" mean in: "Ticket sales exceeded the venue\'s capacity, so extra seats had to be added."?', options: ['go beyond a limit', 'stay below a limit', 'match exactly', 'be cancelled'], correctIndex: 0, explanation: 'Needing extra seats shows sales went beyond capacity — "exceed".' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'intricate', prompt: 'Based on context, what does "intricate" mean in: "The watchmaker assembled hundreds of intricate, tiny parts by hand."?', options: ['detailed and complex', 'simple and plain', 'broken', 'oversized'], correctIndex: 0, explanation: 'Hundreds of tiny parts assembled by hand signals complexity — "intricate".' });

  // ---------------- Reading Bite (8) ----------------
  addSingleChoice({
    skill: 'READING_BITE',
    prompt:
      'Read the passage, then answer the question.\n\n' +
      '"Most people check their phones within minutes of waking up, before they have even had a chance to think clearly. ' +
      'Sleep experts suggest waiting at least twenty minutes after waking before looking at a screen, giving the brain time ' +
      'to fully transition out of sleep mode."\n\n' +
      'What is the main suggestion in the passage?',
    options: ['Delay checking your phone after waking up.', 'Check your phone as soon as you wake up.', 'Sleep for twenty more minutes.', 'Avoid using phones completely.'],
    correctIndex: 0,
    explanation: 'The passage recommends waiting before looking at a screen after waking.',
  });
  addSingleChoice({
    skill: 'READING_BITE',
    prompt:
      'Read the passage, then answer the question.\n\n' +
      '"A local community garden turned an empty lot into a shared space where neighbors grow vegetables together. ' +
      'Beyond the fresh produce, organizers say the garden has helped people who rarely spoke before become close friends."\n\n' +
      'According to the passage, what is one unexpected benefit of the garden?',
    options: ['It helped neighbors form friendships.', 'It lowered vegetable prices citywide.', 'It replaced the need for grocery stores.', 'It attracted tourists to the area.'],
    correctIndex: 0,
    explanation: 'The passage highlights new friendships among neighbors as a benefit beyond fresh produce.',
  });
  addSingleChoice({
    skill: 'READING_BITE',
    prompt:
      'Read the passage, then answer the question.\n\n' +
      '"Athletes who mix in short bursts of high-intensity exercise recover faster than those who train at a single steady pace. ' +
      'Coaches now build interval training into almost every session, even for beginners."\n\n' +
      'Why do coaches now include interval training for beginners?',
    options: ['It helps athletes recover faster.', 'It is easier than steady-pace training.', 'It requires no equipment.', 'It was required by new competition rules.'],
    correctIndex: 0,
    explanation: 'The passage states that mixing in high-intensity bursts leads to faster recovery.',
  });
  addSingleChoice({
    skill: 'READING_BITE',
    prompt:
      'Read the passage, then answer the question.\n\n' +
      '"When students study the same material in several short sessions over many days, they remember it far longer than ' +
      'if they crammed it all into one long session the night before a test."\n\n' +
      'What does the passage suggest about effective studying?',
    options: ['Spreading study sessions out over time improves memory.', 'Studying the night before a test is the most effective method.', 'Longer study sessions are always better.', 'Memory does not depend on how you study.'],
    correctIndex: 0,
    explanation: 'The passage contrasts spaced study sessions with cramming, favoring the spaced approach for memory.',
  });
  addSingleChoice({
    skill: 'READING_BITE',
    prompt:
      'Read the passage, then answer the question.\n\n' +
      '"Many offices now let employees choose their own hours, as long as the work gets done. Managers report that trust, ' +
      'rather than strict monitoring, has actually made teams more productive."\n\n' +
      'According to the passage, what has increased productivity in these offices?',
    options: ['Trusting employees instead of strict monitoring.', 'Requiring fixed nine-to-five hours.', 'Hiring more managers to watch employees.', 'Reducing the number of employees.'],
    correctIndex: 0,
    explanation: 'The passage attributes higher productivity to trust rather than strict monitoring.',
  });
  addSingleChoice({
    skill: 'READING_BITE',
    prompt:
      'Read the passage, then answer the question.\n\n' +
      '"A city replaced several parking lots with small parks. At first, business owners worried about losing customers, ' +
      'but foot traffic and sales in the area increased within a year."\n\n' +
      'What happened after the parking lots were replaced with parks?',
    options: ['Foot traffic and sales increased.', 'Businesses closed down.', 'Traffic congestion worsened.', 'Customers stopped visiting the area.'],
    correctIndex: 0,
    explanation: 'The passage states that foot traffic and sales increased within a year, despite initial worries.',
  });
  addSingleChoice({
    skill: 'READING_BITE',
    prompt:
      'Read the passage, then answer the question.\n\n' +
      '"Volunteers spent the weekend clearing plastic waste from the riverbank. Local officials say the cleanup, now held ' +
      'twice a year, has noticeably reduced the amount of trash reaching the sea."\n\n' +
      'What effect has the twice-yearly cleanup had?',
    options: ['It has reduced the trash reaching the sea.', 'It has increased plastic waste in the river.', 'It happens only once every few years.', 'It was cancelled due to low interest.'],
    correctIndex: 0,
    explanation: 'The passage states the cleanup has noticeably reduced trash reaching the sea.',
  });
  addSingleChoice({
    skill: 'READING_BITE',
    prompt:
      'Read the passage, then answer the question.\n\n' +
      '"Before a big exam, some students stay up all night reviewing notes. Research shows this often backfires: without ' +
      'enough sleep, the brain struggles to recall information it studied just hours earlier."\n\n' +
      'What does the research mentioned in the passage suggest?',
    options: ['Lack of sleep can hurt recall of recently studied material.', 'Staying up all night guarantees better exam results.', 'Sleep has no effect on memory.', 'Studying the night before is unnecessary.'],
    correctIndex: 0,
    explanation: 'The passage states that without enough sleep, recall of recently studied material suffers.',
  });

  // ---------------- Error Detection Tutorial (12) ----------------
  addErrorDetection({ skill: 'ERROR_DETECTION', prompt: 'Identify the part with an error: (A) Each of the boys (B) have (C) finished (D) their homework.', options: ['(A) Each of the boys', '(B) have', '(C) finished', '(D) their homework'], correctIndex: 1, explanation: '"Each" is singular and takes "has", not "have".' });
  addErrorDetection({ skill: 'ERROR_DETECTION', prompt: 'Identify the part with an error: (A) She (B) has been living (C) here since (D) five years.', options: ['(A) She', '(B) has been living', '(C) here since', '(D) five years'], correctIndex: 2, explanation: 'Use "for" with a duration ("for five years"), not "since".' });
  addErrorDetection({ skill: 'ERROR_DETECTION', prompt: 'Identify the part with an error: (A) The number of students (B) are increasing (C) every (D) year.', options: ['(A) The number of students', '(B) are increasing', '(C) every', '(D) year'], correctIndex: 1, explanation: '"The number of" takes a singular verb: "is increasing".' });
  addErrorDetection({ skill: 'ERROR_DETECTION', prompt: 'Identify the part with an error: (A) I have (B) saw (C) that movie (D) twice already.', options: ['(A) I have', '(B) saw', '(C) that movie', '(D) twice already'], correctIndex: 1, explanation: 'Present perfect needs the past participle "seen", not "saw".' });
  addErrorDetection({ skill: 'ERROR_DETECTION', prompt: 'Identify the part with an error: (A) He is (B) one of the (C) most tallest (D) students in class.', options: ['(A) He is', '(B) one of the', '(C) most tallest', '(D) students in class'], correctIndex: 2, explanation: 'Do not use "most" with an already-superlative form; it should be simply "tallest".' });
  addErrorDetection({ skill: 'ERROR_DETECTION', prompt: 'Identify the part with an error: (A) By the time she (B) arrives, we (C) already left (D) for the airport.', options: ['(A) By the time she', '(B) arrives', '(C) already left', '(D) for the airport'], correctIndex: 2, explanation: 'This needs future perfect: "will have already left".' });
  addErrorDetection({ skill: 'ERROR_DETECTION', prompt: 'Identify the part with an error: (A) Neither the teacher (B) nor the students (C) was aware (D) of the change.', options: ['(A) Neither the teacher', '(B) nor the students', '(C) was aware', '(D) of the change'], correctIndex: 2, explanation: 'With "neither...nor", the verb agrees with the nearer subject ("the students"), so it should be "were aware".' });
  addErrorDetection({ skill: 'ERROR_DETECTION', prompt: 'Identify the part with an error: (A) This is (B) the most interesting book (C) that I ever (D) have read.', options: ['(A) This is', '(B) the most interesting book', '(C) that I ever', '(D) have read'], correctIndex: 2, explanation: 'Word order should be "that I have ever read".' });
  addErrorDetection({ skill: 'ERROR_DETECTION', prompt: 'Identify the part with an error: (A) If I (B) will have more time, (C) I would travel (D) around the world.', options: ['(A) If I', '(B) will have more time,', '(C) I would travel', '(D) around the world'], correctIndex: 1, explanation: 'Second conditional needs the past simple in the if-clause: "If I had more time".' });
  addErrorDetection({ skill: 'ERROR_DETECTION', prompt: 'Identify the part with an error: (A) The information (B) that you gave me (C) were (D) very useful.', options: ['(A) The information', '(B) that you gave me', '(C) were', '(D) very useful'], correctIndex: 2, explanation: '"Information" is uncountable and singular, so it should be "was", not "were".' });
  addErrorDetection({ skill: 'ERROR_DETECTION', prompt: 'Identify the part with an error: (A) She is used to (B) get up early (C) because of her (D) part-time job.', options: ['(A) She is used to', '(B) get up early', '(C) because of her', '(D) part-time job'], correctIndex: 1, explanation: '"be used to" is followed by a gerund: "getting up early".' });
  addErrorDetection({ skill: 'ERROR_DETECTION', prompt: 'Identify the part with an error: (A) Not only he (B) missed the bus (C) but he also (D) forgot his bag.', options: ['(A) Not only he', '(B) missed the bus', '(C) but he also', '(D) forgot his bag'], correctIndex: 0, explanation: 'After "Not only" at the start of a sentence, use inverted word order: "Not only did he".' });

  console.log('Expansion complete: 30 new vocabulary entries, 127 new questions across 10 skills.');
}

run();

if (require.main === module) {
  process.exit(0);
}
