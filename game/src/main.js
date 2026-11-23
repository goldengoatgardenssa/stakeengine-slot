import { createCopy } from "./copy.js";
import { formatMoney, fromApi, toApi } from "./format.js";
import { createAudio } from "./audio.js";
import { connect } from "./rgs.js";
import { symbolMarkup } from "./symbols.js";
import { MATH } from "./math-config.js";

const IDS = ["W", "S", "H1", "H2", "H3", "H4", "L1", "L2", "L3", "L4"];
const params = new URLSearchParams(location.search);
const audio = createAudio();
const reelsEl = document.querySelector("#reels");
const bannerEl = document.querySelector("#banner");
const veilEl = document.querySelector("#veil");
const hudEl = document.querySelector("#hud");
const fx = document.querySelector("#fx");
const ctx = fx.getContext("2d");
const lines = document.createElementNS("http://www.w3.org/2000/svg", "svg");
lines.setAttribute("class", "lines");
reelsEl.append(lines);

const ui = {
  balance: document.querySelector("#balance"),
  win: document.querySelector("#win"),
  bet: document.querySelector("#bet"),
  balanceLabel: document.querySelector("#balance-label"),
  winLabel: document.querySelector("#win-label"),
  betLabel: document.querySelector("#bet-label"),
  spin: document.querySelector("#spin"),
  auto: document.querySelector("#auto"),
  lantern: document.querySelector("#lantern"),
  ante: document.querySelector("#ante"),
  history: document.querySelector("#history"),
  turbo: document.querySelector("#turbo"),
  sound: document.querySelector("#sound"),
  info: document.querySelector("#info"),
  dec: document.querySelector("#bet-dec"),
  inc: document.querySelector("#bet-inc"),
  modal: document.querySelector("#modal"),
  error: document.querySelector("#error"),
  replayControls: document.querySelector("#replay-controls"),
  replayPlay: document.querySelector("#replay-play"),
};

let copy = createCopy(params.get("social") === "true");
let session = null;
let currency = "USD";
let social = params.get("social") === "true";
let betIndex = 0;
let balance = 0;
let winShown = 0;
let wagered = 1;
let forceId = params.get("force");
let mode = "base";
let spinning = false;
let slam = false;
let turbo = false;
let soundOn = true;
let autoLeft = 0;
let anteOn = false;
let stopOnFeature = true;
let autoLoss = 0;
let autoWin = 0;
let sessionLoss = 0;
let lastFeature = false;
const HISTORY_KEY = "copperbell-history";
const AUDIO_KEY = "copperbell-audio";
let cellH = 80;
let roundToken = 0;
const particles = [];
const reelNodes = [];

function randomId() {
  return IDS[Math.floor(Math.random() * IDS.length)];
}

function measure() {
  const reel = reelNodes[0];
  const height = reel ? reel.clientHeight / 3 : 0;
  cellH = height > 24 ? height : 72;
  fx.width = Math.max(1, fx.clientWidth) * devicePixelRatio;
  fx.height = Math.max(1, fx.clientHeight) * devicePixelRatio;
}

function paint(strip, names) {
  strip.innerHTML = names
    .map((name) => `<div class="cell" style="height:${cellH}px">${symbolMarkup(name)}</div>`)
    .join("");
}

function ease(t) {
  const c1 = 1.35;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
}

function animateTransform(node, distance, duration) {
  return new Promise((resolve) => {
    const start = performance.now();
    const step = (now) => {
      const limit = slam ? Math.min(duration, 90) : duration;
      const t = Math.min(1, (now - start) / limit);
      node.style.transform = `translateY(${-distance * ease(t)}px)`;
      if (t < 1) requestAnimationFrame(step);
      else resolve();
    };
    requestAnimationFrame(step);
  });
}

async function spinReel(index, finalNames, anticipation) {
  const strip = reelNodes[index].querySelector(".strip");
  const leadCount = slam ? 3 : 12 + anticipation * 8;
  const lead = Array.from({ length: leadCount }, randomId);
  paint(strip, [...lead, ...finalNames]);
  strip.classList.add("moving");
  if (anticipation > 0) {
    reelNodes[index].classList.add("hot");
    audio.anticipate();
  }
  const duration = (turbo ? 320 : 780) + index * (turbo ? 50 : 140) + anticipation * (turbo ? 180 : 560);
  await animateTransform(strip, leadCount * cellH, duration);
  strip.classList.remove("moving");
  paint(strip, finalNames);
  strip.style.transform = "translateY(0)";
  reelNodes[index].classList.remove("hot");
  audio.stop(index);
}

