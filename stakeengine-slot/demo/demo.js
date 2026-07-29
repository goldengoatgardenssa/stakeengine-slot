import SlotEngine from "../engine/SlotEngine.js";
import { describeBonus } from "../engine/BonusFlow.js";

const engine = new SlotEngine();

const reelsEl = document.getElementById("reels");
const modeLabel = document.getElementById("modeLabel");
const betLabel = document.getElementById("betLabel");
const winLabel = document.getElementById("winLabel");
const multiLabel = document.getElementById("multiLabel");

const sndSpin = document.getElementById("sndSpin");
const sndWin = document.getElementById("sndWin");
const sndBonus = document.getElementById("sndBonus");

function playSound(audio) {
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
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

            div.textContent = sym;
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

function handleSpin(mode) {
    playSound(sndSpin);
    const spin = engine.spin(mode);
    renderReels(spin);
    renderHUD(spin);

    if (spin.win > 0) {
        playSound(sndWin);
    }
    if (spin.bonus) {
        playSound(sndBonus);
        console.log("Bonus:", describeBonus(spin.bonus));
    }
}

document.querySelectorAll(".controls button").forEach(btn => {
    btn.addEventListener("click", () => {
        const mode = btn.getAttribute("data-mode");
        handleSpin(mode);
    });
});

// initial render
handleSpin("base");