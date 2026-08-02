// Payouts tuned for 96% base RTP target (within StakeEngine 90-96.70% range)
const LINE_PAYOUTS = {
    "A":        0.1120,
    "K":        0.0840,
    "Q":        0.0560,
    "J":        0.0560,
    "10":       0.0420,
    "9":        0.0280,
    "SKULL":    1.400,
    "MASK":     1.120,
    "GOLD_BAR": 2.730
};

const SYMBOL_ORDER = Object.keys(LINE_PAYOUTS);

function baseLineWin(result) {
    const wilds = result.filter(s => s === "WILD" || s === "STICKY_WILD").length;
    let bestWin = 0;

    for (const symbol of SYMBOL_ORDER) {
        const symCount = result.filter(s => s === symbol).length;
        const count = symCount + wilds;
        if (count >= 3) {
            const win = LINE_PAYOUTS[symbol] * count;
            if (win > bestWin) bestWin = win;
        }
    }

    // Wilds alone (no matching symbol) — pay as lowest symbol
    if (bestWin === 0 && wilds >= 3) {
        bestWin = LINE_PAYOUTS["9"] * wilds;
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
