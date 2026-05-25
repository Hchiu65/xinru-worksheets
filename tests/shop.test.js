const { SHOP, findItem, buyItem, buyConsumable, equip, unequip } = require('./lib/shop');

// ── findItem ───────────────────────────────────────────────────────────────

describe('findItem', () => {
  test('finds a badge by id', () => {
    const item = findItem('b_panda');
    expect(item).not.toBeNull();
    expect(item.id).toBe('b_panda');
    expect(item.cost).toBe(300);
  });

  test('finds a title by id', () => {
    const item = findItem('t_master');
    expect(item).not.toBeNull();
    expect(item.cost).toBe(5000);
  });

  test('finds a consumable reward by id', () => {
    const item = findItem('r_sticker1');
    expect(item).not.toBeNull();
    expect(item.consumable).toBe(true);
  });

  test('returns null for an unknown id', () => {
    expect(findItem('does_not_exist')).toBeNull();
  });
});

// ── buyItem ────────────────────────────────────────────────────────────────

describe('buyItem', () => {
  test('deducts the correct cost from stars', () => {
    const result = buyItem(500, {}, 'b_panda'); // cost 300
    expect(result.stars).toBe(200);
  });

  test('adds the item to owned', () => {
    const result = buyItem(500, {}, 'b_panda');
    expect(result.owned['b_panda']).toBe(true);
  });

  test('returns null when stars are insufficient', () => {
    expect(buyItem(100, {}, 'b_panda')).toBeNull(); // cost 300
  });

  test('returns null when the item is already owned', () => {
    expect(buyItem(1000, { b_panda: true }, 'b_panda')).toBeNull();
  });

  test('returns null for an unknown item id', () => {
    expect(buyItem(9999, {}, 'nonexistent')).toBeNull();
  });

  test('does not mutate the original owned object', () => {
    const owned = {};
    buyItem(500, owned, 'b_panda');
    expect(owned).toEqual({});
  });

  test('exact-cost purchase succeeds (stars == cost)', () => {
    const result = buyItem(300, {}, 'b_panda');
    expect(result).not.toBeNull();
    expect(result.stars).toBe(0);
  });
});

// ── buyConsumable ──────────────────────────────────────────────────────────

describe('buyConsumable', () => {
  test('deducts the correct cost', () => {
    const result = buyConsumable(1000, [], 'r_sticker1', '2024/05/01'); // cost 500
    expect(result.stars).toBe(500);
  });

  test('adds an entry to redeemed', () => {
    const result = buyConsumable(1000, [], 'r_sticker1', '2024/05/01');
    expect(result.redeemed).toHaveLength(1);
    expect(result.redeemed[0]).toMatchObject({ id: 'r_sticker1', date: '2024/05/01', used: false });
  });

  test('can be bought multiple times', () => {
    let state = buyConsumable(2000, [], 'r_sticker1', '2024/05/01');
    state = buyConsumable(state.stars, state.redeemed, 'r_sticker1', '2024/05/02');
    expect(state.redeemed).toHaveLength(2);
  });

  test('returns null when stars are insufficient', () => {
    expect(buyConsumable(100, [], 'r_sticker1', '2024/05/01')).toBeNull();
  });

  test('returns null for an unknown item id', () => {
    expect(buyConsumable(9999, [], 'nonexistent', '2024/05/01')).toBeNull();
  });

  test('does not mutate the original redeemed array', () => {
    const redeemed = [];
    buyConsumable(1000, redeemed, 'r_sticker1', '2024/05/01');
    expect(redeemed).toHaveLength(0);
  });
});

// ── equip / unequip ────────────────────────────────────────────────────────

describe('equip', () => {
  test('sets the correct type in equipped', () => {
    const result = equip({}, 'badge', 'b_panda');
    expect(result.badge).toBe('b_panda');
  });

  test('replaces a previously equipped item of the same type', () => {
    const result = equip({ badge: 'b_fox' }, 'badge', 'b_panda');
    expect(result.badge).toBe('b_panda');
  });

  test('does not affect other equipped types', () => {
    const result = equip({ title: 't_expert' }, 'badge', 'b_panda');
    expect(result.title).toBe('t_expert');
  });

  test('does not mutate the original equipped object', () => {
    const equipped = {};
    equip(equipped, 'badge', 'b_panda');
    expect(equipped).toEqual({});
  });
});

describe('unequip', () => {
  test('removes the specified type', () => {
    const result = unequip({ badge: 'b_panda' }, 'badge');
    expect(result.badge).toBeUndefined();
  });

  test('does not affect other equipped types', () => {
    const result = unequip({ badge: 'b_panda', title: 't_expert' }, 'badge');
    expect(result.title).toBe('t_expert');
  });

  test('is a no-op for an already-absent type', () => {
    const result = unequip({}, 'badge');
    expect(result.badge).toBeUndefined();
  });

  test('does not mutate the original equipped object', () => {
    const equipped = { badge: 'b_panda' };
    unequip(equipped, 'badge');
    expect(equipped.badge).toBe('b_panda');
  });
});
