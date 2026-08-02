// Payouts tuned for 96% base RTP target (within StakeEngine 90-96.70% range)
const LINE_PAYOUTS = {
    "A":        0.0628,
    "K":        0.0471,
    "Q":        0.0314,
    "J":        0.0314,
    "10":       0.0236,
    "9":        0.0157,
    "SKULL":    0.7850,
    "MASK":     0.6280,
    "GOLD_BAR": 1.5310
};

const SYMBOL_ORDER = Object.keys(LINE_PAYOUTS);

function baseLineWin(result) {
    let bestWin = 0;

    for (let row = 0; row < 4; row++) {
        const rowSymbols = [];
        for (let reel = 0; reel < 6; reel++) {
            rowSymbols.push(result[reel * 4 + row]);
        }

        const wilds = rowSymbols.filter(s => s === "WILD" || s === "STICKY_WILD").length;
        for (const symbol of SYMBOL_ORDER) {
            const symCount = rowSymbols.filter(s => s === symbol).length;
            const count = symCount + wilds;
            if (count >= 3) {
                const win = LINE_PAYOUTS[symbol] * count;
                if (win > bestWin) bestWin = win;
            }
        }

        if (bestWin === 0 && wilds >= 3) {
            const win = LINE_PAYOUTS["9"] * wilds;
            if (win > bestWin) bestWin = win;
        }
    }

    return bestWin;
}

function applyMultipliers(result, win) {
    let multi = 1;

    const multis = result.filter(s => s === "MULTI").length;
    multi += multis * 0.15;

    const expanding = result.filter(s => s === "EXPANDING_MULTI").length;
    multi += expanding * 0.3;

    // Cap at 3x on base spins
    multi = Math.min(multi, 3.0);

    return win * multi;
}

export default {
    calculate(result) {
        let win = baseLineWin(result);
        win = applyMultipliers(result, win);
        return win;
    }
};
