import { GAME_CONFIG } from "./GameConfig.js";

function countScatters(result) {
    return result.filter(s => s === "SCATTER").length;
}

export function checkBonus(result) {
    const scatters = countScatters(result);

    if (scatters >= GAME_CONFIG.scattersRequired.superBonus) {
        return { type: "SUPER_BONUS", freeSpins: 4, baseMulti: 1.0, maxMulti: 2.0 };
    }
    if (scatters >= 5) {
        return { type: "BONUS_5_SCATTER", freeSpins: 3, baseMulti: 1.0, maxMulti: 1.5 };
    }
    if (scatters >= 4) {
        return { type: "BONUS_4_SCATTER", freeSpins: 3, baseMulti: 1.0, maxMulti: 1.5 };
    }
    if (scatters >= 3) {
        return { type: "BONUS_3_SCATTER", freeSpins: 3, baseMulti: 1.0, maxMulti: 1.5 };
    }
    return null;
}

export function applyFeatureModifiers(result) {
    const modified = [...result];

    // xWays: expand one symbol into two of same type (reduced impact)
    if (modified.includes("XWAYS")) {
        const idx = modified.findIndex(s => s !== "XWAYS");
        if (idx >= 0) {
            modified.splice(idx, 0, modified[idx]);
        }
    }

    // xSplit: duplicate a premium symbol (reduced impact)
    if (modified.includes("XSPLIT")) {
        const idx = modified.findIndex(s => ["SKULL","MASK","GOLD_BAR"].includes(s));
        if (idx >= 0) {
            modified.splice(idx, 0, modified[idx]);
        }
    }

    // xNudge: treat one WILD as sticky (reduced impact)
    const nudgeIdx = modified.findIndex(s => s === "XNUDGE");
    if (nudgeIdx >= 0) {
        const wildIdx = modified.findIndex(s => s === "WILD");
        if (wildIdx >= 0) {
            modified[wildIdx] = "STICKY_WILD";
        }
    }

    return modified;
}