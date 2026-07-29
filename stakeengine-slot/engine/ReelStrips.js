import { GAME_CONFIG } from "./GameConfig.js";

const { REGULAR, PREMIUM, SPECIAL } = GAME_CONFIG.symbols;

// Weighted strip with advanced features - tuned for ~94% RTP
const baseStrip = [
    ...REGULAR,
    ...REGULAR,
    ...Array(8).fill("A"),
    ...Array(7).fill("K"),
    ...Array(5).fill("Q"),
    ...Array(4).fill("J"),
    ...Array(4).fill("10"),
    ...Array(4).fill("9"),

    ...PREMIUM,
    ...Array(5).fill("SKULL"),
    ...Array(4).fill("MASK"),
    ...Array(1).fill("GOLD_BAR"),

    "SCATTER","SCATTER","SCATTER",
    "WILD","WILD","WILD",
    "MULTI","MULTI",
    "XNUDGE",
    "STICKY_WILD",
    "EXPANDING_MULTI"
];

export default [
    [...baseStrip],
    [...baseStrip],
    [...baseStrip],
    [...baseStrip],
    [...baseStrip],
    [...baseStrip]
];