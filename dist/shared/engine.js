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
export const MAX_FREE_SPINS = 14;
export const BLOOM_MAX = 3;
export const LANTERN_SPINS = 8;

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
export const BASE_STRIPS = BASE_FREQ.map((freq) => stripFromFreq(freq, stripRng));
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

function settleSpin(round, cols, stops, gameType, bloom, totalH) {
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
  if (wins.length > 0 && spinH > 0) {
    round.push({ type: "winInfo", totalWin: spinH, wins });
    round.push({ type: "setWin", amount: spinH, winLevel: winLevel(spinH) });
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

function runFeature(round, rng, startSpins, startTotal, scripted) {
  let totalH = startTotal;
  let bloom = 1;
  let spinsLeft = startSpins;
  let played = 0;
  let capped = false;
  let guard = 0;
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
    const settled = settleSpin(round, drawn.cols, drawn.stops, "freegame", bloom, totalH);
    totalH = settled.totalH;
    capped = settled.capped;
    if (settled.spinH > 0 && bloom < BLOOM_MAX) bloom += 1;
    spinsLeft -= 1;
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

export function playBase(rng) {
  const round = createRound();
  const drawn = drawBoard(BASE_STRIPS, rng);
  const settled = settleSpin(round, drawn.cols, drawn.stops, "basegame", 1, 0);
  let totalH = settled.totalH;
  if (settled.scatterCount >= 3 && totalH < MAX_WIN_H) {
    const spins = FS_FOR_SCATTERS[Math.min(settled.scatterCount, 5)];
    round.push({
      type: "freeSpinTrigger",
      totalFs: spins,
      positions: settled.scatterPos,
    });
    totalH = runFeature(round, rng, spins, totalH, null);
  }
  return finish(round, totalH);
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
  if (mode === "lantern") {
    round.push({
      type: "freeSpinTrigger",
      totalFs: LANTERN_SPINS,
      positions: [],
      mode: "lantern",
    });
    const totalH = runFeature(round, rng, LANTERN_SPINS, 0, variant + 3);
    return finish(round, totalH);
  }
  throw new Error(`Unknown mode ${mode}`);
}

export function playMode(mode, rng) {
  if (mode === "base") return playBase(rng);
  if (mode === "lantern") return playLantern(rng);
  throw new Error(`Unknown mode ${mode}`);
}

export { mulberry32 };
