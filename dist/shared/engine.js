/**
 * LE GOATY — 6×5 cluster heist with tumbles.
 * Books are the source of truth. Payouts are integer hundredths of the
 * base stake (100 = 1×) and are always multiples of 10.
 *
 * Max win is 10,000×. That is the highest cap that still qualifies for the
 * $1,000 max-bet template (top win limit 25,000×) and gives the heist a
 * legendary ceiling without opening the 100×-bet templates.
 */

export const GAME_ID = "le-goaty";
export const GAME_NAME = "LE GOATY";
export const COLS = 6;
export const ROWS = 5;
export const MAX_WIN_X = 10000;
export const MAX_WIN_H = 1000000;
export const PAY_STEP = 10;
export const TARGET_RTP = 0.964;
export const CLUSTER_MIN = 5;
export const ANTE_COST = 1.25;

export const SYMBOLS = ["W", "S", "C1", "C2", "C3", "M", "K", "H1", "H2", "H3", "H4", "H5", "L1", "L2", "L3", "L4"];

export const SYMBOL_META = {
  W: { name: "The Goat", kind: "wild" },
  S: { name: "Alpine Clover", kind: "scatter" },
  C1: { name: "Copper Coin", kind: "coin" },
  C2: { name: "Silver Coin", kind: "coin" },
  C3: { name: "Gold Coin", kind: "coin" },
  M: { name: "Heist Bell", kind: "multiplier" },
  K: { name: "Loot Sack", kind: "collector" },
  H1: { name: "Pocket Watch", kind: "high" },
  H2: { name: "Brass Key", kind: "high" },
  H3: { name: "Wax Seal", kind: "high" },
  H4: { name: "Violin", kind: "high" },
  H5: { name: "Chalice", kind: "high" },
  L1: { name: "Ace of Peaks", kind: "low" },
  L2: { name: "King of Peaks", kind: "low" },
  L3: { name: "Queen of Peaks", kind: "low" },
  L4: { name: "Jack of Peaks", kind: "low" },
};

/** Cluster pays in hundredths, indexed by symbol, then by size bucket 5 / 8 / 12. */
export const PAYTABLE = {
  H1: { 5: 80, 8: 400, 12: 2000 },
  H2: { 5: 50, 8: 240, 12: 1200 },
  H3: { 5: 40, 8: 160, 12: 700 },
  H4: { 5: 30, 8: 120, 12: 400 },
  H5: { 5: 20, 8: 80, 12: 240 },
  L1: { 5: 10, 8: 60, 12: 200 },
  L2: { 5: 10, 8: 40, 12: 140 },
  L3: { 5: 10, 8: 30, 12: 100 },
  L4: { 5: 10, 8: 20, 12: 80 },
};

export const SCATTER_PAY = { 3: 50, 4: 200, 5: 500 };
export const COIN_VALUES = {
  C1: [10, 20, 20, 40],
  C2: [40, 50, 100],
  C3: [100, 200],
};
export const BELL_VALUES = {
  base: [2, 2, 2, 3, 5],
  normal: [2, 2, 3, 5],
  super: [2, 3, 3, 5, 10],
  hidden: [2, 3, 5, 10],
  epic: [2, 3, 5, 10, 10],
};

const GOLD_MULT = [1, 2, 3, 5];
const CASCADE_CAP = { base: 4, free: 6 };
const MAX_FREE_SPINS = 14;

export const BONUS_TIERS = {
  normal: { spins: 8, goldCap: 2, persist: false, meterCap: 3 },
  super: { spins: 8, goldCap: 3, persist: true, meterCap: 4 },
  hidden: { spins: 8, goldCap: 3, persist: false, meterCap: 4, upgradeAt: 3, extra: 2 },
  epic: { spins: 10, goldCap: 3, persist: true, meterCap: 5, seeded: true },
};

const PAYING = ["H1", "H2", "H3", "H4", "H5", "L1", "L2", "L3", "L4"];
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

