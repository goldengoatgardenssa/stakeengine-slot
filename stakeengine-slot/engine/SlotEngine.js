import RNG from "./RNG.js";
import ReelStrips from "./ReelStrips.js";
import Paytable from "./Paytable.js";
import { GAME_CONFIG } from "./GameConfig.js";
import { checkBonus, applyFreeSpinMode } from "./Features.js";

export default class SlotEngine {
    constructor() {
        this.rng = new RNG();
        this.state = {
            mode: "base",
            remainingSpins: 0,
            globalMulti: 1
        };
    }

    _rollReels() {
        return ReelStrips.map(strip => {
            const index = this.rng.randomIndex(strip.length);
            return strip[index];
        });
    }

    _calculateWin(result) {
        let win = Paytable.calculate(result);
        win *= this.state.globalMulti;
        return win;
    }

    spin(mode = "base") {
        let costMultiplier = 1.0;

        if (mode === "feature_spin") {
            costMultiplier = GAME_CONFIG.featureSpins.costMultiplier;
        } else if (mode === "bonus_buy_base") {
            costMultiplier = GAME_CONFIG.bonusBuy.baseBonusCost;
        } else if (mode === "bonus_buy_super") {
            costMultiplier = GAME_CONFIG.bonusBuy.superBonusCost;
        }

        const bet = GAME_CONFIG.betSize * costMultiplier;
        const result = this._rollReels();
        let win = this._calculateWin(result);

        let bonus = null;

        if (mode === "feature_spin" || mode === "base") {
            bonus = checkBonus(result);
            if (bonus) {
                this.state = applyFreeSpinMode(this.state, bonus);
            }
        }

        this.state.mode = mode;

        return {
            result,
            win,
            bet,
            mode,
            bonus
        };
    }
}