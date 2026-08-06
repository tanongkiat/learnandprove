// Reads the raw submitted answer for one question out of req.body, matching
// the field-naming convention used by views/partials/question.ejs.
function parseSubmission(question, options, body) {
  const key = `answer_${question.id}`;
  switch (question.type) {
    case 'single_choice':
    case 'error_detection':
    case 'fill_blank':
    case 'cloze':
      return body[key];

    case 'multiple_choice': {
      const v = body[key];
      if (Array.isArray(v)) return v;
      return v ? [v] : [];
    }

    case 'ordering': {
      const withPos = options.map((o) => ({
        id: o.id,
        pos: Number(body[`pos_${question.id}_${o.id}`]) || 0,
      }));
      withPos.sort((a, b) => a.pos - b.pos);
      return withPos.map((o) => o.id);
    }

    default:
      return null;
  }
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

module.exports = { parseSubmission, shuffle };