const BASE_FREQ = { L4: 6, L3: 5, L2: 5, L1: 4, H5: 3, H4: 2, H3: 2, H2: 2, H1: 1, W: 1, S: 1, C1: 2, C2: 1, M: 1, K: 1 };
const ANTE_FREQ = { ...BASE_FREQ, S: 2 };
const FREE_FREQ = { L4: 8, L3: 6, L2: 4, L1: 3, H5: 2, H4: 1, H3: 1, H2: 1, H1: 1, W: 3, S: 1, C1: 2, C2: 1, M: 1, K: 1 };

export function bonusTier(scatterCount, rng) {
  if (scatterCount >= 5) return "epic";
  if (scatterCount === 4) return "super";
  if (rng && rng() < 0.08) return "hidden";
  return "normal";
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(items, rng) {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const swap = arr[i];
    arr[i] = arr[j];
    arr[j] = swap;
  }
  return arr;
}

function stripFromFreq(freq, rng) {
  const bag = [];
  for (const [sym, count] of Object.entries(freq)) {
    for (let i = 0; i < count; i += 1) bag.push(sym);
  }
  return shuffle(bag, rng);
}

const stripRng = mulberry32(20261123);
export const BASE_STRIPS = [0, 1, 2, 3, 4, 5].map(() => stripFromFreq(BASE_FREQ, stripRng));
export const ANTE_STRIPS = [0, 1, 2, 3, 4, 5].map(() => stripFromFreq(ANTE_FREQ, stripRng));
export const FREE_STRIPS = [0, 1, 2, 3, 4, 5].map(() => stripFromFreq(FREE_FREQ, stripRng));

function clusterPay(symbol, size) {
  const table = PAYTABLE[symbol];
  if (!table) return 0;
  if (size >= 12) return table[12];
  if (size >= 8) return table[8];
  if (size >= 5) return table[5];
  return 0;
}

function emptyGold() {
  return [0, 1, 2, 3, 4, 5].map(() => [0, 0, 0, 0, 0]);
}

function createRound() {
  const events = [];
  const push = (event) => {
    events.push({ index: events.length, ...event });
  };
  return { events, push };
}

function rollCoin(id, rng) {
  const table = COIN_VALUES[id];
  return table[Math.floor(rng() * table.length)];
}

function rollBell(tier, rng) {
  const table = BELL_VALUES[tier] || BELL_VALUES.base;
  return table[Math.floor(rng() * table.length)];
}

function makeCell(id, rng, tier) {
  const cell = { id };
  if (id === "C1" || id === "C2" || id === "C3") cell.coin = rollCoin(id, rng);
  if (id === "M") cell.bell = rollBell(tier, rng);
  return cell;
}

function drawSymbol(strip, rng, tier) {
  const id = strip[Math.floor(rng() * strip.length)];
  return makeCell(id, rng, tier);
}

function drawBoard(strips, rng, tier) {
  const board = [];
  for (let reel = 0; reel < COLS; reel += 1) {
    const strip = strips[reel];
    const stop = Math.floor(rng() * strip.length);
    const col = [];
    for (let row = 0; row < ROWS; row += 1) {
      const id = strip[(stop + row) % strip.length];
      col.push(makeCell(id, rng, tier));
    }
    board.push(col);
  }
  return board;
}

const GRID_CODE = {
  W: "W", S: "S", C1: "c", C2: "d", C3: "e", M: "m", K: "k",
  H1: "a", H2: "b", H3: "f", H4: "g", H5: "h",
  L1: "1", L2: "2", L3: "3", L4: "4",
};