function clearWins() {
  lines.replaceChildren();
  for (const reel of reelNodes) {
    for (const cell of reel.querySelectorAll(".win")) cell.classList.remove("win");
  }
}

function highlight(wins) {
  clearWins();
  const bounds = reelsEl.getBoundingClientRect();
  for (const win of wins || []) {
    const points = [];
    for (const pos of win.positions) {
      const cell = reelNodes[pos.reel]?.querySelectorAll(".cell")[pos.row];
      if (!cell) continue;
      cell.classList.add("win");
      const rect = cell.getBoundingClientRect();
      points.push([
        rect.left - bounds.left + rect.width / 2,
        rect.top - bounds.top + rect.height / 2,
      ]);
      burst(rect.left - bounds.left + rect.width / 2, rect.top - bounds.top + rect.height / 2, 8);
    }
    if (points.length > 1 && win.meta?.lineIndex >= 0) {
      const poly = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      poly.setAttribute("points", points.map((point) => point.join(",")).join(" "));
      poly.setAttribute("fill", "none");
      poly.setAttribute("stroke", "#c56a32");
      poly.setAttribute("stroke-width", "4");
      poly.setAttribute("stroke-linecap", "round");
      lines.append(poly);
    }
  }
}

function burst(x, y, count) {
  for (let i = 0; i < count; i += 1) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: -Math.random() * 3 - 1,
      life: 40 + Math.random() * 20,
      color: Math.random() > 0.5 ? "#e7b256" : "#c56a32",
      r: 2 + Math.random() * 3,
    });
  }
}

function coins() {
  const width = fx.clientWidth;
  for (let i = 0; i < 36; i += 1) {
    particles.push({
      x: Math.random() * width,
      y: -10,
      vx: (Math.random() - 0.5) * 1.5,
      vy: 2 + Math.random() * 3,
      life: 90,
      color: "#e7b256",
      r: 4,
    });
  }
}

function drawFx() {
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  ctx.clearRect(0, 0, fx.clientWidth, fx.clientHeight);
  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const particle = particles[i];
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.08;
    particle.life -= 1;
    if (particle.life <= 0) particles.splice(i, 1);
    ctx.globalAlpha = Math.max(0, particle.life / 40);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.ellipse(particle.x, particle.y, particle.r, particle.r * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(drawFx);
}

function money(amount) {
  return formatMoney(amount, currency);
}

function betAmount() {
  return session.betLevels?.[betIndex] ?? 0;
}

function renderMeters() {
  ui.balance.textContent = money(balance);
  ui.win.textContent = money(winShown);
  ui.bet.textContent = money(betAmount());
  ui.balanceLabel.textContent = copy.strings.balance;
  ui.winLabel.textContent = copy.strings.win;
  ui.betLabel.textContent = copy.strings.bet;
  ui.spin.textContent = copy.strings.spin;
  ui.auto.textContent = autoLeft > 0 ? copy.strings.stop : copy.strings.auto;
  ui.lantern.textContent = `${copy.strings.feature} ${MATH.modes.lantern.cost}×`;
  ui.sound.setAttribute("aria-label", soundOn ? copy.strings.soundOn : copy.strings.soundOff);
  ui.sound.setAttribute("aria-pressed", String(soundOn));
  ui.turbo.setAttribute("aria-pressed", String(turbo));
}

function countTo(next) {
  const from = winShown;
  const start = performance.now();
  const duration = turbo ? 220 : Math.min(1600, 400 + Math.abs(next - from) * 40);
  return new Promise((resolve) => {
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      winShown = from + (next - from) * (1 - (1 - t) ** 3);
      ui.win.textContent = money(winShown);
      if (Math.floor(t * 8) !== Math.floor(((now - start - 16) / duration) * 8)) audio.tick?.();
      if (t < 1 && !slam) requestAnimationFrame(step);
      else {
        winShown = next;
        ui.win.textContent = money(winShown);
        resolve();
      }
    };
    requestAnimationFrame(step);
  });
}

function winValue(hundredths) {
  return (hundredths / 100) * wagered;
}

