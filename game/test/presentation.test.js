import assert from "node:assert/strict";
import test from "node:test";
import { createCopy, findRestricted } from "../src/copy.js";
import { formatMoney } from "../src/format.js";
import {
  MAX_WIN_H,
  bonusTier,
  findClusters,
  mulberry32,
  playBase,
  playCap,
  playMode,
} from "../shared/engine.js";

test("social copy avoids restricted gambling words", () => {
  const hits = findRestricted(createCopy(true));
  assert.deepEqual(hits, []);
});

test("money formats fiat, yen, and social coins", () => {
  assert.equal(formatMoney(10, "USD"), "$10.00");
  assert.equal(formatMoney(0.001, "USD"), "$0.001");
  assert.equal(formatMoney(10, "JPY"), "¥10");
  assert.equal(formatMoney(10, "XSC"), "10.00 SC");
  assert.equal(formatMoney(10, "XGC"), "10.00 GC");
  assert.equal(formatMoney(10, "EUR").includes("€"), true);
});

test("max win books pay the cap exactly", () => {
  for (const mode of ["base", "ante", "bonus", "super", "epic"]) {
    const book = playCap(mode);
    assert.equal(book.payoutMultiplier, MAX_WIN_H);
    const finalWin = book.events.find((event) => event.type === "finalWin");
    assert.equal(finalWin.amount, MAX_WIN_H);
  }
});

test("a full grid is one cluster", () => {
  const board = Array.from({ length: 6 }, () => Array.from({ length: 5 }, () => ({ id: "L4" })));
  const wins = findClusters(board);
  assert.equal(wins.length, 1);
  assert.equal(wins[0].size, 30);
});

test("base rounds tumble and stay on the payout step", () => {
  const rng = mulberry32(7);
  let tumbled = false;
  for (let i = 0; i < 40; i += 1) {
    const book = playBase(rng);
    assert.equal(book.payoutMultiplier % 10, 0);
    assert.ok(book.payoutMultiplier <= MAX_WIN_H);
    if (book.events.some((event) => event.type === "tumbleBoard")) tumbled = true;
  }
  assert.equal(tumbled, true);
});

test("the loot sack total matches the coins it gathers", () => {
  const rng = mulberry32(11);
  const ladder = [1, 2, 3, 5];
  let seen = false;
  for (let i = 0; i < 80 && !seen; i += 1) {
    const book = playBase(rng);
    const event = book.events.find((item) => item.type === "collector");
    if (!event) continue;
    const sum = event.coins.reduce((total, coin) => total + coin.value * (ladder[coin.golden] || 1), 0);
    assert.equal(event.total, sum);
    seen = true;
  }
  assert.equal(seen, true);
});

test("super heists mark golden cells and can ring a bell", () => {
  let gold = false;
  let bell = false;
  for (let i = 0; i < 12; i += 1) {
    const book = playMode("super", mulberry32(40 + i));
    if (book.events.some((event) => event.type === "goldenSet" && event.cells?.length)) gold = true;
    if (book.events.some((event) => event.type === "multiplierLand")) bell = true;
    assert.ok(book.payoutMultiplier <= MAX_WIN_H);
  }
  assert.equal(gold, true);
  assert.equal(bell, true);
});

test("bonus tiers and bought heists are distinct", () => {
  assert.equal(bonusTier(5, () => 0), "epic");
  assert.equal(bonusTier(4, () => 0), "super");
  assert.equal(bonusTier(3, () => 0.5), "normal");
  assert.equal(bonusTier(3, () => 0.01), "hidden");
  const bonus = playMode("bonus", mulberry32(3));
  const epic = playMode("epic", mulberry32(4));
  assert.equal(bonus.events.some((event) => event.type === "freeSpinTrigger"), true);
  assert.equal(epic.events.some((event) => event.type === "goldenSet"), true);
  assert.equal(bonus.payoutMultiplier % 10, 0);
  assert.equal(epic.payoutMultiplier % 10, 0);
});