function packBoard(board, golden) {
  let grid = "";
  const coins = [];
  const bells = [];
  const golds = [];
  for (let reel = 0; reel < COLS; reel += 1) {
    for (let row = 0; row < ROWS; row += 1) {
      const cell = board[reel][row];
      grid += GRID_CODE[cell.id] || "?";
      if (cell.coin) coins.push([reel, row, cell.coin]);
      if (cell.bell) bells.push([reel, row, cell.bell]);
      const level = golden[reel][row];
      if (level) golds.push([reel, row, level]);
    }
  }
  const packed = { grid };
  if (coins.length) packed.coins = coins;
  if (bells.length) packed.bells = bells;
  if (golds.length) packed.golds = golds;
  return packed;
}

function anticipationFor(board) {
  const flags = [0, 0, 0, 0, 0, 0];
  let seen = 0;
  for (let reel = 0; reel < COLS; reel += 1) {
    flags[reel] = seen >= 2 ? seen : 0;
    for (let row = 0; row < ROWS; row += 1) {
      if (board[reel][row].id === "S") seen += 1;
    }
  }
  return flags;
}

export function findClusters(board) {
  const consumed = new Set();
  const wins = [];
  for (const symbol of PAYING) {
    for (let reel = 0; reel < COLS; reel += 1) {
      for (let row = 0; row < ROWS; row += 1) {
        const seed = `${reel},${row}`;
        if (consumed.has(seed)) continue;
        if (board[reel][row].id !== symbol) continue;
        const group = [];
        const stack = [[reel, row]];
        const local = new Set([seed]);
        while (stack.length) {
          const [cr, cy] = stack.pop();
          group.push({ reel: cr, row: cy });
          for (const [dx, dy] of DIRS) {
            const nr = cr + dx;
            const ny = cy + dy;
            if (nr < 0 || ny < 0 || nr >= COLS || ny >= ROWS) continue;
            const key = `${nr},${ny}`;
            if (local.has(key) || consumed.has(key)) continue;
            const id = board[nr][ny].id;
            if (id === symbol || id === "W") {
              local.add(key);
              stack.push([nr, ny]);
            }
          }
        }
        if (group.length >= CLUSTER_MIN) {
          for (const cell of group) consumed.add(`${cell.reel},${cell.row}`);
          wins.push({ symbol, size: group.length, positions: group, raw: clusterPay(symbol, group.length) });
        }
      }
    }
  }
  return wins;
}

function countId(board, id) {
  let n = 0;
  for (const col of board) {
    for (const cell of col) if (cell.id === id) n += 1;
  }
  return n;
}

function maxBell(board) {
  let best = 0;
  let at = null;
  for (let reel = 0; reel < COLS; reel += 1) {
    for (let row = 0; row < ROWS; row += 1) {
      const bell = board[reel][row].bell || 0;
      if (bell > best) {
        best = bell;
        at = { reel, row };
      }
    }
  }
  return { value: best, at };
}

function goldenMult(level) {
  return GOLD_MULT[level] || 1;
}

function bestGolden(positions, golden) {
  let level = 0;
  for (const pos of positions) level = Math.max(level, golden[pos.reel][pos.row]);
  return level;
}

function markGolden(positions, golden, cap) {
  const changed = [];
  for (const pos of positions) {
    const next = Math.min(cap, golden[pos.reel][pos.row] + 1);
    if (next !== golden[pos.reel][pos.row]) {
      golden[pos.reel][pos.row] = next;
      changed.push({ reel: pos.reel, row: pos.row, level: next, mult: goldenMult(next) });
    }
  }
  return changed;
}

function removeCells(board, positions) {
  for (const pos of positions) board[pos.reel][pos.row] = null;
}

function collapse(board, strips, rng, tier) {
  for (let reel = 0; reel < COLS; reel += 1) {
    const kept = [];
    for (let row = 0; row < ROWS; row += 1) {
      if (board[reel][row]) kept.push(board[reel][row]);
    }
    const fresh = [];
    const missing = ROWS - kept.length;
    for (let i = 0; i < missing; i += 1) fresh.push(drawSymbol(strips[reel], rng, tier));
    board[reel] = fresh.concat(kept);
  }
}

