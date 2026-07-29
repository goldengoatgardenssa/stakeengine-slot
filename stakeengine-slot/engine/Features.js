import { GAME_CONFIG } from "./GameConfig.js";

function countScatters(result) {
    return result.filter(s => s === "SCATTER").length;
}

export function checkBonus(result) {
    const scatters = countScatters(result);

    if (scatters >= GAME_CONFIG.scattersRequired.superBonus) {
        return { type: "SUPER_BONUS", freeSpins: 15, multiBoost: 5 };
    }

    if (scatters >= 5) {
        return { type: "BONUS_5_SCATTER", freeSpins: 12, multiBoost: 3 };
    }

    if (scatters >= 4) {
        return { type: "BONUS_4_SCATTER", freeSpins: 10, multiBoost: 2 };
    }

    if (scatters >= 3) {
        return { type: "BONUS_3_SCATTER", freeSpins: 8, multiBoost: 1 };
    }

    return null;
}

export function applyFreeSpinMode(engineState, bonus) {
    return {
        ...engineState,
        mode: bonus.type,
        remainingSpins: bonus.freeSpins,
        globalMulti: bonus.multiBoost
    };
}