// Second additive content batch — original vocabulary + questions (academic/exam-prep
// register), independent of any third-party word list or document. Idempotent: checks
// a marker word before inserting, and only adds to whatever already exists.

const db = require('./connection');

const NEW_VOCAB = [
  { lemma: 'achieve', pos: 'verb', cefr: 'B1', thai: 'บรรลุ, ประสบความสำเร็จ', ex: 'She worked hard to achieve her dream of becoming a doctor.', exTh: 'เธอทำงานหนักเพื่อบรรลุความฝันที่จะเป็นหมอ' },
  { lemma: 'acknowledge', pos: 'verb', cefr: 'B2', thai: 'ยอมรับ', ex: 'He finally acknowledged that he had made a mistake.', exTh: 'ในที่สุดเขาก็ยอมรับว่าเขาทำผิดพลาด' },
  { lemma: 'adapt', pos: 'verb', cefr: 'B1', thai: 'ปรับตัว', ex: 'It took her a few weeks to adapt to the new school.', exTh: 'เธอใช้เวลาสองสามสัปดาห์ในการปรับตัวเข้ากับโรงเรียนใหม่' },
  { lemma: 'additional', pos: 'adjective', cefr: 'B1', thai: 'เพิ่มเติม', ex: 'The teacher gave additional exercises for extra practice.', exTh: 'ครูให้แบบฝึกหัดเพิ่มเติมเพื่อฝึกฝนเพิ่มเติม' },
  { lemma: 'advantage', pos: 'noun', cefr: 'B1', thai: 'ข้อได้เปรียบ', ex: 'Speaking two languages gives you a big advantage in the job market.', exTh: 'การพูดได้สองภาษาทำให้คุณได้เปรียบอย่างมากในตลาดงาน' },
  { lemma: 'advocate', pos: 'verb', cefr: 'C1', thai: 'สนับสนุน', ex: 'Teachers advocate for more reading time in the school schedule.', exTh: 'ครูสนับสนุนให้มีเวลาอ่านหนังสือมากขึ้นในตารางเรียน' },
  { lemma: 'aid', pos: 'noun', cefr: 'B1', thai: 'ความช่วยเหลือ', ex: 'The organization provides aid to students who cannot afford books.', exTh: 'องค์กรนี้ให้ความช่วยเหลือแก่นักเรียนที่ไม่มีเงินซื้อหนังสือ' },
  { lemma: 'aim', pos: 'noun', cefr: 'B1', thai: 'เป้าหมาย', ex: 'Her aim is to finish the course before the exam.', exTh: 'เป้าหมายของเธอคือทำหลักสูตรให้เสร็จก่อนสอบ' },
  { lemma: 'alter', pos: 'verb', cefr: 'B2', thai: 'เปลี่ยนแปลง', ex: 'They had to alter their plan because of the weather.', exTh: 'พวกเขาต้องเปลี่ยนแปลงแผนเพราะสภาพอากาศ' },
  { lemma: 'analyze', pos: 'verb', cefr: 'B2', thai: 'วิเคราะห์', ex: 'Students learn to analyze a passage before answering questions.', exTh: 'นักเรียนเรียนรู้ที่จะวิเคราะห์บทความก่อนตอบคำถาม' },
  { lemma: 'anticipate', pos: 'verb', cefr: 'C1', thai: 'คาดการณ์', ex: 'We anticipate that the exam will be more difficult this year.', exTh: 'เราคาดการณ์ว่าข้อสอบปีนี้จะยากขึ้น' },
  { lemma: 'appropriate', pos: 'adjective', cefr: 'B1', thai: 'เหมาะสม', ex: 'Choose the most appropriate word to complete the sentence.', exTh: 'เลือกคำที่เหมาะสมที่สุดเพื่อเติมประโยคให้สมบูรณ์' },
  { lemma: 'approximate', pos: 'adjective', cefr: 'B2', thai: 'โดยประมาณ', ex: 'The approximate distance to the school is two kilometers.', exTh: 'ระยะทางโดยประมาณไปโรงเรียนคือสองกิโลเมตร' },
  { lemma: 'assert', pos: 'verb', cefr: 'C1', thai: 'ยืนยัน, กล่าวอ้าง', ex: 'She asserted that her answer was correct.', exTh: 'เธอยืนยันว่าคำตอบของเธอถูกต้อง' },
  { lemma: 'assess', pos: 'verb', cefr: 'B2', thai: 'ประเมิน', ex: 'The test is designed to assess reading comprehension.', exTh: 'แบบทดสอบนี้ออกแบบมาเพื่อประเมินความเข้าใจในการอ่าน' },
  { lemma: 'assist', pos: 'verb', cefr: 'B1', thai: 'ช่วยเหลือ', ex: 'The tutor assists students who are struggling with grammar.', exTh: 'ติวเตอร์ช่วยเหลือนักเรียนที่มีปัญหาเรื่องไวยากรณ์' },
  { lemma: 'assume', pos: 'verb', cefr: 'B2', thai: 'สันนิษฐาน, สมมติ', ex: "Don't assume the answer is correct without checking.", exTh: 'อย่าสันนิษฐานว่าคำตอบถูกต้องโดยไม่ตรวจสอบ' },
  { lemma: 'assure', pos: 'verb', cefr: 'B2', thai: 'รับรอง, ทำให้มั่นใจ', ex: 'I assure you that the exam schedule will not change.', exTh: 'ฉันรับรองว่าตารางสอบจะไม่เปลี่ยนแปลง' },
  { lemma: 'attain', pos: 'verb', cefr: 'C1', thai: 'บรรลุ, ได้มาซึ่ง', ex: 'It takes discipline to attain a high score on the exam.', exTh: 'ต้องมีวินัยจึงจะสามารถบรรลุคะแนนสูงในข้อสอบได้' },
  { lemma: 'attribute', pos: 'verb', cefr: 'C1', thai: 'ให้เหตุผลว่าเป็นเพราะ', ex: 'She attributes her success to daily practice.', exTh: 'เธอให้เหตุผลว่าความสำเร็จของเธอมาจากการฝึกฝนทุกวัน' },
  { lemma: 'authority', pos: 'noun', cefr: 'B2', thai: 'อำนาจ, ผู้มีอำนาจ', ex: 'The school authority announced a new exam schedule.', exTh: 'ผู้มีอำนาจของโรงเรียนประกาศตารางสอบใหม่' },
  { lemma: 'available', pos: 'adjective', cefr: 'B1', thai: 'ที่มีให้ใช้ได้', ex: 'Extra practice tests are available on the school website.', exTh: 'มีแบบทดสอบเพิ่มเติมให้ใช้ได้บนเว็บไซต์โรงเรียน' },
  { lemma: 'aware', pos: 'adjective', cefr: 'B1', thai: 'ตระหนัก, รู้ตัว', ex: 'Be aware of the time limit during the mock exam.', exTh: 'ตระหนักถึงเวลาที่จำกัดระหว่างการสอบจำลอง' },
  { lemma: 'benefit', pos: 'noun', cefr: 'B1', thai: 'ประโยชน์', ex: 'Daily review has a huge benefit for long-term memory.', exTh: 'การทบทวนทุกวันมีประโยชน์อย่างมากต่อความจำระยะยาว' },
  { lemma: 'capable', pos: 'adjective', cefr: 'B2', thai: 'มีความสามารถ', ex: 'She is capable of solving difficult grammar problems.', exTh: 'เธอมีความสามารถในการแก้ปัญหาไวยากรณ์ที่ยาก' },
  { lemma: 'capacity', pos: 'noun', cefr: 'B2', thai: 'ความสามารถ, ความจุ', ex: 'The classroom has a capacity of thirty students.', exTh: 'ห้องเรียนมีความจุนักเรียนสามสิบคน' },
  { lemma: 'category', pos: 'noun', cefr: 'B1', thai: 'หมวดหมู่', ex: 'Sort the vocabulary words into the correct category.', exTh: 'จัดคำศัพท์ให้อยู่ในหมวดหมู่ที่ถูกต้อง' },
  { lemma: 'cease', pos: 'verb', cefr: 'C1', thai: 'หยุด, ยุติ', ex: 'The rain finally ceased after the exam started.', exTh: 'ฝนหยุดตกในที่สุดหลังจากการสอบเริ่มขึ้น' },
  { lemma: 'challenge', pos: 'noun', cefr: 'B1', thai: 'ความท้าทาย', ex: 'The reading section is always the biggest challenge for students.', exTh: 'ส่วนการอ่านมักเป็นความท้าทายที่ใหญ่ที่สุดสำหรับนักเรียนเสมอ' },
  { lemma: 'circumstance', pos: 'noun', cefr: 'B2', thai: 'สถานการณ์', ex: 'Under normal circumstances, the exam lasts two hours.', exTh: 'ภายใต้สถานการณ์ปกติ การสอบใช้เวลาสองชั่วโมง' },
  { lemma: 'clarify', pos: 'verb', cefr: 'B2', thai: 'ทำให้ชัดเจน', ex: 'Could you clarify what this question is asking?', exTh: 'คุณช่วยทำให้ชัดเจนได้ไหมว่าคำถามนี้ถามอะไร' },
  { lemma: 'collapse', pos: 'verb', cefr: 'B2', thai: 'ล้มลง, พังทลาย', ex: 'The old building collapsed after the earthquake.', exTh: 'อาคารเก่าพังทลายลงหลังจากแผ่นดินไหว' },
  { lemma: 'commit', pos: 'verb', cefr: 'B2', thai: 'มุ่งมั่น, กระทำ', ex: 'You need to commit to studying every day to improve.', exTh: 'คุณต้องมุ่งมั่นเรียนทุกวันจึงจะพัฒนาได้' },
  { lemma: 'compensate', pos: 'verb', cefr: 'C1', thai: 'ชดเชย', ex: 'Extra practice can compensate for a weak vocabulary.', exTh: 'การฝึกฝนเพิ่มเติมสามารถชดเชยคำศัพท์ที่อ่อนแอได้' },
  { lemma: 'compile', pos: 'verb', cefr: 'C1', thai: 'รวบรวม', ex: 'The teacher compiled a list of common mistakes.', exTh: 'ครูรวบรวมรายการข้อผิดพลาดที่พบบ่อย' },
  { lemma: 'complex', pos: 'adjective', cefr: 'B2', thai: 'ซับซ้อน', ex: "This grammar rule seems complex at first, but it's easy with practice.", exTh: 'กฎไวยากรณ์นี้ดูซับซ้อนในตอนแรก แต่จะง่ายขึ้นเมื่อฝึกฝน' },
  { lemma: 'component', pos: 'noun', cefr: 'B2', thai: 'องค์ประกอบ', ex: 'Vocabulary is a key component of the reading exam.', exTh: 'คำศัพท์เป็นองค์ประกอบสำคัญของข้อสอบการอ่าน' },
  { lemma: 'compromise', pos: 'noun', cefr: 'B2', thai: 'การประนีประนอม', ex: 'They compromised on a study schedule that worked for both of them.', exTh: 'พวกเขาประนีประนอมเรื่องตารางเรียนที่ใช้ได้กับทั้งคู่' },
  { lemma: 'conclude', pos: 'verb', cefr: 'B2', thai: 'สรุป', ex: 'The passage concludes with a strong recommendation.', exTh: 'บทความสรุปด้วยข้อเสนอแนะที่ชัดเจน' },
  { lemma: 'conduct', pos: 'verb', cefr: 'B2', thai: 'ดำเนินการ', ex: 'The school will conduct a mock exam next week.', exTh: 'โรงเรียนจะดำเนินการสอบจำลองในสัปดาห์หน้า' },
  { lemma: 'confirm', pos: 'verb', cefr: 'B1', thai: 'ยืนยัน', ex: 'Please confirm your exam date with the office.', exTh: 'กรุณายืนยันวันสอบของคุณกับสำนักงาน' },
  { lemma: 'consequence', pos: 'noun', cefr: 'B2', thai: 'ผลที่ตามมา', ex: 'Skipping practice has a consequence: slower progress.', exTh: 'การข้ามการฝึกฝนมีผลที่ตามมาคือความก้าวหน้าที่ช้าลง' },
  { lemma: 'considerable', pos: 'adjective', cefr: 'B2', thai: 'มาก, พอสมควร', ex: 'She made considerable progress after one month of daily practice.', exTh: 'เธอมีความก้าวหน้าอย่างมากหลังจากฝึกฝนทุกวันเป็นเวลาหนึ่งเดือน' },
  { lemma: 'consist', pos: 'verb', cefr: 'B1', thai: 'ประกอบด้วย', ex: 'The exam consists of four sections.', exTh: 'ข้อสอบประกอบด้วยสี่ส่วน' },
  { lemma: 'constant', pos: 'adjective', cefr: 'B2', thai: 'คงที่, สม่ำเสมอ', ex: 'Constant practice is more effective than cramming.', exTh: 'การฝึกฝนอย่างสม่ำเสมอมีประสิทธิภาพมากกว่าการอ่านหนังสือแบบเร่งด่วน' },
  { lemma: 'construct', pos: 'verb', cefr: 'B2', thai: 'สร้าง', ex: 'Learn how to construct a clear sentence in English.', exTh: 'เรียนรู้วิธีสร้างประโยคภาษาอังกฤษที่ชัดเจน' },
  { lemma: 'consult', pos: 'verb', cefr: 'B2', thai: 'ปรึกษา', ex: 'Consult the dictionary if you are not sure of a word.', exTh: 'ปรึกษาพจนานุกรมหากคุณไม่แน่ใจเกี่ยวกับคำศัพท์' },
  { lemma: 'consume', pos: 'verb', cefr: 'B2', thai: 'บริโภค, ใช้ไป', ex: 'Long reading passages consume a lot of exam time.', exTh: 'บทความที่ยาวใช้เวลาสอบไปมาก' },
  { lemma: 'context', pos: 'noun', cefr: 'B1', thai: 'บริบท', ex: 'Guess the meaning of the word from the context.', exTh: 'เดาความหมายของคำจากบริบท' },
  { lemma: 'contract', pos: 'noun', cefr: 'B2', thai: 'สัญญา', ex: 'The tutoring center asked parents to sign a contract.', exTh: 'ศูนย์ติวขอให้ผู้ปกครองเซ็นสัญญา' },
  { lemma: 'contrast', pos: 'noun', cefr: 'B2', thai: 'ความแตกต่าง', ex: "In contrast to last year, this year's exam was easier.", exTh: 'ตรงกันข้ามกับปีที่แล้ว ข้อสอบปีนี้ง่ายกว่า' },
  { lemma: 'contribute', pos: 'verb', cefr: 'B1', thai: 'มีส่วนร่วม, ส่งผล', ex: 'Daily reading contributes to a bigger vocabulary.', exTh: 'การอ่านทุกวันมีส่วนช่วยให้คำศัพท์มากขึ้น' },
  { lemma: 'convey', pos: 'verb', cefr: 'C1', thai: 'สื่อความหมาย, ถ่ายทอด', ex: 'Good writers convey their ideas clearly and simply.', exTh: 'นักเขียนที่ดีสื่อความหมายอย่างชัดเจนและเรียบง่าย' },
  { lemma: 'convince', pos: 'verb', cefr: 'B2', thai: 'โน้มน้าว', ex: 'He convinced his friend to study together every evening.', exTh: 'เขาโน้มน้าวเพื่อนให้เรียนด้วยกันทุกเย็น' },
  { lemma: 'cooperate', pos: 'verb', cefr: 'B2', thai: 'ร่วมมือ', ex: 'Students who cooperate in group study often learn faster.', exTh: 'นักเรียนที่ร่วมมือกันในการเรียนกลุ่มมักเรียนรู้ได้เร็วกว่า' },
  { lemma: 'correspond', pos: 'verb', cefr: 'B2', thai: 'สอดคล้องกัน', ex: 'Make sure your answer corresponds to the question asked.', exTh: 'ตรวจสอบให้แน่ใจว่าคำตอบของคุณสอดคล้องกับคำถามที่ถาม' },
  { lemma: 'crucial', pos: 'adjective', cefr: 'B2', thai: 'สำคัญยิ่ง', ex: 'Time management is crucial during the exam.', exTh: 'การบริหารเวลาสำคัญยิ่งในระหว่างการสอบ' },
  { lemma: 'cycle', pos: 'noun', cefr: 'B1', thai: 'วัฏจักร, รอบ', ex: 'The study plan follows a weekly review cycle.', exTh: 'แผนการเรียนเป็นไปตามรอบการทบทวนรายสัปดาห์' },
  { lemma: 'debate', pos: 'noun', cefr: 'B2', thai: 'การโต้แย้ง', ex: 'Teachers debate the best way to teach grammar.', exTh: 'ครูถกเถียงกันถึงวิธีที่ดีที่สุดในการสอนไวยากรณ์' },
  { lemma: 'decade', pos: 'noun', cefr: 'B1', thai: 'ทศวรรษ', ex: 'The exam format has changed a lot over the past decade.', exTh: 'รูปแบบข้อสอบเปลี่ยนไปมากในช่วงทศวรรษที่ผ่านมา' },
  { lemma: 'decline', pos: 'verb', cefr: 'B2', thai: 'ปฏิเสธ, ลดลง', ex: 'His motivation began to decline after the long holiday.', exTh: 'แรงจูงใจของเขาเริ่มลดลงหลังจากวันหยุดยาว' },
  { lemma: 'define', pos: 'verb', cefr: 'B1', thai: 'ให้คำจำกัดความ', ex: 'Can you define this word in your own words?', exTh: 'คุณสามารถให้คำจำกัดความของคำนี้ด้วยคำพูดของคุณเองได้ไหม' },
  { lemma: 'demonstrate', pos: 'verb', cefr: 'B2', thai: 'แสดงให้เห็น, สาธิต', ex: 'The teacher demonstrated how to answer a cloze question.', exTh: 'ครูสาธิตวิธีตอบคำถามแบบเติมคำ' },
  { lemma: 'deny', pos: 'verb', cefr: 'B2', thai: 'ปฏิเสธ', ex: 'She denied making any mistakes on the test.', exTh: 'เธอปฏิเสธว่าไม่ได้ทำผิดพลาดในการทดสอบ' },
  { lemma: 'derive', pos: 'verb', cefr: 'C1', thai: 'ได้มาจาก', ex: 'Many English words derive from Latin roots.', exTh: 'คำศัพท์ภาษาอังกฤษหลายคำได้มาจากรากศัพท์ภาษาละติน' },
  { lemma: 'despite', pos: 'preposition', cefr: 'B1', thai: 'แม้ว่า, ทั้งๆที่', ex: 'Despite the difficulty, she finished the exam on time.', exTh: 'แม้ว่าจะยาก เธอก็ทำข้อสอบเสร็จทันเวลา' },
  { lemma: 'detect', pos: 'verb', cefr: 'B2', thai: 'ตรวจจับ, ตรวจพบ', ex: 'Good readers can detect the main idea quickly.', exTh: 'นักอ่านที่ดีสามารถตรวจจับใจความหลักได้อย่างรวดเร็ว' },
  { lemma: 'determine', pos: 'verb', cefr: 'B2', thai: 'กำหนด, ตัดสินใจ', ex: 'The mock exam score helps determine which skills need work.', exTh: 'คะแนนสอบจำลองช่วยกำหนดว่าทักษะใดที่ต้องพัฒนา' },
  { lemma: 'devote', pos: 'verb', cefr: 'B2', thai: 'อุทิศ', ex: 'She devotes one hour a day to vocabulary practice.', exTh: 'เธออุทิศเวลาหนึ่งชั่วโมงต่อวันให้กับการฝึกคำศัพท์' },
  { lemma: 'dimension', pos: 'noun', cefr: 'C1', thai: 'มิติ, แง่มุม', ex: 'Reading speed adds a new dimension to exam preparation.', exTh: 'ความเร็วในการอ่านเพิ่มมิติใหม่ให้กับการเตรียมสอบ' },
];