function winTierName(hundredths) {
  const x = hundredths / 100;
  if (x >= MAX_WIN_X || x >= 500) return "legendary";
  if (x >= 100) return "epic";
  if (x >= 40) return "mega";
  if (x >= 15) return "big";
  if (x >= 5) return "nice";
  return "";
}

function scaleTo(amount, room) {
  const capped = Math.min(amount, room);
  return Math.floor(capped / PAY_STEP) * PAY_STEP;
}

function resolveSpin(round, board, strips, rng, ctx, totalH) {
  let total = totalH;
  let cascades = 0;
  let maxScatters = 0;
  let first = true;
  let capped = false;
  const cascadeCap = ctx.gameType === "freegame" ? CASCADE_CAP.free : CASCADE_CAP.base;
  while (cascades < cascadeCap && !capped) {
    const scatters = countId(board, "S");
    if (scatters > maxScatters) maxScatters = scatters;
    round.push({
      type: first ? "reveal" : "tumbleBoard",
      board: packBoard(board, ctx.golden),
      gameType: ctx.gameType,
      anticipation: first ? anticipationFor(board) : [0, 0, 0, 0, 0, 0],
    });
    first = false;
    const clusters = findClusters(board);
    const positions = [];
    let raw = 0;
    for (const cluster of clusters) {
      raw += cluster.raw;
      for (const pos of cluster.positions) positions.push(pos);
    }
    const bell = clusters.length ? maxBell(board) : { value: 0, at: null };
    const goldLevel = bestGolden(positions, ctx.golden);
    const gold = goldenMult(goldLevel);
    const bellOrMeter = Math.max(ctx.meter, bell.value || 1);
    const applied = Math.min(15, gold > 1 ? bellOrMeter * gold : bellOrMeter);
    let award = 0;
    if (raw > 0) {
      award = scaleTo(raw * applied, MAX_WIN_H - total);
      if (award > 0) {
        if (bell.value > 1) {
          round.push({ type: "multiplierLand", value: bell.value, reel: bell.at.reel, row: bell.at.row });
        }
        if (applied > 1) round.push({ type: "multiplierApply", multiplier: applied, bell: bell.value || null, golden: gold });
        let left = award;
        const packedWins = clusters.map((cluster, index) => {
          const share = index === clusters.length - 1
            ? left
            : scaleTo(Math.round((cluster.raw / raw) * award), left);
          left -= share;
          return {
            symbol: cluster.symbol,
            kind: cluster.size,
            win: share,
            positions: cluster.positions,
            meta: { multiplier: applied, winWithoutMult: cluster.raw },
          };
        });
        round.push({ type: "winInfo", totalWin: award, wins: packedWins });
        const marked = markGolden(positions, ctx.golden, ctx.goldCap);
        if (marked.length) round.push({ type: "goldenSet", cells: marked });
        removeCells(board, positions);
        if (bell.at) board[bell.at.reel][bell.at.row] = null;
      }
    }
    const coins = [];
    let sack = null;
    for (let reel = 0; reel < COLS; reel += 1) {
      for (let row = 0; row < ROWS; row += 1) {
        const cell = board[reel][row];
        if (!cell) continue;
        if (cell.id === "K" && !sack) sack = { reel, row };
        if (cell.coin) {
          coins.push({
            reel,
            row,
            symbol: cell.id,
            value: cell.coin,
            golden: ctx.golden[reel][row],
          });
        }
      }
    }
    let collected = 0;
    if (sack && coins.length && total + award < MAX_WIN_H) {
      let coinSum = 0;
      for (const coin of coins) coinSum += coin.value * Math.max(1, goldenMult(ctx.golden[coin.reel][coin.row]));
      collected = scaleTo(coinSum, MAX_WIN_H - total - award);
      if (collected > 0) {
        round.push({ type: "collector", sack, coins, total: collected });
        removeCells(board, [sack, ...coins.map((coin) => ({ reel: coin.reel, row: coin.row }))]);
      }
    }
    const step = award + collected;
    if (step > 0) {
      total += step;
      round.push({ type: "setWin", amount: step, winLevel: winTierName(step) });
      round.push({ type: "setTotalWin", amount: total });
      if (total >= MAX_WIN_H) {
        capped = true;
        total = MAX_WIN_H;
        break;
      }
    }
    const emptied = board.some((col) => col.some((cell) => cell === null));
    if (!emptied || step <= 0) break;
    cascades += 1;
    if (cascades >= cascadeCap) break;
    collapse(board, strips, rng, ctx.tier);
  }
  if (maxScatters >= 3 && total < MAX_WIN_H) {
    const pay = scaleTo(SCATTER_PAY[Math.min(maxScatters, 5)] || 0, MAX_WIN_H - total);
    if (pay > 0) {
      total += pay;
      round.push({ type: "setWin", amount: pay, winLevel: winTierName(pay) });
      round.push({ type: "setTotalWin", amount: total });
    }
  }
  return { total, scatters: maxScatters, capped: capped || total >= MAX_WIN_H };
}

