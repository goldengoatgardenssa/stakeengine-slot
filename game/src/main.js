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
  if (anticipation > 0) reelNodes[index].classList.add("hot");
  const duration = (turbo ? 320 : 760) + index * (turbo ? 50 : 130) + anticipation * (turbo ? 180 : 520);
  await animateTransform(strip, leadCount * cellH, duration);
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

async function showVeil(title, hold) {
  veilEl.classList.remove("hidden");
  veilEl.innerHTML = `<strong>${title.replace("\n", "<br>")}</strong>`;
  await wait(slam || turbo ? 350 : hold);
  veilEl.classList.add("hidden");
}

function showBanner(text) {
  bannerEl.innerHTML = `<strong>${text}</strong>`;
  setTimeout(() => {
    if (bannerEl.firstChild) bannerEl.replaceChildren();
  }, turbo ? 600 : 1400);
}

function celebrate(hundredths) {
  const x = hundredths / 100;
  if (x >= MATH.maxWinX) showBanner(copy.strings.max);
  else if (x >= 100) showBanner(copy.strings.epic);
  else if (x >= 40) showBanner(copy.strings.mega);
  else if (x >= 15) showBanner(copy.strings.big);
  if (x > 0) audio.win(x >= 40 ? 6 : 3);
  if (x >= 15) coins();
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
      case "setWin":
        break;
      case "setTotalWin":
        await countTo(winValue(event.amount));
        break;
      case "freeSpinTrigger":
        feature = true;
        audio.feature();
        await showVeil(copy.strings.featureIntro(event.totalFs), 1500);
        break;
      case "freeSpinRetrigger":
        hudEl.innerHTML = `<span>+${event.added}</span>`;
        await wait(500);
        break;
      case "updateFreeSpin":
        hudEl.dataset.spin = `${event.amount}/${event.total}`;
        hudEl.innerHTML = `<span>${copy.strings.freespins} ${hudEl.dataset.spin}</span><span>${copy.strings.bloom} ${hudEl.dataset.bloom || 1}×</span>`;
        break;
      case "updateGlobalMult":
        hudEl.dataset.bloom = String(event.globalMult);
        hudEl.innerHTML = `<span>${copy.strings.freespins} ${hudEl.dataset.spin || ""}</span><span>${copy.strings.bloom} ${event.globalMult}×</span>`;
        break;
      case "freeSpinEnd":
        await showVeil(copy.strings.featureOutro, 1200);
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
    <p>Lantern values: ${scatter}. Bell bloom values: 1×, 2× and 3×.</p>
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
  wagered = betAmount();
  const amount = session.betLevelsApi[betIndex];
  try {
    const force = session.mock ? forceId : null;
    forceId = null;
    const data = await session.client.play({ amount, mode: nextMode, currency, force });
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
  spinning = false;
  if (autoLeft > 0 && nextMode === "base") {
    autoLeft -= 1;
    renderMeters();
    if (autoLeft > 0) doSpin("base");
  }
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
  ui.spin.addEventListener("click", () => doSpin("base"));
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
  ui.sound.addEventListener("click", () => {
    soundOn = !soundOn;
    audio.unlock();
    audio.setMuted(!soundOn);
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
      `<div class="sheet"><h2>${copy.strings.autoTitle}</h2><p>${copy.strings.autoBody(25)}</p>
        <button class="text-btn" type="button" data-ok>${copy.strings.confirm}</button>
        <button class="text-btn" type="button" data-cancel>${copy.strings.cancel}</button></div>`,
      () => {
        autoLeft = 25;
        renderMeters();
        doSpin("base");
      },
    );
  });
  ui.lantern.addEventListener("click", () => {
    openModal(
      `<div class="sheet"><h2>${copy.strings.featureTitle}</h2><p>${copy.strings.featureBody}</p>
        <button class="text-btn" type="button" data-ok>${copy.strings.confirm}</button>
        <button class="text-btn" type="button" data-cancel>${copy.strings.cancel}</button></div>`,
      () => doSpin("lantern"),
    );
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
