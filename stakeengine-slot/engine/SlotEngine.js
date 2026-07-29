import RNG from "./RNG.js";
import ReelStrips from "./ReelStrips.js";
import Paytable from "./Paytable.js";
import { GAME_CONFIG } from "./GameConfig.js";
import { checkBonus, applyFeatureModifiers } from "./Features.js";
import { runBonusRound } from "./BonusFlow.js";

const BONUS_MODE_MAP = {
    bonus_3: { type: "BONUS_3_SCATTER", freeSpins: 5, baseMulti: 1.0 },
    bonus_4: { type: "BONUS_4_SCATTER", freeSpins: 7, baseMulti: 1.0 },
    bonus_5: { type: "BONUS_5_SCATTER", freeSpins: 8, baseMulti: 1.0 },
    super_bonus: { type: "SUPER_BONUS", freeSpins: 9, baseMulti: 1.0 },
    bonus_buy_base: { type: "BONUS_3_SCATTER", freeSpins: 5, baseMulti: 1.0 },
    bonus_buy_super: { type: "SUPER_BONUS", freeSpins: 9, baseMulti: 1.0 }
};

export default class SlotEngine {
    constructor(config = {}) {
        this.rng = new RNG();
        this.state = {
            mode: "base",
            globalMulti: 1.0
        };
        this.reels = config.reels || ReelStrips;
        this.config = config;
        this.paytable = config.paytable || Paytable;
    }

    _rollReels() {
        return this.reels.map(strip => {
            const index = this.rng.randomIndex(strip.length);
            return strip[index];
        });
    }

    _spinBase(persistentMulti = 1.0) {
        const result = this._rollReels();
        const tunedResult = applyFeatureModifiers(result);
        let win = this.paytable.calculate(tunedResult);
        win *= this.state.globalMulti * persistentMulti * (this.config.rtpTuning?.baseMultiplier || 1.0);
        const bonus = checkBonus(tunedResult);
        return { result: tunedResult, win, bonus };
    }

    _calculateWin(result, persistentMulti = 1.0) {
        const tunedResult = applyFeatureModifiers(result);
        let win = this.paytable.calculate(tunedResult);
        win *= this.state.globalMulti * persistentMulti * (this.config.rtpTuning?.baseMultiplier || 1.0);
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
            const bonusResult = runBonusRound(this, bonusConfig);
            result = bonusResult.results.length > 0
                ? bonusResult.results[bonusResult.results.length - 1].result
                : [];
            win = bonusResult.totalWin;
            bonus = { type: bonusConfig.type };
        } else {
            const baseSpin = this._spinBase(persistentMulti);
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
