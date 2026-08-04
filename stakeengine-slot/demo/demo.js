import SlotEngine from "./engine/SlotEngine.js";
import { describeBonus } from "./engine/BonusFlow.js";
import { soundEngine } from "./SoundEngine.js";
import { stakeEngineClient } from "./StakeEngineClient.js";

const engine = new SlotEngine();

const reelsEl = document.getElementById("reels");
const modeLabel = document.getElementById("modeLabel");
const betLabel = document.getElementById("betLabel");
const winLabel = document.getElementById("winLabel");
const multiLabel = document.getElementById("multiLabel");
const balanceLabel = document.getElementById("balanceLabel");
const loadingOverlay = document.getElementById("loadingOverlay");
const bonusOverlay = document.getElementById("bonusOverlay");
const bonusText = document.getElementById("bonusText");
const paytableOverlay = document.getElementById("paytableOverlay");
const gameInfoOverlay = document.getElementById("gameInfoOverlay");
const bigWinOverlay = document.getElementById("bigWinOverlay");
const bigWinText = document.getElementById("bigWinText");
const errorOverlay = document.getElementById("errorOverlay");
const errorText = document.getElementById("errorText");

let balance = 1000.00;
let currentMode = "base";
let isSpinning = false;
let turboMode = false;
let autoPlayCount = 0;
let currentBetIndex = 0;

function playSound(name) {
    soundEngine.resume();
    if (name === "spin") soundEngine.spin();
    else if (name === "reelStop") soundEngine.reelStop();
    else if (name === "win") soundEngine.win();
    else if (name === "bigWin") soundEngine.bigWin();
    else if (name === "bonus") soundEngine.bonus();
    else if (name === "click") soundEngine.click();
}

function showOverlay(el, show) {
    if (show) el.classList.remove("hidden");
    else el.classList.add("hidden");
}

function formatCurrency(val) {
    return val.toFixed(2);
}

function getSymbolPath(sym) {
    const tierMap = {
        "A": "low/A.svg", "K": "low/K.svg", "Q": "low/Q.svg", "J": "low/J.svg", "10": "low/10.svg",
        "SKULL": "premium/traystrees50_goat_hybrid.svg",
        "MASK": "premium/perpertium_goat_hybrid.svg",
        "GOLD_BAR": "premium/golden_goat_chrome.svg",
        "SCATTER": "special/scatter.svg",
        "WILD": "special/wild.svg",
        "MULTI": "special/multi.svg",
        "XWAYS": "special/xways.svg",
        "XSPLIT": "special/xsplit.svg",
        "XNUDGE": "special/xnudge.svg",
        "STICKY_WILD": "special/sticky_wild.svg",
        "EXPANDING_MULTI": "special/expanding_multi.svg"
    };
    return `/images/symbols/${tierMap[sym] || "special/wild.svg"}`;
}

function createSymbolElement(sym) {
    const div = document.createElement("div");
    div.className = "symbol";

    if (["SKULL", "MASK", "GOLD_BAR"].includes(sym)) {
        div.classList.add("premium");
    }
    if (["SCATTER", "WILD", "MULTI", "XWAYS", "XSPLIT", "XNUDGE", "STICKY_WILD", "EXPANDING_MULTI"].includes(sym)) {
        div.classList.add("special");
    }
    if (sym === "STICKY_WILD") {
        div.classList.add("sticky");
    }
    if (sym === "EXPANDING_MULTI") {
        div.classList.add("expanding");
    }

    const img = document.createElement("img");
    img.src = getSymbolPath(sym);
    img.alt = sym;
    img.loading = "eager";
    img.onerror = () => {
        div.removeChild(img);
        div.textContent = sym;
    };
    div.appendChild(img);

    return div;
}

