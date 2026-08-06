// In-memory session store for the Duolingo-style one-question-at-a-time training flow.
// Single-process, single-user hobby app — no need for a persistent session store.
const crypto = require('node:crypto');

const sessions = new Map();

function createSession(skillCode, questionIds) {
  const id = crypto.randomUUID();
  sessions.set(id, {
    skillCode,
    questionIds,
    index: 0,
    results: [],
    xpTotal: 0,
    streak: null,
    awaitingContinue: false,
  });
  return id;
}

function getSession(id) {
  return sessions.get(id);
}

function endSession(id) {
  const s = sessions.get(id);
  sessions.delete(id);
  return s;
}

module.exports = { createSession, getSession, endSession };