function waitGate(html) {
  veilEl.classList.remove("hidden");
  veilEl.innerHTML = html;
  return new Promise((resolve) => {
    const go = () => {
      veilEl.classList.add("hidden");
      veilEl.innerHTML = "";
      resolve();
    };
    veilEl.querySelector("[data-go]")?.addEventListener("click", go);
    veilEl.addEventListener("click", go, { once: true });
  });
}

async function showVeil(title, hold) {
  veilEl.classList.remove("hidden");
  veilEl.innerHTML = `<strong>${title.replace("\n", "<br>")}</strong>`;
  await wait(slam || turbo ? 350 : hold);
  veilEl.classList.add("hidden");
}

function orbTier(value) {
  if (value >= 50) return "high";
  if (value >= 10) return "mid";
  return "low";
}

function orbMarkup(value) {
  const tier = orbTier(value);
  return `<div class="orb orb-${value} tier-${tier}" data-value="${value}">
    <img class="orb-glow" alt="" src="assets/art-v4/ui/particles/soft_glow.webp" />
    <img class="orb-glint" alt="" src="assets/art-v4/ui/particles/glint_star.webp" />
    <svg viewBox="0 0 80 80" aria-hidden="true">
      <circle class="ring" cx="40" cy="40" r="28" fill="none" stroke="#1a120e" stroke-width="3" />
      <path d="M40 16c2 8 16 14 16 28a16 16 0 0 1-32 0c0-14 14-20 16-28z" fill="${tier === "high" ? "#e2b15a" : tier === "mid" ? "#8a3450" : "#c4622d"}" stroke="#1a120e" stroke-width="3" />
      <path d="M28 36h24" stroke="#1a120e" stroke-width="3" />
      <circle cx="40" cy="64" r="4" fill="#e2b15a" stroke="#1a120e" stroke-width="2" />
    </svg>
    <b>${value}×</b>
  </div>`;
}

function paintFeatureHud() {
  const spin = hudEl.dataset.spin || "";
  const bloom = hudEl.dataset.bloom || "";
  const applied = hudEl.dataset.applied || "";
  const parts = [];
  if (spin) parts.push(`<span>${copy.strings.freespins} ${spin}</span>`);
  if (bloom) parts.push(`<span class="mult-meter">${copy.strings.bloom} ${bloom}×</span>`);
  if (applied && applied !== bloom) parts.push(`<span class="mult-meter hot">${applied}×</span>`);
  if (parts.length) hudEl.innerHTML = parts.join("");
}

async function flyMultiplier(value, source) {
  const target = ui.win;
  if (!source || !target) return;
  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const flyer = document.createElement("div");
  flyer.className = `flyer tier-${orbTier(value)}`;
  flyer.textContent = `${value}×`;
  flyer.style.left = `${from.left + from.width / 2}px`;
  flyer.style.top = `${from.top + from.height / 2}px`;
  document.body.appendChild(flyer);
  await wait(30);
  flyer.style.left = `${to.left + to.width / 2}px`;
  flyer.style.top = `${to.top + to.height / 2}px`;
  await wait(turbo ? 160 : 520);
  flyer.remove();
  target.classList.add("win-burst");
  setTimeout(() => target.classList.remove("win-burst"), 560);
}

async function placeOrb(event) {
  const cell = reelNodes[event.reel]?.querySelectorAll(".cell")[event.row];
  if (!cell) return;
  cell.insertAdjacentHTML("beforeend", orbMarkup(event.value));
  cell.classList.add("orb-land");
  await wait(turbo ? 90 : 320);
  await flyMultiplier(event.value, cell.querySelector(".orb"));
}

function showBanner(text) {
  bannerEl.innerHTML = `<strong>${text}</strong>`;
  setTimeout(() => {
    if (bannerEl.firstChild) bannerEl.replaceChildren();
  }, turbo ? 600 : 1400);
}

function celebrate(hundredths) {
  const x = hundredths / 100;
  const stage = document.querySelector("#stage");
  if (x >= MATH.maxWinX) showBanner(copy.strings.max);
  else if (x >= 100) showBanner(copy.strings.epic);
  else if (x >= 40) showBanner(copy.strings.mega);
  else if (x >= 15) showBanner(copy.strings.big);
  else if (x >= 5) showBanner("Nice win");
  if (x >= 15) {
    stage.classList.add("shake");
    setTimeout(() => stage.classList.remove("shake"), 500);
    coins();
    audio.bell?.();
  }
  if (x > 0) audio.win(x >= 40 ? 6 : 3);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, slam ? Math.min(ms, 40) : ms));
}

