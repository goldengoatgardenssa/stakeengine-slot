import { createCopy } from "./copy.js";
import { formatMoney, fromApi, toApi } from "./format.js";
import { createAudio } from "./audio.js";
import { connect } from "./rgs.js";
import { MATH } from "./math-config.js";
import { detectArt } from "./manifest.js";
import { mascotMarkup, symbolMarkup } from "./symbols.js";

const params = new URLSearchParams(location.search);
const audio = createAudio();
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const stage = document.querySelector("#stage");
const reelsEl = document.querySelector("#reels");
const veilEl = document.querySelector("#veil");
const hudEl = document.querySelector("#hud");
const bannerEl = document.querySelector("#banner");
const fx = document.querySelector("#fx");
const ctx = fx.getContext("2d");
const mascot = document.querySelector("#mascot");

const ui = {
  balance: document.querySelector("#balance"),
  win: document.querySelector("#win"),
  bet: document.querySelector("#bet"),
  balanceLabel: document.querySelector("#balance-label"),
  winLabel: document.querySelector("#win-label"),
  betLabel: document.querySelector("#bet-label"),
  spin: document.querySelector("#spin"),
  auto: document.querySelector("#auto"),
  heist: document.querySelector("#heist"),
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

const HISTORY_KEY = "le-goaty-history";
const AUDIO_KEY = "le-goaty-audio";
let copy = createCopy(params.get("social") === "true");
let session = null;
let currency = "USD";
let social = params.get("social") === "true";
let betIndex = 0;
let balance = 0;
let winShown = 0;
let wagered = 0;
let spinning = false;
let slam = false;
let turbo = false;
let soundOn = true;
let anteOn = false;
let autoLeft = 0;
let stopOnFeature = true;
let autoLoss = 0;
let autoWin = 0;
let sessionLoss = 0;
let lastFeature = false;
let forceId = null;
const particles = [];

function money(amount) {
  return formatMoney(amount, currency, social);
}

function betAmount() {
  return session?.betLevels?.[betIndex] ?? 0;
}

function renderMeters() {
  ui.balance.textContent = money(balance);
  ui.win.textContent = money(winShown);
  ui.bet.textContent = money(betAmount());
  ui.balanceLabel.textContent = copy.strings.balance;
  ui.winLabel.textContent = copy.strings.win;
  ui.betLabel.textContent = copy.strings.bet;
  ui.spin.textContent = autoLeft > 0 ? String(autoLeft) : copy.strings.spin;
  ui.turbo.textContent = turbo ? copy.strings.stop : "Fast";
  ui.turbo.setAttribute("aria-pressed", String(turbo));
  ui.ante?.setAttribute("aria-pressed", String(anteOn));
}

function wait(ms) {
  const limit = reduce || slam ? 16 : turbo ? Math.min(ms, ms * 0.4) : ms;
  return new Promise((resolve) => setTimeout(resolve, limit));
}

function cellEl(reel, row) {
  return reelsEl.querySelector(`[data-reel="${reel}"][data-row="${row}"]`);
}

const GRID_NAME = {
  W: "W", S: "S", c: "C1", d: "C2", e: "C3", m: "M", k: "K",
  a: "H1", b: "H2", f: "H3", g: "H4", h: "H5",
  1: "L1", 2: "L2", 3: "L3", 4: "L4",
};

function columnsFrom(board) {
  if (!board) return [];
  if (Array.isArray(board)) return board;
  const cols = Array.from({ length: 6 }, () => Array.from({ length: 5 }, () => ({ name: "L4" })));
  const glyphs = board.grid || "";
  for (let index = 0; index < glyphs.length; index += 1) {
    const reel = Math.floor(index / 5);
    const row = index % 5;
    cols[reel][row] = { name: GRID_NAME[glyphs[index]] || "L4" };
  }
  for (const [reel, row, coin] of board.coins || []) cols[reel][row].coin = coin;
  for (const [reel, row, bell] of board.bells || []) cols[reel][row].bell = bell;
  for (const [reel, row, level] of board.golds || []) cols[reel][row].golden = level;
  return cols;
}

function paintGrid(board, dropping) {
  reelsEl.replaceChildren();
  const columns = columnsFrom(board);
  if (!columns.length) return;
  const rows = columns[0]?.length || 0;
  for (let row = 0; row < rows; row += 1) {
    for (let reel = 0; reel < columns.length; reel += 1) {
      const symbol = columns[reel][row];
      const cell = document.createElement("div");
      cell.className = "cell";
      if (dropping) cell.classList.add("drop");
      cell.dataset.reel = String(reel);
      cell.dataset.row = String(row);
      const level = symbol.golden || 0;
      if (level) cell.classList.add(`gold-${Math.min(3, level)}`);
      cell.innerHTML = symbolMarkup(symbol);
      reelsEl.append(cell);
    }
  }
}

function mood(name) {
  mascot.className = `mascot ${name}`;
}

function clearWins() {
  reelsEl.querySelectorAll(".win,.hot,.bell-slam").forEach((node) => {
    node.classList.remove("win", "hot", "bell-slam");
  });
}

function highlight(wins) {
  for (const win of wins || []) {
    for (const pos of win.positions || []) cellEl(pos.reel, pos.row)?.classList.add("win");
  }
}

function burst(x, y, count, color) {
  if (reduce) return;
  for (let i = 0; i < count; i += 1) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 5,
      vy: -Math.random() * 4 - 1,
      life: 36,
      color,
      r: 2 + Math.random() * 3,
    });
  }
}

