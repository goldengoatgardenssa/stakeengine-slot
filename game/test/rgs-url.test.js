import assert from "node:assert/strict";
import test from "node:test";
import { normalizeRgsUrl } from "../src/rgs.js";

test("host-only stake hosts become https origins", () => {
  assert.equal(normalizeRgsUrl("rgs.stake-engine.com"), "https://rgs.stake-engine.com");
  assert.equal(normalizeRgsUrl("rgs.stake-engine.com/"), "https://rgs.stake-engine.com");
});

test("explicit schemes are kept and trailing slashes drop", () => {
  assert.equal(normalizeRgsUrl("https://rgs.example.com/"), "https://rgs.example.com");
  assert.equal(normalizeRgsUrl("http://127.0.0.1:8791"), "http://127.0.0.1:8791");
});

test("local hosts without a scheme use http", () => {
  assert.equal(normalizeRgsUrl("127.0.0.1:8791"), "http://127.0.0.1:8791");
  assert.equal(normalizeRgsUrl("localhost:8080"), "http://localhost:8080");
  assert.equal(normalizeRgsUrl("[::1]:8080"), "http://[::1]:8080");
});

test("paths, queries, fragments, and bad hosts are rejected", () => {
  for (const value of ["not a host", "https://rgs.example.com/wallet", "https://rgs.example.com?a=1", "https://rgs.example.com#x", "", "   "]) {
    assert.throws(() => normalizeRgsUrl(value), /network/);
  }
});
