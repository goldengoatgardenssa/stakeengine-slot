/**
 * Copperbell Orchard — deterministic line game.
 * Books are the source of truth. Payouts are integer hundredths of the
 * base stake (100 = 1×) and are always multiples of 10.
 */

export const GAME_ID = "copperbell-orchard";
export const GAME_NAME = "Copperbell Orchard";
export const REELS = 5;
export const ROWS = 3;
export const MAX_WIN_X = 5000;
export const MAX_WIN_H = 500000;
export const PAY_STEP = 10;
export const TARGET_RTP = 0.964;

export const SYMBOLS = ["W", "S", "H1", "H2", "H3", "H4", "L1", "L2", "L3", "L4"];

export const SYMBOL_META = {
  W: { name: "Copperbell Goat", kind: "wild" },
  S: { name: "Orchard Lantern", kind: "scatter" },
  H1: { name: "Honey Hive", kind: "high" },
  H2: { name: "Copper Can", kind: "high" },
  H3: { name: "Seed Pouch", kind: "high" },
  H4: { name: "Berry Crock", kind: "high" },
  L1: { name: "Fern Frond", kind: "low" },
  L2: { name: "Acorn", kind: "low" },
  L3: { name: "Toadstool", kind: "low" },
  L4: { name: "Thistle", kind: "low" },
};

/** Line pays in hundredths of the base stake. Multiples of 10. Index by count. */
export const PAYTABLE = {
  W: { 3: 400, 4: 1600, 5: 6000 },
  H1: { 3: 200, 4: 800, 5: 3000 },
  H2: { 3: 120, 4: 400, 5: 1600 },
  H3: { 3: 80, 4: 240, 5: 800 },
  H4: { 3: 60, 4: 160, 5: 500 },
  L1: { 3: 40, 4: 100, 5: 240 },
  L2: { 3: 30, 4: 80, 5: 200 },
  L3: { 3: 20, 4: 60, 5: 160 },
  L4: { 3: 20, 4: 40, 5: 120 },
};

export const SCATTER_PAY = { 3: 200, 4: 800, 5: 2000 };
export const FS_FOR_SCATTERS = { 3: 8, 4: 10, 5: 12 };
export const RETRIGGER_SPINS = 3;
export const MAX_FREE_SPINS = 18;
export const BLOOM_MAX = 3;
export const LANTERN_SPINS = 8;
export const ANTE_COST = 1.25;
export const BONUS_TIERS = {
  normal: { spins: 8, bloomMax: 3 },
  super: { spins: 10, bloomMax: 4 },
  hidden: { spins: 12, bloomMax: 4 },
  epic: { spins: 14, bloomMax: 5 },
};

export function bonusTier(scatterCount, rng) {
  if (scatterCount >= 5) return "epic";
  if (scatterCount === 4) return "super";
  if (rng && rng() < 0.08) return "hidden";
  return "normal";
}

/** Twenty left-to-right lines. Row 0 is the top. */
export const PAYLINES = [
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0],
  [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0],
  [2, 1, 0, 1, 2],
  [0, 0, 1, 2, 2],
  [2, 2, 1, 0, 0],
  [1, 0, 0, 0, 1],
  [1, 2, 2, 2, 1],
  [0, 1, 1, 1, 0],
  [2, 1, 1, 1, 2],
  [0, 1, 0, 1, 0],
  [2, 1, 2, 1, 2],
  [1, 0, 1, 2, 1],
  [1, 2, 1, 0, 1],
  [1, 1, 0, 1, 1],
  [1, 1, 2, 1, 1],
  [0, 1, 2, 2, 1],
  [2, 1, 0, 0, 1],
  [0, 2, 1, 2, 0],
];

