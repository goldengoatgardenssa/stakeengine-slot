export default class SlotEngine {
    constructor() {
        this.reelsCount = 6;
        this.rowsCount = 4;
        
        // Symbol weight matrix tuned for high-volatility hybrid mechanics
        this.symbolWeights = {
            "GOLD_BAR": 2,
            "MASK": 3,
            "SKULL": 5,
            "A": 10,
            "K": 12,
            "Q": 15,
            "J": 15,
            "10": 18,
            "9": 20,
            "WILD": 4,
            "SCATTER": 3,
            "MULTI": 2,
            "XWAYS": 2
        };
    }

    getRandomSymbol(mode) {
        const keys = Object.keys(this.symbolWeights);
        const totalWeight = keys.reduce((sum, key) => sum + this.symbolWeights[key], 0);
        let random = Math.random() * totalWeight;

        for (const key of keys) {
            if (random < this.symbolWeights[key]) {
                return key;
            }
            random -= this.symbolWeights[key];
        }
        return "A";
    }

    spin(mode = "base") {
        const totalSlots = this.reelsCount * this.rowsCount;
        let result = [];

        for (let i = 0; i < totalSlots; i++) {
            result.push(this.getRandomSymbol(mode));
        }

        // Calculate a simulated win amount based on matched hybrid premiums
        let win = 0;
        const baseMultiplier = mode === "bonus_buy_super" ? 5.0 : (mode === "feature_spin" ? 2.0 : 1.0);
        
        if (Math.random() < 0.32) { // 32% hit frequency rate
            const multipliers = [0.5, 1.2, 2.5, 5.0, 15.0, 50.0];
            const randMult = multipliers[Math.floor(Math.random() * multipliers.length)];
            win = randMult * baseMultiplier;
        }

        // Check for bonus trigger (3 or more scatters)
        const scatterCount = result.filter(s => s === "SCATTER").length;
        const bonus = scatterCount >= 3 ? { type: "free_spins", spins: 10 } : null;

        return {
            result,
            win: Number(win.toFixed(2)),
            mode,
            bet: 1.00,
            globalMulti: 1.0 + (bonus ? 2.0 : 0.0),
            bonus
        };
    }
}
