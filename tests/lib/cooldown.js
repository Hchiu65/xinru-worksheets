// Cooldown/unlock state machine — extracted from the inline <script> in each game HTML file.
// Functions accept a plain cooldowns object rather than reading localStorage directly.

function isLocked(cds, gameId) {
  const g = cds[gameId];
  return !!(g && g.locked && (g.unlockBy || []).length < 2);
}

// Returns a new cooldowns object (does not mutate the input).
// perfect: whether the player completed the game without any mistakes.
function reportComplete(cds, gameId, perfect) {
  const next = JSON.parse(JSON.stringify(cds)); // deep clone

  if (!next[gameId]) next[gameId] = { streak: 0, locked: false, unlockBy: [] };
  const me = next[gameId];

  if (!me.locked) {
    me.streak = perfect ? (me.streak || 0) + 1 : 0;
    if (me.streak >= 2) {
      me.locked = true;
      me.unlockBy = [];
    }
  }

  Object.keys(next).forEach(id => {
    if (id === gameId || !next[id].locked) return;
    if (!(next[id].unlockBy || []).includes(gameId)) {
      next[id].unlockBy = [...(next[id].unlockBy || []), gameId];
      if (next[id].unlockBy.length >= 2) {
        next[id].locked = false;
        next[id].streak = 0;
        next[id].unlockBy = [];
      }
    }
  });

  return next;
}

module.exports = { isLocked, reportComplete };