function fountain() {
  if (reduce) return;
  const width = fx.clientWidth || 600;
  for (let i = 0; i < 48; i += 1) {
    particles.push({
      x: width * 0.5 + (Math.random() - 0.5) * 80,
      y: fx.clientHeight * 0.55,
      vx: (Math.random() - 0.5) * 6,
      vy: -5 - Math.random() * 4,
      life: 70,
      color: Math.random() > 0.5 ? "#e2b15a" : "#c4622d",
      r: 3,
    });
  }
}

function frame() {
  const width = fx.clientWidth;
  const height = fx.clientHeight;
  if (fx.width !== width) fx.width = width;
  if (fx.height !== height) fx.height = height;
  ctx.clearRect(0, 0, width, height);
  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const bit = particles[i];
    bit.x += bit.vx;
    bit.y += bit.vy;
    bit.vy += 0.12;
    bit.life -= 1;
    ctx.globalAlpha = Math.max(0, bit.life / 70);
    ctx.fillStyle = bit.color;
    ctx.beginPath();
    ctx.arc(bit.x, bit.y, bit.r, 0, Math.PI * 2);
    ctx.fill();
    if (bit.life <= 0) particles.splice(i, 1);
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(frame);
}

async function countTo(target) {
  const start = winShown;
  const began = performance.now();
  const duration = slam || reduce ? 40 : 500;
  await new Promise((resolve) => {
    const step = (now) => {
      const t = Math.min(1, (now - began) / duration);
      winShown = start + (target - start) * t;
      ui.win.textContent = money(winShown);
      if (t < 1) requestAnimationFrame(step);
      else {
        winShown = target;
        renderMeters();
        resolve();
      }
    };
    requestAnimationFrame(step);
  });
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

const TIER_COPY = {
  nice: () => copy.strings.nice,
  big: () => copy.strings.big,
  mega: () => copy.strings.mega,
  epic: () => copy.strings.epic,
  legendary: () => copy.strings.legendary,
};

async function ceremony(level) {
  const label = TIER_COPY[level]?.();
  if (!label) return;
  if (level === "mega" || level === "epic" || level === "legendary") mood("shock");
  else mood("celebrate");
  fountain();
  audio.win(level);
  stage.classList.add("shake");
  veilEl.classList.remove("hidden");
  veilEl.innerHTML = `<div class="ceremony"><div class="sun"></div><b>${label}</b><strong class="roll">${money(winShown)}</strong></div>`;
  await new Promise((resolve) => {
    const done = () => resolve();
    veilEl.addEventListener("pointerdown", done, { once: true });
    setTimeout(done, slam || reduce ? 200 : level === "legendary" ? 2600 : 1600);
  });
  veilEl.classList.add("hidden");
  veilEl.innerHTML = "";
  stage.classList.remove("shake");
  mood("idle");
}

async function playEvents(events) {
  let feature = false;
  for (const event of events) {
    if (session?.client?.event && !session.replay) session.client.event(event.index).catch(() => {});
    switch (event.type) {
      case "reveal":
      case "tumbleBoard":
        clearWins();
        paintGrid(event.board, event.type === "tumbleBoard");
        if (event.type === "tumbleBoard") audio.tumble();
        else audio.land();
        if ((event.anticipation || []).some((value) => value > 0)) {
          mood("anticipate");
          columnsFrom(event.board).forEach((column, reel) => {
            if (event.anticipation[reel]) column.forEach((_, row) => cellEl(reel, row)?.classList.add("hot"));
          });
        }
        await wait(event.type === "tumbleBoard" ? 280 : 180);
        break;
      case "winInfo":
        highlight(event.wins);
        mood("celebrate");
        audio.coin();
        await wait(320);
        break;
      case "collector": {
        audio.sack();
        const sack = cellEl(event.sack.reel, event.sack.row);
        const to = sack?.getBoundingClientRect();
        for (const coin of event.coins || []) {
          const node = cellEl(coin.reel, coin.row);
          if (!node || !to) continue;
          const from = node.getBoundingClientRect();
          node.classList.add("suck");
          node.style.transform = `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(0.15)`;
        }
        await wait(420);
        break;
      }
      case "goldenSet":
        for (const cell of event.cells || []) {
          const node = cellEl(cell.reel, cell.row);
          if (!node) continue;
          node.classList.remove("gold-1", "gold-2", "gold-3");
          node.classList.add(`gold-${Math.min(3, cell.level)}`);
        }
        break;
      case "multiplierLand":
        cellEl(event.reel, event.row)?.classList.add("bell-slam");
        stage.classList.add("shake");
        audio.bell();
        await wait(280);
        stage.classList.remove("shake");
        break;
      case "multiplierApply":
        ui.win.classList.add("win-burst");
        setTimeout(() => ui.win.classList.remove("win-burst"), 400);
        break;
      case "setWin":
        break;
      case "setTotalWin":
        await countTo((event.amount / 100) * wagered);
        break;
      case "bonusReveal":
        await waitGate(`<div class="ceremony"><b>${copy.strings.deeper}</b><button class="text-btn" type="button" data-go>${copy.strings.start}</button></div>`);
        break;
      case "freeSpinTrigger":
        feature = true;
        lastFeature = true;
        stage.classList.add("feature");
        audio.setTheme("bonus");
        audio.feature();
        mood("celebrate");
        await waitGate(`<div class="ceremony"><b>${copy.strings.featureIntro(String(event.bonusTier || "normal").toUpperCase(), event.totalFs).replace("\n", "<br>")}</b><button class="text-btn" type="button" data-go>${copy.strings.start}</button></div>`);
        break;
      case "freeSpinRetrigger":
        hudEl.insertAdjacentHTML("beforeend", `<span>+${event.added}</span>`);
        await wait(400);
        break;
      case "updateFreeSpin":
        hudEl.innerHTML = `<span>${copy.strings.freespins} ${event.amount}/${event.total}</span><span>${copy.strings.meter} ${event.meter}×</span>`;
        break;
      case "freeSpinEnd":
        await countTo((event.amount / 100) * wagered);
        if (event.winLevel) await ceremony(event.winLevel);
        await waitGate(`<div class="ceremony"><b>${copy.strings.featureOutro}<br>${money(winShown)}</b><button class="text-btn" type="button" data-go>${copy.strings.collect}</button></div>`);
        stage.classList.remove("feature");
        audio.setTheme("base");
        mood("idle");
        break;
      case "wincap":
        await ceremony("legendary");
        break;
      case "finalWin":
        await countTo((event.amount / 100) * wagered);
        if (!feature && event.winLevel) await ceremony(event.winLevel);
        if (!feature) hudEl.replaceChildren();
        break;
      default:
        console.warn("unhandled event", event.type);
    }
  }
}

function openModal(html) {
  ui.modal.classList.remove("hidden");
  ui.modal.innerHTML = html;
  ui.modal.querySelector("[data-cancel]")?.addEventListener("click", closeModal);
}

function closeModal() {
  ui.modal.classList.add("hidden");
  ui.modal.innerHTML = "";
}

function infoHtml() {
  const rows = Object.entries(MATH.paytable)
    .map(([id, pays]) => `<tr><td>${copy.symbols[id].name}</td><td>${(pays[5] / 100).toFixed(2)}×</td><td>${(pays[8] / 100).toFixed(2)}×</td><td>${(pays[12] / 100).toFixed(2)}×</td></tr>`)
    .join("");
  return `<div class="sheet"><h2>${copy.strings.gameName}</h2><p>${copy.strings.tagline}</p>
    <h3>${copy.strings.rules}</h3>${copy.rules.map((rule) => `<p>${rule}</p>`).join("")}
    <h3>${copy.strings.table}</h3>
    <table><thead><tr><th>Symbol</th><th>5</th><th>8</th><th>12</th></tr></thead><tbody>${rows}</tbody></table>
    ${copy.strings.uiGuide.map((line) => `<p>${line}</p>`).join("")}
    <p>${copy.strings.disclaimer}</p>
    <button class="text-btn" type="button" data-cancel>${copy.strings.close}</button></div>`;
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
    } else showError(copy.strings.connectFail);
    return;
  }
  if (played) rememberRound(nextMode, stake, winShown, played.state);
  spinning = false;
  mood("idle");
  if (autoLeft > 0 && (nextMode === "base" || nextMode === "ante")) {
    if (stopOnFeature && lastFeature) autoLeft = 0;
    if (autoLoss > 0 && sessionLoss >= autoLoss) autoLeft = 0;
    if (autoWin > 0 && winShown >= autoWin) autoLeft = 0;
    autoLeft -= 1;
    renderMeters();
    if (autoLeft > 0) doSpin(anteOn ? "ante" : "base");
  }
}

