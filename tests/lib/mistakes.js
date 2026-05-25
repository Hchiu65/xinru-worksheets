// Mistake tracking logic — extracted from unit6.html and mistakes.html.

const UNIT_ORDER = [
  '第六單元　詞語填空', '第六單元　成語連連看',
  '第七單元　字音辨正', '第七單元　找錯別字', '第七單元　成語填空',
  '第七單元　作業練習　改錯字', '第七單元　作業練習　字音辨字', '第七單元　作業練習　字彙練習',
];

// Returns a new mistakes object with the given word recorded (or its count incremented).
// all: existing mistakes object { [word]: MistakeEntry }
// meanings: optional lookup map { [word]: string }
// source: game source label string
function recordMistake(all, word, question, source, meanings = {}) {
  const next = { ...all };
  if (!next[word]) {
    next[word] = {
      word,
      question: question || word,
      meaning: meanings[word] || '',
      source: source || '',
      wrongCount: 0,
      practiceCount: 0,
      lastWrong: '',
      mastered: false,
    };
  }
  if (question && !next[word].question) next[word].question = question;
  if (!next[word].source && source) next[word].source = source;
  next[word].wrongCount++;
  next[word].lastWrong = new Date().toLocaleDateString('zh-TW');
  if (meanings[word]) next[word].meaning = meanings[word];
  return next;
}

// Flip the mastered flag for one word. Returns a new mistakes object.
function toggleMaster(all, word) {
  if (!all[word]) return all;
  return { ...all, [word]: { ...all[word], mastered: !all[word].mastered } };
}

// Remove all mastered entries. Returns a new mistakes object.
function clearMastered(all) {
  return Object.fromEntries(Object.entries(all).filter(([, v]) => !v.mastered));
}

// Return sorted copy of a mistakes array according to sortMode.
function sortMistakes(items, sortMode) {
  const arr = [...items];
  if (sortMode === 'unit') {
    arr.sort((a, b) => {
      const ai = UNIT_ORDER.indexOf(a.source || '');
      const bi = UNIT_ORDER.indexOf(b.source || '');
      const ao = ai < 0 ? 999 : ai;
      const bo = bi < 0 ? 999 : bi;
      return ao !== bo ? ao - bo : b.wrongCount - a.wrongCount;
    });
  } else if (sortMode === 'wrong') {
    arr.sort((a, b) => b.wrongCount - a.wrongCount);
  } else {
    arr.sort((a, b) => (b.lastWrong || '').localeCompare(a.lastWrong || ''));
  }
  return arr;
}

// Return up to 8 non-mastered items that have a meaning (suitable for practice).
function buildPracticePool(all) {
  return Object.values(all)
    .filter(m => !m.mastered && m.meaning)
    .slice(0, 8);
}

module.exports = { recordMistake, toggleMaster, clearMastered, sortMistakes, buildPracticePool, UNIT_ORDER };
