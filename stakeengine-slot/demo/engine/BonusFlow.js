export function runBonusRound(engine, bonus, mode = null) {
    const results = [];
    let totalWin = 0;

    let spins = bonus.freeSpins;
    let persistentMulti = bonus.baseMulti;
    const maxMulti = bonus.maxMulti || 5.0;

    for (let i = 0; i < spins; i++) {
        const spin = engine._spinBase(persistentMulti, mode);
        results.push(spin);
        totalWin += spin.win;

        if (spin.bonus && spin.bonus.type === bonus.type) {
            spins += 1;
        }

        const multiHits = spin.result.filter(
            s => s === "MULTI" || s === "EXPANDING_MULTI"
        ).length;
        if (multiHits > 0) {
            persistentMulti = Math.min(persistentMulti + multiHits * 0.1, maxMulti);
        }
    }

    return { bonusType: bonus.type, totalWin, spins, persistentMulti, results };
}

export function describeBonus(bonus) {
    switch (bonus.type) {
        case "SUPER_BONUS":
            return "Super Bonus — moderate volatility, persistent multiplier growth.";
        case "BONUS_5_SCATTER":
            return "5 Scatter Bonus — moderate volatility, good multiplier growth.";
        case "BONUS_4_SCATTER":
            return "4 Scatter Bonus — medium volatility.";
        case "BONUS_3_SCATTER":
            return "3 Scatter Bonus — lower volatility, more frequent.";
        default:
            return "Unknown bonus type";
    }
}
