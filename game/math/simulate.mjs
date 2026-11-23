import { createWriteStream } from "node:fs";
import { mkdir, writeFile, rm, stat } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  GAME_ID,
  GAME_NAME,
  MAX_WIN_H,
  ANTE_COST,
  MAX_WIN_X,
  PAYTABLE,
  PAY_STEP,
  SCATTER_PAY,
  TARGET_RTP,
  mulberry32,
  playCap,
  playMode,
} from "../shared/engine.js";
import { analyzeMode, allPassed, betTemplate, dashboardChecks } from "../shared/metrics.js";
import { optimizeWeights } from "../shared/optimize.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const publishDir = path.join(root, "publish");
const mockDir = path.join(root, "game", "mock");
const SIMS = Number(process.env.SIMS || 100000);
const CAPS = 8;

function assertPayout(h, where) {
  if (!Number.isInteger(h) || h < 0) throw new Error(`bad payout ${h} at ${where}`);
  if (h > 0 && (h < 10 || h % PAY_STEP !== 0)) {
    throw new Error(`payout ${h} is not a 0.1× step at ${where}`);
  }
  if (h > MAX_WIN_H) throw new Error(`payout ${h} exceeds cap at ${where}`);
}

function finalAmount(book) {
  const last = [...book.events].reverse().find((event) => event.type === "finalWin");
  if (!last || last.amount !== book.payoutMultiplier) {
    throw new Error(`finalWin mismatch id ${book.id}`);
  }
}

function classify(book) {
  const x = book.payoutMultiplier / 100;
  const feature = book.events.some((event) => event.type === "freeSpinTrigger");
  if (book.payoutMultiplier === MAX_WIN_H) return "max";
  if (x === 0) return "loss";
  if (feature && x < MAX_WIN_X) return "feature";
  if (x >= 15) return "big";
  if (x > 0) return "small";
  return "other";
}

function streamBooks(mode, count) {
  return new Promise((resolve, reject) => {
    const jsonlPath = path.join(publishDir, `books_${mode}.jsonl`);
    const stream = createWriteStream(jsonlPath);
    const payouts = new Uint32Array(count);
    const scenarios = {};
    const pool = [];
    const rng = mulberry32(mode === "base" ? 424242 : 525252);
    let index = 0;

    const writeNext = () => {
      while (index < count) {
        const id = index + 1;
        const book = index < CAPS ? playCap(mode, index) : playMode(mode, rng);
        book.id = id;
        assertPayout(book.payoutMultiplier, `${mode}:${id}`);
        finalAmount(book);
        payouts[index] = book.payoutMultiplier;
        const kind = classify(book);
        if (!scenarios[kind]) scenarios[kind] = book;
        if (!scenarios.tumble && book.events.some((event) => event.type === "tumbleBoard")) scenarios.tumble = book;
        if (!scenarios.collector && book.events.some((event) => event.type === "collector")) scenarios.collector = book;
        if (!scenarios.golden && book.events.some((event) => event.type === "goldenSet")) scenarios.golden = book;
        if (!scenarios.bell && book.events.some((event) => event.type === "multiplierLand")) scenarios.bell = book;
        if (pool.length < 80) pool.push(book);
        else if (rng() < 80 / (index + 1)) pool[Math.floor(rng() * pool.length)] = book;
        const line = `${JSON.stringify(book)}\n`;
        index += 1;
        if (index % 20000 === 0) console.log(`  ${mode} ${index}/${count}`);
        if (!stream.write(line)) {
          stream.once("drain", writeNext);
          return;
        }
      }
      stream.end(() => resolve({ payouts, scenarios, pool, jsonlPath }));
    };

    stream.on("error", reject);
    writeNext();
  });
}

function compress(jsonlPath, zstPath) {
  return new Promise((resolve, reject) => {
    const child = spawn("zstd", ["-12", "-f", "-q", jsonlPath, "-o", zstPath], { stdio: "inherit" });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`zstd exited ${code}`));
    });
  });
}

