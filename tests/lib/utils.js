// Shared utilities — extracted from unit6-match.html and mistakes.html.

// Fisher-Yates in-place shuffle. Returns the same array.
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Birthday validation: exactly 4 digits (MMDD format).
function isValidBirthday(value) {
  return /^\d{4}$/.test(value);
}

// Map Firebase account data onto a plain object keyed by localStorage key names.
// Mirrors applyData() in index.html.
function applyData(d) {
  const map = {
    xr_stars: 'stars',
    xr_owned: 'owned',
    xr_equipped: 'equipped',
    xr_redeemed: 'redeemed',
    xr_records: 'records',
    xr_mistakes: 'mistakes',
    xr_cooldowns: 'cooldowns',
  };
  const result = {};
  Object.entries(map).forEach(([lsKey, dKey]) => {
    if (d[dKey] !== undefined) {
      result[lsKey] = typeof d[dKey] === 'object' ? JSON.stringify(d[dKey]) : String(d[dKey]);
    }
  });
  return result;
}

module.exports = { shuffle, isValidBirthday, applyData };
