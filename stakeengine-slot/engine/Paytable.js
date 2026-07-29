import { GAME_CONFIG } from "./GameConfig.js";

const LINE_PAYOUTS = {
    "A": 1,
    "K": 1,
    "Q": 0.8,
    "J": 0.8,
    "10": 0.5,
    "9": 0.5,
    "SKULL": 5,
    "MASK": 3,
    "GOLD_BAR": 10
};

function countSymbol(result, symbol) {
    return result.filter(s => s === symbol || s === "WILD").length;
}

function baseLineWin(result) {
    let win = 0;
    for (const symbol of Object.keys(LINE_PAYOUTS)) {
        const count = countSymbol(result, symbol);
        if (count >= 3) {
            win += LINE_PAYOUTS[symbol] * count;
        }
    }
    return win;
}

function applyMultipliers(result, win) {
    const multis = result.filter(s => s === "MULTI").length;
    if (multis === 0) return win;
    const totalMulti = 1 + multis * 2; // 1x base + 2x per MULTI
    return win * totalMulti;
}

export default {
    calculate(result) {
        let win = baseLineWin(result);
        win = applyMultipliers(result, win);
        return win;
    }
};