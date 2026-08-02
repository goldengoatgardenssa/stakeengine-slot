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
        modeTrim: {
            base:            1.017,
            feature_spin:    1.017,
            bonus_3:         1.017,
            bonus_4:         1.017,
            bonus_5:         1.017,
            super_bonus:     1.017,
            bonus_buy_base:  7.000,
            bonus_buy_super: 8.500
        }
    }
};