function seedEpicGold(golden) {
  const spots = [[1, 2], [2, 1], [3, 3], [4, 2]];
  for (const [reel, row] of spots) golden[reel][row] = 1;
  return spots.map(([reel, row]) => ({ reel, row, level: 1, mult: 2 }));
}

function fullGoatBoard(tier) {
  const board = [];
  for (let reel = 0; reel < COLS; reel += 1) {
    const col = [];
    for (let row = 0; row < ROWS; row += 1) col.push({ id: "H1" });
    board.push(col);
  }
  return board;
}

function runFeature(round, rng, tierName, totalH, scripted) {
  const tier = BONUS_TIERS[tierName];
  let total = totalH;
  let spinsLeft = tier.spins;
  let played = 0;
  let meter = 1;
  let persist = tier.persist;
  let goldCap = tier.goldCap;
  let upgraded = false;
  const golden = emptyGold();
  if (tier.seeded) {
    round.push({ type: "goldenSet", cells: seedEpicGold(golden) });
  }
  while (spinsLeft > 0 && total < MAX_WIN_H && played < MAX_FREE_SPINS) {
    played += 1;
    spinsLeft -= 1;
    round.push({ type: "updateFreeSpin", amount: played, total: played + spinsLeft, meter });
    if (!persist) {
      for (let reel = 0; reel < COLS; reel += 1) golden[reel].fill(0);
    }
    if (tierName === "hidden" && !upgraded && played === tier.upgradeAt) {
      upgraded = true;
      persist = true;
      goldCap = 3;
      const added = Math.min(tier.extra, MAX_FREE_SPINS - (played + spinsLeft));
      spinsLeft += added;
      round.push({ type: "bonusReveal", from: "normal", to: "hidden", added });
    }
    let board;
    if (scripted && played > 2) board = fullGoatBoard(tierName);
    else if (scripted) board = drawBoard(FREE_STRIPS, rng, tierName);
    else board = drawBoard(FREE_STRIPS, rng, tierName);
    const before = total;
    const settled = resolveSpin(round, board, FREE_STRIPS, rng, {
      gameType: "freegame",
      tier: tierName,
      golden,
      goldCap,
      meter,
    }, total);
    total = settled.total;
    if (!scripted && settled.total > before) {
      const grew = round.events.some((event, index) => index >= round.events.length - 8 && event.type === "multiplierLand");
      if (grew) meter = Math.min(tier.meterCap, meter + 1);
    }
    if (scripted && played > 2 && total < MAX_WIN_H) {
      const rest = MAX_WIN_H - total;
      total = MAX_WIN_H;
      round.push({ type: "setWin", amount: rest, winLevel: "legendary" });
      round.push({ type: "setTotalWin", amount: total });
      round.push({ type: "wincap", amount: MAX_WIN_H });
      break;
    }
    if (settled.capped) {
      round.push({ type: "wincap", amount: MAX_WIN_H });
      total = MAX_WIN_H;
      break;
    }
    if (settled.scatters >= 3 && played + spinsLeft < MAX_FREE_SPINS) {
      const added = Math.min(2, MAX_FREE_SPINS - (played + spinsLeft));
      if (added > 0) {
        spinsLeft += added;
        round.push({ type: "freeSpinRetrigger", added, totalFs: played + spinsLeft });
      }
    }
  }
  round.push({ type: "freeSpinEnd", amount: total, winLevel: winTierName(total) });
  return total;
}

