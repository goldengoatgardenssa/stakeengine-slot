import RNG from "./RNG.js";
import ReelStrips from "./ReelStrips.js";
import Paytable from "./Paytable.js";
import { GAME_CONFIG } from "./GameConfig.js";
import { checkBonus, applyFeatureModifiers } from "./Features.js";
import { runBonusRound } from "./BonusFlow.js";

const BONUS_MODE_MAP = {
    bonus_3: { type: "BONUS_3_SCATTER", freeSpins: 3,  baseMulti: 1.0, maxMulti: 1.5 },
    bonus_4: { type: "BONUS_4_SCATTER", freeSpins: 3,  baseMulti: 1.0, maxMulti: 1.5 },
    bonus_5: { type: "BONUS_5_SCATTER", freeSpins: 3,  baseMulti: 1.0, maxMulti: 1.5 },
    super_bonus:     { type: "SUPER_BONUS",      freeSpins: 4,  baseMulti: 1.0, maxMulti: 2.0 },
    bonus_buy_base:  { type: "BONUS_3_SCATTER",  freeSpins: 3,  baseMulti: 1.0, maxMulti: 1.5 },
    bonus_buy_super: { type: "SUPER_BONUS",      freeSpins: 4,  baseMulti: 1.0, maxMulti: 2.0 }
};

export default class SlotEngine {
    constructor(config = {}) {
        this.rng = new RNG(config.seed !== undefined ? config.seed : 12345);
        this.state = {
            mode: "base",
            globalMulti: 1.0
        };
        this.reels = config.reels || ReelStrips;
        this.config = config;
        this.paytable = config.paytable || Paytable;
    }

    _rollReels() {
        const result = [];
        for (const strip of this.reels) {
            const startIndex = this.rng.randomIndex(strip.length);
            for (let row = 0; row < 4; row++) {
                result.push(strip[(startIndex + row) % strip.length]);
            }
        }
        return result;
    }

    _spinBase(persistentMulti = 1.0, mode = null) {
        const result = this._rollReels();
        const tunedResult = applyFeatureModifiers(result);
        let win = this.paytable.calculate(tunedResult);
        const trim = mode && GAME_CONFIG.rtpTuning.modeTrim[mode] || 1.0;
        win *= this.state.globalMulti * persistentMulti * trim;
        const bonus = checkBonus(tunedResult);
        return { result: tunedResult, win, bonus };
    }

    _calculateWin(result, persistentMulti = 1.0) {
        const tunedResult = applyFeatureModifiers(result);
        let win = this.paytable.calculate(tunedResult);
        win *= this.state.globalMulti * persistentMulti;
        return win;
    }

    spin(mode = "base", persistentMulti = 1.0) {
        let costMultiplier = 1.0;

        if (mode === "feature_spin") {
            costMultiplier = GAME_CONFIG.featureSpins.costMultiplier;
        } else if (mode === "bonus_buy_base") {
            costMultiplier = GAME_CONFIG.bonusBuy.baseBonusCost;
        } else if (mode === "bonus_buy_super") {
            costMultiplier = GAME_CONFIG.bonusBuy.superBonusCost;
        }

        const bet = GAME_CONFIG.baseBet * costMultiplier;
        let result, win, bonus;

        const bonusConfig = BONUS_MODE_MAP[mode];
        if (bonusConfig) {
            const bonusResult = runBonusRound(this, bonusConfig, mode);
            result = bonusResult.results.length > 0
                ? bonusResult.results[bonusResult.results.length - 1].result
                : this._rollReels();
            win = bonusResult.totalWin;
            bonus = { type: bonusConfig.type };
        } else {
            const baseSpin = this._spinBase(persistentMulti, mode);
            result = baseSpin.result;
            win = baseSpin.win;
            bonus = baseSpin.bonus;
        }

        this.state.mode = mode;

        return {
            result,
            win,
            bet,
            mode,
            bonus,
            globalMulti: this.state.globalMulti
        };
    }
}
