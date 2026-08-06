// Best-effort heuristic parser: turns raw text extracted from an admin-uploaded PDF
// (e.g. a glossary or word list the admin has rights to use) into vocabulary candidates.
// Never auto-published — see routes/adminImport.js, which always inserts as DRAFT.

const THAI_RE = /[฀-๿]/;
const LATIN_WORD_RE = /^[A-Za-z][A-Za-z\s\-']*[A-Za-z]$|^[A-Za-z]$/;

const SEPARATORS = [' - ', ' – ', ' — ', ' : ', ': ', ' = ', '\t'];

function splitLine(line) {
  for (const sep of SEPARATORS) {
    const idx = line.indexOf(sep);
    if (idx > 0) {
      return [line.slice(0, idx).trim(), line.slice(idx + sep.length).trim()];
    }
  }
  // Fallback: split at the first Thai character.
  const match = line.match(THAI_RE);
  if (match) {
    const idx = match.index;
    return [line.slice(0, idx).trim(), line.slice(idx).trim()];
  }
  return null;
}

function cleanLemma(raw) {
  return raw
    .replace(/^[\d.\-)\s•*]+/, '') // strip leading numbering/bullets
    .replace(/\([^)]*\)\s*$/, '') // strip trailing (pos) markers, captured separately below
    .trim();
}

function extractPos(raw) {
  const m = raw.match(/\(([a-zA-Z.]+)\)\s*$/);
  return m ? m[1].toLowerCase() : null;
}

function cleanMeaning(raw) {
  return raw.replace(/^[-–—:=\s]+/, '').trim();
}

const POS_MAP = {
  n: 'noun', 'n.': 'noun', noun: 'noun',
  v: 'verb', 'v.': 'verb', vt: 'verb', vi: 'verb', verb: 'verb',
  adj: 'adjective', 'adj.': 'adjective', adjective: 'adjective',
  adv: 'adverb', 'adv.': 'adverb', adverb: 'adverb',
};

function parseVocabCandidates(text, { limit = 300 } = {}) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const seen = new Set();
  const candidates = [];

  for (const line of lines) {
    if (candidates.length >= limit) break;
    if (!THAI_RE.test(line)) continue; // need a Thai meaning to be useful

    const parts = splitLine(line);
    if (!parts) continue;
    const [rawLemma, rawMeaning] = parts;
    if (!rawLemma || !rawMeaning) continue;

    const pos = extractPos(rawLemma);
    const lemma = cleanLemma(rawLemma);
    const thaiMeaning = cleanMeaning(rawMeaning);

    if (!LATIN_WORD_RE.test(lemma)) continue;
    if (lemma.length < 2 || lemma.length > 40) continue;
    if (!thaiMeaning || !THAI_RE.test(thaiMeaning)) continue;

    const key = lemma.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    candidates.push({
      lemma,
      pos: pos ? POS_MAP[pos] || pos : '',
      thai_meaning: thaiMeaning,
    });
  }

  return candidates;
}

module.exports = { parseVocabCandidates };