function run() {
  const marker = db.prepare('SELECT id FROM vocabulary_entries WHERE lemma = ?').get('dimension');
  if (marker) {
    console.log('Expansion 2 skipped: already applied.');
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

  // ---------------- Vocabulary Meaning (15) ----------------
  const meaningWords = [
    'achieve', 'acknowledge', 'adapt', 'advantage', 'alter', 'analyze', 'anticipate',
    'appropriate', 'assess', 'assume', 'authority', 'benefit', 'capable', 'circumstance', 'crucial',
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

  // ---------------- Context Detective (15) ----------------
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'anticipate', prompt: 'Based on context, what does "anticipate" mean in: "Coaches anticipate a tough match, so they prepared extra defensive drills."?', options: ['expect beforehand', 'ignore completely', 'remember fondly', 'complain about'], correctIndex: 0, explanation: 'Preparing extra drills beforehand shows they expected a tough match — "anticipate".' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'assert', prompt: 'Based on context, what does "assert" mean in: "Despite the criticism, she continued to assert that her research was accurate."?', options: ['state firmly', 'quietly doubt', 'apologize for', 'forget about'], correctIndex: 0, explanation: 'Continuing despite criticism shows a firm statement — "assert".' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'attain', prompt: 'Based on context, what does "attain" mean in: "After years of training, the athlete finally attained her goal of an Olympic medal."?', options: ['successfully reach', 'give up on', 'forget', 'criticize'], correctIndex: 0, explanation: '"Finally" after years of training signals successfully reaching a goal — "attain".' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'cease', prompt: 'Based on context, what does "cease" mean in: "The factory was ordered to cease operations until the safety issue was fixed."?', options: ['stop', 'increase', 'celebrate', 'repair'], correctIndex: 0, explanation: 'Being ordered to stop until an issue is fixed signals "cease" means stop.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'collapse', prompt: 'Based on context, what does "collapse" mean in: "Ticket sales collapsed after the event was cancelled."?', options: ['fell sharply', 'rose sharply', 'stayed the same', 'were postponed'], correctIndex: 0, explanation: 'Cancellation causing sales to fall sharply signals "collapse".' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'compensate', prompt: 'Based on context, what does "compensate" mean in: "The airline offered a free ticket to compensate passengers for the delay."?', options: ['make up for a loss', 'apologize verbally only', 'ignore the problem', 'cancel the flight'], correctIndex: 0, explanation: 'Offering something for a delay is making up for a loss — "compensate".' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'convey', prompt: 'Based on context, what does "convey" mean in: "The poster used a single image to convey the danger of drunk driving."?', options: ['communicate an idea', 'hide an idea', 'sell a product', 'measure distance'], correctIndex: 0, explanation: 'Using an image to communicate danger is "convey" — to express or communicate.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'correspond', prompt: 'Based on context, what does "correspond" mean in: "The map\'s colors correspond to different regions of the country."?', options: ['match or relate to', 'contradict', 'replace', 'be larger than'], correctIndex: 0, explanation: 'Colors matching regions signals "correspond" means to match or relate.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'decline', prompt: 'Based on context, what does "decline" mean in: "Bee populations have declined sharply over the past decade."?', options: ['decreased', 'increased', 'migrated', 'been studied'], correctIndex: 0, explanation: '"Sharply" combined with a downward trend signals "decline" means decrease.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'derive', prompt: 'Based on context, what does "derive" mean in: "The word \'biology\' derives from Greek words meaning \'life\' and \'study\'."?', options: ['comes from / originates from', 'is unrelated to', 'was banned by', 'translates poorly from'], correctIndex: 0, explanation: 'A word tracing its origin to Greek roots is "derive" — to come from.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'detect', prompt: 'Based on context, what does "detect" mean in: "The new software can detect unusual activity on the network within seconds."?', options: ['notice or discover', 'delete', 'slow down', 'advertise'], correctIndex: 0, explanation: 'Software finding unusual activity is "detect" — to notice or discover.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'devote', prompt: 'Based on context, what does "devote" mean in: "She devotes every weekend to volunteering at the animal shelter."?', options: ['gives time and energy to', 'avoids completely', 'gets paid for', 'complains about'], correctIndex: 0, explanation: 'Giving every weekend to volunteering is "devote" — to give time/energy to something.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'considerable', prompt: 'Based on context, what does "considerable" mean in: "The renovation cost a considerable amount, far more than the family expected."?', options: ['large / significant', 'tiny', 'exact', 'refundable'], correctIndex: 0, explanation: '"Far more than expected" signals a large, "considerable" amount.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'compromise', prompt: 'Based on context, what does "compromise" mean in: "After a long argument, both sides reached a compromise that gave each side part of what they wanted."?', options: ['a middle-ground agreement', 'total victory for one side', 'a formal complaint', 'a broken promise'], correctIndex: 0, explanation: 'Each side getting part of what they wanted describes a "compromise".' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'authority', prompt: 'Based on context, what does "authority" mean in: "As team captain, she had the authority to decide who would start the match."?', options: ['the power or right to decide', 'a strong opinion', 'a written rule', 'public popularity'], correctIndex: 0, explanation: 'Having the power to decide as captain describes "authority".' });

  // ---------------- Word Family (10) ----------------
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'achieve', prompt: 'Which word is the noun form of "achieve"?', options: ['achievement', 'achievation', 'achievity', 'achievable-ness'], correctIndex: 0, explanation: '"achieve" (verb) -> "achievement" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'acknowledge', prompt: 'Which word is the noun form of "acknowledge"?', options: ['acknowledgment', 'acknowledgement-ity', 'acknowledgeness', 'acknowledgation'], correctIndex: 0, explanation: '"acknowledge" (verb) -> "acknowledgment" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'analyze', prompt: 'Which word is the noun form of "analyze"?', options: ['analysis', 'analyzement', 'analyzation', 'analyzity'], correctIndex: 0, explanation: '"analyze" (verb) -> "analysis" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'assess', prompt: 'Which word is the noun form of "assess"?', options: ['assessment', 'assessation', 'assessivity', 'assessness'], correctIndex: 0, explanation: '"assess" (verb) -> "assessment" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'assist', prompt: 'Which word is the noun form of "assist"?', options: ['assistance', 'assistment', 'assistivity', 'assistion'], correctIndex: 0, explanation: '"assist" (verb) -> "assistance" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'aware', prompt: 'Which word is the noun form of "aware"?', options: ['awareness', 'awarety', 'awarement', 'awarity'], correctIndex: 0, explanation: '"aware" (adj.) -> "awareness" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'capable', prompt: 'Which word is the noun form of "capable"?', options: ['capability', 'capableness-ity', 'capablement', 'capablify'], correctIndex: 0, explanation: '"capable" (adj.) -> "capability" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'confirm', prompt: 'Which word is the noun form of "confirm"?', options: ['confirmation', 'confirmity', 'confirmment', 'confirmology'], correctIndex: 0, explanation: '"confirm" (verb) -> "confirmation" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'contribute', prompt: 'Which word is the noun form of "contribute"?', options: ['contribution', 'contributement', 'contributivity', 'contribution-ness'], correctIndex: 0, explanation: '"contribute" (verb) -> "contribution" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'define', prompt: 'Which word is the noun form of "define"?', options: ['definition', 'definement', 'definity', 'definology'], correctIndex: 0, explanation: '"define" (verb) -> "definition" (noun).' });

  console.log('Expansion 2 complete: 70 new vocabulary entries, 40 new questions.');
}

run();

if (require.main === module) {
  process.exit(0);
}
