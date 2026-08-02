export const GAME_CONFIG = {
    name: "Secure The Bag PERP Edition",
    reels: 6,
    rows: 4,
    directions: ["left-to-right", "right-to-left"],

    baseBet: 1.0,

    targetRtp: 0.98,
    maxRtpAllowed: 0.985,

    symbols: {
        REGULAR: ["A","K","Q","J","10","9"],
        PREMIUM: ["SKULL","MASK","GOLD_BAR"],
        SPECIAL: [
            "SCATTER",
            "WILD",
            "MULTI",
            "XWAYS",
            "XSPLIT",
            "XNUDGE",
            "STICKY_WILD",
            "EXPANDING_MULTI"
        ]
    },

    scattersRequired: {
        baseBonus: [3, 4, 5],
        superBonus: 6
    },

    bonusBuy: {
        baseBonusCost: 100,
        superBonusCost: 300
    },

    featureSpins: {
        enabled: true,
        costMultiplier: 2,
        bonusChanceBoost: 3
    },

    rtpTuning: {
        baseMultiplier: 1.0,
        premiumMultiplier: 1.0,
        specialFrequencyBoost: 1.0,
        // Per-mode trim to keep all modes within ±0.25% of 95.5% target
        modeTrim: {
            base:            1.0,
            feature_spin:    1.0,
            bonus_3:         1.0,
            bonus_4:         1.0,
            bonus_5:         1.0,
            super_bonus:     1.0,
            bonus_buy_base:  1.0,
            bonus_buy_super: 1.0
        }
    }
};