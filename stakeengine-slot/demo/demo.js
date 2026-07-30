import SlotEngine from "../engine/SlotEngine.js";
import { describeBonus } from "../engine/BonusFlow.js";

const engine = new SlotEngine();

const reelsEl = document.getElementById("reels");
const modeLabel = document.getElementById("modeLabel");
const betLabel = document.getElementById("betLabel");
const winLabel = document.getElementById("winLabel");
const multiLabel = document.getElementById("multiLabel");
const loadingOverlay = document.getElementById("loadingOverlay");
const bonusOverlay = document.getElementById("bonusOverlay");
const bonusText = document.getElementById("bonusText");

const sndSpin = document.getElementById("sndSpin");
const sndWin = document.getElementById("sndWin");
const sndBonus = document.getElementById("sndBonus");
const sndBigWin = document.getElementById("sndBigWin");

let symbolAtlas = null;

function playSound(audio) {
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
}

async function loadSymbolAtlasConfig() {
    try {
        const res = await fetch("/images/config.json");
        const config = await res.json();
        symbolAtlas = config;
    } catch (e) {
        console.warn("Failed to load symbol atlas config:", e);
        symbolAtlas = null;
    }
}

function applySymbolBackground(div, sym) {
    if (!symbolAtlas || !symbolAtlas.symbolMap || !symbolAtlas.symbolMap[sym]) {
        return;
    }
    const coords = symbolAtlas.symbolMap[sym];
    div.style.backgroundImage = `url(${symbolAtlas.symbolAtlas})`;
    div.style.backgroundPosition = `-${coords.x}px -${coords.y}px`;
    div.style.backgroundSize = `${Object.values(symbolAtlas.symbolMap).reduce((w, c) => Math.max(w, c.x + c.width), 0)}px ${Object.values(symbolAtlas.symbolMap).reduce((h, c) => Math.max(h, c.y + c.height), 0)}px`;
    div.textContent = "";
}

function renderReels(spin) {
    reelsEl.innerHTML = "";
    const rows = 4;
    const cols = spin.result.length;

    for (let c = 0; c < cols; c++) {
        const colDiv = document.createElement("div");
        colDiv.className = "reel-column";

        for (let r = 0; r < rows; r++) {
            const idx = (c * rows + r) % spin.result.length;
            const sym = spin.result[idx];
            const div = document.createElement("div");
            div.className = "symbol";

            if (["SKULL", "MASK", "GOLD_BAR"].includes(sym)) {
                div.classList.add("premium");
            }
            if (["SCATTER", "WILD", "MULTI", "XWAYS", "XSPLIT", "XNUDGE"].includes(sym)) {
                div.classList.add("special");
            }
            if (sym === "STICKY_WILD") {
                div.classList.add("sticky");
            }
            if (sym === "EXPANDING_MULTI") {
                div.classList.add("expanding");
            }

            applySymbolBackground(div, sym);
            if (!div.textContent) {
                div.textContent = sym;
            }

            colDiv.appendChild(div);
        }

        reelsEl.appendChild(colDiv);
    }
}

function renderHUD(spin) {
    modeLabel.textContent = spin.mode;
    betLabel.textContent = spin.bet.toFixed(2);
    winLabel.textContent = spin.win.toFixed(2);
    multiLabel.textContent = `${spin.globalMulti.toFixed(2)}x`;
}

function showLoading(show) {
    loadingOverlay.classList.toggle("hidden", !show);
}

function showBonusIntro(show) {
    bonusOverlay.classList.toggle("hidden", !show);
}

function handleSpin(mode) {
    showLoading(true);
    playSound(sndSpin);

    setTimeout(() => {
        const spin = engine.spin(mode);
        renderReels(spin);
        renderHUD(spin);
        showLoading(false);

        if (spin.win > 0) {
            if (spin.win > 10) {
                playSound(sndBigWin);
            } else {
                playSound(sndWin);
            }
        }
        if (spin.bonus) {
            playSound(sndBonus);
            bonusText.textContent = describeBonus(spin.bonus);
            showBonusIntro(true);
            setTimeout(() => showBonusIntro(false), 2500);
        }
    }, 600);
}

document.querySelectorAll(".controls button").forEach(btn => {
    btn.addEventListener("click", () => {
        const mode = btn.getAttribute("data-mode");
        handleSpin(mode);
    });
});

loadSymbolAtlasConfig().then(() => handleSpin("base"));