function writeLookup(file, payouts, weights) {
  const lines = new Array(payouts.length);
  for (let i = 0; i < payouts.length; i += 1) {
    lines[i] = `${i + 1},${weights[i]},${payouts[i]}`;
  }
  return writeFile(file, `${lines.join("\n")}\n`);
}

function roundReport(mode, cost, row, replay) {
  const normEtl40 = row.etl40 / cost;
  const normEtl10k = row.etl10k / cost;
  const sumEtl = normEtl40 + normEtl10k;
  const sumEtlAbs = row.etl40 + row.etl10k;
  const view = {
    ...row,
    normEtl40,
    normEtl10k,
    sumEtl,
    sumEtlAbs,
    cvarNorm: row.cvar / cost,
    cvarAbs: row.cvar,
  };
  const checks = dashboardChecks({
    ...row,
    etl40: normEtl40,
    etl10k: normEtl10k,
    tailCombined: sumEtl,
    tailCombinedBaseBets: sumEtlAbs,
    cvar: row.cvar / cost,
  });
  return { mode, cost, replay, checks, pass: allPassed(checks), view };
}

async function buildMode(mode, cost) {
  console.log(`simulating ${mode} x ${SIMS}`);
  const { payouts, scenarios, pool, jsonlPath } = await streamBooks(mode, SIMS);
  console.log(`optimizing ${mode} at cost ${cost}`);
  const optimized = optimizeWeights(payouts, cost);
  let usedCost = cost;
  let row = optimized.row;
  if ((mode === "bonus" || mode === "super" || mode === "epic") && (row.rtp < 0.9605 || row.rtp > 0.9665)) {
    usedCost = chooseCost(row.meanX);
    row = analyzeMode(payouts, optimized.weights, usedCost);
    console.log(`retarget ${mode} cost ${usedCost} rtp ${(row.rtp * 100).toFixed(3)}%`);
  }
  const lookupName = `lookup_${mode}.csv`;
  const eventsName = `books_${mode}.jsonl.zst`;
  await writeLookup(path.join(publishDir, lookupName), payouts, optimized.weights);
  const zstPath = path.join(publishDir, eventsName);
  await compress(jsonlPath, zstPath);
  await rm(jsonlPath);
  const replay = {
    loss: scenarios.loss?.id ?? null,
    small: scenarios.small?.id ?? null,
    big: scenarios.big?.id ?? null,
    feature: scenarios.feature?.id ?? null,
    max: scenarios.max?.id ?? null,
    tumble: scenarios.tumble?.id ?? null,
    collector: scenarios.collector?.id ?? null,
    golden: scenarios.golden?.id ?? null,
    bell: scenarios.bell?.id ?? null,
  };
  const kept = [];
  for (const book of Object.values(scenarios)) {
    if (book) kept.push(book);
  }
  for (const book of pool) {
    if (!kept.some((item) => item.id === book.id)) kept.push(book);
  }
  return {
    report: roundReport(mode, usedCost, row, replay),
    modeEntry: { name: mode, cost: usedCost, events: eventsName, weights: lookupName },
    mockBooks: kept.map((book) => ({
      ...book,
      weight: optimized.weights[book.id - 1],
    })),
    zstPath,
  };
}

function sampleMean(mode) {
  const rng = mulberry32(99 + mode.length);
  let sum = 0;
  const n = 2500;
  for (let i = 0; i < n; i += 1) sum += playMode(mode, rng).payoutMultiplier;
  return sum / n / 100;
}

function chooseCost(mean) {
  const tenth = Math.round((mean / TARGET_RTP) * 10) / 10;
  const rtp = mean / tenth;
  if (rtp >= 0.961 && rtp <= 0.966) return tenth;
  return Math.round((mean / TARGET_RTP) * 100) / 100;
}

