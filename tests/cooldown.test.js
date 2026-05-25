const { isLocked, reportComplete } = require('./lib/cooldown');

describe('isLocked', () => {
  test('returns false for unknown game', () => {
    expect(isLocked({}, 'unit6')).toBe(false);
  });

  test('returns false when locked flag is false', () => {
    expect(isLocked({ unit6: { locked: false, unlockBy: [] } }, 'unit6')).toBe(false);
  });

  test('returns true when locked and unlockBy has fewer than 2 entries', () => {
    expect(isLocked({ unit6: { locked: true, unlockBy: [] } }, 'unit6')).toBe(true);
    expect(isLocked({ unit6: { locked: true, unlockBy: ['unit6m'] } }, 'unit6')).toBe(true);
  });

  test('returns false when locked but unlockBy has 2 entries (unlock condition met)', () => {
    expect(isLocked({ unit6: { locked: true, unlockBy: ['unit6m', 'u7ziyin'] } }, 'unit6')).toBe(false);
  });

  test('treats missing unlockBy as empty array', () => {
    expect(isLocked({ unit6: { locked: true } }, 'unit6')).toBe(true);
  });
});

describe('reportComplete', () => {
  test('initialises entry for new game', () => {
    const result = reportComplete({}, 'unit6', true);
    expect(result.unit6).toBeDefined();
  });

  test('increments streak on perfect completion', () => {
    let cds = reportComplete({}, 'unit6', true);
    expect(cds.unit6.streak).toBe(1);
    expect(cds.unit6.locked).toBe(false);
  });

  test('locks game after 2 consecutive perfect completions', () => {
    let cds = reportComplete({}, 'unit6', true);
    cds = reportComplete(cds, 'unit6', true);
    expect(cds.unit6.streak).toBe(2);
    expect(cds.unit6.locked).toBe(true);
    expect(cds.unit6.unlockBy).toEqual([]);
  });

  test('resets streak on non-perfect completion', () => {
    let cds = reportComplete({}, 'unit6', true);
    cds = reportComplete(cds, 'unit6', false);
    expect(cds.unit6.streak).toBe(0);
    expect(cds.unit6.locked).toBe(false);
  });

  test('does not lock after non-perfect then perfect', () => {
    let cds = reportComplete({}, 'unit6', false);
    cds = reportComplete(cds, 'unit6', true);
    expect(cds.unit6.locked).toBe(false);
  });

  test('completing a game adds it to unlockBy of locked games', () => {
    // Lock unit6 first
    let cds = reportComplete({}, 'unit6', true);
    cds = reportComplete(cds, 'unit6', true);
    expect(cds.unit6.locked).toBe(true);

    // Complete unit6m — should add unit6m to unit6's unlockBy
    cds = reportComplete(cds, 'unit6m', true);
    expect(cds.unit6.unlockBy).toContain('unit6m');
    expect(cds.unit6.locked).toBe(true); // still only 1 unlock, needs 2
  });

  test('unlocks game when 2 different games have been completed', () => {
    let cds = reportComplete({}, 'unit6', true);
    cds = reportComplete(cds, 'unit6', true);
    expect(cds.unit6.locked).toBe(true);

    cds = reportComplete(cds, 'unit6m', true);
    cds = reportComplete(cds, 'u7ziyin', true);

    expect(cds.unit6.locked).toBe(false);
    expect(cds.unit6.streak).toBe(0);
    expect(cds.unit6.unlockBy).toEqual([]);
  });

  test('same game completing twice does not count as two different unlocks', () => {
    let cds = reportComplete({}, 'unit6', true);
    cds = reportComplete(cds, 'unit6', true);

    cds = reportComplete(cds, 'unit6m', true);
    cds = reportComplete(cds, 'unit6m', true); // same game again

    expect(cds.unit6.unlockBy).toEqual(['unit6m']); // still only 1
    expect(cds.unit6.locked).toBe(true);
  });

  test('does not mutate the input object', () => {
    const original = {};
    const result = reportComplete(original, 'unit6', true);
    expect(original).toEqual({});
    expect(result).not.toBe(original);
  });

  test('locked game itself is skipped when scanning for games to unlock', () => {
    // Lock unit6
    let cds = reportComplete({}, 'unit6', true);
    cds = reportComplete(cds, 'unit6', true);

    // Completing unit6 while it is locked should not add itself to its own unlockBy
    cds = reportComplete(cds, 'unit6', true);
    expect((cds.unit6.unlockBy || [])).not.toContain('unit6');
  });
});
