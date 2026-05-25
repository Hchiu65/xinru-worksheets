const { isValidBirthday, applyData, shuffle } = require('./lib/utils');

// ── isValidBirthday ────────────────────────────────────────────────────────

describe('isValidBirthday', () => {
  test('accepts exactly 4 digits', () => {
    expect(isValidBirthday('0115')).toBe(true);
    expect(isValidBirthday('1231')).toBe(true);
    expect(isValidBirthday('0101')).toBe(true);
  });

  test('rejects fewer than 4 digits', () => {
    expect(isValidBirthday('011')).toBe(false);
    expect(isValidBirthday('1')).toBe(false);
    expect(isValidBirthday('')).toBe(false);
  });

  test('rejects more than 4 digits', () => {
    expect(isValidBirthday('01150')).toBe(false);
    expect(isValidBirthday('12345')).toBe(false);
  });

  test('rejects non-digit characters', () => {
    expect(isValidBirthday('abc0')).toBe(false);
    expect(isValidBirthday('01/5')).toBe(false);
    expect(isValidBirthday(' 115')).toBe(false);
  });
});

// ── applyData ──────────────────────────────────────────────────────────────

describe('applyData', () => {
  test('maps stars as a string', () => {
    const result = applyData({ stars: 42 });
    expect(result['xr_stars']).toBe('42');
  });

  test('serialises object values to JSON', () => {
    const result = applyData({ owned: { b_panda: true } });
    expect(result['xr_owned']).toBe(JSON.stringify({ b_panda: true }));
  });

  test('serialises array values to JSON', () => {
    const result = applyData({ records: [{ stars: 10 }] });
    expect(result['xr_records']).toBe(JSON.stringify([{ stars: 10 }]));
  });

  test('skips keys not present in the input', () => {
    const result = applyData({ stars: 5 });
    expect(result['xr_owned']).toBeUndefined();
    expect(result['xr_records']).toBeUndefined();
  });

  test('maps all known keys when all are present', () => {
    const d = {
      stars: 100,
      owned: {},
      equipped: {},
      redeemed: [],
      records: [],
      mistakes: {},
      cooldowns: {},
    };
    const result = applyData(d);
    const expectedKeys = ['xr_stars','xr_owned','xr_equipped','xr_redeemed','xr_records','xr_mistakes','xr_cooldowns'];
    expectedKeys.forEach(k => expect(result[k]).toBeDefined());
  });

  test('does not include xr_name or xr_bday (handled separately by auth)', () => {
    const result = applyData({ stars: 1, name: 'Alice', bday: '0101' });
    expect(result['xr_name']).toBeUndefined();
    expect(result['xr_bday']).toBeUndefined();
  });
});

// ── shuffle ────────────────────────────────────────────────────────────────

describe('shuffle', () => {
  test('returns the same array reference', () => {
    const arr = [1, 2, 3];
    expect(shuffle(arr)).toBe(arr);
  });

  test('preserves all elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const copy = [...arr];
    shuffle(arr);
    expect(arr.sort()).toEqual(copy.sort());
  });

  test('preserves length', () => {
    const arr = [1, 2, 3, 4];
    shuffle(arr);
    expect(arr).toHaveLength(4);
  });

  test('handles an empty array', () => {
    expect(shuffle([])).toEqual([]);
  });

  test('handles a single-element array', () => {
    expect(shuffle([42])).toEqual([42]);
  });

  test('produces different orderings over many runs (statistical)', () => {
    // With 6 elements there are 720 permutations; after 100 shuffles
    // the probability of always producing the original order is (1/720)^100 ≈ 0.
    const original = [1, 2, 3, 4, 5, 6];
    let identical = 0;
    for (let i = 0; i < 100; i++) {
      const arr = [...original];
      shuffle(arr);
      if (arr.join() === original.join()) identical++;
    }
    expect(identical).toBeLessThan(5);
  });
});
