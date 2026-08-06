// Fifth additive content batch. Word selection sourced from the New General Service
// List (NGSL) — Browne, C., Culligan, B., and Phillips, J., licensed under a Creative
// Commons Attribution-ShareAlike 4.0 International License (https://www.newgeneralservicelist.com).
// The word list itself is used per that license; all Thai meanings, example sentences,
// hints, and questions below are original content written for this project. CEFR tags
// are independent estimates, not copied from any publisher's classification.

const db = require('./connection');

const NEW_VOCAB = [
  { lemma: 'depend', pos: 'verb', cefr: 'A2', thai: 'ขึ้นอยู่กับ', ex: 'Your final score depends on both grammar and vocabulary sections.', exTh: 'คะแนนสุดท้ายของคุณขึ้นอยู่กับทั้งส่วนไวยากรณ์และคำศัพท์' },
  { lemma: 'dependent', pos: 'adjective', cefr: 'B1', thai: 'ขึ้นอยู่กับ, พึ่งพา', ex: 'Success in the exam is dependent on consistent daily practice.', exTh: 'ความสำเร็จในการสอบขึ้นอยู่กับการฝึกฝนอย่างสม่ำเสมอทุกวัน' },
  { lemma: 'deposit', pos: 'noun', cefr: 'B1', thai: 'เงินมัดจำ, การฝาก', ex: 'Parents paid a deposit to reserve a seat in the tutoring class.', exTh: 'ผู้ปกครองจ่ายเงินมัดจำเพื่อจองที่นั่งในชั้นเรียนพิเศษ' },
  { lemma: 'depth', pos: 'noun', cefr: 'B1', thai: 'ความลึก, ความลึกซึ้ง', ex: 'The reading passage explores the topic in great depth.', exTh: 'บทความที่อ่านสำรวจหัวข้อนี้อย่างลึกซึ้งมาก' },
  { lemma: 'describe', pos: 'verb', cefr: 'A2', thai: 'บรรยาย, อธิบาย', ex: 'Describe your daily study routine in three sentences.', exTh: 'บรรยายกิจวัตรการเรียนประจำวันของคุณในสามประโยค' },
  { lemma: 'description', pos: 'noun', cefr: 'A2', thai: 'คำบรรยาย', ex: 'Write a short description of your favorite subject.', exTh: 'เขียนคำบรรยายสั้น ๆ เกี่ยวกับวิชาที่คุณชื่นชอบ' },
  { lemma: 'desert', pos: 'noun', cefr: 'A2', thai: 'ทะเลทราย', ex: 'The passage describes life in a hot, dry desert.', exTh: 'บทความบรรยายถึงชีวิตในทะเลทรายที่ร้อนและแห้งแล้ง' },
  { lemma: 'deserve', pos: 'verb', cefr: 'B1', thai: 'สมควรได้รับ', ex: 'She deserves a high score after months of hard work.', exTh: 'เธอสมควรได้คะแนนสูงหลังจากทำงานหนักมาหลายเดือน' },
  { lemma: 'design', pos: 'noun', cefr: 'A2', thai: 'การออกแบบ', ex: "The new exam has a different design than last year's.", exTh: 'ข้อสอบใหม่มีการออกแบบที่แตกต่างจากปีที่แล้ว' },
  { lemma: 'designer', pos: 'noun', cefr: 'B1', thai: 'นักออกแบบ', ex: 'A designer created the colorful vocabulary cards for the class.', exTh: 'นักออกแบบสร้างการ์ดคำศัพท์สีสันสดใสสำหรับชั้นเรียน' },
  { lemma: 'desire', pos: 'noun', cefr: 'B1', thai: 'ความปรารถนา', ex: 'Her desire to improve pushed her to study every day.', exTh: 'ความปรารถนาที่จะพัฒนาตัวเองผลักดันให้เธอเรียนทุกวัน' },
  { lemma: 'destroy', pos: 'verb', cefr: 'B1', thai: 'ทำลาย', ex: 'One careless mistake can destroy your exam score.', exTh: 'ความผิดพลาดที่ไม่ระวังเพียงครั้งเดียวสามารถทำลายคะแนนสอบของคุณได้' },
  { lemma: 'destruction', pos: 'noun', cefr: 'B1', thai: 'การทำลาย', ex: 'The story describes the destruction caused by the storm.', exTh: 'เรื่องราวบรรยายถึงการทำลายล้างที่เกิดจากพายุ' },
  { lemma: 'detail', pos: 'noun', cefr: 'A2', thai: 'รายละเอียด', ex: 'Pay attention to every detail in the reading passage.', exTh: 'ให้ความสนใจกับทุกรายละเอียดในบทความที่อ่าน' },
  { lemma: 'determination', pos: 'noun', cefr: 'B2', thai: 'ความมุ่งมั่น', ex: 'Her determination helped her finish the difficult course.', exTh: 'ความมุ่งมั่นของเธอช่วยให้เธอเรียนหลักสูตรที่ยากจนจบ' },
  { lemma: 'develop', pos: 'verb', cefr: 'A2', thai: 'พัฒนา', ex: 'Daily reading helps you develop a stronger vocabulary.', exTh: 'การอ่านทุกวันช่วยให้คุณพัฒนาคำศัพท์ให้แข็งแกร่งขึ้น' },
  { lemma: 'development', pos: 'noun', cefr: 'B1', thai: 'การพัฒนา', ex: "The report tracks each student's development over the term.", exTh: 'รายงานติดตามพัฒนาการของนักเรียนแต่ละคนตลอดภาคเรียน' },
  { lemma: 'device', pos: 'noun', cefr: 'A2', thai: 'อุปกรณ์', ex: 'Turn off your device during the exam.', exTh: 'ปิดอุปกรณ์ของคุณระหว่างการสอบ' },
  { lemma: 'differ', pos: 'verb', cefr: 'B1', thai: 'แตกต่างกัน', ex: 'The two exam formats differ in length and difficulty.', exTh: 'รูปแบบข้อสอบทั้งสองแตกต่างกันทั้งความยาวและความยาก' },
  { lemma: 'difference', pos: 'noun', cefr: 'A2', thai: 'ความแตกต่าง', ex: 'Explain the difference between the two grammar structures.', exTh: 'อธิบายความแตกต่างระหว่างโครงสร้างไวยากรณ์ทั้งสอง' },
  { lemma: 'difficulty', pos: 'noun', cefr: 'A2', thai: 'ความยาก, ความลำบาก', ex: 'Some students have difficulty with long reading passages.', exTh: 'นักเรียนบางคนมีความลำบากกับบทความที่ยาว' },
  { lemma: 'digital', pos: 'adjective', cefr: 'B1', thai: 'ดิจิทัล', ex: 'The school moved to digital exams last year.', exTh: 'โรงเรียนเปลี่ยนมาใช้การสอบแบบดิจิทัลเมื่อปีที่แล้ว' },
  { lemma: 'direct', pos: 'adjective', cefr: 'B1', thai: 'โดยตรง', ex: 'Give a direct answer instead of a long explanation.', exTh: 'ให้คำตอบโดยตรงแทนที่จะอธิบายยาว ๆ' },
  { lemma: 'direction', pos: 'noun', cefr: 'A2', thai: 'ทิศทาง, คำแนะนำ', ex: 'Read the direction carefully before answering each question.', exTh: 'อ่านคำแนะนำอย่างรอบคอบก่อนตอบคำถามแต่ละข้อ' },
  { lemma: 'directly', pos: 'adverb', cefr: 'B1', thai: 'โดยตรง', ex: 'This question relates directly to the reading passage above.', exTh: 'คำถามนี้เกี่ยวข้องโดยตรงกับบทความที่อ่านด้านบน' },
  { lemma: 'director', pos: 'noun', cefr: 'B1', thai: 'ผู้อำนวยการ', ex: 'The school director announced the new exam schedule.', exTh: 'ผู้อำนวยการโรงเรียนประกาศตารางสอบใหม่' },
  { lemma: 'disagree', pos: 'verb', cefr: 'A2', thai: 'ไม่เห็นด้วย', ex: "It's fine to disagree with a classmate's opinion politely.", exTh: 'การไม่เห็นด้วยกับความคิดเห็นของเพื่อนอย่างสุภาพนั้นไม่เป็นไร' },
  { lemma: 'disappear', pos: 'verb', cefr: 'A2', thai: 'หายไป', ex: 'Her nervousness began to disappear after the first few questions.', exTh: 'ความประหม่าของเธอเริ่มหายไปหลังจากคำถามสองสามข้อแรก' },
  { lemma: 'disappoint', pos: 'verb', cefr: 'B1', thai: 'ทำให้ผิดหวัง', ex: 'A low score can disappoint students who studied hard.', exTh: 'คะแนนต่ำอาจทำให้นักเรียนที่ตั้งใจเรียนรู้สึกผิดหวัง' },
  { lemma: 'disaster', pos: 'noun', cefr: 'B1', thai: 'ภัยพิบัติ', ex: 'The reading passage was about natural disaster preparation.', exTh: 'บทความที่อ่านเกี่ยวกับการเตรียมพร้อมรับภัยพิบัติทางธรรมชาติ' },
  { lemma: 'discipline', pos: 'noun', cefr: 'B1', thai: 'วินัย', ex: 'Discipline is more important than talent when preparing for exams.', exTh: 'วินัยสำคัญกว่าพรสวรรค์เมื่อต้องเตรียมตัวสอบ' },
  { lemma: 'discount', pos: 'noun', cefr: 'B1', thai: 'ส่วนลด', ex: 'The bookstore offered a discount on exam-prep books this month.', exTh: 'ร้านหนังสือให้ส่วนลดหนังสือเตรียมสอบในเดือนนี้' },
  { lemma: 'discover', pos: 'verb', cefr: 'A2', thai: 'ค้นพบ', ex: 'She discovered a new way to remember vocabulary.', exTh: 'เธอค้นพบวิธีใหม่ในการจำคำศัพท์' },
  { lemma: 'discovery', pos: 'noun', cefr: 'B1', thai: 'การค้นพบ', ex: 'His biggest discovery was that short daily practice works best.', exTh: 'การค้นพบที่ยิ่งใหญ่ที่สุดของเขาคือการฝึกฝนสั้น ๆ ทุกวันได้ผลดีที่สุด' },
  { lemma: 'discuss', pos: 'verb', cefr: 'A2', thai: 'อภิปราย, พูดคุย', ex: 'Discuss the main idea of the passage with your partner.', exTh: 'พูดคุยเกี่ยวกับใจความหลักของบทความกับคู่ของคุณ' },
  { lemma: 'discussion', pos: 'noun', cefr: 'A2', thai: 'การอภิปราย', ex: 'Group discussion helps clarify difficult grammar points.', exTh: 'การอภิปรายกลุ่มช่วยทำให้จุดไวยากรณ์ที่ยากชัดเจนขึ้น' },
  { lemma: 'display', pos: 'verb', cefr: 'B1', thai: 'แสดง', ex: 'The results are displayed on the school notice board.', exTh: 'ผลคะแนนแสดงอยู่บนกระดานประกาศของโรงเรียน' },
  { lemma: 'distance', pos: 'noun', cefr: 'A2', thai: 'ระยะทาง', ex: 'The passage describes the distance between two cities.', exTh: 'บทความบรรยายถึงระยะทางระหว่างสองเมือง' },
  { lemma: 'distinction', pos: 'noun', cefr: 'B2', thai: 'ความแตกต่าง, เกียรตินิยม', ex: 'There is an important distinction between these two similar words.', exTh: 'มีความแตกต่างที่สำคัญระหว่างคำที่คล้ายกันสองคำนี้' },
  { lemma: 'distinguish', pos: 'verb', cefr: 'B2', thai: 'แยกแยะ', ex: 'Learn to distinguish between count and non-count nouns.', exTh: 'เรียนรู้ที่จะแยกแยะระหว่างคำนามนับได้และนับไม่ได้' },
  { lemma: 'distribute', pos: 'verb', cefr: 'B1', thai: 'แจกจ่าย', ex: 'The teacher distributed the mock exam papers to every student.', exTh: 'ครูแจกกระดาษข้อสอบจำลองให้นักเรียนทุกคน' },
  { lemma: 'district', pos: 'noun', cefr: 'B1', thai: 'เขต', ex: 'Schools in this district share the same exam schedule.', exTh: 'โรงเรียนในเขตนี้ใช้ตารางสอบเดียวกัน' },
  { lemma: 'disturb', pos: 'verb', cefr: 'B1', thai: 'รบกวน', ex: "Please don't disturb the students during the exam.", exTh: 'กรุณาอย่ารบกวนนักเรียนระหว่างการสอบ' },
  { lemma: 'diversity', pos: 'noun', cefr: 'B2', thai: 'ความหลากหลาย', ex: 'The reading passage celebrates cultural diversity.', exTh: 'บทความที่อ่านยกย่องความหลากหลายทางวัฒนธรรม' },
  { lemma: 'divide', pos: 'verb', cefr: 'A2', thai: 'แบ่ง', ex: 'Divide your study time evenly between all subjects.', exTh: 'แบ่งเวลาเรียนของคุณให้เท่า ๆ กันในทุกวิชา' },
  { lemma: 'division', pos: 'noun', cefr: 'B1', thai: 'การแบ่ง', ex: 'The exam has a clear division between reading and writing sections.', exTh: 'ข้อสอบมีการแบ่งที่ชัดเจนระหว่างส่วนการอ่านและการเขียน' },
  { lemma: 'document', pos: 'noun', cefr: 'B1', thai: 'เอกสาร', ex: 'Bring your ID document on the day of the exam.', exTh: 'นำเอกสารประจำตัวมาในวันสอบ' },
  { lemma: 'domestic', pos: 'adjective', cefr: 'B1', thai: 'ภายในประเทศ, ในบ้าน', ex: 'The passage compares domestic and international education systems.', exTh: 'บทความเปรียบเทียบระบบการศึกษาภายในประเทศและระหว่างประเทศ' },
  { lemma: 'dominate', pos: 'verb', cefr: 'B2', thai: 'ครอบงำ, มีอิทธิพลเหนือ', ex: 'Grammar questions dominate the first half of the exam.', exTh: 'คำถามไวยากรณ์มีสัดส่วนมากในครึ่งแรกของข้อสอบ' },
  { lemma: 'double', pos: 'verb', cefr: 'A2', thai: 'เพิ่มเป็นสองเท่า', ex: 'She doubled her vocabulary in just two months.', exTh: 'เธอเพิ่มคำศัพท์ของตัวเองเป็นสองเท่าภายในสองเดือน' },
  { lemma: 'doubt', pos: 'noun', cefr: 'A2', thai: 'ความสงสัย', ex: 'If you have any doubt about a word, check the dictionary.', exTh: 'หากคุณมีข้อสงสัยเกี่ยวกับคำใด ให้ตรวจสอบพจนานุกรม' },
  { lemma: 'draft', pos: 'noun', cefr: 'B1', thai: 'ร่าง', ex: 'Write a first draft of your essay before revising it.', exTh: 'เขียนร่างแรกของเรียงความก่อนที่จะแก้ไข' },
  { lemma: 'drama', pos: 'noun', cefr: 'A2', thai: 'ละคร', ex: 'The class performed a short drama based on the story.', exTh: 'ชั้นเรียนแสดงละครสั้นที่สร้างจากเรื่องราว' },
  { lemma: 'dramatic', pos: 'adjective', cefr: 'B1', thai: 'น่าทึ่ง, รุนแรง', ex: 'She showed dramatic improvement after a month of practice.', exTh: 'เธอแสดงให้เห็นถึงการพัฒนาที่น่าทึ่งหลังจากฝึกฝนหนึ่งเดือน' },
  { lemma: 'dramatically', pos: 'adverb', cefr: 'B2', thai: 'อย่างมาก', ex: 'Her reading speed increased dramatically after daily practice.', exTh: 'ความเร็วในการอ่านของเธอเพิ่มขึ้นอย่างมากหลังจากฝึกฝนทุกวัน' },
  { lemma: 'drop', pos: 'verb', cefr: 'A2', thai: 'ลดลง, ทำหล่น', ex: "Don't let your score drop by skipping review sessions.", exTh: 'อย่าปล่อยให้คะแนนของคุณลดลงเพราะข้ามการทบทวน' },
  { lemma: 'due', pos: 'adjective', cefr: 'A2', thai: 'ครบกำหนด', ex: 'The essay is due before the mock exam begins.', exTh: 'เรียงความครบกำหนดส่งก่อนการสอบจำลองจะเริ่มขึ้น' },
  { lemma: 'duty', pos: 'noun', cefr: 'B1', thai: 'หน้าที่', ex: "It is every student's duty to review their mistakes.", exTh: 'เป็นหน้าที่ของนักเรียนทุกคนที่จะทบทวนข้อผิดพลาดของตนเอง' },
  { lemma: 'earn', pos: 'verb', cefr: 'A2', thai: 'ได้รับ, หาได้', ex: 'You earn extra points for finishing early with no mistakes.', exTh: 'คุณจะได้คะแนนพิเศษหากทำเสร็จเร็วโดยไม่มีข้อผิดพลาด' },
  { lemma: 'earth', pos: 'noun', cefr: 'A2', thai: 'โลก', ex: "The reading passage discusses changes on Earth's climate.", exTh: 'บทความที่อ่านกล่าวถึงการเปลี่ยนแปลงสภาพภูมิอากาศของโลก' },
  { lemma: 'ease', pos: 'noun', cefr: 'B1', thai: 'ความง่ายดาย', ex: 'With ease, she finished the vocabulary section first.', exTh: 'เธอทำส่วนคำศัพท์เสร็จเป็นคนแรกได้อย่างง่ายดาย' },
  { lemma: 'easily', pos: 'adverb', cefr: 'A2', thai: 'อย่างง่ายดาย', ex: 'She easily recognized the word from its root.', exTh: 'เธอจำคำนั้นได้อย่างง่ายดายจากรากศัพท์' },
  { lemma: 'eastern', pos: 'adjective', cefr: 'A2', thai: 'ทางตะวันออก', ex: 'The story is set in an eastern coastal town.', exTh: 'เรื่องราวเกิดขึ้นในเมืองชายฝั่งทางตะวันออก' },
  { lemma: 'economic', pos: 'adjective', cefr: 'B1', thai: 'ทางเศรษฐกิจ', ex: 'The passage explains the economic effects of tourism.', exTh: 'บทความอธิบายผลกระทบทางเศรษฐกิจของการท่องเที่ยว' },
  { lemma: 'economy', pos: 'noun', cefr: 'B1', thai: 'เศรษฐกิจ', ex: "The reading passage discusses the country's growing economy.", exTh: 'บทความที่อ่านกล่าวถึงเศรษฐกิจของประเทศที่กำลังเติบโต' },
  { lemma: 'edge', pos: 'noun', cefr: 'B1', thai: 'ขอบ, ความได้เปรียบ', ex: 'Extra vocabulary practice gives you an edge on the exam.', exTh: 'การฝึกคำศัพท์เพิ่มเติมทำให้คุณได้เปรียบในการสอบ' },
  { lemma: 'edit', pos: 'verb', cefr: 'B1', thai: 'แก้ไข', ex: 'Edit your essay carefully before submitting it.', exTh: 'แก้ไขเรียงความของคุณอย่างรอบคอบก่อนส่ง' },
  { lemma: 'edition', pos: 'noun', cefr: 'B1', thai: 'ฉบับ', ex: 'This is the newest edition of the exam-prep textbook.', exTh: 'นี่คือฉบับล่าสุดของหนังสือเตรียมสอบ' },
  { lemma: 'editor', pos: 'noun', cefr: 'B1', thai: 'บรรณาธิการ', ex: 'The editor checked every example sentence for errors.', exTh: 'บรรณาธิการตรวจสอบประโยคตัวอย่างทุกประโยคเพื่อหาข้อผิดพลาด' },
  { lemma: 'educate', pos: 'verb', cefr: 'B1', thai: 'ให้การศึกษา', ex: 'The program aims to educate students about time management.', exTh: 'โปรแกรมนี้มีเป้าหมายเพื่อให้ความรู้แก่นักเรียนเกี่ยวกับการบริหารเวลา' },
];

