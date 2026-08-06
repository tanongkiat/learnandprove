// Grades one submitted answer against a question + its options.
// `submitted` shape depends on question.type (see routes for how forms encode it).
function gradeQuestion(question, options, submitted) {
  switch (question.type) {
    case 'single_choice':
    case 'error_detection': {
      const correct = options.find((o) => o.is_correct);
      const submittedId = Number(submitted);
      return { isCorrect: !!correct && correct.id === submittedId, correctLabel: correct ? correct.label : null };
    }

    case 'multiple_choice': {
      const correctIds = options.filter((o) => o.is_correct).map((o) => o.id).sort();
      const submittedIds = (Array.isArray(submitted) ? submitted : [submitted])
        .filter(Boolean)
        .map(Number)
        .sort();
      const isCorrect =
        correctIds.length === submittedIds.length && correctIds.every((id, i) => id === submittedIds[i]);
      return { isCorrect, correctLabel: options.filter((o) => o.is_correct).map((o) => o.label).join(', ') };
    }

    case 'fill_blank':
    case 'cloze': {
      const accepted = String(question.correct_answer || '')
        .split('|')
        .map((s) => s.trim().toLowerCase());
      const value = String(submitted || '').trim().toLowerCase();
      return { isCorrect: accepted.includes(value), correctLabel: question.correct_answer };
    }

    case 'ordering': {
      const correctOrder = options.slice().sort((a, b) => a.sort_order - b.sort_order).map((o) => o.id);
      const submittedOrder = (Array.isArray(submitted) ? submitted : [submitted]).filter(Boolean).map(Number);
      const isCorrect =
        correctOrder.length === submittedOrder.length && correctOrder.every((id, i) => id === submittedOrder[i]);
      const correctLabel = options
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((o) => o.label)
        .join(' ');
      return { isCorrect, correctLabel };
    }

    default:
      return { isCorrect: false, correctLabel: null };
  }
}

module.exports = { gradeQuestion };
