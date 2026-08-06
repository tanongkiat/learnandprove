// Fourth additive content batch. Word selection sourced from the New General Service
// List (NGSL) — Browne, C., Culligan, B., and Phillips, J., licensed under a Creative
// Commons Attribution-ShareAlike 4.0 International License (https://www.newgeneralservicelist.com).
// The word list itself is used per that license; all Thai meanings, example sentences,
// hints, and questions below are original content written for this project. CEFR tags
// are independent estimates, not copied from any publisher's classification.

const db = require('./connection');

const NEW_VOCAB = [
  { lemma: 'continue', pos: 'verb', cefr: 'A2', thai: 'ดำเนินต่อ, ทำต่อ', ex: 'Continue practicing even after you finish the assigned homework.', exTh: 'ฝึกฝนต่อไปแม้จะทำการบ้านที่ได้รับมอบหมายเสร็จแล้ว' },
  { lemma: 'continuous', pos: 'adjective', cefr: 'B1', thai: 'ต่อเนื่อง', ex: 'Continuous review helps vocabulary stay in long-term memory.', exTh: 'การทบทวนอย่างต่อเนื่องช่วยให้คำศัพท์อยู่ในความจำระยะยาว' },
  { lemma: 'contribution', pos: 'noun', cefr: 'B1', thai: 'การมีส่วนร่วม, การบริจาค', ex: "Every student's contribution matters during group discussion.", exTh: 'การมีส่วนร่วมของนักเรียนทุกคนมีความสำคัญระหว่างการอภิปรายกลุ่ม' },
  { lemma: 'control', pos: 'noun', cefr: 'A2', thai: 'การควบคุม', ex: 'Time control is essential during a timed exam.', exTh: 'การควบคุมเวลาเป็นสิ่งจำเป็นระหว่างการสอบที่จับเวลา' },
  { lemma: 'controversial', pos: 'adjective', cefr: 'B2', thai: 'เป็นที่ถกเถียง', ex: 'The essay topic was controversial, so students had strong opinions.', exTh: 'หัวข้อเรียงความเป็นที่ถกเถียง นักเรียนจึงมีความคิดเห็นที่ชัดเจน' },
  { lemma: 'convention', pos: 'noun', cefr: 'B2', thai: 'ธรรมเนียมปฏิบัติ', ex: 'It is a convention to write the title at the top of an essay.', exTh: 'เป็นธรรมเนียมปฏิบัติที่จะเขียนชื่อเรื่องไว้ด้านบนของเรียงความ' },
  { lemma: 'conventional', pos: 'adjective', cefr: 'B2', thai: 'ตามธรรมเนียม, ทั่วไป', ex: 'Instead of conventional flashcards, she used an app to review words.', exTh: 'แทนที่จะใช้แฟลชการ์ดแบบทั่วไป เธอใช้แอปเพื่อทบทวนคำศัพท์' },
  { lemma: 'conversation', pos: 'noun', cefr: 'A2', thai: 'บทสนทนา', ex: 'Practicing conversation improves speaking confidence quickly.', exTh: 'การฝึกบทสนทนาช่วยเพิ่มความมั่นใจในการพูดได้อย่างรวดเร็ว' },
  { lemma: 'convert', pos: 'verb', cefr: 'B1', thai: 'เปลี่ยน, แปลง', ex: 'Learn how to convert direct speech into reported speech.', exTh: 'เรียนรู้วิธีเปลี่ยนประโยคคำพูดตรงให้เป็นคำพูดรายงาน' },
  { lemma: 'cooperation', pos: 'noun', cefr: 'B1', thai: 'ความร่วมมือ', ex: 'Group cooperation made the project finish faster.', exTh: 'ความร่วมมือของกลุ่มทำให้โครงการเสร็จเร็วขึ้น' },
  { lemma: 'cope', pos: 'verb', cefr: 'B1', thai: 'รับมือ, จัดการกับ', ex: 'Deep breathing helps students cope with exam stress.', exTh: 'การหายใจลึก ๆ ช่วยให้นักเรียนรับมือกับความเครียดจากการสอบ' },
  { lemma: 'core', pos: 'noun', cefr: 'B1', thai: 'แก่นแท้, ศูนย์กลาง', ex: 'Grammar is at the core of every language exam.', exTh: 'ไวยากรณ์เป็นแก่นแท้ของข้อสอบภาษาทุกฉบับ' },
  { lemma: 'corporate', pos: 'adjective', cefr: 'B2', thai: 'เกี่ยวกับองค์กร', ex: 'The talk covered corporate life after university.', exTh: 'การบรรยายครอบคลุมเรื่องชีวิตการทำงานในองค์กรหลังเรียนจบมหาวิทยาลัย' },
  { lemma: 'corporation', pos: 'noun', cefr: 'B1', thai: 'บริษัทขนาดใหญ่', ex: 'The corporation donated books to local schools.', exTh: 'บริษัทขนาดใหญ่บริจาคหนังสือให้โรงเรียนในท้องถิ่น' },
  { lemma: 'coverage', pos: 'noun', cefr: 'B2', thai: 'การครอบคลุม, การรายงานข่าว', ex: 'The news gave wide coverage to the exam schedule changes.', exTh: 'ข่าวให้การรายงานอย่างกว้างขวางเกี่ยวกับการเปลี่ยนแปลงตารางสอบ' },
  { lemma: 'craft', pos: 'noun', cefr: 'B1', thai: 'งานฝีมือ', ex: 'Writing a strong essay is a craft that improves with practice.', exTh: 'การเขียนเรียงความที่ดีเป็นงานฝีมือที่พัฒนาได้ด้วยการฝึกฝน' },
  { lemma: 'crash', pos: 'noun', cefr: 'B1', thai: 'การชน, การล่ม', ex: 'The website crashed the night before the mock exam.', exTh: 'เว็บไซต์ล่มในคืนก่อนการสอบจำลอง' },
  { lemma: 'creation', pos: 'noun', cefr: 'B1', thai: 'การสร้างสรรค์', ex: 'The creation of a study schedule helped her stay organized.', exTh: 'การสร้างตารางเรียนช่วยให้เธอมีระเบียบมากขึ้น' },
  { lemma: 'creative', pos: 'adjective', cefr: 'A2', thai: 'สร้างสรรค์', ex: 'Creative writing lets students express their own ideas.', exTh: 'การเขียนเชิงสร้างสรรค์ทำให้นักเรียนได้แสดงความคิดของตัวเอง' },
  { lemma: 'creature', pos: 'noun', cefr: 'B1', thai: 'สิ่งมีชีวิต', ex: 'The story described a strange creature living in the forest.', exTh: 'เรื่องราวบรรยายถึงสิ่งมีชีวิตแปลกประหลาดที่อาศัยอยู่ในป่า' },
  { lemma: 'credit', pos: 'noun', cefr: 'B1', thai: 'เครดิต, การยกย่อง', ex: 'She gave credit to her tutor for helping her improve.', exTh: 'เธอให้เครดิตกับติวเตอร์ที่ช่วยให้เธอพัฒนาขึ้น' },
  { lemma: 'crew', pos: 'noun', cefr: 'B1', thai: 'ลูกเรือ, ทีมงาน', ex: 'The film crew arrived early to set up the equipment.', exTh: 'ทีมงานถ่ายทำมาถึงแต่เช้าเพื่อติดตั้งอุปกรณ์' },
  { lemma: 'crime', pos: 'noun', cefr: 'A2', thai: 'อาชญากรรม', ex: 'The reading passage was about crime rates in big cities.', exTh: 'บทความที่อ่านเกี่ยวกับอัตราอาชญากรรมในเมืองใหญ่' },
  { lemma: 'criminal', pos: 'noun', cefr: 'B1', thai: 'อาชญากร', ex: 'The story follows a detective solving a criminal case.', exTh: 'เรื่องราวติดตามนักสืบที่ไขคดีอาชญากรรม' },
  { lemma: 'crisis', pos: 'noun', cefr: 'B1', thai: 'วิกฤต', ex: 'The school held a meeting to discuss the water crisis.', exTh: 'โรงเรียนจัดประชุมเพื่อหารือเกี่ยวกับวิกฤตน้ำ' },
  { lemma: 'criteria', pos: 'noun', cefr: 'B2', thai: 'เกณฑ์', ex: 'Check the criteria before you start writing your essay.', exTh: 'ตรวจสอบเกณฑ์ก่อนเริ่มเขียนเรียงความของคุณ' },
  { lemma: 'critic', pos: 'noun', cefr: 'B2', thai: 'นักวิจารณ์', ex: 'A film critic reviewed the movie for the newspaper.', exTh: 'นักวิจารณ์ภาพยนตร์รีวิวหนังให้กับหนังสือพิมพ์' },
  { lemma: 'critical', pos: 'adjective', cefr: 'B1', thai: 'สำคัญยิ่ง, วิพากษ์วิจารณ์', ex: 'Reading speed is critical for finishing the exam on time.', exTh: 'ความเร็วในการอ่านสำคัญยิ่งต่อการทำข้อสอบให้เสร็จทันเวลา' },
  { lemma: 'criticism', pos: 'noun', cefr: 'B2', thai: 'การวิจารณ์', ex: "She accepted the teacher's criticism and revised her essay.", exTh: 'เธอยอมรับคำวิจารณ์ของครูและแก้ไขเรียงความของเธอ' },
  { lemma: 'criticize', pos: 'verb', cefr: 'B1', thai: 'วิจารณ์', ex: 'Try not to criticize your own mistakes too harshly.', exTh: 'พยายามอย่าวิจารณ์ข้อผิดพลาดของตัวเองอย่างรุนแรงเกินไป' },
  { lemma: 'crowd', pos: 'noun', cefr: 'A2', thai: 'ฝูงชน', ex: 'A large crowd gathered to watch the school competition.', exTh: 'ฝูงชนจำนวนมากมารวมตัวกันเพื่อชมการแข่งขันของโรงเรียน' },
  { lemma: 'cultural', pos: 'adjective', cefr: 'B1', thai: 'เกี่ยวกับวัฒนธรรม', ex: 'The reading passage described an interesting cultural festival.', exTh: 'บทความที่อ่านบรรยายถึงเทศกาลทางวัฒนธรรมที่น่าสนใจ' },
  { lemma: 'curious', pos: 'adjective', cefr: 'A2', thai: 'อยากรู้อยากเห็น', ex: 'Curious students often ask more questions in class.', exTh: 'นักเรียนที่อยากรู้อยากเห็นมักถามคำถามมากขึ้นในชั้นเรียน' },
  { lemma: 'currency', pos: 'noun', cefr: 'B1', thai: 'สกุลเงิน', ex: 'The passage compared the currency values of two countries.', exTh: 'บทความเปรียบเทียบมูลค่าสกุลเงินของสองประเทศ' },
  { lemma: 'current', pos: 'adjective', cefr: 'A2', thai: 'ปัจจุบัน', ex: 'Check the current exam schedule on the school website.', exTh: 'ตรวจสอบตารางสอบปัจจุบันบนเว็บไซต์โรงเรียน' },
  { lemma: 'currently', pos: 'adverb', cefr: 'B1', thai: 'ในปัจจุบัน', ex: 'She is currently reviewing grammar rules for the test.', exTh: 'ขณะนี้เธอกำลังทบทวนกฎไวยากรณ์สำหรับการทดสอบ' },
  { lemma: 'custom', pos: 'noun', cefr: 'B1', thai: 'ธรรมเนียม, ประเพณี', ex: 'It is a custom to review vocabulary every morning in this class.', exTh: 'เป็นธรรมเนียมที่จะทบทวนคำศัพท์ทุกเช้าในชั้นเรียนนี้' },
  { lemma: 'daily', pos: 'adjective', cefr: 'A2', thai: 'ประจำวัน', ex: 'A daily study routine improves long-term memory.', exTh: 'กิจวัตรการเรียนประจำวันช่วยเพิ่มความจำระยะยาว' },
  { lemma: 'damage', pos: 'noun', cefr: 'A2', thai: 'ความเสียหาย', ex: 'Water damage ruined several textbooks in the classroom.', exTh: 'ความเสียหายจากน้ำทำให้หนังสือเรียนหลายเล่มในห้องเรียนเสียหาย' },
  { lemma: 'danger', pos: 'noun', cefr: 'A2', thai: 'อันตราย', ex: 'Ignoring grammar rules can be a danger to your exam score.', exTh: 'การละเลยกฎไวยากรณ์อาจเป็นอันตรายต่อคะแนนสอบของคุณ' },
  { lemma: 'dare', pos: 'verb', cefr: 'B1', thai: 'กล้า', ex: 'Not many students dare to ask questions in front of the class.', exTh: 'ไม่ค่อยมีนักเรียนกล้าถามคำถามต่อหน้าชั้นเรียน' },
  { lemma: 'darkness', pos: 'noun', cefr: 'B1', thai: 'ความมืด', ex: 'The story begins in complete darkness before dawn.', exTh: 'เรื่องราวเริ่มต้นในความมืดสนิทก่อนรุ่งสาง' },
  { lemma: 'database', pos: 'noun', cefr: 'B1', thai: 'ฐานข้อมูล', ex: 'The school built a database of past exam questions.', exTh: 'โรงเรียนสร้างฐานข้อมูลของข้อสอบเก่า' },
  { lemma: 'dead', pos: 'adjective', cefr: 'A2', thai: 'ตาย', ex: 'The battery in the classroom clock was completely dead.', exTh: 'แบตเตอรี่ของนาฬิกาในห้องเรียนหมดสนิท' },
  { lemma: 'deal', pos: 'noun', cefr: 'A2', thai: 'ข้อตกลง', ex: 'She made a deal with herself to study one hour every night.', exTh: 'เธอทำข้อตกลงกับตัวเองว่าจะเรียนหนึ่งชั่วโมงทุกคืน' },
  { lemma: 'dealer', pos: 'noun', cefr: 'B1', thai: 'พ่อค้า, ตัวแทนจำหน่าย', ex: 'The bookstore is a dealer for several exam-prep textbooks.', exTh: 'ร้านหนังสือเป็นตัวแทนจำหน่ายหนังสือเตรียมสอบหลายเล่ม' },
  { lemma: 'death', pos: 'noun', cefr: 'A2', thai: 'ความตาย', ex: 'The novel explores themes of life and death.', exTh: 'นวนิยายสำรวจแก่นเรื่องเกี่ยวกับชีวิตและความตาย' },
  { lemma: 'debt', pos: 'noun', cefr: 'B1', thai: 'หนี้สิน', ex: "The country's debt was a major topic in the reading passage.", exTh: 'หนี้สินของประเทศเป็นหัวข้อหลักในบทความที่อ่าน' },
  { lemma: 'decision', pos: 'noun', cefr: 'A2', thai: 'การตัดสินใจ', ex: 'Making a quick decision helps you finish the exam on time.', exTh: 'การตัดสินใจอย่างรวดเร็วช่วยให้คุณทำข้อสอบเสร็จทันเวลา' },
  { lemma: 'declare', pos: 'verb', cefr: 'B1', thai: 'ประกาศ, แถลง', ex: 'The teacher declared that the exam would be postponed.', exTh: 'ครูประกาศว่าการสอบจะถูกเลื่อนออกไป' },
  { lemma: 'decrease', pos: 'verb', cefr: 'B1', thai: 'ลดลง', ex: 'Her mistakes began to decrease after weeks of practice.', exTh: 'ข้อผิดพลาดของเธอเริ่มลดลงหลังจากฝึกฝนมาหลายสัปดาห์' },
  { lemma: 'dedicate', pos: 'verb', cefr: 'B2', thai: 'อุทิศ', ex: 'He dedicated his weekends to reviewing grammar rules.', exTh: 'เขาอุทิศวันหยุดสุดสัปดาห์ให้กับการทบทวนกฎไวยากรณ์' },
  { lemma: 'deeply', pos: 'adverb', cefr: 'B1', thai: 'อย่างลึกซึ้ง', ex: 'She was deeply focused during the mock exam.', exTh: 'เธอมีสมาธิอย่างลึกซึ้งระหว่างการสอบจำลอง' },
  { lemma: 'defeat', pos: 'noun', cefr: 'B1', thai: 'ความพ่ายแพ้', ex: "The team's defeat taught them to prepare more carefully next time.", exTh: 'ความพ่ายแพ้ของทีมสอนให้พวกเขาเตรียมตัวอย่างรอบคอบมากขึ้นในครั้งต่อไป' },
  { lemma: 'defend', pos: 'verb', cefr: 'A2', thai: 'ป้องกัน', ex: 'You must defend your answer with evidence from the passage.', exTh: 'คุณต้องปกป้องคำตอบของคุณด้วยหลักฐานจากบทความ' },
  { lemma: 'defense', pos: 'noun', cefr: 'B1', thai: 'การป้องกัน', ex: 'Her defense of the argument was clear and well organized.', exTh: 'การป้องกันข้อโต้แย้งของเธอชัดเจนและเป็นระเบียบ' },
  { lemma: 'deficit', pos: 'noun', cefr: 'C1', thai: 'การขาดดุล', ex: 'The report mentioned a budget deficit at the school.', exTh: 'รายงานกล่าวถึงการขาดดุลงบประมาณของโรงเรียน' },
  { lemma: 'definitely', pos: 'adverb', cefr: 'A2', thai: 'อย่างแน่นอน', ex: 'She will definitely take the mock exam next week.', exTh: 'เธอจะสอบจำลองในสัปดาห์หน้าอย่างแน่นอน' },
  { lemma: 'definition', pos: 'noun', cefr: 'B1', thai: 'คำจำกัดความ', ex: "Look up the definition of any word you don't understand.", exTh: 'ค้นหาคำจำกัดความของคำที่คุณไม่เข้าใจ' },
  { lemma: 'degree', pos: 'noun', cefr: 'A2', thai: 'ระดับ, ปริญญา', ex: 'A high degree of focus is needed during reading comprehension.', exTh: 'ต้องใช้สมาธิในระดับสูงระหว่างการทำความเข้าใจในการอ่าน' },
  { lemma: 'delay', pos: 'noun', cefr: 'A2', thai: 'ความล่าช้า', ex: 'A short delay in the schedule gave students more time to review.', exTh: 'ความล่าช้าเล็กน้อยในตารางเรียนทำให้นักเรียนมีเวลาทบทวนมากขึ้น' },
  { lemma: 'delight', pos: 'noun', cefr: 'B1', thai: 'ความยินดี', ex: 'To her delight, she scored higher than expected.', exTh: 'เธอดีใจมากที่ได้คะแนนสูงกว่าที่คาดไว้' },
  { lemma: 'deliver', pos: 'verb', cefr: 'A2', thai: 'ส่งมอบ', ex: 'The teacher delivers a short vocabulary lesson every morning.', exTh: 'ครูสอนบทเรียนคำศัพท์สั้น ๆ ทุกเช้า' },
  { lemma: 'delivery', pos: 'noun', cefr: 'A2', thai: 'การจัดส่ง', ex: 'The delivery of new textbooks was delayed by a week.', exTh: 'การจัดส่งหนังสือเรียนใหม่ล่าช้าไปหนึ่งสัปดาห์' },
  { lemma: 'demand', pos: 'noun', cefr: 'A2', thai: 'ความต้องการ', ex: 'The exam places a high demand on reading speed.', exTh: 'ข้อสอบมีความต้องการสูงด้านความเร็วในการอ่าน' },
  { lemma: 'democracy', pos: 'noun', cefr: 'B1', thai: 'ประชาธิปไตย', ex: 'The reading passage explained how democracy works.', exTh: 'บทความที่อ่านอธิบายว่าประชาธิปไตยทำงานอย่างไร' },
  { lemma: 'democratic', pos: 'adjective', cefr: 'B1', thai: 'เป็นประชาธิปไตย', ex: 'Students voted in a democratic process to choose the class rep.', exTh: 'นักเรียนลงคะแนนเสียงตามกระบวนการประชาธิปไตยเพื่อเลือกตัวแทนห้อง' },
  { lemma: 'demonstration', pos: 'noun', cefr: 'B1', thai: 'การสาธิต', ex: 'The teacher gave a demonstration of how to answer cloze questions.', exTh: 'ครูสาธิตวิธีตอบคำถามแบบเติมคำ' },
  { lemma: 'density', pos: 'noun', cefr: 'B2', thai: 'ความหนาแน่น', ex: 'The passage compared population density in two cities.', exTh: 'บทความเปรียบเทียบความหนาแน่นของประชากรในสองเมือง' },
  { lemma: 'department', pos: 'noun', cefr: 'A2', thai: 'แผนก', ex: 'Ask the English department for extra practice materials.', exTh: 'ขอวัสดุฝึกฝนเพิ่มเติมจากแผนกภาษาอังกฤษ' },
];

