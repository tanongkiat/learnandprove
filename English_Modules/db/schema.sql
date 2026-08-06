-- TriamQuest 90 MVP schema (SQLite, simplified from Speckits.md section 14)

CREATE TABLE IF NOT EXISTS skills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS vocabulary_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lemma TEXT NOT NULL,
  pos TEXT,
  cefr TEXT,
  ipa TEXT,
  thai_meaning TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PUBLISHED',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS vocabulary_examples (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vocabulary_id INTEGER NOT NULL REFERENCES vocabulary_entries(id) ON DELETE CASCADE,
  sentence_en TEXT NOT NULL,
  sentence_th TEXT
);

CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  skill_id INTEGER NOT NULL REFERENCES skills(id),
  vocabulary_id INTEGER REFERENCES vocabulary_entries(id),
  type TEXT NOT NULL,
  prompt TEXT NOT NULL,
  correct_answer TEXT,
  hint TEXT,
  explanation TEXT,
  difficulty INTEGER NOT NULL DEFAULT 2,
  status TEXT NOT NULL DEFAULT 'PUBLISHED',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS question_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  label TEXT NOT NULL,
  match_value TEXT,
  is_correct INTEGER NOT NULL DEFAULT 0
);

-- Internal-use, small-team login (spec: "internal use only", max ~10 people).
-- Deliberately minimal: a name + optional PIN, no password hashing/MFA — this is
-- not meant to withstand outside attackers, only to give each teammate their own
-- progress and let admins tell people apart.
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  pin TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS student_profile (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  exam_date TEXT,
  start_date TEXT NOT NULL DEFAULT (date('now')),
  xp INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  last_active_date TEXT,
  streak_freeze_available INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS student_word_state (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vocabulary_id INTEGER NOT NULL REFERENCES vocabulary_entries(id),
  familiarity REAL NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  lapse_count INTEGER NOT NULL DEFAULT 0,
  recognition_mastery INTEGER NOT NULL DEFAULT 0,
  production_mastery INTEGER NOT NULL DEFAULT 0,
  context_mastery INTEGER NOT NULL DEFAULT 0,
  next_review_at TEXT,
  last_result TEXT,
  UNIQUE (user_id, vocabulary_id)
);

CREATE TABLE IF NOT EXISTS student_skill_mastery (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id INTEGER NOT NULL REFERENCES skills(id),
  mastery REAL NOT NULL DEFAULT 0,
  confidence REAL NOT NULL DEFAULT 0,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  avg_response_ms INTEGER NOT NULL DEFAULT 0,
  last_practiced_at TEXT,
  next_review_at TEXT,
  UNIQUE (user_id, skill_id)
);

CREATE TABLE IF NOT EXISTS attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id),
  skill_id INTEGER NOT NULL REFERENCES skills(id),
  vocabulary_id INTEGER REFERENCES vocabulary_entries(id),
  mode TEXT NOT NULL,
  is_correct INTEGER NOT NULL,
  response_ms INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS error_notebook (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id),
  vocabulary_id INTEGER REFERENCES vocabulary_entries(id),
  skill_id INTEGER NOT NULL REFERENCES skills(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS mock_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  total INTEGER NOT NULL,
  correct INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Admin-uploaded source files for the (lite) ingestion path: PDF -> extracted text ->
-- reviewed candidates -> DRAFT vocabulary_entries. Never auto-published (spec section 10/11).
CREATE TABLE IF NOT EXISTS import_batches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  raw_text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_vocab_lemma ON vocabulary_entries(lemma);
CREATE INDEX IF NOT EXISTS idx_questions_skill ON questions(skill_id);
CREATE INDEX IF NOT EXISTS idx_attempts_created ON attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON attempts(user_id);