async function playEvents(events) {
  let feature = false;
  for (const event of events) {
    if (session?.client?.event && !session.replay) session.client.event(event.index).catch(() => {});
    switch (event.type) {
      case "reveal":
        clearWins();
        delete hudEl.dataset.applied;
        for (const reel of reelNodes) reel.classList.remove("expand");
        if ((event.anticipation || []).some((value) => value > 0)) audio.anticipate();
        await Promise.all(
          event.board.map((column, index) =>
            spinReel(
              index,
              column.map((symbol) => symbol.name),
              event.anticipation?.[index] || 0,
            ),
          ),
        );
        break;
      case "winInfo":
        highlight(event.wins);
        break;
      case "multiplierLand":
        audio.bell?.();
        await placeOrb(event);
        break;
      case "multiplierApply":
        hudEl.dataset.applied = String(event.multiplier);
        paintFeatureHud();
        ui.win.classList.add("win-burst");
        setTimeout(() => ui.win.classList.remove("win-burst"), 560);
        break;
      case "wildSticky":
        for (const pos of event.positions || []) {
          const cell = reelNodes[pos.reel]?.querySelectorAll(".cell")[pos.row];
          if (!cell) continue;
          cell.classList.add("sticky");
          if (event.wildMult > 1) cell.dataset.wild = `${event.wildMult}×`;
        }
        break;
      case "wildExpand":
        for (const reel of event.reels || []) {
          reelNodes[reel]?.classList.add("expand");
          if (event.wildMult > 1) reelNodes[reel].dataset.wild = `${event.wildMult}×`;
        }
        break;
      case "bonusReveal":
        await waitGate(`<strong>HIDDEN</strong><button class="text-btn" type="button" data-go>Start</button>`);
        break;
      case "setWin":
        break;
      case "setTotalWin":
        await countTo(winValue(event.amount));
        break;
      case "freeSpinTrigger":
        feature = true;
        lastFeature = true;
        audio.feature();
        await waitGate(
          `<strong>${(event.bonusTier || "normal").toUpperCase()}<br>${copy.strings.featureIntro(event.totalFs).replace("\n", "<br>")}</strong><button class="text-btn" type="button" data-go>Start</button>`,
        );
        break;
      case "freeSpinRetrigger":
        hudEl.dataset.spin = `+${event.added}`;
        paintFeatureHud();
        await wait(500);
        break;
      case "updateFreeSpin":
        hudEl.dataset.spin = `${event.amount}/${event.total}`;
        paintFeatureHud();
        break;
      case "updateGlobalMult":
        hudEl.dataset.bloom = String(event.globalMult);
        paintFeatureHud();
        break;
      case "freeSpinEnd":
        await countTo(winValue(event.amount));
        await waitGate(
          `<strong>${copy.strings.featureOutro}<br>${money(winValue(event.amount))}</strong><button class="text-btn" type="button" data-go>Collect</button>`,
        );
        break;
      case "wincap":
        showBanner(copy.strings.max);
        coins();
        break;
      case "finalWin":
        await countTo(winValue(event.amount));
        celebrate(event.amount);
        if (!feature) hudEl.replaceChildren();
        break;
      default: {
        const unknown = event.type;
        console.warn("unhandled event", unknown);
      }
    }
    const min = session?.jurisdiction?.minimumRoundDuration || 0;
    if (min > 0 && event.type === "finalWin") await wait(min);
  }
}

function openModal(html, onConfirm) {
  ui.modal.classList.remove("hidden");
  ui.modal.innerHTML = html;
  ui.modal.querySelector("[data-cancel]")?.addEventListener("click", closeModal);
  ui.modal.querySelector("[data-ok]")?.addEventListener("click", async () => {
    closeModal();
    if (onConfirm) await onConfirm();
  });
}

function closeModal() {
  ui.modal.classList.add("hidden");
  ui.modal.innerHTML = "";
}

