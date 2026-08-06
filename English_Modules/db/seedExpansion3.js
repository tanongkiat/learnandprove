// Third additive content batch. Word selection sourced from the New General Service
// List (NGSL) — Browne, C., Culligan, B., and Phillips, J., licensed under a Creative
// Commons Attribution-ShareAlike 4.0 International License (https://www.newgeneralservicelist.com).
// The word list itself is used per that license; all Thai meanings, example sentences,
// hints, and questions below are original content written for this project.

const db = require('./connection');

const NEW_VOCAB = [
  { lemma: 'claim', pos: 'verb', cefr: 'B1', thai: 'อ้าง, กล่าวอ้าง', ex: 'He claimed that he had finished all his homework.', exTh: 'เขาอ้างว่าทำการบ้านเสร็จหมดแล้ว' },
  { lemma: 'classical', pos: 'adjective', cefr: 'B1', thai: 'คลาสสิก, แบบดั้งเดิม', ex: 'She enjoys listening to classical music while she studies.', exTh: 'เธอชอบฟังเพลงคลาสสิกขณะที่อ่านหนังสือ' },
  { lemma: 'clause', pos: 'noun', cefr: 'B2', thai: 'อนุประโยค, ข้อกำหนด', ex: 'A relative clause gives extra information about a noun.', exTh: 'อนุประโยคสัมพัทธ์ให้ข้อมูลเพิ่มเติมเกี่ยวกับคำนาม' },
  { lemma: 'climate', pos: 'noun', cefr: 'B1', thai: 'ภูมิอากาศ', ex: 'The region has a dry climate with very little rain.', exTh: 'ภูมิภาคนี้มีภูมิอากาศแห้งแล้งมีฝนตกน้อยมาก' },
  { lemma: 'clinical', pos: 'adjective', cefr: 'C1', thai: 'ทางคลินิก, เกี่ยวกับการรักษา', ex: 'The clinical trial tested a new medicine for a year.', exTh: 'การทดลองทางคลินิกทดสอบยาชนิดใหม่เป็นเวลาหนึ่งปี' },
  { lemma: 'clothing', pos: 'noun', cefr: 'A2', thai: 'เสื้อผ้า', ex: 'Warm clothing is necessary during the cold season.', exTh: 'เสื้อผ้าที่อบอุ่นจำเป็นในช่วงฤดูหนาว' },
  { lemma: 'cluster', pos: 'noun', cefr: 'B2', thai: 'กลุ่มก้อน, กระจุก', ex: 'A cluster of new vocabulary words appeared in the reading passage.', exTh: 'คำศัพท์กลุ่มหนึ่งปรากฏในบทความที่อ่าน' },
  { lemma: 'coach', pos: 'noun', cefr: 'B1', thai: 'โค้ช, ผู้ฝึกสอน', ex: 'The coach reminded the team to review their mistakes after every match.', exTh: 'โค้ชเตือนทีมให้ทบทวนข้อผิดพลาดหลังการแข่งขันทุกครั้ง' },
  { lemma: 'coal', pos: 'noun', cefr: 'B1', thai: 'ถ่านหิน', ex: 'The old factory used coal to power its machines.', exTh: 'โรงงานเก่าใช้ถ่านหินในการขับเคลื่อนเครื่องจักร' },
  { lemma: 'coast', pos: 'noun', cefr: 'A2', thai: 'ชายฝั่ง', ex: 'The city is located along the eastern coast.', exTh: 'เมืองนี้ตั้งอยู่ตามแนวชายฝั่งด้านตะวันออก' },
  { lemma: 'code', pos: 'noun', cefr: 'B1', thai: 'รหัส, ประมวลกฎ', ex: "Students must follow the school's dress code.", exTh: 'นักเรียนต้องปฏิบัติตามระเบียบการแต่งกายของโรงเรียน' },
  { lemma: 'coin', pos: 'noun', cefr: 'A2', thai: 'เหรียญ', ex: 'She found an old coin in the garden.', exTh: 'เธอพบเหรียญเก่าในสวน' },
  { lemma: 'colleague', pos: 'noun', cefr: 'B1', thai: 'เพื่อนร่วมงาน', ex: 'He asked a colleague to review his lesson plan.', exTh: 'เขาขอให้เพื่อนร่วมงานตรวจสอบแผนการสอนของเขา' },
  { lemma: 'collection', pos: 'noun', cefr: 'A2', thai: 'การสะสม, ชุดสะสม', ex: 'She has a large collection of English storybooks.', exTh: 'เธอมีชุดสะสมหนังสือนิทานภาษาอังกฤษจำนวนมาก' },
  { lemma: 'column', pos: 'noun', cefr: 'B1', thai: 'คอลัมน์, สดมภ์', ex: 'Write your answers in the second column of the table.', exTh: 'เขียนคำตอบของคุณในคอลัมน์ที่สองของตาราง' },
  { lemma: 'combination', pos: 'noun', cefr: 'B1', thai: 'การผสมผสาน', ex: 'Success comes from a combination of hard work and good habits.', exTh: 'ความสำเร็จมาจากการผสมผสานระหว่างความขยันและนิสัยที่ดี' },
  { lemma: 'combine', pos: 'verb', cefr: 'B1', thai: 'ผสมผสาน, รวมกัน', ex: 'The lesson combines grammar practice with vocabulary review.', exTh: 'บทเรียนผสมผสานการฝึกไวยากรณ์เข้ากับการทบทวนคำศัพท์' },
  { lemma: 'comedy', pos: 'noun', cefr: 'B1', thai: 'ตลก, หนังตลก', ex: 'They watched a comedy to relax after the exam.', exTh: 'พวกเขาดูหนังตลกเพื่อผ่อนคลายหลังสอบ' },
  { lemma: 'comfort', pos: 'noun', cefr: 'B1', thai: 'ความสบาย, การปลอบโยน', ex: "Her friend's words gave her comfort before the exam.", exTh: 'คำพูดของเพื่อนทำให้เธอรู้สึกสบายใจก่อนสอบ' },
  { lemma: 'comfortable', pos: 'adjective', cefr: 'A2', thai: 'สบาย', ex: 'Choose a comfortable place to study at home.', exTh: 'เลือกสถานที่ที่สบายสำหรับอ่านหนังสือที่บ้าน' },
  { lemma: 'command', pos: 'noun', cefr: 'B1', thai: 'คำสั่ง', ex: 'The teacher gave a clear command to begin the test.', exTh: 'ครูให้คำสั่งที่ชัดเจนให้เริ่มทำข้อสอบ' },
  { lemma: 'comment', pos: 'noun', cefr: 'A2', thai: 'ความคิดเห็น', ex: 'The teacher left a helpful comment on her essay.', exTh: 'ครูแสดงความคิดเห็นที่เป็นประโยชน์บนเรียงความของเธอ' },
  { lemma: 'commercial', pos: 'adjective', cefr: 'B1', thai: 'เชิงพาณิชย์', ex: 'The company launched a new commercial product last month.', exTh: 'บริษัทเปิดตัวผลิตภัณฑ์เชิงพาณิชย์ใหม่เมื่อเดือนที่แล้ว' },
  { lemma: 'commission', pos: 'noun', cefr: 'B2', thai: 'คณะกรรมการ, ค่านายหน้า', ex: 'The commission reviewed the new curriculum before approval.', exTh: 'คณะกรรมการตรวจสอบหลักสูตรใหม่ก่อนอนุมัติ' },
  { lemma: 'commitment', pos: 'noun', cefr: 'B2', thai: 'ความมุ่งมั่น, พันธะสัญญา', ex: 'Passing the exam requires real commitment to daily study.', exTh: 'การสอบผ่านต้องอาศัยความมุ่งมั่นในการเรียนทุกวันอย่างแท้จริง' },
  { lemma: 'committee', pos: 'noun', cefr: 'B1', thai: 'คณะกรรมการ', ex: 'The exam committee decided on the new test format.', exTh: 'คณะกรรมการสอบตัดสินใจเรื่องรูปแบบข้อสอบใหม่' },
  { lemma: 'communicate', pos: 'verb', cefr: 'A2', thai: 'สื่อสาร', ex: 'Practice speaking to communicate more confidently in English.', exTh: 'ฝึกพูดเพื่อสื่อสารภาษาอังกฤษได้อย่างมั่นใจมากขึ้น' },
  { lemma: 'communication', pos: 'noun', cefr: 'B1', thai: 'การสื่อสาร', ex: 'Good communication helps avoid misunderstandings in group work.', exTh: 'การสื่อสารที่ดีช่วยหลีกเลี่ยงความเข้าใจผิดในการทำงานกลุ่ม' },
  { lemma: 'community', pos: 'noun', cefr: 'A2', thai: 'ชุมชน', ex: 'The school community came together to support the new students.', exTh: 'ชุมชนโรงเรียนร่วมมือกันสนับสนุนนักเรียนใหม่' },
  { lemma: 'comparison', pos: 'noun', cefr: 'B1', thai: 'การเปรียบเทียบ', ex: 'Make a comparison between the two reading passages.', exTh: 'ทำการเปรียบเทียบระหว่างบทความสองเรื่อง' },
  { lemma: 'compensation', pos: 'noun', cefr: 'C1', thai: 'ค่าชดเชย', ex: 'The airline offered compensation for the long delay.', exTh: 'สายการบินให้ค่าชดเชยสำหรับความล่าช้าที่ยาวนาน' },
  { lemma: 'compete', pos: 'verb', cefr: 'B1', thai: 'แข่งขัน', ex: 'Students from many schools compete in the annual English quiz.', exTh: 'นักเรียนจากหลายโรงเรียนแข่งขันในการแข่งขันตอบปัญหาภาษาอังกฤษประจำปี' },
  { lemma: 'competition', pos: 'noun', cefr: 'B1', thai: 'การแข่งขัน', ex: 'She won first place in the spelling competition.', exTh: 'เธอได้อันดับหนึ่งในการแข่งขันสะกดคำ' },
  { lemma: 'competitive', pos: 'adjective', cefr: 'B2', thai: 'ที่มีการแข่งขันสูง', ex: 'University admission has become very competitive in recent years.', exTh: 'การเข้ามหาวิทยาลัยมีการแข่งขันสูงมากในช่วงไม่กี่ปีที่ผ่านมา' },
  { lemma: 'competitor', pos: 'noun', cefr: 'B2', thai: 'คู่แข่ง', ex: 'Each competitor had ten minutes to finish the test.', exTh: 'ผู้แข่งขันแต่ละคนมีเวลาสิบนาทีในการทำแบบทดสอบให้เสร็จ' },
  { lemma: 'complain', pos: 'verb', cefr: 'B1', thai: 'บ่น, ร้องเรียน', ex: 'Some students complain that the reading passages are too long.', exTh: 'นักเรียนบางคนบ่นว่าบทความที่อ่านยาวเกินไป' },
  { lemma: 'complaint', pos: 'noun', cefr: 'B1', thai: 'คำร้องเรียน', ex: 'The teacher took the complaint about the noisy classroom seriously.', exTh: 'ครูรับฟังคำร้องเรียนเรื่องห้องเรียนที่มีเสียงดังอย่างจริงจัง' },
  { lemma: 'complexity', pos: 'noun', cefr: 'C1', thai: 'ความซับซ้อน', ex: 'The complexity of the grammar rule confused many students.', exTh: 'ความซับซ้อนของกฎไวยากรณ์ทำให้นักเรียนหลายคนสับสน' },
  { lemma: 'compose', pos: 'verb', cefr: 'B2', thai: 'แต่ง, ประกอบขึ้น', ex: 'She composed a short essay about her study habits.', exTh: 'เธอแต่งเรียงความสั้น ๆ เกี่ยวกับนิสัยการเรียนของเธอ' },
  { lemma: 'composition', pos: 'noun', cefr: 'B2', thai: 'การประพันธ์, องค์ประกอบ', ex: 'Write a composition describing your favorite hobby.', exTh: 'เขียนเรียงความบรรยายงานอดิเรกที่คุณชื่นชอบ' },
  { lemma: 'compound', pos: 'noun', cefr: 'B2', thai: 'คำประสม, สารประกอบ', ex: "'Homework' is a compound word made from 'home' and 'work'.", exTh: "'Homework' เป็นคำประสมที่เกิดจาก 'home' และ 'work'" },
  { lemma: 'comprise', pos: 'verb', cefr: 'C1', thai: 'ประกอบด้วย', ex: 'The mock exam comprises listening, reading, and grammar sections.', exTh: 'ข้อสอบจำลองประกอบด้วยส่วนการฟัง การอ่าน และไวยากรณ์' },
  { lemma: 'concentrate', pos: 'verb', cefr: 'B1', thai: 'มีสมาธิ, จดจ่อ', ex: 'Turn off your phone so you can concentrate on studying.', exTh: 'ปิดโทรศัพท์เพื่อให้คุณมีสมาธิจดจ่อกับการเรียน' },
  { lemma: 'concentration', pos: 'noun', cefr: 'B2', thai: 'สมาธิ', ex: 'A quiet room helps improve your concentration during practice.', exTh: 'ห้องที่เงียบช่วยเพิ่มสมาธิระหว่างการฝึกฝน' },
  { lemma: 'concept', pos: 'noun', cefr: 'B1', thai: 'แนวคิด', ex: 'This lesson introduces the concept of spaced repetition.', exTh: 'บทเรียนนี้แนะนำแนวคิดเรื่องการทบทวนแบบเว้นระยะ' },
  { lemma: 'concern', pos: 'noun', cefr: 'B1', thai: 'ความกังวล, เรื่องที่เกี่ยวข้อง', ex: 'Her main concern is running out of time during the exam.', exTh: 'ความกังวลหลักของเธอคือเวลาหมดระหว่างการสอบ' },
  { lemma: 'conclusion', pos: 'noun', cefr: 'B1', thai: 'บทสรุป', ex: 'Every essay needs a clear introduction and conclusion.', exTh: 'เรียงความทุกเรื่องต้องมีบทนำและบทสรุปที่ชัดเจน' },
  { lemma: 'concrete', pos: 'adjective', cefr: 'B2', thai: 'เป็นรูปธรรม, ที่จับต้องได้', ex: 'Give a concrete example to support your answer.', exTh: 'ยกตัวอย่างที่เป็นรูปธรรมเพื่อสนับสนุนคำตอบของคุณ' },
  { lemma: 'condition', pos: 'noun', cefr: 'B1', thai: 'เงื่อนไข, สภาพ', ex: 'Check the condition of your pencil before the exam starts.', exTh: 'ตรวจสอบสภาพดินสอของคุณก่อนเริ่มสอบ' },
  { lemma: 'conference', pos: 'noun', cefr: 'B1', thai: 'การประชุม', ex: 'Teachers attended a conference about new teaching methods.', exTh: 'ครูเข้าร่วมการประชุมเกี่ยวกับวิธีการสอนแบบใหม่' },
  { lemma: 'confidence', pos: 'noun', cefr: 'B1', thai: 'ความมั่นใจ', ex: 'Daily practice builds confidence before the mock exam.', exTh: 'การฝึกฝนทุกวันสร้างความมั่นใจก่อนการสอบจำลอง' },
  { lemma: 'confident', pos: 'adjective', cefr: 'B1', thai: 'มั่นใจ', ex: 'She felt confident after reviewing all the vocabulary words.', exTh: 'เธอรู้สึกมั่นใจหลังจากทบทวนคำศัพท์ทั้งหมด' },
  { lemma: 'conflict', pos: 'noun', cefr: 'B1', thai: 'ความขัดแย้ง', ex: 'The story is about a conflict between two neighboring towns.', exTh: 'เรื่องราวนี้เกี่ยวกับความขัดแย้งระหว่างเมืองใกล้เคียงสองเมือง' },
  { lemma: 'confuse', pos: 'verb', cefr: 'B1', thai: 'ทำให้สับสน', ex: 'Similar-sounding words often confuse beginner learners.', exTh: 'คำที่ออกเสียงคล้ายกันมักทำให้ผู้เรียนมือใหม่สับสน' },
  { lemma: 'confusion', pos: 'noun', cefr: 'B2', thai: 'ความสับสน', ex: 'Clear instructions reduce confusion during the test.', exTh: 'คำแนะนำที่ชัดเจนช่วยลดความสับสนระหว่างการทดสอบ' },
  { lemma: 'connect', pos: 'verb', cefr: 'A2', thai: 'เชื่อมโยง, เชื่อมต่อ', ex: 'Try to connect new words to ones you already know.', exTh: 'พยายามเชื่อมโยงคำศัพท์ใหม่กับคำที่คุณรู้จักอยู่แล้ว' },
  { lemma: 'connection', pos: 'noun', cefr: 'B1', thai: 'ความเชื่อมโยง', ex: 'There is a strong connection between reading speed and vocabulary size.', exTh: 'มีความเชื่อมโยงอย่างมากระหว่างความเร็วในการอ่านกับปริมาณคำศัพท์' },
  { lemma: 'consequently', pos: 'adverb', cefr: 'B2', thai: 'ดังนั้น, เป็นผลให้', ex: 'She skipped practice for a week; consequently, her score dropped.', exTh: 'เธอข้ามการฝึกฝนไปหนึ่งสัปดาห์ ดังนั้นคะแนนของเธอจึงลดลง' },
  { lemma: 'conservative', pos: 'adjective', cefr: 'B2', thai: 'อนุรักษ์นิยม, ระมัดระวัง', ex: 'Give a conservative estimate of how long the reading will take.', exTh: 'ให้การประมาณการอย่างระมัดระวังว่าการอ่านจะใช้เวลานานเท่าใด' },
  { lemma: 'consideration', pos: 'noun', cefr: 'B2', thai: 'การพิจารณา', ex: "The teacher took students' feedback into consideration.", exTh: 'ครูนำความคิดเห็นของนักเรียนมาพิจารณา' },
  { lemma: 'consistent', pos: 'adjective', cefr: 'B2', thai: 'สม่ำเสมอ', ex: 'Consistent daily practice works better than occasional long sessions.', exTh: 'การฝึกฝนอย่างสม่ำเสมอทุกวันได้ผลดีกว่าการฝึกเป็นครั้งคราวแบบนาน ๆ' },
  { lemma: 'constantly', pos: 'adverb', cefr: 'B1', thai: 'อย่างต่อเนื่อง, ตลอดเวลา', ex: 'She constantly reviews her error notebook before each test.', exTh: 'เธอทบทวนสมุดบันทึกข้อผิดพลาดของเธออยู่ตลอดเวลาก่อนการทดสอบแต่ละครั้ง' },
  { lemma: 'constraint', pos: 'noun', cefr: 'C1', thai: 'ข้อจำกัด', ex: 'Time constraint is the biggest challenge during the mock exam.', exTh: 'ข้อจำกัดด้านเวลาเป็นความท้าทายที่ใหญ่ที่สุดระหว่างการสอบจำลอง' },
  { lemma: 'construction', pos: 'noun', cefr: 'B1', thai: 'การก่อสร้าง, การสร้าง', ex: 'Sentence construction improves with regular grammar practice.', exTh: 'การสร้างประโยคจะดีขึ้นด้วยการฝึกไวยากรณ์อย่างสม่ำเสมอ' },
  { lemma: 'consultant', pos: 'noun', cefr: 'B2', thai: 'ที่ปรึกษา', ex: 'An education consultant helped design the new curriculum.', exTh: 'ที่ปรึกษาด้านการศึกษาช่วยออกแบบหลักสูตรใหม่' },
  { lemma: 'consumer', pos: 'noun', cefr: 'B1', thai: 'ผู้บริโภค', ex: 'The passage discusses how consumers choose products online.', exTh: 'บทความกล่าวถึงวิธีที่ผู้บริโภคเลือกซื้อสินค้าออนไลน์' },
  { lemma: 'contain', pos: 'verb', cefr: 'A2', thai: 'บรรจุ, ประกอบด้วย', ex: 'This unit contains ten new vocabulary words.', exTh: 'หน่วยการเรียนนี้ประกอบด้วยคำศัพท์ใหม่สิบคำ' },
  { lemma: 'contemporary', pos: 'adjective', cefr: 'B2', thai: 'ร่วมสมัย', ex: 'The reading passage is about contemporary issues in education.', exTh: 'บทความที่อ่านเกี่ยวกับประเด็นร่วมสมัยด้านการศึกษา' },
  { lemma: 'contest', pos: 'noun', cefr: 'B1', thai: 'การประกวด, การแข่งขัน', ex: 'She entered a writing contest at her school.', exTh: 'เธอเข้าร่วมการประกวดเขียนที่โรงเรียนของเธอ' },
];

