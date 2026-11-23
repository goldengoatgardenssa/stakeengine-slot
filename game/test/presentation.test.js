import assert from "node:assert/strict";
import test from "node:test";
import { createCopy, findRestricted } from "../src/copy.js";
import { formatMoney } from "../src/format.js";
import { playCap, mulberry32, playBase, MAX_WIN_H } from "../shared/engine.js";

test("social copy avoids restricted gambling words", () => {
  const copy = createCopy(true);
  const hits = findRestricted(copy);
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
  for (const mode of ["base", "lantern"]) {
    const book = playCap(mode, 0);
    assert.equal(book.payoutMultiplier, MAX_WIN_H);
    const finalWin = book.events.find((event) => event.type === "finalWin");
    assert.equal(finalWin.amount, MAX_WIN_H);
  }
});

test("base rounds stay on the payout step", () => {
  const rng = mulberry32(7);
  for (let i = 0; i < 200; i += 1) {
    const book = playBase(rng);
    assert.equal(book.payoutMultiplier % 10, 0);
    assert.ok(book.payoutMultiplier <= MAX_WIN_H);
  }
});
