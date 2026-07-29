export const GAME_CONFIG = {
    name: "Hybrid NoLimit x Hacksaw",
    reels: 6,
    rows: 4,
    directions: ["left-to-right", "right-to-left"],

    baseBet: 1.0,

    targetRtp: 0.93,
    maxRtpAllowed: 0.945,

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
        superBonus: 5
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
        baseMultiplier: 0.96,
        premiumMultiplier: 1.0,
        specialFrequencyBoost: 1.0
    }
};