function run() {
  const marker = db.prepare('SELECT id FROM vocabulary_entries WHERE lemma = ?').get('contest');
  if (marker) {
    console.log('Expansion 3 skipped: already applied.');
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
    'claim', 'classical', 'clause', 'climate', 'clinical', 'cluster', 'coach', 'coal',
    'colleague', 'column', 'combination', 'comedy', 'command', 'commercial', 'commission',
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
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'complexity', prompt: 'Based on context, what does "complexity" mean in: "The complexity of the tax form confused even the accountants."?', options: ['the state of being complicated', 'the state of being cheap', 'the state of being short', 'the state of being colorful'], correctIndex: 0, explanation: 'Confusing even experts signals something complicated — "complexity".' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'compensation', prompt: 'Based on context, what does "compensation" mean in: "Workers injured on the job are entitled to compensation."?', options: ['payment to make up for harm', 'a formal apology only', 'extra vacation days', 'a promotion'], correctIndex: 0, explanation: 'Payment owed for an injury is "compensation".' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'competitive', prompt: 'Based on context, what does "competitive" mean in: "Only a few students get in each year, so admission is extremely competitive."?', options: ['involving strong rivalry for limited spots', 'very relaxed and easy', 'completely random', 'free of charge'], correctIndex: 0, explanation: 'Few spots and many applicants describes something "competitive".' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'comprise', prompt: 'Based on context, what does "comprise" mean in: "The committee comprises five teachers and two parents."?', options: ['is made up of', 'excludes', 'was founded by', 'disagrees with'], correctIndex: 0, explanation: 'Listing the members shows what the committee "comprises" — is made up of.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'concentration', prompt: 'Based on context, what does "concentration" mean in: "The noise outside made it hard to keep his concentration during the test."?', options: ['focused attention', 'good handwriting', 'physical strength', 'a loud voice'], correctIndex: 0, explanation: 'Noise disrupting studying signals "concentration" means focused attention.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'concrete', prompt: 'Based on context, what does "concrete" mean in: "Instead of vague promises, the manager gave concrete steps for improvement."?', options: ['specific and clear', 'vague and general', 'expensive', 'temporary'], correctIndex: 0, explanation: 'Contrasted with "vague promises," concrete means specific and clear.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'confusion', prompt: 'Based on context, what does "confusion" mean in: "The two similar forms caused confusion at the registration desk."?', options: ['a state of not understanding clearly', 'a state of great excitement', 'a state of calm', 'a state of agreement'], correctIndex: 0, explanation: 'Similar forms causing mix-ups describes "confusion".' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'consequently', prompt: 'Based on context, what does "consequently" mean in: "He forgot his ID card; consequently, he could not enter the exam room."?', options: ['as a result', 'however', 'meanwhile', 'for example'], correctIndex: 0, explanation: 'Introducing a result of the prior sentence signals "consequently" means as a result.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'conservative', prompt: 'Based on context, what does "conservative" mean in: "To be safe, she made a conservative estimate of the project\'s cost."?', options: ['cautious, avoiding overstatement', 'wildly exaggerated', 'exact to the cent', 'based on guessing'], correctIndex: 0, explanation: '"To be safe" signals a cautious, "conservative" estimate.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'consideration', prompt: 'Based on context, what does "consideration" mean in: "The judges gave careful consideration to every entry before choosing a winner."?', options: ['careful thought', 'quick dismissal', 'public criticism', 'financial reward'], correctIndex: 0, explanation: '"Careful" combined with "before choosing" signals careful thought — "consideration".' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'consistent', prompt: 'Based on context, what does "consistent" mean in: "Her grades have been consistent all year, always between 85 and 90."?', options: ['staying steady, not changing much', 'improving rapidly', 'dropping sharply', 'impossible to measure'], correctIndex: 0, explanation: 'Staying between 85-90 all year describes something "consistent" — steady.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'constraint', prompt: 'Based on context, what does "constraint" mean in: "Budget constraints forced the school to cancel the field trip."?', options: ['a limitation', 'an opportunity', 'a celebration', 'a reward'], correctIndex: 0, explanation: 'Forcing a cancellation due to budget signals a limitation — "constraint".' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'contemporary', prompt: 'Based on context, what does "contemporary" mean in: "The museum\'s new wing focuses on contemporary art from the last twenty years."?', options: ['modern, from the present time', 'ancient', 'imaginary', 'foreign only'], correctIndex: 0, explanation: '"From the last twenty years" signals modern, "contemporary" art.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'commitment', prompt: 'Based on context, what does "commitment" mean in: "Training for a marathon takes serious commitment over many months."?', options: ['dedicated, sustained effort', 'a one-time payment', 'a short vacation', 'a written contract only'], correctIndex: 0, explanation: 'Sustained effort over many months describes "commitment".' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'complaint', prompt: 'Based on context, what does "complaint" mean in: "The restaurant received a complaint about slow service."?', options: ['an expression of dissatisfaction', 'a compliment', 'a menu item', 'a job application'], correctIndex: 0, explanation: 'Dissatisfaction about slow service is a "complaint".' });

  // ---------------- Word Family (10) ----------------
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'combine', prompt: 'Which word is the noun form of "combine"?', options: ['combination', 'combinement', 'combinity', 'combinature'], correctIndex: 0, explanation: '"combine" (verb) -> "combination" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'compete', prompt: 'Which word is the noun form of "compete"?', options: ['competition', 'competement', 'competivity', 'competation'], correctIndex: 0, explanation: '"compete" (verb) -> "competition" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'confident', prompt: 'Which word is the noun form of "confident"?', options: ['confidence', 'confidentness', 'confidion', 'confidentity'], correctIndex: 0, explanation: '"confident" (adj.) -> "confidence" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'communicate', prompt: 'Which word is the noun form of "communicate"?', options: ['communication', 'communicement', 'communicity', 'communicature'], correctIndex: 0, explanation: '"communicate" (verb) -> "communication" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'concentrate', prompt: 'Which word is the noun form of "concentrate"?', options: ['concentration', 'concentrement', 'concentrity', 'concentrature'], correctIndex: 0, explanation: '"concentrate" (verb) -> "concentration" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'confuse', prompt: 'Which word is the noun form of "confuse"?', options: ['confusion', 'confusement', 'confusity', 'confusation'], correctIndex: 0, explanation: '"confuse" (verb) -> "confusion" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'connect', prompt: 'Which word is the noun form of "connect"?', options: ['connection', 'connectment', 'connectivity-ness', 'connectation'], correctIndex: 0, explanation: '"connect" (verb) -> "connection" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'complain', prompt: 'Which word is the noun form of "complain"?', options: ['complaint', 'complainment', 'complainity', 'complainion'], correctIndex: 0, explanation: '"complain" (verb) -> "complaint" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'compose', prompt: 'Which word is the noun form of "compose"?', options: ['composition', 'composement', 'composity', 'composation'], correctIndex: 0, explanation: '"compose" (verb) -> "composition" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'consistent', prompt: 'Which word is the noun form of "consistent"?', options: ['consistency', 'consistentness', 'consistion', 'consistature'], correctIndex: 0, explanation: '"consistent" (adj.) -> "consistency" (noun).' });

  console.log('Expansion 3 complete: 70 new vocabulary entries, 40 new questions.');
}

run();

if (require.main === module) {
  process.exit(0);
}
