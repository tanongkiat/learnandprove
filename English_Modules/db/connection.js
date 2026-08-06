const path = require('node:path');
const fs = require('node:fs');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'triamquest.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA foreign_keys = ON;');

// The move to multi-user login reshaped student_profile and added user_id to several
// tables. This is local, disposable dev data, so on that one-time transition we just
// drop the old single-user versions of those tables and let schema.sql rebuild them.
const hasUsersTable = db
  .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'users'")
  .get();
const hasOldProfileTable = db
  .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'student_profile'")
  .get();
if (!hasUsersTable && hasOldProfileTable) {
  db.exec(`
    DROP TABLE IF EXISTS student_profile;
    DROP TABLE IF EXISTS student_word_state;
    DROP TABLE IF EXISTS student_skill_mastery;
    DROP TABLE IF EXISTS attempts;
    DROP TABLE IF EXISTS error_notebook;
    DROP TABLE IF EXISTS mock_sessions;
  `);
}

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

// CREATE TABLE IF NOT EXISTS won't add new columns to an already-existing table,
// so patch older databases in place.
const questionColumns = db.prepare('PRAGMA table_info(questions)').all().map((c) => c.name);
if (!questionColumns.includes('hint')) {
  db.exec('ALTER TABLE questions ADD COLUMN hint TEXT');
}

module.exports = db;
