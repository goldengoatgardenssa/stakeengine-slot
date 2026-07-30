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
let symbolMapping = null;

function playSound(audio) {
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
}

async function loadSymbolAtlasConfig() {
    try {
        const res = await fetch("/images/config.json");
        const config = await res.json();
        symbolAtlas = config.symbolAtlas || null;
        symbolMapping = config.mapping || {};
    } catch (e) {
        console.warn("Symbol atlas config load failed:", e);
        symbolAtlas = null;
        symbolMapping = {};
    }
}

function getAtlasStyle(sym) {
    if (!symbolMapping || !symbolMapping[sym]) return null;
    const coords = symbolMapping[sym];
    if (typeof coords === "string") {
        const parts = coords.split(",");
        const x = parseInt(parts[0], 10);
        const y = parseInt(parts[1], 10);
        return { x, y, width: 64, height: 64 };
    }
    return coords;
}

function createSymbolElement(sym) {
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

    const atlasStyle = getAtlasStyle(sym);
    if (atlasStyle && symbolAtlas) {
        const img = document.createElement("img");
        img.src = symbolAtlas;
        img.alt = sym;
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "contain";
        img.style.imageRendering = "pixelated";
        div.appendChild(img);
        div.style.background = "none";
    } else {
        div.textContent = sym;
    }

    return div;
}

function renderReels(spin) {
    reelsEl.innerHTML = "";
    const rows = 4;
    const cols = spin.result.length;

    for (let c = 0; c < cols; c++) {
        const colDiv = document.createElement("div");
        colDiv.className = "reel-column spinning";

        for (let r = 0; r < rows; r++) {
            const idx = (c * rows + r) % spin.result.length;
            const sym = spin.result[idx];
            const div = createSymbolElement(sym);
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

    setTimeout(async () => {
        const spin = engine.spin(mode);
        renderReels(spin);
        renderHUD(spin);

        setTimeout(() => {
            showLoading(false);
            document.querySelectorAll(".reel-column.spinning").forEach(col => {
                col.classList.remove("spinning");
                col.classList.add("bounce");
                setTimeout(() => col.classList.remove("bounce"), 300);
            });
        }, 800);

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