function finish(round, totalH) {
  const amount = Math.min(totalH, MAX_WIN_H);
  round.push({ type: "finalWin", amount, winLevel: winTierName(amount) });
  if (amount % PAY_STEP !== 0) throw new Error(`Payout ${amount} is not a multiple of ${PAY_STEP}`);
  return { payoutMultiplier: amount, events: round.events };
}

function pushTrigger(round, tier, positions) {
  const spec = BONUS_TIERS[tier];
  round.push({
    type: "freeSpinTrigger",
    totalFs: spec.spins,
    positions,
    bonusTier: tier,
  });
}

function playSpin(strips, rng) {
  const round = createRound();
  const board = drawBoard(strips, rng, "base");
  const golden = emptyGold();
  const settled = resolveSpin(round, board, strips, rng, {
    gameType: "basegame",
    tier: "base",
    golden,
    goldCap: 1,
    meter: 1,
  }, 0);
  let total = settled.total;
  if (settled.scatters >= 3 && total < MAX_WIN_H) {
    const tier = bonusTier(settled.scatters, rng);
    pushTrigger(round, tier, []);
    total = runFeature(round, rng, tier, total, false);
  }
  return finish(round, total);
}

export function playBase(rng) {
  return playSpin(BASE_STRIPS, rng);
}

export function playAnte(rng) {
  return playSpin(ANTE_STRIPS, rng);
}

function playBought(tier, rng) {
  const round = createRound();
  const rolled = tier === "normal" && rng() < 0.08 ? "hidden" : tier;
  pushTrigger(round, rolled, []);
  const total = runFeature(round, rng, rolled, 0, false);
  return finish(round, total);
}

export function playBonus(rng) {
  return playBought("normal", rng);
}

export function playSuper(rng) {
  return playBought("super", rng);
}

export function playEpic(rng) {
  return playBought("epic", rng);
}

export function playCap(mode) {
  const round = createRound();
  const rng = mulberry32(900000 + (mode.length * 17));
  const tier = mode === "epic" ? "epic" : mode === "super" ? "super" : "normal";
  if (mode === "base" || mode === "ante") {
    const board = drawBoard(BASE_STRIPS, rng, "base");
    let planted = 0;
    for (let reel = 0; reel < COLS && planted < 3; reel += 1) {
      board[reel][0] = { id: "S" };
      planted += 1;
    }
    const settled = resolveSpin(round, board, BASE_STRIPS, rng, {
      gameType: "basegame",
      tier: "base",
      golden: emptyGold(),
      goldCap: 1,
      meter: 1,
    }, 0);
    pushTrigger(round, "normal", []);
    const total = runFeature(round, rng, "normal", settled.total, true);
    return finish(round, total);
  }
  pushTrigger(round, tier, []);
  const total = runFeature(round, rng, tier, 0, true);
  return finish(round, total);
}

export function playMode(mode, rng) {
  if (mode === "base") return playBase(rng);
  if (mode === "ante") return playAnte(rng);
  if (mode === "bonus") return playBonus(rng);
  if (mode === "super") return playSuper(rng);
  if (mode === "epic") return playEpic(rng);
  throw new Error(`Unknown mode ${mode}`);
}
