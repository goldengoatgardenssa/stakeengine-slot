export const GAME_CONFIG = {
    name: "Hybrid NoLimit x Hacksaw",
    reels: 6,
    rows: 4,
    directions: ["left-to-right", "right-to-left"],

    betSize: 1,

    // Example RTP cap – adjust to Stake/StakeEngine max if needed
    targetRtp: 0.97,
    maxRtpAllowed: 0.98,

    symbols: {
        REGULAR: ["A","K","Q","J","10","9"],
        PREMIUM: ["SKULL","MASK","GOLD_BAR"],
        SPECIAL: ["SCATTER","WILD","MULTI"]
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
    }
};