function renderReels(spin, animate = true) {
    reelsEl.innerHTML = "";
    const rows = 4;
    const cols = 6;

    for (let c = 0; c < cols; c++) {
        const colDiv = document.createElement("div");
        colDiv.className = "reel-column" + (animate ? " spinning" : "");

        for (let r = 0; r < rows; r++) {
            const idx = c * rows + r;
            const sym = spin.result[idx];
            const div = createSymbolElement(sym);
            colDiv.appendChild(div);
        }

        reelsEl.appendChild(colDiv);
    }

    if (animate) {
        const delay = turboMode ? 300 : 800;
        setTimeout(() => {
            document.querySelectorAll(".reel-column.spinning").forEach(col => {
                col.classList.remove("spinning");
                col.classList.add("bounce");
                playSound("reelStop");
                setTimeout(() => col.classList.remove("bounce"), 300);
            });
        }, delay);
    }
}

function renderHUD(spin) {
    modeLabel.textContent = spin.mode;
    betLabel.textContent = formatCurrency(spin.bet);
    multiLabel.textContent = `${spin.globalMulti.toFixed(2)}x`;
}

function showLoading(show) {
    showOverlay(loadingOverlay, show);
}

function showBonusIntro(show, text) {
    bonusText.textContent = text;
    showOverlay(bonusOverlay, show);
}

function showBigWin(amount) {
    bigWinText.textContent = `BIG WIN: ${formatCurrency(amount)}`;
    showOverlay(bigWinOverlay, true);
    setTimeout(() => showOverlay(bigWinOverlay, false), 3000);
}

function updateBalance(amount) {
    balance += amount;
    balanceLabel.textContent = formatCurrency(balance);
}

function setSpinButtons(enabled) {
    document.querySelectorAll(".controls button[data-mode]").forEach(btn => {
        btn.disabled = !enabled;
    });
    document.getElementById("turboBtn").disabled = !enabled;
    document.getElementById("autoPlayBtn").disabled = !enabled;
}

function highlightWins(spin) {
    const best = findBestWin(spin.result);
    if (best.win > 0 && best.symbol) {
        const positions = [];
        spin.result.forEach((s, i) => {
            if (s === best.symbol || s === "WILD" || s === "STICKY_WILD") {
                positions.push({ reel: Math.floor(i / 4), row: i % 4 });
            }
        });
        positions.forEach(pos => {
            const idx = pos.reel * 4 + pos.row;
            const col = reelsEl.children[pos.reel];
            if (col && col.children[pos.row]) {
                col.children[pos.row].classList.add("win");
            }
        });
    }
}

function findBestWin(result) {
    let bestWin = 0;
    let bestSymbol = null;
    let bestCount = 0;

    const linePayouts = {
        "A": 0.0628, "K": 0.0471, "Q": 0.0314, "J": 0.0314,
        "10": 0.0236, "9": 0.0157,
        "SKULL": 0.7850, "MASK": 0.6280, "GOLD_BAR": 1.5310
    };

    const symbolOrder = Object.keys(linePayouts);

    for (let row = 0; row < 4; row++) {
        const rowSymbols = [];
        for (let reel = 0; reel < 6; reel++) {
            rowSymbols.push(result[reel * 4 + row]);
        }

        const wilds = rowSymbols.filter(s => s === "WILD" || s === "STICKY_WILD").length;
        for (const symbol of symbolOrder) {
            const symCount = rowSymbols.filter(s => s === symbol).length;
            const count = symCount + wilds;
            if (count >= 3) {
                const win = linePayouts[symbol] * count;
                if (win > bestWin) {
                    bestWin = win;
                    bestSymbol = symbol;
                    bestCount = count;
                }
            }
        }

        if (bestWin === 0 && wilds >= 3) {
            const win = linePayouts["9"] * wilds;
            if (win > bestWin) {
                bestWin = win;
                bestSymbol = "WILD";
                bestCount = wilds;
            }
        }
    }

    return { win: bestWin, symbol: bestSymbol, count: bestCount };
}

function getCurrentBet(mode) {
    const baseBet = stakeEngineClient.betLevels && stakeEngineClient.betLevels.length > 0
        ? stakeEngineClient.betLevels[currentBetIndex]
        : 1.0;

    switch (mode) {
        case "feature_spin": return baseBet * 2;
        case "bonus_buy_base": return baseBet * 100;
        case "bonus_buy_super": return baseBet * 300;
        default: return baseBet;
    }
}

