import { MAX_WIN_H } from "./engine.js";
import { analyzeMode } from "./metrics.js";

const CAP_P = 1 / 45000;

function applyShape(payouts, cost, winScale, tailScale) {
  const n = payouts.length;
  const weights = new Float64Array(n);
  const threshold = 40 * cost * 100;
  for (let i = 0; i < n; i += 1) {
    const h = payouts[i];
    if (h === MAX_WIN_H) weights[i] = 0;
    else if (h === 0) weights[i] = 1;
    else if (h >= threshold) weights[i] = winScale * tailScale;
    else weights[i] = winScale;
  }
  let rest = 0;
  const caps = [];
  for (let i = 0; i < n; i += 1) {
    if (payouts[i] === MAX_WIN_H) caps.push(i);
    else rest += weights[i];
  }
  if (caps.length > 0 && rest > 0) {
    const each = ((CAP_P / (1 - CAP_P)) * rest) / caps.length;
    for (const index of caps) weights[index] = each;
  }
  return weights;
}

function searchScale(payouts, cost, tailScale) {
  let lo = 0.002;
  let hi = 8;
  let best = null;
  for (let iter = 0; iter < 48; iter += 1) {
    const mid = (lo + hi) / 2;
    const weights = applyShape(payouts, cost, mid, tailScale);
    const row = analyzeMode(payouts, weights, cost);
    best = { weights, row, winScale: mid, tailScale };
    if (row.rtp > 0.964) hi = mid;
    else lo = mid;
  }
  return best;
}

export function optimizeWeights(payouts, cost) {
  let tailScale = 1;
  let best = searchScale(payouts, cost, tailScale);
  for (let iter = 0; iter < 12 && best.row.etl40 > 0.62; iter += 1) {
    tailScale *= 0.7;
    best = searchScale(payouts, cost, tailScale);
  }
  for (let iter = 0; iter < 8 && best.row.cvar > 620; iter += 1) {
    tailScale *= 0.75;
    best = searchScale(payouts, cost, tailScale);
  }

  const n = payouts.length;
  const integers = new Array(n);
  let minPositive = Infinity;
  for (let i = 0; i < n; i += 1) {
    if (best.weights[i] > 0 && best.weights[i] < minPositive) minPositive = best.weights[i];
  }
  const scale = 1000 / minPositive;
  for (let i = 0; i < n; i += 1) {
    integers[i] = Math.max(1, Math.round(best.weights[i] * scale));
  }

  const threshold = 40 * cost * 100;
  const bump = (wantHigher) => {
    const pool = [];
    for (let i = 0; i < n; i += 1) {
      if (payouts[i] === MAX_WIN_H) continue;
      if (wantHigher && payouts[i] > 0 && payouts[i] < threshold) pool.push(i);
      if (!wantHigher && payouts[i] === 0) pool.push(i);
    }
    if (pool.length === 0) return;
    const step = Math.max(1, Math.round(integers[pool[0]] * 0.004));
    for (const index of pool) integers[index] += step;
  };

  let row = analyzeMode(payouts, integers, cost);
  for (let iter = 0; iter < 30; iter += 1) {
    if (row.rtp >= 0.9605 && row.rtp <= 0.9665) break;
    bump(row.rtp < 0.964);
    row = analyzeMode(payouts, integers, cost);
  }
  return { weights: integers, row: analyzeMode(payouts, integers, cost), tailScale: best.tailScale };
}
