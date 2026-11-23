import assert from "node:assert/strict";
import test from "node:test";
import { createCopy, findRestricted } from "../src/copy.js";
import { formatMoney } from "../src/format.js";
import { playCap, mulberry32, playBase, playMode, bonusTier, MAX_WIN_H } from "../shared/engine.js";

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

test("super books can land a multiplier orb and a sticky wild", () => {
  let orb = false;
  let sticky = false;
  for (let i = 0; i < 40; i += 1) {
    const book = playMode("super", mulberry32(200 + i));
    if (book.events.some((event) => event.type === "multiplierLand")) orb = true;
    if (book.events.some((event) => event.type === "wildSticky" && event.positions?.length)) sticky = true;
    assert.ok(book.payoutMultiplier <= MAX_WIN_H);
  }
  assert.equal(orb, true);
  assert.equal(sticky, true);
});

test("a landed bell multiplier is the multiplier on that win", () => {
  const rng = mulberry32(5);
  let seen = false;
  for (let i = 0; i < 120 && !seen; i += 1) {
    const book = playMode("super", rng);
    for (let n = 0; n < book.events.length; n += 1) {
      const event = book.events[n];
      if (event.type !== "multiplierLand") continue;
      const rest = book.events.slice(n + 1);
      const end = rest.findIndex((item) => item.type === "reveal" || item.type === "freeSpinEnd");
      const window = rest.slice(0, end === -1 ? rest.length : end);
      const apply = window.find((item) => item.type === "multiplierApply");
      if (!apply) continue;
      assert.equal(apply.multiplier, event.value);
      assert.equal(apply.orb, event.value);
      seen = true;
      break;
    }
    assert.equal(book.payoutMultiplier % 10, 0);
  }
  assert.equal(seen, true);
});

test("hidden watches can expand a goat wild", () => {
  let expand = false;
  for (let i = 0; i < 300 && !expand; i += 1) {
    const book = playMode("bonus", mulberry32(800 + i));
    expand = book.events.some((event) => event.type === "wildExpand" && event.reels?.length);
  }
  assert.equal(expand, true);
});

test("bonus tiers and ante mode are distinct", () => {
  assert.equal(bonusTier(5, () => 0), "epic");
  assert.equal(bonusTier(4, () => 0), "super");
  assert.equal(bonusTier(3, () => 0.5), "normal");
  assert.equal(bonusTier(3, () => 0.01), "hidden");
  const ante = playMode("ante", mulberry32(3));
  const bonus = playMode("bonus", mulberry32(4));
  assert.equal(ante.payoutMultiplier % 10, 0);
  assert.ok(bonus.events.some((event) => event.type === "freeSpinTrigger"));
});

test("base rounds stay on the payout step", () => {
  const rng = mulberry32(7);
  for (let i = 0; i < 200; i += 1) {
    const book = playBase(rng);
    assert.equal(book.payoutMultiplier % 10, 0);
    assert.ok(book.payoutMultiplier <= MAX_WIN_H);
  }
});