function changeBet(delta) {
    const levels = stakeEngineClient.betLevels && stakeEngineClient.betLevels.length > 0
        ? stakeEngineClient.betLevels
        : [1.0];
    currentBetIndex = Math.max(0, Math.min(levels.length - 1, currentBetIndex + delta));
    betLabel.textContent = formatCurrency(getCurrentBet(currentMode));
}

async function handleSpin(mode) {
    if (isSpinning) return;
    isSpinning = true;
    setSpinButtons(false);

    const bet = getCurrentBet(mode);

    if (balance < bet) {
        alert("Insufficient balance!");
        isSpinning = false;
        return;
    }

    showLoading(true);
    playSound("spin");

    const spinDelay = turboMode ? 200 : 600;
    await new Promise(r => setTimeout(r, spinDelay));

    if (stakeEngineClient.connected) {
        const playResult = await stakeEngineClient.play(mode, bet);
        if (!playResult.success) {
            alert(playResult.error?.statusMessage || "Bet failed");
            isSpinning = false;
            showLoading(false);
            return;
        }
        if (playResult.balance) {
            balance = playResult.balance.amount;
            balanceLabel.textContent = formatCurrency(balance);
        }
    }

    const spin = engine.spin(mode);
    currentMode = mode;

    renderReels(spin);
    renderHUD(spin);

    await new Promise(r => setTimeout(r, turboMode ? 200 : 600));

    showLoading(false);

    if (spin.win > 0) {
        winLabel.textContent = formatCurrency(spin.win);
        updateBalance(spin.win);
        highlightWins(spin);

        if (spin.win >= 50) {
            playSound("bigWin");
            showBigWin(spin.win);
        } else {
            playSound("win");
        }
    } else {
        winLabel.textContent = "0.00";
    }

    if (spin.bonus) {
        playSound("bonus");
        showBonusIntro(true, describeBonus(spin.bonus));
        setTimeout(() => showBonusIntro(false), 2500);
    }

    updateBalance(-bet);
    isSpinning = false;

    if (stakeEngineClient.connected) {
        await stakeEngineClient.endRound();
    }

    if (autoPlayCount > 0) {
        autoPlayCount--;
        if (autoPlayCount > 0) {
            setTimeout(() => handleSpin("base"), turboMode ? 400 : 1200);
        } else {
            document.getElementById("autoPlayBtn").textContent = "AUTO";
            setSpinButtons(true);
        }
    } else {
        setSpinButtons(true);
    }
}

