// Scoring calculations — extracted from unit6-match.html game logic.

// Star award for a single card match attempt.
function calcMatchStars(isFirstTry) {
  return isFirstTry ? 5 : 3;
}

// Bonus stars awarded at streak milestones (3, 5, 10 consecutive correct matches).
function calcStreakBonus(streak) {
  if (streak === 10) return 50;
  if (streak === 5)  return 20;
  if (streak === 3)  return 10;
  return 0;
}

// Bonus stars for completing a round with no mistakes.
const PERFECT_ROUND_BONUS = 50;

// Bonus stars for completing the timed challenge.
// success: true = no mistakes, false = completed with mistakes.
function calcChallengeBonus(success) {
  return success ? 100 : 50;
}

// Accuracy as an integer percentage (0–100). Returns 0 for empty input.
function calcAccuracy(correct, total) {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}

module.exports = {
  calcMatchStars,
  calcStreakBonus,
  PERFECT_ROUND_BONUS,
  calcChallengeBonus,
  calcAccuracy,
};
