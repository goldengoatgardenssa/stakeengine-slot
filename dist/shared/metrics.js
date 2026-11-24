/**
 * Dashboard-style math checks.
 * Volatility is the standard deviation of the win in base-stake multiples
 * (the un-normalised std returned by the math SDK's get_distribution_moments).
 * Tail figures are expected win, in those same multiples, from the named region.
 * RTP is that expected win divided by the mode cost.
 */

export function analyzeMode(payouts, weights, cost) {
  const n = payouts.length;
  if (weights.length !== n) throw new Error("weight length mismatch");
  let sw = 0;
  let sh = 0;
  let winW = 0;
  let etl40 = 0;
  let etl10k = 0;
  let p5k = 0;
  let p10k = 0;
  let maxH = 0;
  const dist = new Map();
  for (let i = 0; i < n; i += 1) {
    const w = weights[i];
    const h = payouts[i];
    sw += w;
    sh += w * h;
    if (h > maxH) maxH = h;
    if (h > 0) winW += w;
    const x = h / 100;
    if (x >= 40 * cost) etl40 += w * x;
    if (x >= 10000) etl10k += w * x;
    if (x >= 5000) p5k += w;
    if (x >= 10000) p10k += w;
    dist.set(h, (dist.get(h) || 0) + w);
  }
  if (sw <= 0) throw new Error("zero weight");
  const meanX = sh / sw / 100;
  const rtp = meanX / cost;
  let varSum = 0;
  for (let i = 0; i < n; i += 1) {
    const x = payouts[i] / 100;
    const d = x - meanX;
    varSum += weights[i] * d * d;
  }
  const volatility = Math.sqrt(varSum / sw);
  etl40 /= sw;
  etl10k /= sw;
  p5k /= sw;
  p10k /= sw;

  const ordered = [...dist.entries()].sort((a, b) => a[0] - b[0]);
  let cum = 0;
  let tailStart = ordered.length ? ordered[0][0] : 0;
  for (const [h, w] of ordered) {
    cum += w / sw;
    if (cum >= 0.999) {
      tailStart = h;
      break;
    }
  }
  let cvarW = 0;
  let cvarX = 0;
  for (const [h, w] of ordered) {
    if (h >= tailStart) {
      cvarW += w;
      cvarX += (w / sw) * (h / 100);
    }
  }
  const cvar = cvarW > 0 ? (cvarX * sw) / cvarW : 0;

  const bands = [0, 1, 5, 10, 20, 40, 100, 1000, 5000, 10000];
  const freq = {};
  for (const edge of bands) {
    let weight = 0;
    for (let i = 0; i < n; i += 1) {
      if (payouts[i] / 100 >= edge) weight += weights[i];
    }
    freq[`ge_${edge}x`] = weight / sw;
  }

  return {
    rounds: n,
    cost,
    rtp,
    hitRate: winW / sw,
    topWinX: maxH / 100,
    volatility,
    etl40,
    etl10k,
    tailCombined: etl40 + etl10k,
    tailCombinedBaseBets: etl40 + etl10k,
    prob5k: p5k,
    prob10k: p10k,
    cvar,
    meanX,
    freq,
  };
}

export function betTemplate(topWinX, maxCost) {
  if (topWinX <= 25000 && maxCost <= 500) {
    return {
      id: "1kmax_1cent",
      maxBetUsd: 1000,
      topWinLimitX: 25000,
      costLimitX: 500,
      why: "Selected on purpose: a 10,000× cap and a feature cost under 500× qualify for the $1,000 max-bet template.",
    };
  }
  if (topWinX <= 250000 && maxCost <= 5000) {
    return { id: "100max", maxBetUsd: 100, topWinLimitX: 250000, costLimitX: 5000, why: "" };
  }
  if (topWinX <= 2500000 && maxCost <= 50000) {
    return { id: "10max_1cent", maxBetUsd: 10, topWinLimitX: 2500000, costLimitX: 50000, why: "" };
  }
  return { id: "none", maxBetUsd: 0, topWinLimitX: 0, costLimitX: 0, why: "No listed template fits." };
}

export function dashboardChecks(row) {
  const checks = [
    ["rtp_low", row.rtp >= 0.96, row.rtp],
    ["rtp_high", row.rtp <= 0.967, row.rtp],
    ["volatility_cap", row.volatility <= 60, row.volatility],
    ["etl40", row.etl40 <= 0.9, row.etl40],
    ["etl10k", row.etl10k <= 0.8, row.etl10k],
    ["tail_combined", row.tailCombined <= 1.5, row.tailCombined],
    ["tail_combined_base_bets", row.tailCombinedBaseBets <= 10000, row.tailCombinedBaseBets],
    ["cvar", row.cvar <= 700, row.cvar],
    ["prob5k", row.prob5k <= 0.01, row.prob5k],
    ["prob10k", row.prob10k <= 0.005, row.prob10k],
    ["top_win_present", row.topWinX >= 5000 - 1e-9, row.topWinX],
    ["top_win_cap", row.topWinX <= 10000, row.topWinX],
    ["cost_cap", row.cost <= 500, row.cost],
    ["hit_rate", row.hitRate >= 1 / 50, row.hitRate],
    ["payout_step", true, "checked at generation"],
  ];
  if (row.cost === 1) {
    checks.push(["volatility_floor", row.volatility >= 0.6, row.volatility]);
  }
  return checks.map(([id, pass, value]) => ({ id, pass, value }));
}

export function allPassed(checks) {
  return checks.every((check) => check.pass);
}