function infoHtml() {
  const rows = Object.entries(MATH.paytable)
    .map(([id, pays]) => {
      const name = copy.symbols[id].name;
      return `<tr><td>${name}</td><td>${(pays[3] / 100).toFixed(2)}×</td><td>${(pays[4] / 100).toFixed(2)}×</td><td>${(pays[5] / 100).toFixed(2)}×</td></tr>`;
    })
    .join("");
  const scatter = [3, 4, 5]
    .map((count) => `${count} lanterns ${(MATH.scatterPay[count] / 100).toFixed(2)}×`)
    .join(", ");
  return `<div class="sheet">
    <h2>${copy.strings.gameName}</h2>
    <p>${copy.strings.tagline}</p>
    <h3>${copy.strings.rules}</h3>
    ${copy.rules.map((rule) => `<p>${rule}</p>`).join("")}
    <p>Lantern values: ${scatter}. Bell multipliers: 2×, 3×, 5×, 10×, 25×, 50×, 100×.</p>
    <h3>${copy.strings.table}</h3>
    <table><thead><tr><th>Symbol</th><th>3</th><th>4</th><th>5</th></tr></thead><tbody>${rows}</tbody></table>
    <h3>Controls</h3>
    ${copy.strings.uiGuide.map((line) => `<p>${line}</p>`).join("")}
    <p>${copy.strings.disclaimer}</p>
    <button class="text-btn" type="button" data-cancel>${copy.strings.close}</button>
  </div>`;
}

async function settle(round) {
  const base = fromApi(round.amount || toApi(betAmount()));
  if (base > 0) wagered = base;
  winShown = 0;
  renderMeters();
  await playEvents(round.state || []);
  if (round.payout > 0 && round.active !== false && !session.replay) {
    const ended = await session.client.endRound();
    if (ended?.balance) balance = fromApi(ended.balance.amount);
  }
  renderMeters();
}

async function doSpin(nextMode) {
  if (spinning) {
    slam = true;
    return;
  }
  if (session.replay) return;
  const cost = MATH.modes[nextMode].cost;
  const stake = betAmount() * cost;
  if (balance + 1e-8 < stake) {
    openModal(`<div class="sheet"><p>${copy.strings.insufficient}</p><button class="text-btn" type="button" data-cancel>${copy.strings.close}</button></div>`);
    autoLeft = 0;
    return;
  }
  spinning = true;
  slam = false;
  audio.unlock();
  audio.spin();
  mode = nextMode;
  lastFeature = false;
  wagered = betAmount();
  sessionLoss += stake;
  const amount = session.betLevelsApi[betIndex];
  let played = null;
  try {
    const force = session.mock ? forceId : null;
    forceId = null;
    const data = await session.client.play({ amount, mode: nextMode, currency, force });
    played = data.round;
    balance = fromApi(data.balance.amount);
    renderMeters();
    await settle(data.round);
  } catch (error) {
    spinning = false;
    autoLeft = 0;
    if (error.message === "ERR_IPB") {
      openModal(`<div class="sheet"><p>${copy.strings.insufficient}</p><button class="text-btn" type="button" data-cancel>${copy.strings.close}</button></div>`);
    } else {
      showError(copy.strings.connectFail);
    }
    return;
  }
  if (played) rememberRound(nextMode, stake, winShown, played.state);
  spinning = false;
  if (autoLeft > 0 && (nextMode === "base" || nextMode === "ante")) {
    if (stopOnFeature && lastFeature) autoLeft = 0;
    if (autoLoss > 0 && sessionLoss >= autoLoss) autoLeft = 0;
    if (autoWin > 0 && winShown >= autoWin) autoLeft = 0;
    autoLeft -= 1;
    renderMeters();
    if (autoLeft > 0) doSpin("base");
  }
}

function rememberRound(modeName, bet, win, events) {
  try {
    const list = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    list.unshift({ t: Date.now(), mode: modeName, bet, win, events });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 20)));
  } catch { /* ignore */ }
}

function showError(message) {
  ui.error.classList.remove("hidden");
  ui.error.innerHTML = `<div><h1>${copy.strings.gameName}</h1><p>${message}</p></div>`;
}

function applyJurisdiction() {
  const rules = session.jurisdiction || {};
  social = social || rules.socialCasino;
  copy = createCopy(social);
  if (rules.disabledTurbo) ui.turbo.classList.add("hidden");
  if (rules.disabledAutoplay) ui.auto.classList.add("hidden");
  if (rules.disabledBuyFeature) ui.lantern.classList.add("hidden");
  if (session.replay) {
    document.querySelector("#stepper").classList.add("hidden");
    document.querySelector("#mode-actions").classList.add("hidden");
    ui.spin.classList.add("hidden");
    ui.replayControls.classList.remove("hidden");
  }
  if (session.mock && !session.replay) {
    hudEl.insertAdjacentHTML("beforeend", `<span>${copy.strings.preview}</span>`);
  }
}

