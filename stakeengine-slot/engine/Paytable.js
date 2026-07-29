import { GAME_CONFIG } from "./GameConfig.js";

const LINE_PAYOUTS = {
    "A": 0.205,
    "K": 0.154,
    "Q": 0.103,
    "J": 0.103,
    "10": 0.077,
    "9": 0.052,
    "SKULL": 2.56,
    "MASK": 2.04,
    "GOLD_BAR": 5.00
};

function countSymbol(result, symbol) {
    return result.filter(s => s === symbol || s === "WILD" || s === "STICKY_WILD").length;
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
    let multi = 1;

    const multis = result.filter(s => s === "MULTI").length;
    multi += multis * 0.01;

    const expanding = result.filter(s => s === "EXPANDING_MULTI").length;
    multi += expanding * 0.02;

    multi = Math.min(multi, 1.5);

    return win * multi;
}

export default {
    calculate(result) {
        let win = baseLineWin(result);
        win = applyMultipliers(result, win);
        return win;
    }
};