async function main() {
  await mkdir(publishDir, { recursive: true });
  await mkdir(mockDir, { recursive: true });
  const bonusMean = sampleMean("bonus");
  const superMean = sampleMean("super");
  const epicMean = sampleMean("epic");
  const bonusCost = chooseCost(bonusMean);
  const superCost = chooseCost(superMean);
  const epicCost = chooseCost(epicMean);
  console.log(`bonus mean ${bonusMean.toFixed(2)} cost ${bonusCost}; super mean ${superMean.toFixed(2)} cost ${superCost}; epic mean ${epicMean.toFixed(2)} cost ${epicCost}`);
  const built = [];
  for (const [name, cost] of [["base", 1], ["ante", ANTE_COST], ["bonus", bonusCost], ["super", superCost], ["epic", epicCost]]) {
    built.push(await buildMode(name, cost));
  }
  const modes = built;
  const index = { modes: modes.map((mode) => mode.modeEntry) };
  await writeFile(path.join(publishDir, "index.json"), `${JSON.stringify(index, null, 2)}\n`);

  const topWin = Math.max(...modes.map((mode) => mode.report.view.topWinX));
  const maxCost = Math.max(...modes.map((mode) => mode.report.cost));
  const template = betTemplate(topWin, maxCost);
  const exposureAtMaxBet = (topWin * template.maxBetUsd);
  const roundCostAtMaxBet = maxCost * template.maxBetUsd;

  const mathConfig = {
    gameId: GAME_ID,
    gameName: GAME_NAME,
    maxWinX: MAX_WIN_X,
    paytable: PAYTABLE,
    scatterPay: SCATTER_PAY,
    modes: Object.fromEntries([
      ...modes.map((mode) => [mode.modeEntry.name, {
        cost: mode.report.cost,
        rtp: Number(mode.report.view.rtp.toFixed(6)),
        hitRate: Number(mode.report.view.hitRate.toFixed(6)),
        topWinX: mode.report.view.topWinX,
        volatility: Number(mode.report.view.volatility.toFixed(4)),
      }]),
    ]),
  };
  await writeFile(
    path.join(root, "game", "src", "math-config.js"),
    `export const MATH = ${JSON.stringify(mathConfig, null, 2)};\n`,
  );

  const modeReports = [];
  for (const mode of modes) {
    modeReports.push({
      ...mode.report,
      checks: mode.report.checks,
      bytes: (await stat(mode.zstPath)).size,
    });
  }
  const report = {
    generatedAt: new Date().toISOString(),
    sims: SIMS,
    template,
    exposureAtMaxBetUsd: exposureAtMaxBet,
    roundCostAtMaxBetUsd: roundCostAtMaxBet,
    roundCostLimitUsd: 500000,
    modes: modeReports,
  };
  await writeFile(path.join(publishDir, "MATH_REPORT.json"), `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(
    path.join(mockDir, "pack.json"),
    JSON.stringify({
      modes: Object.fromEntries(modes.map((mode) => [mode.modeEntry.name, {
        cost: mode.report.cost,
        books: mode.mockBooks,
      }])),
    }),
  );

  let failed = false;
  for (const mode of modes) {
    const view = mode.report.view;
    console.log(
      `${mode.modeEntry.name} cost ${mode.report.cost} rtp ${(view.rtp * 100).toFixed(3)}% hit ${(view.hitRate * 100).toFixed(2)}% top ${view.topWinX} std ${view.volatility.toFixed(2)} etl40 ${(view.etl40 / mode.report.cost).toFixed(4)} cvar ${(view.cvar / mode.report.cost).toFixed(1)}`,
    );
    const bad = mode.report.checks.filter((check) => !check.pass);
    if (bad.length) {
      failed = true;
      console.error(mode.modeEntry.name, bad);
    }
  }
  if (roundCostAtMaxBet > 500000) {
    failed = true;
    console.error("round cost at max bet exceeds $500,000");
  }
  if (failed) process.exit(1);
  console.log(`template ${template.id}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