function bind() {
  ui.spin.addEventListener("click", () => doSpin(anteOn ? "ante" : "base"));
  ui.dec.addEventListener("click", () => {
    if (betIndex > 0) betIndex -= 1;
    renderMeters();
  });
  ui.inc.addEventListener("click", () => {
    if (betIndex < session.betLevels.length - 1) betIndex += 1;
    renderMeters();
  });
  ui.turbo.addEventListener("click", () => {
    turbo = !turbo;
    renderMeters();
  });
  ui.info.addEventListener("click", () => openModal(infoHtml()));
  ui.auto.addEventListener("click", () => {
    if (autoLeft > 0) {
      autoLeft = 0;
      renderMeters();
      return;
    }
    openModal(
      `<div class="sheet"><h2>${copy.strings.autoTitle}</h2>
        <div class="gridbets">
          <button class="text-btn" type="button" data-n="10">10</button>
          <button class="text-btn" type="button" data-n="25">25</button>
          <button class="text-btn" type="button" data-n="50">50</button>
          <button class="text-btn" type="button" data-n="100">100</button>
        </div>
        <p><label><input id="stop-feature" type="checkbox" checked /> Stop on feature</label></p>
        <p><label>Loss limit <input id="loss-limit" type="number" min="0" value="0" /></label>
        <label>Win limit <input id="win-limit" type="number" min="0" value="0" /></label></p>
        <button class="text-btn" type="button" data-cancel>${copy.strings.cancel}</button></div>`,
    );
    ui.modal.querySelectorAll("[data-n]").forEach((button) => {
      button.addEventListener("click", () => {
        autoLeft = Number(button.dataset.n);
        stopOnFeature = ui.modal.querySelector("#stop-feature").checked;
        autoLoss = Number(ui.modal.querySelector("#loss-limit").value) || 0;
        autoWin = Number(ui.modal.querySelector("#win-limit").value) || 0;
        sessionLoss = 0;
        closeModal();
        renderMeters();
        doSpin(anteOn ? "ante" : "base");
      });
    });
  });
  ui.ante?.addEventListener("click", () => {
    anteOn = !anteOn;
    ui.ante.setAttribute("aria-pressed", String(anteOn));
    ui.ante.textContent = anteOn ? "Ante 1.25×" : "Ante";
  });
  ui.history?.addEventListener("click", () => {
    const list = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    const rows = list.length
      ? list.map((item, index) => `<button class="text-btn" type="button" data-hist="${index}">${new Date(item.t).toLocaleTimeString()} ${item.mode} ${money(item.bet)} → ${money(item.win)}</button>`).join("")
      : "<p>No rounds yet.</p>";
    openModal(`<div class="sheet"><h2>History</h2><div class="gridbets">${rows}</div><button class="text-btn" type="button" data-cancel>${copy.strings.close}</button></div>`);
    ui.modal.querySelectorAll("[data-hist]").forEach((button) => {
      button.addEventListener("click", async () => {
        const item = list[Number(button.dataset.hist)];
        closeModal();
        if (item?.events) {
          spinning = true;
          await playEvents(item.events);
          spinning = false;
        }
      });
    });
  });
  ui.lantern.addEventListener("click", () => {
    openModal(
      `<div class="sheet"><h2>${copy.strings.featureTitle}</h2>
        <div class="card"><div>Normal</div><b>${MATH.modes.bonus?.cost ?? MATH.modes.lantern?.cost ?? 17.1}×</b><p>${copy.strings.featureBody}</p>
          <button class="text-btn" type="button" data-mode="bonus">${copy.strings.confirm}</button></div>
        <div class="card"><div>Super</div><b>${MATH.modes.super?.cost ?? 23.5}×</b><p>Super starts the larger watch.</p>
          <button class="text-btn" type="button" data-mode="super">${copy.strings.confirm}</button></div>
        <button class="text-btn" type="button" data-ok>${copy.strings.confirm}</button>
        <button class="text-btn" type="button" data-cancel>${copy.strings.cancel}</button></div>`,
    );
    ui.modal.querySelectorAll("[data-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        const next = button.dataset.mode;
        closeModal();
        doSpin(next);
      });
    });
  });
  ui.bet.addEventListener("click", () => {
    const buttons = (session.betLevels || [])
      .map((level, index) => `<button class="text-btn" type="button" data-bet="${index}">${money(level)}</button>`)
      .join("");
    openModal(`<div class="sheet"><h2>${copy.strings.bet}</h2><div class="gridbets">${buttons}</div><button class="text-btn" type="button" data-cancel>${copy.strings.close}</button></div>`);
    ui.modal.querySelectorAll("[data-bet]").forEach((button) => {
      button.addEventListener("click", () => {
        betIndex = Number(button.dataset.bet);
        renderMeters();
        closeModal();
      });
    });
  });
  ui.sound.addEventListener("click", () => {
    openModal(`<div class="sheet"><h2>${copy.strings.soundOn}</h2>
      <p><button class="text-btn" type="button" id="tog-sound">${soundOn ? copy.strings.soundOn : copy.strings.soundOff}</button>
      <button class="text-btn" type="button" id="tog-turbo">${copy.strings.turbo}</button></p>
      <p><label>SFX <input id="sfx-vol" type="range" min="0" max="100" value="80" /></label></p>
      <p><label>Music <input id="music-vol" type="range" min="0" max="100" value="70" /></label></p>
      <p>Space bar starts a round when no panel is open.</p>
      <button class="text-btn" type="button" data-cancel>${copy.strings.close}</button></div>`);
    const saveLevels = () => {
      audio.setLevels({
        sfx: Number(ui.modal.querySelector("#sfx-vol").value) / 100,
        musicLevel: Number(ui.modal.querySelector("#music-vol").value) / 100,
      });
    };
    ui.modal.querySelector("#sfx-vol")?.addEventListener("input", saveLevels);
    ui.modal.querySelector("#music-vol")?.addEventListener("input", saveLevels);
    ui.modal.querySelector("#tog-sound")?.addEventListener("click", () => {
      soundOn = !soundOn;
      audio.unlock();
      audio.setLevels({ sound: soundOn });
      renderMeters();
    });
    ui.modal.querySelector("#tog-turbo")?.addEventListener("click", () => {
      turbo = !turbo;
      renderMeters();
      closeModal();
    });
  });
  ui.replayPlay.addEventListener("click", async () => {
    if (spinning) return;
    spinning = true;
    ui.replayPlay.disabled = true;
    const data = session.replayData;
    const amount = Number(params.get("amount") || 0);
    await settle({
      amount,
      payout: Math.round(amount * (data.payoutMultiplier || 0)),
      active: false,
      state: data.state || [],
    });
    spinning = false;
    ui.replayPlay.disabled = false;
    ui.replayPlay.textContent = copy.strings.playAgain;
  });
  window.addEventListener("keydown", (event) => {
    if (event.code !== "Space") return;
    if (session?.jurisdiction?.disabledSpacebar) return;
    if (!ui.modal.classList.contains("hidden") || session?.replay) return;
    event.preventDefault();
    doSpin("base");
  });
  window.addEventListener("resize", measure);
}

async function boot() {
  try {
    const saved = JSON.parse(localStorage.getItem(AUDIO_KEY) || "{}");
    if (saved && typeof saved.sfx === "number") audio.setLevels({ sfx: saved.sfx, musicLevel: saved.music, sound: saved.soundOn });
  } catch { /* ignore */ }
  for (let i = 0; i < 5; i += 1) {
    const reel = document.createElement("div");
    reel.className = "reel";
    const strip = document.createElement("div");
    strip.className = "strip";
    reel.append(strip);
    reelsEl.append(reel);
    reelNodes.push(reel);
  }
  measure();
  for (const reel of reelNodes) paint(reel.querySelector(".strip"), [randomId(), randomId(), randomId()]);
  drawFx();
  try {
    session = await connect(params);
  } catch (error) {
    showError(copy.strings.connectFail);
    return;
  }
  currency = session.currency || params.get("currency") || "USD";
  balance = session.balance || 0;
  betIndex = Math.max(0, (session.betLevels || []).findIndex((level) => level === session.defaultBet));
  applyJurisdiction();
  renderMeters();
  bind();
  if (session.resume?.state) {
    await settle(session.resume);
  }
}

boot();