const BASE_FREQ = [
  { L4: 8, L3: 7, L2: 6, L1: 5, H4: 4, H3: 3, H2: 2, H1: 2, W: 1, S: 2 },
  { L4: 8, L3: 7, L2: 6, L1: 5, H4: 4, H3: 3, H2: 2, H1: 2, W: 2, S: 2 },
  { L4: 7, L3: 7, L2: 6, L1: 5, H4: 4, H3: 3, H2: 3, H1: 2, W: 2, S: 2 },
  { L4: 8, L3: 7, L2: 6, L1: 5, H4: 4, H3: 3, H2: 2, H1: 2, W: 2, S: 2 },
  { L4: 8, L3: 7, L2: 6, L1: 5, H4: 4, H3: 3, H2: 2, H1: 2, W: 1, S: 2 },
];

const FREE_FREQ = { L4: 6, L3: 5, L2: 5, L1: 4, H4: 4, H3: 4, H2: 3, H1: 3, W: 2, S: 1 };

function mulberry32(seed) {
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
const ANTE_FREQ = BASE_FREQ.map((freq) => ({ ...freq, S: freq.S + 1 }));
export const BASE_STRIPS = BASE_FREQ.map((freq) => stripFromFreq(freq, stripRng));
export const ANTE_STRIPS = ANTE_FREQ.map((freq) => stripFromFreq(freq, stripRng));
export const FREE_STRIPS = [0, 1, 2, 3, 4].map(() => stripFromFreq(FREE_FREQ, stripRng));
export const FREE_JACKPOT_STOP = FREE_STRIPS[0].length;
for (const strip of FREE_STRIPS) {
  strip.push("H1", "H1", "H1");
}

function symObj(name) {
  if (name === "S") return { name, scatter: true };
  return { name };
}

function boardJson(cols) {
  return cols.map((col) => col.map((name) => symObj(name)));
}

function anticipationFor(cols) {
  const flags = [0, 0, 0, 0, 0];
  let seen = 0;
  for (let reel = 0; reel < REELS; reel += 1) {
    flags[reel] = seen >= 2 ? seen : 0;
    for (let row = 0; row < ROWS; row += 1) {
      if (cols[reel][row] === "S") seen += 1;
    }
  }
  return flags;
}

function drawBoard(strips, rng) {
  const cols = [];
  const stops = [];
  for (let reel = 0; reel < REELS; reel += 1) {
    const strip = strips[reel];
    const stop = Math.floor(rng() * strip.length);
    stops.push(stop);
    const col = [];
    for (let row = 0; row < ROWS; row += 1) col.push(strip[(stop + row) % strip.length]);
    cols.push(col);
  }
  return { cols, stops };
}

function evalLine(symbols) {
  if (symbols[0] === "S") return null;
  let wildCount = 0;
  while (wildCount < symbols.length && symbols[wildCount] === "W") wildCount += 1;
  let firstRegular = null;
  for (const sym of symbols) {
    if (sym !== "W" && sym !== "S") {
      firstRegular = sym;
      break;
    }
  }
  let best = null;
  if (wildCount >= 3) {
    best = { symbol: "W", kind: wildCount, win: PAYTABLE.W[wildCount] };
  }
  if (firstRegular) {
    let kind = 0;
    for (let i = 0; i < symbols.length; i += 1) {
      const sym = symbols[i];
      if (sym === firstRegular || sym === "W") kind += 1;
      else break;
    }
    if (kind >= 3) {
      const win = PAYTABLE[firstRegular][kind];
      if (!best || win > best.win) best = { symbol: firstRegular, kind, win };
    }
  }
  return best;
}

export function evaluateBoard(cols) {
  const wins = [];
  for (let lineIndex = 0; lineIndex < PAYLINES.length; lineIndex += 1) {
    const line = PAYLINES[lineIndex];
    const symbols = line.map((row, reel) => cols[reel][row]);
    const result = evalLine(symbols);
    if (!result) continue;
    const positions = [];
    for (let step = 0; step < result.kind; step += 1) {
      positions.push({ reel: step, row: line[step] });
    }
    wins.push({
      symbol: result.symbol,
      kind: result.kind,
      win: result.win,
      positions,
      meta: {
        lineIndex,
        multiplier: 1,
        winWithoutMult: result.win,
        globalMult: 1,
        lineMultiplier: 1,
      },
    });
  }
  const scatterPos = [];
  for (let reel = 0; reel < REELS; reel += 1) {
    for (let row = 0; row < ROWS; row += 1) {
      if (cols[reel][row] === "S") scatterPos.push({ reel, row });
    }
  }
  const scatterCount = scatterPos.length;
  if (scatterCount >= 3) {
    const pay = SCATTER_PAY[Math.min(scatterCount, 5)];
    wins.push({
      symbol: "S",
      kind: scatterCount,
      win: pay,
      positions: scatterPos,
      meta: {
        lineIndex: -1,
        multiplier: 1,
        winWithoutMult: pay,
        globalMult: 1,
        lineMultiplier: 1,
      },
    });
  }
  return { wins, scatterCount, scatterPos };
}

function applyBloom(wins, bloom) {
  return wins.map((win) => {
    const base = win.meta.winWithoutMult;
    const amount = base * bloom;
    return {
      ...win,
      win: amount,
      meta: {
        ...win.meta,
        multiplier: bloom,
        globalMult: bloom,
        lineMultiplier: bloom,
        winWithoutMult: base,
      },
    };
  });
}

function sumWins(wins) {
  let total = 0;
  for (const win of wins) total += win.win;
  return total;
}

function scaleWinsTo(wins, awarded) {
  const raw = sumWins(wins);
  if (raw === awarded) return wins;
  if (awarded <= 0 || raw <= 0) {
    return wins.map((win) => ({ ...win, win: 0 }));
  }
  let left = awarded;
  return wins.map((win, index) => {
    if (index === wins.length - 1) return { ...win, win: left };
    const share = Math.floor((win.win / raw) * awarded / PAY_STEP) * PAY_STEP;
    const safe = Math.max(0, Math.min(share, left));
    left -= safe;
    return { ...win, win: safe };
  });
}

export function winLevel(hundredths) {
  const x = hundredths / 100;
  if (x >= MAX_WIN_X) return 10;
  if (x >= 100) return 6;
  if (x >= 40) return 5;
  if (x >= 15) return 4;
  if (x >= 5) return 3;
  if (x > 0) return 2;
  return 1;
}

function revealEvent(cols, stops, gameType) {
  return {
    type: "reveal",
    board: boardJson(cols),
    paddingPositions: stops,
    gameType,
    anticipation: anticipationFor(cols),
  };
}

function createRound() {
  const events = [];
  const push = (event) => {
    events.push({ index: events.length, ...event });
  };
  return { events, push };
}

/** Face values are the exact one-spin multiplier. High faces stay rare so the tail rules hold. */
const ORB_WEIGHTS = {
  base: [[2, 72], [3, 22], [5, 6]],
  normal: [[2, 62], [3, 26], [5, 9], [10, 3]],
  super: [[2, 56], [3, 26], [5, 13], [10, 5]],
  hidden: [[2, 44], [3, 26], [5, 16], [10, 9], [25, 4], [50, 1]],
  epic: [[3, 36], [5, 28], [10, 18], [25, 11], [50, 5], [100, 2]],
};

const ORB_CHANCE = { base: 0.03, normal: 0.08, super: 0.08, hidden: 0.1, epic: 0.14 };
const STICKY_CAP = { normal: 0, super: 1, hidden: 2, epic: 3 };
const STICKY_LIFE = { super: 1, hidden: 2, epic: 3 };
const STICKY_LOCK = { super: 0.07, hidden: 0.2, epic: 0.45 };
const WILD_MULT = { normal: 1, super: 2, hidden: 2, epic: 3 };

function toneOrb(orb, rawHundredths) {
  if (!orb) return null;
  if (orb >= 100 && rawHundredths > 150) return 10;
  if (orb >= 50 && rawHundredths > 250) return 10;
  if (orb >= 25 && rawHundredths > 500) return 5;
  if (orb >= 10 && rawHundredths > 900) return 5;
  return orb;
}

function rollOrb(tier, rng) {
  const chance = ORB_CHANCE[tier] || 0;
  if (!rng || rng() > chance) return null;
  const table = ORB_WEIGHTS[tier] || ORB_WEIGHTS.normal;
  const total = table.reduce((sum, pair) => sum + pair[1], 0);
  let roll = rng() * total;
  for (const [value, weight] of table) {
    roll -= weight;
    if (roll <= 0) return value;
  }
  return table[0][0];
}

function rollCell(rng) {
  return { reel: Math.floor(rng() * REELS), row: Math.floor(rng() * ROWS) };
}

function settleSpin(round, cols, stops, gameType, bloom, totalH, fx = {}) {
  const evaluated = evaluateBoard(cols);
  let wins = applyBloom(evaluated.wins, bloom);
  let spinH = sumWins(wins);
  let capped = false;
  if (totalH >= MAX_WIN_H) {
    spinH = 0;
    wins = scaleWinsTo(wins, 0);
    capped = true;
  } else if (totalH + spinH >= MAX_WIN_H) {
    spinH = MAX_WIN_H - totalH;
    wins = scaleWinsTo(wins, spinH);
    capped = true;
  }
  round.push(revealEvent(cols, stops, gameType));
  if (fx.expand?.length) round.push({ type: "wildExpand", reels: fx.expand, wildMult: fx.wildMult || 1 });
  if (fx.sticky?.length) round.push({ type: "wildSticky", positions: fx.sticky, wildMult: fx.wildMult || 1 });
  if (fx.orb) {
    round.push({ type: "multiplierLand", value: fx.orb, reel: fx.reel ?? 2, row: fx.row ?? 1 });
  }
  if (wins.length > 0 && spinH > 0) {
    round.push({ type: "winInfo", totalWin: spinH, wins });
    round.push({ type: "setWin", amount: spinH, winLevel: winLevel(spinH) });
    if (bloom > 1) round.push({ type: "multiplierApply", multiplier: bloom, orb: fx.orb || null });
  }
  const nextTotal = totalH + spinH;
  round.push({ type: "setTotalWin", amount: nextTotal });
  return {
    totalH: nextTotal,
    spinH,
    capped,
    scatterCount: evaluated.scatterCount,
    scatterPos: evaluated.scatterPos,
    bloom,
  };
}

function jackpotDraw() {
  const cols = [];
  const stops = [];
  for (let reel = 0; reel < REELS; reel += 1) {
    stops.push(FREE_JACKPOT_STOP);
    cols.push(["H1", "H1", "H1"]);
  }
  return { cols, stops };
}

function findBoard(strips, seed, predicate, attempts = 40000) {
  const rng = mulberry32(seed);
  for (let i = 0; i < attempts; i += 1) {
    const drawn = drawBoard(strips, rng);
    const evaluated = evaluateBoard(drawn.cols);
    const raw = sumWins(evaluated.wins);
    if (predicate(evaluated, raw, drawn)) return { ...drawn, raw, evaluated };
  }
  return null;
}

let smallBoards = null;
function getSmallBoards() {
  if (smallBoards) return smallBoards;
  smallBoards = [];
  for (let n = 0; n < 6; n += 1) {
    const found = findBoard(
      FREE_STRIPS,
      8800 + n * 97,
      (evaluated, raw) => evaluated.scatterCount === 0 && raw >= 20 && raw <= 120,
    );
    if (!found) throw new Error("Could not find a small free-spin board");
    smallBoards.push(found);
  }
  return smallBoards;
}

let triggerBoards = null;
function getTriggerBoards() {
  if (triggerBoards) return triggerBoards;
  triggerBoards = [];
  for (let n = 0; n < 12; n += 1) {
    const found = findBoard(
      BASE_STRIPS,
      44000 + n * 131,
      (evaluated, raw) => evaluated.scatterCount === 3 && raw <= 800,
    );
    if (!found) throw new Error("Could not find a 3-scatter trigger board");
    triggerBoards.push(found);
  }
  return triggerBoards;
}

function runFeature(round, rng, startSpins, startTotal, scripted, bloomMax = BLOOM_MAX, tier = "normal") {
  let totalH = startTotal;
  let bloom = 1;
  let spinsLeft = startSpins;
  let played = 0;
  let capped = false;
  let guard = 0;
  const sticky = [];
  while (spinsLeft > 0 && !capped && guard < MAX_FREE_SPINS + 2) {
    guard += 1;
    played += 1;
    round.push({ type: "updateFreeSpin", amount: played, total: played + spinsLeft - 1 });
    round.push({ type: "updateGlobalMult", globalMult: bloom });
    let drawn;
    if (scripted) {
      drawn = played <= 2 ? getSmallBoards()[(scripted + played) % 6] : jackpotDraw();
    } else {
      drawn = drawBoard(FREE_STRIPS, rng);
    }
    const natural = drawn.cols.map((column) => column.slice());
    const cols = natural.map((column) => column.slice());
    const cap = STICKY_CAP[tier] || 0;
    if (!scripted && cap > 0) {
      for (const pos of sticky) cols[pos.reel][pos.row] = "W";
    }
    const expanded = [];
    if (!scripted && (tier === "hidden" || tier === "epic")) {
      const odds = tier === "epic" ? 0.36 : 0.18;
      for (let reel = 0; reel < REELS; reel += 1) {
        if (natural[reel].includes("W") && rng() < odds) {
          cols[reel] = ["W", "W", "W"];
          expanded.push(reel);
          break;
        }
      }
    }
    const rawSpin = sumWins(evaluateBoard(cols).wins);
    const orb = scripted ? null : toneOrb(rollOrb(tier, rng), rawSpin);
    const spot = scripted ? { reel: 2, row: 1 } : rollCell(rng);
    const wildMult = !orb && bloom === 1 && (expanded.length || sticky.length) ? WILD_MULT[tier] || 1 : 1;
    const applied = orb || Math.max(bloom, wildMult);
    const settled = settleSpin(round, cols, drawn.stops, "freegame", applied, totalH, {
      expand: expanded,
      sticky: sticky.map((pos) => ({ reel: pos.reel, row: pos.row })),
      orb,
      reel: spot.reel,
      row: spot.row,
      wildMult,
    });
    totalH = settled.totalH;
    capped = settled.capped;
    if (!scripted && orb && bloom < bloomMax) bloom += 1;
    else if (settled.spinH > 0 && bloom < bloomMax) bloom += 1;
    spinsLeft -= 1;
    if (!scripted) {
      for (const pos of sticky) pos.life -= 1;
      for (let i = sticky.length - 1; i >= 0; i -= 1) {
        if (sticky[i].life <= 0) sticky.splice(i, 1);
      }
      if (tier === "epic" && sticky.length && rng() < 0.75) {
        const walker = sticky[0];
        const nextReel = Math.min(REELS - 1, walker.reel + 1);
        const blocked = sticky.some((pos, index) => index > 0 && pos.reel === nextReel && pos.row === walker.row);
        if (!blocked) walker.reel = nextReel;
      }
    }
    if (!scripted && cap > 0 && sticky.length < cap && rng() < (STICKY_LOCK[tier] || 0)) {
      const minReel = tier === "super" ? 2 : tier === "hidden" ? 1 : 0;
      for (let reel = REELS - 1; reel >= minReel && sticky.length < cap; reel -= 1) {
        for (let row = 0; row < ROWS && sticky.length < cap; row += 1) {
          if (natural[reel][row] !== "W") continue;
          if (sticky.some((pos) => pos.reel === reel && pos.row === row)) continue;
          sticky.push({ reel, row, life: STICKY_LIFE[tier] || 1 });
          break;
        }
      }
    }
    if (!capped && settled.scatterCount >= 3 && played + spinsLeft < MAX_FREE_SPINS) {
      const added = Math.min(RETRIGGER_SPINS, MAX_FREE_SPINS - (played + spinsLeft));
      if (added > 0) {
        spinsLeft += added;
        round.push({
          type: "freeSpinRetrigger",
          added,
          totalFs: played + spinsLeft,
          positions: settled.scatterPos,
        });
      }
    }
  }
  round.push({
    type: "freeSpinEnd",
    amount: totalH,
    winLevel: winLevel(totalH),
  });
  if (capped || totalH >= MAX_WIN_H) {
    round.push({ type: "wincap", amount: MAX_WIN_H });
    totalH = MAX_WIN_H;
  }
  return totalH;
}

function finish(round, totalH) {
  const amount = Math.min(totalH, MAX_WIN_H);
  round.push({ type: "finalWin", amount });
  if (amount % PAY_STEP !== 0) {
    throw new Error(`Payout ${amount} is not a multiple of ${PAY_STEP}`);
  }
  return { payoutMultiplier: amount, events: round.events };
}

function pushTrigger(round, tier, positions) {
  const spec = BONUS_TIERS[tier];
  if (tier === "hidden") {
    round.push({ type: "bonusReveal", from: "normal", to: "hidden" });
  }
  round.push({
    type: "freeSpinTrigger",
    totalFs: spec.spins,
    positions,
    bonusTier: tier,
  });
}

function playSpin(strips, rng) {
  const round = createRound();
  const drawn = drawBoard(strips, rng);
  const orb = rollOrb("base", rng);
  const spot = rollCell(rng);
  const settled = settleSpin(round, drawn.cols, drawn.stops, "basegame", orb || 1, 0, {
    orb,
    reel: spot.reel,
    row: spot.row,
  });
  let totalH = settled.totalH;
  if (settled.scatterCount >= 3 && totalH < MAX_WIN_H) {
    const tier = bonusTier(settled.scatterCount, rng);
    pushTrigger(round, tier, settled.scatterPos);
    totalH = runFeature(round, rng, BONUS_TIERS[tier].spins, totalH, null, BONUS_TIERS[tier].bloomMax, tier);
  }
  return finish(round, totalH);
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
  const totalH = runFeature(round, rng, BONUS_TIERS[rolled].spins, 0, null, BONUS_TIERS[rolled].bloomMax, rolled);
  return finish(round, totalH);
}

export function playBonus(rng) {
  return playBought("normal", rng);
}

export function playSuper(rng) {
  return playBought("super", rng);
}

export function playLantern(rng) {
  const round = createRound();
  round.push({
    type: "freeSpinTrigger",
    totalFs: LANTERN_SPINS,
    positions: [],
    mode: "lantern",
  });
  const totalH = runFeature(round, rng, LANTERN_SPINS, 0, null);
  return finish(round, totalH);
}

export function playCap(mode, variant) {
  const round = createRound();
  const rng = mulberry32(900000 + variant * 17);
  if (mode === "base") {
    const trigger = getTriggerBoards()[variant % getTriggerBoards().length];
    const settled = settleSpin(round, trigger.cols, trigger.stops, "basegame", 1, 0);
    const spins = FS_FOR_SCATTERS[3];
    round.push({
      type: "freeSpinTrigger",
      totalFs: spins,
      positions: settled.scatterPos,
    });
    const totalH = runFeature(round, rng, spins, settled.totalH, variant + 1);
    return finish(round, totalH);
  }
  if (mode === "lantern" || mode === "bonus" || mode === "super" || mode === "ante") {
    const tier = mode === "super" ? "super" : "normal";
    pushTrigger(round, tier, []);
    const totalH = runFeature(round, rng, BONUS_TIERS[tier].spins, 0, variant + 3, BONUS_TIERS[tier].bloomMax);
    return finish(round, totalH);
  }
  throw new Error(`Unknown mode ${mode}`);
}

export function playMode(mode, rng) {
  if (mode === "base") return playBase(rng);
  if (mode === "ante") return playAnte(rng);
  if (mode === "bonus" || mode === "lantern") return playBonus(rng);
  if (mode === "super") return playSuper(rng);
  throw new Error(`Unknown mode ${mode}`);
}

export { mulberry32 };