function run() {
  const marker = db.prepare('SELECT id FROM vocabulary_entries WHERE lemma = ?').get('educate');
  if (marker) {
    console.log('Expansion 5 skipped: already applied.');
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
    'depend', 'deposit', 'describe', 'desert', 'design', 'designer', 'desire', 'destroy',
    'detail', 'develop', 'device', 'difficulty', 'digital', 'direction', 'discount',
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
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'dependent', prompt: 'Based on context, what does "dependent" mean in: "Plant growth is highly dependent on sunlight and water."?', options: ['relying on something', 'unrelated to something', 'opposed to something', 'faster than something'], correctIndex: 0, explanation: 'Growth relying on sunlight/water means it is "dependent" on them.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'determination', prompt: 'Based on context, what does "determination" mean in: "Despite failing twice, she studied with even more determination the third time."?', options: ['firm, unwavering effort', 'sudden fear', 'quiet acceptance', 'mild curiosity'], correctIndex: 0, explanation: 'Trying harder despite failure shows "determination" — firm effort.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'disappoint', prompt: 'Based on context, what does "disappoint" mean in: "The sequel disappointed fans who loved the first movie."?', options: ['fail to meet expectations', 'exceed expectations', 'confuse completely', 'entertain briefly'], correctIndex: 0, explanation: 'Fans who "loved the first movie" being let down means the sequel failed to meet expectations.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'disaster', prompt: 'Based on context, what does "disaster" mean in: "Forgetting his notes before the presentation was a total disaster."?', options: ['a very bad situation', 'a minor inconvenience', 'a pleasant surprise', 'a planned event'], correctIndex: 0, explanation: '"Total" combined with a serious mistake signals "disaster" means a very bad situation.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'discipline', prompt: 'Based on context, what does "discipline" mean in: "It takes discipline to wake up early and study before school every day."?', options: ['self-control to follow a routine', 'natural talent', 'financial support', 'group cooperation'], correctIndex: 0, explanation: 'Waking up early consistently requires self-control — "discipline".' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'discovery', prompt: 'Based on context, what does "discovery" mean in: "The scientist\'s discovery changed how doctors treat the disease."?', options: ['something newly found out', 'something forgotten', 'something purchased', 'something destroyed'], correctIndex: 0, explanation: 'A finding that changes practice is a "discovery" — something newly found out.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'distinction', prompt: 'Based on context, what does "distinction" mean in: "There is a clear distinction between borrowing an idea and copying one."?', options: ['a clear difference', 'a strong similarity', 'a legal contract', 'a public apology'], correctIndex: 0, explanation: '"Clear distinction between" signals a clear difference.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'distinguish', prompt: 'Based on context, what does "distinguish" mean in: "It can be hard to distinguish identical twins at first."?', options: ['tell apart', 'introduce', 'photograph', 'compliment'], correctIndex: 0, explanation: 'Difficulty telling identical twins apart is about the ability to "distinguish" them.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'diversity', prompt: 'Based on context, what does "diversity" mean in: "The festival celebrated the diversity of foods from different regions."?', options: ['a wide variety', 'a strict rule', 'a low price', 'a small quantity'], correctIndex: 0, explanation: 'Many different regional foods being celebrated together shows "diversity" — variety.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'dominate', prompt: 'Based on context, what does "dominate" mean in: "One tall player dominated the basketball game, scoring most of the points."?', options: ['have the most control or influence', 'perform the worst', 'sit on the bench', 'referee the match'], correctIndex: 0, explanation: 'Scoring most of the points shows the player controlled/influenced the game most — "dominate".' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'dramatic', prompt: 'Based on context, what does "dramatic" mean in: "There was a dramatic drop in ticket sales after the price increase."?', options: ['sudden and very noticeable', 'slow and steady', 'completely unnoticed', 'planned in advance'], correctIndex: 0, explanation: 'A sudden, big change is described as "dramatic".' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'dramatically', prompt: 'Based on context, what does "dramatically" mean in: "Attendance dropped dramatically once the free snacks were removed."?', options: ['to a great, noticeable extent', 'only slightly', 'gradually over years', 'in a humorous way'], correctIndex: 0, explanation: 'A big, noticeable drop happened "dramatically".' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'doubt', prompt: 'Based on context, what does "doubt" mean in: "She had doubt about whether her answer to the tricky question was correct."?', options: ['uncertainty', 'complete confidence', 'anger', 'excitement'], correctIndex: 0, explanation: 'Not being sure about an answer is having "doubt" — uncertainty.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'edge', prompt: 'Based on context, what does "edge" mean in: "Knowing extra vocabulary gave her an edge over the other candidates."?', options: ['an advantage', 'a disadvantage', 'a penalty', 'a delay'], correctIndex: 0, explanation: 'Something that helps you do better than others is an "edge" — an advantage.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'disturb', prompt: 'Based on context, what does "disturb" mean in: "A loud noise outside disturbed the students during the quiet test."?', options: ['interrupt or bother', 'entertain', 'help', 'ignore'], correctIndex: 0, explanation: 'A loud noise breaking a quiet test is "disturbing" — interrupting or bothering.' });

  // ---------------- Word Family (10) ----------------
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'describe', prompt: 'Which word is the noun form of "describe"?', options: ['description', 'describement', 'describity', 'describation'], correctIndex: 0, explanation: '"describe" (verb) -> "description" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'destroy', prompt: 'Which word is the noun form of "destroy"?', options: ['destruction', 'destroyment', 'destroyity', 'destroyation'], correctIndex: 0, explanation: '"destroy" (verb) -> "destruction" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'differ', prompt: 'Which word is the noun form of "differ"?', options: ['difference', 'differment', 'differity', 'differation'], correctIndex: 0, explanation: '"differ" (verb) -> "difference" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'develop', prompt: 'Which word is the noun form of "develop"?', options: ['development', 'developement-ism', 'developity', 'developation'], correctIndex: 0, explanation: '"develop" (verb) -> "development" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'discover', prompt: 'Which word is the noun form of "discover"?', options: ['discovery', 'discoverment', 'discoverity', 'discoveration'], correctIndex: 0, explanation: '"discover" (verb) -> "discovery" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'discuss', prompt: 'Which word is the noun form of "discuss"?', options: ['discussion', 'discussment', 'discussity', 'discussation'], correctIndex: 0, explanation: '"discuss" (verb) -> "discussion" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'distinguish', prompt: 'Which word is the noun form of "distinguish"?', options: ['distinction', 'distinguishment', 'distinguishity', 'distinguishation'], correctIndex: 0, explanation: '"distinguish" (verb) relates to the noun "distinction".' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'divide', prompt: 'Which word is the noun form of "divide"?', options: ['division', 'dividement', 'dividity', 'dividation'], correctIndex: 0, explanation: '"divide" (verb) -> "division" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'dominate', prompt: 'Which word is the noun form of "dominate"?', options: ['domination', 'dominatement', 'dominity', 'dominateness'], correctIndex: 0, explanation: '"dominate" (verb) -> "domination" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'educate', prompt: 'Which word is the noun form of "educate"?', options: ['education', 'educatement', 'educatity', 'educateness'], correctIndex: 0, explanation: '"educate" (verb) -> "education" (noun).' });

  console.log('Expansion 5 complete: 70 new vocabulary entries, 40 new questions.');
}

run();

if (require.main === module) {
  process.exit(0);
}
