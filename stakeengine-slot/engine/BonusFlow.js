import { GAME_CONFIG } from "./GameConfig.js";

export function runBonusRound(engine, bonus) {
    const results = [];
    let totalWin = 0;

    for (let i = 0; i < bonus.freeSpins; i++) {
        const spin = engine.spin(bonus.type);
        results.push(spin);
        totalWin += spin.win;

        // Retrigger logic
        if (spin.bonus && spin.bonus.type === bonus.type) {
            bonus.freeSpins += 2; // small retrigger
        }
    }

    return {
        bonusType: bonus.type,
        totalWin,
        spins: results
    };
}

export function describeBonus(bonus) {
    switch (bonus.type) {
        case "SUPER_BONUS":
            return "Super Bonus — highest volatility, persistent multiplier";
        case "BONUS_5_SCATTER":
            return "5 Scatter Bonus — high volatility";
        case "BONUS_4_SCATTER":
            return "4 Scatter Bonus — medium volatility";
        case "BONUS_3_SCATTER":
            return "3 Scatter Bonus — lower volatility";
        default:
            return "Unknown bonus type";
    }
}