function run() {
  const marker = db.prepare('SELECT id FROM vocabulary_entries WHERE lemma = ?').get('department');
  if (marker) {
    console.log('Expansion 4 skipped: already applied.');
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
    'continue', 'continuous', 'control', 'convention', 'conversation', 'cooperation', 'core',
    'corporation', 'craft', 'creature', 'credit', 'crew', 'crisis', 'currency', 'custom',
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
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'controversial', prompt: 'Based on context, what does "controversial" mean in: "The new uniform policy was controversial, splitting parents into two strongly opposed groups."?', options: ['causing disagreement', 'universally popular', 'boring', 'temporary'], correctIndex: 0, explanation: 'Splitting people into opposed groups signals something "controversial".' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'coverage', prompt: 'Based on context, what does "coverage" mean in: "Local news gave heavy coverage to the school\'s award-winning team."?', options: ['amount of reporting given', 'financial funding', 'a type of insurance only', 'a written complaint'], correctIndex: 0, explanation: '"Heavy" combined with "news" signals "coverage" means amount of reporting.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'critical', prompt: 'Based on context, what does "critical" mean in: "Getting enough sleep is critical the night before an exam."?', options: ['extremely important', 'slightly helpful', 'unnecessary', 'illegal'], correctIndex: 0, explanation: 'Something described as essential for success is "critical" — extremely important.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'criticism', prompt: 'Based on context, what does "criticism" mean in: "The author welcomed criticism from readers to improve the next edition."?', options: ['negative feedback pointing out flaws', 'praise and compliments', 'a legal complaint', 'a sales report'], correctIndex: 0, explanation: 'Feedback meant to point out flaws to improve something is "criticism".' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'curious', prompt: 'Based on context, what does "curious" mean in: "Curious about how the story would end, she read three chapters in one sitting."?', options: ['eager to know more', 'annoyed', 'exhausted', 'confident'], correctIndex: 0, explanation: 'Wanting to know how the story ends shows being "curious" — eager to know.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'dedicate', prompt: 'Based on context, what does "dedicate" mean in: "The author dedicated the book to her first English teacher."?', options: ['formally devoted something to someone', 'sold something to someone', 'borrowed something from someone', 'hid something from someone'], correctIndex: 0, explanation: 'A book formally devoted to someone as a tribute is "dedicated" to them.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'defeat', prompt: 'Based on context, what does "defeat" mean in: "After three defeats in a row, the team changed their training schedule."?', options: ['a loss in competition', 'a win in competition', 'a scheduled break', 'a new strategy'], correctIndex: 0, explanation: 'Losing three times in a row describes three "defeats" — losses.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'defense', prompt: 'Based on context, what does "defense" mean in: "Her defense of the unpopular idea was so convincing that the class changed its mind."?', options: ['an argument supporting something', 'an attack on something', 'a summary of a story', 'a musical performance'], correctIndex: 0, explanation: 'Convincingly supporting an idea is a "defense" of it.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'deficit', prompt: 'Based on context, what does "deficit" mean in: "Spending more than it earned, the club ended the year with a deficit."?', options: ['a shortage of money', 'a surplus of money', 'a large donation', 'a new member'], correctIndex: 0, explanation: 'Spending more than earned results in a "deficit" — a shortage.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'delight', prompt: 'Based on context, what does "delight" mean in: "Much to her delight, the exam included several topics she had just reviewed."?', options: ['great pleasure', 'great disappointment', 'mild confusion', 'sudden fear'], correctIndex: 0, explanation: '"Much to her delight" before good news signals great pleasure.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'demand', prompt: 'Based on context, what does "demand" mean in: "The advanced course places heavy demand on students\' free time."?', options: ['a strong requirement', 'a small suggestion', 'a type of reward', 'a scheduling error'], correctIndex: 0, explanation: '"Heavy" combined with "on students\' time" signals a strong requirement — "demand".' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'dare', prompt: 'Based on context, what does "dare" mean in: "Few students dare to disagree with the teacher openly."?', options: ['have the courage to do something', 'refuse to do something', 'forget to do something', 'enjoy doing something'], correctIndex: 0, explanation: '"Few... dare" signals a lack of courage to do something.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'decrease', prompt: 'Based on context, what does "decrease" mean in: "As the deadline approached, her free time began to decrease."?', options: ['become smaller in amount', 'become larger in amount', 'stay exactly the same', 'be scheduled in advance'], correctIndex: 0, explanation: 'Free time shrinking as a deadline nears is a "decrease" — becoming smaller.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'cope', prompt: 'Based on context, what does "cope" mean in: "She used breathing exercises to cope with her nerves before the interview."?', options: ['deal successfully with a difficulty', 'ignore a difficulty completely', 'cause a difficulty', 'complain about a difficulty'], correctIndex: 0, explanation: 'Using exercises to manage nerves is a way to "cope" — deal successfully with a difficulty.' });
  addSingleChoice({ skill: 'CONTEXT_DETECTIVE', vocab: 'conventional', prompt: 'Based on context, what does "conventional" mean in: "Instead of a conventional essay, students could submit a short video this year."?', options: ['usual, standard', 'illegal', 'expensive', 'newly invented'], correctIndex: 0, explanation: 'Contrasted with an alternative (video), "conventional" means the usual, standard option.' });

  // ---------------- Word Family (10) ----------------
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'criticize', prompt: 'Which word is the noun form of "criticize"?', options: ['criticism', 'criticizement', 'criticity', 'criticization'], correctIndex: 0, explanation: '"criticize" (verb) -> "criticism" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'creation', prompt: 'Which word is the verb form of "creation"?', options: ['create', 'creating-ize', 'creational', 'creationize'], correctIndex: 0, explanation: '"creation" (noun) comes from the verb "create".' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'curious', prompt: 'Which word is the noun form of "curious"?', options: ['curiosity', 'curiousness-ity', 'curiousity', 'curiousment'], correctIndex: 0, explanation: '"curious" (adj.) -> "curiosity" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'cultural', prompt: 'Which word is the noun form of "cultural"?', options: ['culture', 'culturality', 'culturement', 'culturivity'], correctIndex: 0, explanation: '"cultural" (adj.) comes from the noun "culture".' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'democratic', prompt: 'Which word is the noun form of "democratic"?', options: ['democracy', 'democraticness-ity', 'democratism', 'democratation'], correctIndex: 0, explanation: '"democratic" (adj.) comes from the noun "democracy".' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'defend', prompt: 'Which word is the noun form of "defend"?', options: ['defense', 'defendment', 'defendity', 'defendation'], correctIndex: 0, explanation: '"defend" (verb) -> "defense" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'current', prompt: 'Which word is the adverb form of "current"?', options: ['currently', 'currentness', 'currentity', 'currentment'], correctIndex: 0, explanation: '"current" (adj.) -> "currently" (adverb).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'dead', prompt: 'Which word is the noun form of "dead"?', options: ['death', 'deadness-ity', 'deadity', 'deadment'], correctIndex: 0, explanation: '"dead" (adj.) -> "death" (noun).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'crime', prompt: 'Which word is the adjective form of "crime"?', options: ['criminal', 'crimeful', 'crimely', 'crimeive'], correctIndex: 0, explanation: '"crime" (noun) -> "criminal" (adjective).' });
  addSingleChoice({ skill: 'WORD_FAMILY', vocab: 'declare', prompt: 'Which word is the noun form of "declare"?', options: ['declaration', 'declarement', 'declarity', 'declaration-ize'], correctIndex: 0, explanation: '"declare" (verb) -> "declaration" (noun).' });

  console.log('Expansion 4 complete: 70 new vocabulary entries, 40 new questions.');
}

run();

if (require.main === module) {
  process.exit(0);
}