function initPaytable() {
    const payouts = [
        { symbol: "GOLD_BAR", name: "Gold Bar", "3": 1.53, "4": 3.06, "5": 7.65, "6": 15.30, tier: "premium" },
        { symbol: "MASK", name: "Mask", "3": 1.26, "4": 2.52, "5": 6.30, "6": 12.60, tier: "premium" },
        { symbol: "SKULL", name: "Skull", "3": 0.79, "4": 1.57, "5": 3.93, "6": 7.86, tier: "premium" },
        { symbol: "10", name: "10", "3": 0.24, "4": 0.47, "5": 1.18, "6": 2.36, tier: "low" },
        { symbol: "J", name: "J", "3": 0.31, "4": 0.63, "5": 1.57, "6": 3.14, tier: "low" },
        { symbol: "Q", name: "Q", "3": 0.31, "4": 0.63, "5": 1.57, "6": 3.14, tier: "low" },
        { symbol: "K", name: "K", "3": 0.47, "4": 0.94, "5": 2.36, "6": 4.71, tier: "low" },
        { symbol: "A", name: "A", "3": 0.63, "4": 1.26, "5": 3.14, "6": 6.28, tier: "low" },
    ];

    const tbody = document.getElementById("paytableBody");
    payouts.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><img src="${getSymbolPath(p.symbol)}" alt="${p.name}" class="paytable-symbol"><span>${p.name}</span></td>
            <td>${p["3"]}</td>
            <td>${p["4"]}</td>
            <td>${p["5"]}</td>
            <td>${p["6"]}</td>
        `;
        tbody.appendChild(tr);
    });
}

function initControls() {
    document.querySelectorAll(".controls button[data-mode]").forEach(btn => {
        btn.addEventListener("click", () => {
            playSound("click");
            handleSpin(btn.dataset.mode);
        });
    });

    const turboBtn = document.getElementById("turboBtn");
    turboBtn.addEventListener("click", () => {
        playSound("click");
        turboMode = !turboMode;
        turboBtn.classList.toggle("active", turboMode);
        turboBtn.textContent = turboMode ? "TURBO: ON" : "TURBO";
    });

    const autoPlayBtn = document.getElementById("autoPlayBtn");
    autoPlayBtn.addEventListener("click", () => {
        playSound("click");
        if (autoPlayCount > 0) {
            autoPlayCount = 0;
            autoPlayBtn.textContent = "AUTO";
        } else {
            autoPlayCount = 50;
            autoPlayBtn.textContent = "STOP";
            handleSpin("base");
        }
    });

    document.getElementById("betDown").addEventListener("click", () => {
        playSound("click");
        changeBet(-1);
    });

    document.getElementById("betUp").addEventListener("click", () => {
        playSound("click");
        changeBet(1);
    });

    document.getElementById("paytableBtn").addEventListener("click", () => {
        playSound("click");
        showOverlay(paytableOverlay, true);
    });

    document.getElementById("gameInfoBtn").addEventListener("click", () => {
        playSound("click");
        showOverlay(gameInfoOverlay, true);
    });

    document.getElementById("closePaytable").addEventListener("click", () => {
        playSound("click");
        showOverlay(paytableOverlay, false);
    });

    document.getElementById("closeGameInfo").addEventListener("click", () => {
        playSound("click");
        showOverlay(gameInfoOverlay, false);
    });

    document.getElementById("closeBigWin").addEventListener("click", () => {
        playSound("click");
        showOverlay(bigWinOverlay, false);
    });

    document.getElementById("closeBonus").addEventListener("click", () => {
        playSound("click");
        showOverlay(bonusOverlay, false);
    });

    document.getElementById("closeError").addEventListener("click", () => {
        playSound("click");
        showOverlay(errorOverlay, false);
    });
}

async function initStakeEngine() {
    const connected = stakeEngineClient.init();
    const statusEl = document.getElementById("stakeengineStatus");

    if (connected) {
        await stakeEngineClient.authenticate();

        if (stakeEngineClient.error) {
            statusEl.textContent = `Auth Error: ${stakeEngineClient.error.statusMessage || "Unknown"}`;
            statusEl.classList.add("error");
            stakeEngineClient.connected = false;
        } else {
            statusEl.textContent = "Connected to StakeEngine";
            statusEl.classList.add("connected");
            balance = stakeEngineClient.balance.amount;
            balanceLabel.textContent = formatCurrency(balance);
            currentBetIndex = 0;

            if (stakeEngineClient.betLevels && stakeEngineClient.betLevels.length > 0) {
                betLabel.textContent = formatCurrency(stakeEngineClient.betLevels[0]);
            }

            if (stakeEngineClient.jurisdiction) {
                const j = stakeEngineClient.jurisdiction;
                if (j.disabledTurbo) {
                    document.getElementById("turboBtn").style.display = "none";
                }
                if (j.disabledAutoplay) {
                    document.getElementById("autoPlayBtn").style.display = "none";
                }
                if (j.disabledBuyFeature) {
                    document.querySelectorAll(".bonus-buy-group button").forEach(btn => {
                        btn.style.display = "none";
                    });
                }
            }
        }
    } else {
        statusEl.textContent = "Demo Mode (No StakeEngine Session)";
        if (stakeEngineClient.betLevels && stakeEngineClient.betLevels.length > 0) {
            betLabel.textContent = formatCurrency(stakeEngineClient.betLevels[0]);
        }
    }
}

async function init() {
    soundEngine.init();
    initPaytable();
    initControls();
    await initStakeEngine();
    balanceLabel.textContent = formatCurrency(balance);

    if (stakeEngineClient.connected && stakeEngineClient.round) {
        const round = stakeEngineClient.round;
        const isActive = round.state && round.state !== "completed" && round.state !== "cancelled";
        if (isActive) {
            modeLabel.textContent = round.mode ? round.mode.toLowerCase() : "base";
            showLoading(false);
            return;
        }
    }

    handleSpin("base");
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
