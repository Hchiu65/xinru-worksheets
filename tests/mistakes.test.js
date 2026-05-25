const {
  recordMistake,
  toggleMaster,
  clearMastered,
  sortMistakes,
  buildPracticePool,
  UNIT_ORDER,
} = require('./lib/mistakes');

// ── recordMistake ──────────────────────────────────────────────────────────

describe('recordMistake', () => {
  test('creates a new entry for an unknown word', () => {
    const result = recordMistake({}, '集思廣益', '大家要（集思廣益）', '第六單元　詞語填空');
    expect(result['集思廣益']).toMatchObject({
      word: '集思廣益',
      question: '大家要（集思廣益）',
      source: '第六單元　詞語填空',
      wrongCount: 1,
      practiceCount: 0,
      mastered: false,
    });
  });

  test('increments wrongCount for an existing entry', () => {
    let all = recordMistake({}, '集思廣益', 'q', 'src');
    all = recordMistake(all, '集思廣益', 'q', 'src');
    expect(all['集思廣益'].wrongCount).toBe(2);
  });

  test('sets meaning from the meanings lookup', () => {
    const meanings = { '集思廣益': '集合眾人智慧，廣泛獲益' };
    const result = recordMistake({}, '集思廣益', 'q', 'src', meanings);
    expect(result['集思廣益'].meaning).toBe('集合眾人智慧，廣泛獲益');
  });

  test('updates meaning on subsequent calls if lookup has the word', () => {
    const meanings = { '集思廣益': '集合眾人智慧，廣泛獲益' };
    let all = recordMistake({}, '集思廣益', 'q', 'src', {});
    expect(all['集思廣益'].meaning).toBe('');
    all = recordMistake(all, '集思廣益', 'q', 'src', meanings);
    expect(all['集思廣益'].meaning).toBe('集合眾人智慧，廣泛獲益');
  });

  test('sets lastWrong to a non-empty date string', () => {
    const result = recordMistake({}, '集思廣益', 'q', 'src');
    expect(result['集思廣益'].lastWrong).toBeTruthy();
  });

  test('does not overwrite existing question if new question is falsy', () => {
    let all = recordMistake({}, '集思廣益', 'original question', 'src');
    all = recordMistake(all, '集思廣益', '', 'src');
    expect(all['集思廣益'].question).toBe('original question');
  });

  test('does not mutate the input object', () => {
    const original = {};
    recordMistake(original, '集思廣益', 'q', 'src');
    expect(original).toEqual({});
  });
});

// ── toggleMaster ───────────────────────────────────────────────────────────

describe('toggleMaster', () => {
  test('marks an unmastered word as mastered', () => {
    const all = { '集思廣益': { mastered: false } };
    expect(toggleMaster(all, '集思廣益')['集思廣益'].mastered).toBe(true);
  });

  test('unmarks a mastered word', () => {
    const all = { '集思廣益': { mastered: true } };
    expect(toggleMaster(all, '集思廣益')['集思廣益'].mastered).toBe(false);
  });

  test('returns input unchanged for an unknown word', () => {
    const all = {};
    expect(toggleMaster(all, '不存在')).toBe(all);
  });

  test('does not mutate the input', () => {
    const all = { '集思廣益': { mastered: false } };
    toggleMaster(all, '集思廣益');
    expect(all['集思廣益'].mastered).toBe(false);
  });
});

// ── clearMastered ──────────────────────────────────────────────────────────

describe('clearMastered', () => {
  test('removes mastered entries', () => {
    const all = {
      a: { mastered: true },
      b: { mastered: false },
    };
    const result = clearMastered(all);
    expect(result.a).toBeUndefined();
    expect(result.b).toBeDefined();
  });

  test('returns empty object when all entries are mastered', () => {
    const all = { a: { mastered: true }, b: { mastered: true } };
    expect(clearMastered(all)).toEqual({});
  });

  test('returns identical entries when none are mastered', () => {
    const all = { a: { mastered: false } };
    const result = clearMastered(all);
    expect(result.a).toBeDefined();
  });
});

// ── sortMistakes ───────────────────────────────────────────────────────────

describe('sortMistakes', () => {
  const items = [
    { word: 'c', source: '第七單元　字音辨正', wrongCount: 3, lastWrong: '2024/05/01' },
    { word: 'a', source: '第六單元　詞語填空', wrongCount: 1, lastWrong: '2024/05/03' },
    { word: 'b', source: '第六單元　詞語填空', wrongCount: 5, lastWrong: '2024/05/02' },
    { word: 'd', source: '未知單元',           wrongCount: 2, lastWrong: '2024/04/30' },
  ];

  test('sort by unit follows UNIT_ORDER; ties broken by wrongCount descending', () => {
    const sorted = sortMistakes(items, 'unit');
    // First two should be 第六單元　詞語填空 (index 0), with b (wrongCount 5) before a (1)
    expect(sorted[0].word).toBe('b');
    expect(sorted[1].word).toBe('a');
    // Then 第七單元　字音辨正 (index 2)
    expect(sorted[2].word).toBe('c');
    // Unknown source sorts last
    expect(sorted[3].word).toBe('d');
  });

  test('sort by wrong is descending by wrongCount', () => {
    const sorted = sortMistakes(items, 'wrong');
    const counts = sorted.map(i => i.wrongCount);
    expect(counts).toEqual([...counts].sort((a, b) => b - a));
  });

  test('sort by date is descending by lastWrong', () => {
    const sorted = sortMistakes(items, 'date');
    const dates = sorted.map(i => i.lastWrong);
    for (let i = 0; i < dates.length - 1; i++) {
      expect(dates[i] >= dates[i + 1]).toBe(true);
    }
  });

  test('does not mutate the input array', () => {
    const copy = [...items];
    sortMistakes(items, 'wrong');
    expect(items.map(i => i.word)).toEqual(copy.map(i => i.word));
  });
});

// ── buildPracticePool ──────────────────────────────────────────────────────

describe('buildPracticePool', () => {
  test('excludes mastered items', () => {
    const all = {
      a: { mastered: true,  meaning: '解釋A' },
      b: { mastered: false, meaning: '解釋B' },
    };
    const pool = buildPracticePool(all);
    expect(pool.every(m => !m.mastered)).toBe(true);
  });

  test('excludes items without a meaning', () => {
    const all = {
      a: { mastered: false, meaning: '' },
      b: { mastered: false, meaning: '解釋B' },
    };
    const pool = buildPracticePool(all);
    expect(pool.length).toBe(1);
    expect(pool[0].meaning).toBe('解釋B');
  });

  test('caps at 8 items', () => {
    const all = {};
    for (let i = 0; i < 20; i++) {
      all[`word${i}`] = { mastered: false, meaning: `meaning${i}` };
    }
    expect(buildPracticePool(all).length).toBe(8);
  });

  test('returns all qualifying items when fewer than 8', () => {
    const all = {
      a: { mastered: false, meaning: '解釋A' },
      b: { mastered: false, meaning: '解釋B' },
    };
    expect(buildPracticePool(all).length).toBe(2);
  });
});
