// Shop purchase/equip logic — extracted from shop.html.

const SHOP = {
  badges: [
    { id: 'b_panda',     icon: '🐼', name: '小熊貓',   cost: 300  },
    { id: 'b_fox',       icon: '🦊', name: '小狐狸',   cost: 300  },
    { id: 'b_penguin',   icon: '🐧', name: '企　鵝',   cost: 500  },
    { id: 'b_butterfly', icon: '🦋', name: '蝴　蝶',   cost: 500  },
    { id: 'b_tiger',     icon: '🐯', name: '小老虎',   cost: 1000 },
    { id: 'b_lion',      icon: '🦁', name: '小獅子',   cost: 1000 },
    { id: 'b_dragon',    icon: '🐉', name: '神　龍',   cost: 3000 },
    { id: 'b_unicorn',   icon: '🦄', name: '獨角獸',   cost: 3000 },
  ],
  titles: [
    { id: 't_expert', icon: '🏅', name: '成語小達人', cost: 1500  },
    { id: 't_master', icon: '🥇', name: '成語大師',   cost: 5000  },
    { id: 't_king',   icon: '👑', name: '成語無敵王', cost: 10000 },
  ],
  rewards: [
    { id: 'r_sticker1', icon: '🌟', name: '貼紙一張',      cost: 500,  consumable: true },
    { id: 'r_sticker3', icon: '✨', name: '貼紙豪華包×3',  cost: 1500, consumable: true },
    { id: 'r_score3',   icon: '📝', name: '課堂加分 +3分', cost: 1200, consumable: true },
    { id: 'r_score5',   icon: '📚', name: '課堂加分 +5分', cost: 3000, consumable: true },
  ],
};

function findItem(id) {
  for (const cat of Object.values(SHOP)) {
    const found = cat.find(i => i.id === id);
    if (found) return found;
  }
  return null;
}

// Returns { stars, owned } after buying a non-consumable item, or null if purchase is invalid.
function buyItem(stars, owned, id) {
  const item = findItem(id);
  if (!item || stars < item.cost || owned[id]) return null;
  return { stars: stars - item.cost, owned: { ...owned, [id]: true } };
}

// Returns { stars, redeemed } after buying a consumable, or null if purchase is invalid.
function buyConsumable(stars, redeemed, id, dateStr) {
  const item = findItem(id);
  if (!item || stars < item.cost) return null;
  return {
    stars: stars - item.cost,
    redeemed: [...redeemed, { id, date: dateStr, used: false }],
  };
}

// Returns a new equipped object with type set to id.
function equip(equipped, type, id) {
  return { ...equipped, [type]: id };
}

// Returns a new equipped object with type removed.
function unequip(equipped, type) {
  const next = { ...equipped };
  delete next[type];
  return next;
}

module.exports = { SHOP, findItem, buyItem, buyConsumable, equip, unequip };
