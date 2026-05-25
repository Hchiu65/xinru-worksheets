const {
  calcMatchStars,
  calcStreakBonus,
  PERFECT_ROUND_BONUS,
  calcChallengeBonus,
  calcAccuracy,
} = require('./lib/scoring');

describe('calcMatchStars', () => {
  test('awards 5 stars for a first-try correct match', () => {
    expect(calcMatchStars(true)).toBe(5);
  });

  test('awards 3 stars for a retry correct match', () => {
    expect(calcMatchStars(false)).toBe(3);
  });
});

describe('calcStreakBonus', () => {
  test('awards +10 at streak of 3', () => {
    expect(calcStreakBonus(3)).toBe(10);
  });

  test('awards +20 at streak of 5', () => {
    expect(calcStreakBonus(5)).toBe(20);
  });

  test('awards +50 at streak of 10', () => {
    expect(calcStreakBonus(10)).toBe(50);
  });

  test('awards 0 for non-milestone streaks', () => {
    [1, 2, 4, 6, 7, 8, 9, 11].forEach(n => {
      expect(calcStreakBonus(n)).toBe(0);
    });
  });
});

describe('PERFECT_ROUND_BONUS', () => {
  test('is 50', () => {
    expect(PERFECT_ROUND_BONUS).toBe(50);
  });
});

describe('calcChallengeBonus', () => {
  test('awards +100 for a no-mistake challenge', () => {
    expect(calcChallengeBonus(true)).toBe(100);
  });

  test('awards +50 for a challenge completed with mistakes', () => {
    expect(calcChallengeBonus(false)).toBe(50);
  });
});

describe('calcAccuracy', () => {
  test('returns 100 when all answers are correct', () => {
    expect(calcAccuracy(10, 10)).toBe(100);
  });

  test('returns 0 when no answers are correct', () => {
    expect(calcAccuracy(0, 10)).toBe(0);
  });

  test('returns 0 for empty input (total = 0)', () => {
    expect(calcAccuracy(0, 0)).toBe(0);
  });

  test('rounds to the nearest integer', () => {
    // 1/3 ≈ 33.33 → 33
    expect(calcAccuracy(1, 3)).toBe(33);
    // 2/3 ≈ 66.67 → 67
    expect(calcAccuracy(2, 3)).toBe(67);
  });

  test('returns 50 for half-correct answers', () => {
    expect(calcAccuracy(5, 10)).toBe(50);
  });
});
