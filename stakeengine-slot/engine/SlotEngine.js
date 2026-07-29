import RNG from "./RNG.js";
import ReelStrips from "./ReelStrips.js";
import Paytable from "./Paytable.js";
import { GAME_CONFIG } from "./GameConfig.js";
import { checkBonus, applyFeatureModifiers } from "./Features.js";

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
        const result = this._rollReels();
        const win = this._calculateWin(result, persistentMulti);

        const bonus = (mode === "base" || mode === "feature_spin")
            ? checkBonus(result)
            : null;

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