function rememberRound(modeName, bet, win, events) {
  try {
    const list = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    list.unshift({ t: Date.now(), mode: modeName, bet, win, events });
    const trimmed = list.slice(0, 12);
    const json = JSON.stringify(trimmed);
    if (json.length < 450000) localStorage.setItem(HISTORY_KEY, json);
  } catch { /* ignore quota */ }
}

function showError(message) {
  ui.error.classList.remove("hidden");
  ui.error.innerHTML = `<div><h1>${copy.strings.gameName}</h1><p>${message}</p></div>`;
}

function heistHtml() {
  const card = (mode, title, blurb) => `<div class="card"><div>${title}</div><b>${MATH.modes[mode].cost}×</b><p>${blurb}</p>
    <button class="text-btn" type="button" data-mode="${mode}">${copy.strings.confirm}</button></div>`;
  return `<div class="sheet"><h2>${copy.strings.featureTitle}</h2><div class="cards">
    ${card("bonus", "Normal", "Eight free tumbles.")}
    ${card("super", "Super", "Golden cells stay for the heist.")}
    ${card("epic", "Epic", "Starts with golden cells already lit.")}
    </div><button class="text-btn" type="button" data-cancel>${copy.strings.cancel}</button></div>`;
}

function bind() {
  ui.spin.addEventListener("click", () => doSpin(anteOn ? "ante" : "base"));
  ui.dec.addEventListener("click", () => {
    if (betIndex > 0) betIndex -= 1;
    renderMeters();
  });
  ui.inc.addEventListener("click", () => {
    if (betIndex < (session.betLevels || []).length - 1) betIndex += 1;
    renderMeters();
  });
  ui.turbo.addEventListener("click", () => {
    turbo = !turbo;
    renderMeters();
  });
  ui.info.addEventListener("click", () => openModal(infoHtml()));
  ui.ante.addEventListener("click", () => {
    anteOn = !anteOn;
    renderMeters();
  });
  ui.auto.addEventListener("click", () => {
    if (autoLeft > 0) {
      autoLeft = 0;
      renderMeters();
      return;
    }
    openModal(`<div class="sheet"><h2>${copy.strings.autoTitle}</h2><p>${copy.strings.autoBody(25)}</p>
      <div class="gridbets">
        <button class="text-btn" type="button" data-n="10">10</button>
        <button class="text-btn" type="button" data-n="25">25</button>
        <button class="text-btn" type="button" data-n="50">50</button>
        <button class="text-btn" type="button" data-n="100">100</button>
      </div>
      <p><label><input id="stop-feature" type="checkbox" checked /> Stop on feature</label></p>
      <p><label>Loss limit <input id="loss-limit" type="number" min="0" value="0" /></label>
      <label>Win limit <input id="win-limit" type="number" min="0" value="0" /></label></p>
      <button class="text-btn" type="button" data-cancel>${copy.strings.cancel}</button></div>`);
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
  ui.heist.addEventListener("click", () => {
    openModal(heistHtml());
    ui.modal.querySelectorAll("[data-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        const next = button.dataset.mode;
        closeModal();
        doSpin(next);
      });
    });
  });
  ui.history.addEventListener("click", () => {
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
          wagered = item.bet || betAmount();
          await playEvents(item.events);
          spinning = false;
        }
      });
    });
  });
  ui.bet.addEventListener("click", () => {
    const buttons = (session.betLevels || []).map((level, index) => `<button class="text-btn" type="button" data-bet="${index}">${money(level)}</button>`).join("");
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
      <p><button class="text-btn" type="button" id="tog-sound">${soundOn ? copy.strings.soundOn : copy.strings.soundOff}</button></p>
      <p><label>SFX <input id="sfx-vol" type="range" min="0" max="100" value="80" /></label></p>
      <p><label>Music <input id="music-vol" type="range" min="0" max="100" value="55" /></label></p>
      <button class="text-btn" type="button" data-cancel>${copy.strings.close}</button></div>`);
    const save = () => audio.setLevels({
      sfx: Number(ui.modal.querySelector("#sfx-vol").value) / 100,
      musicLevel: Number(ui.modal.querySelector("#music-vol").value) / 100,
    });
    ui.modal.querySelector("#sfx-vol")?.addEventListener("input", save);
    ui.modal.querySelector("#music-vol")?.addEventListener("input", save);
    ui.modal.querySelector("#tog-sound")?.addEventListener("click", () => {
      soundOn = !soundOn;
      audio.setLevels({ sound: soundOn });
      renderMeters();
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
    doSpin(anteOn ? "ante" : "base");
  });
}

function applyJurisdiction() {
  const rules = session.jurisdiction || {};
  social = social || rules.socialCasino;
  copy = createCopy(social);
  if (rules.disabledTurbo) ui.turbo.classList.add("hidden");
  if (rules.disabledAutoplay) ui.auto.classList.add("hidden");
  if (rules.disabledBuyFeature) ui.heist.classList.add("hidden");
  if (session.replay) {
    document.querySelector("#stepper").classList.add("hidden");
    document.querySelector("#mode-actions").classList.add("hidden");
    ui.spin.classList.add("hidden");
    ui.replayControls.classList.remove("hidden");
  }
  if (session.mock && !session.replay) {
    document.querySelector(".brand").insertAdjacentHTML("beforeend", `<span class="pill">${copy.strings.preview}</span>`);
  }
}

function hideBrokenArt() {
  document.querySelectorAll("img").forEach((img) => {
    img.addEventListener("error", () => img.classList.add("hidden"));
  });
}

async function boot() {
  mascot.innerHTML = mascotMarkup();
  hideBrokenArt();
  await detectArt();
  try {
    const saved = JSON.parse(localStorage.getItem(AUDIO_KEY) || "{}");
    if (typeof saved.sfx === "number") audio.setLevels({ sfx: saved.sfx, musicLevel: saved.music, sound: saved.soundOn });
  } catch { /* ignore */ }
  requestAnimationFrame(frame);
  try {
    session = await connect(params);
  } catch (error) {
    showError(error.message === "network" ? copy.strings.connectFail : copy.strings.replayFail);
    return;
  }
  if (session.replay && !session.replayData) {
    showError(copy.strings.replayFail);
    return;
  }
  currency = session.currency || "USD";
  balance = session.balance || 0;
  const levels = session.betLevels || [1];
  const target = session.defaultBet || levels[0];
  betIndex = Math.max(0, levels.findIndex((level) => Math.abs(level - target) < 1e-8));
  applyJurisdiction();
  renderMeters();
  bind();
  paintGrid([0, 1, 2, 3, 4, 5].map(() => ["L1", "L2", "L3", "L4", "H5"].map((name) => ({ name }))));
  if (session.resume) await settle(session.resume);
}

boot();
