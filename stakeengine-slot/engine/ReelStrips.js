import { GAME_CONFIG } from "./GameConfig.js";

// Strip tuned for 98% RTP target
// Total: 72 symbols per reel
const baseStrip = [
    // Regular symbols (low pay, high frequency)
    ...Array(9).fill("A"),
    ...Array(8).fill("K"),
    ...Array(6).fill("Q"),
    ...Array(5).fill("J"),
    ...Array(5).fill("10"),
    ...Array(5).fill("9"),

    // Premium symbols (high pay, lower frequency)
    ...Array(6).fill("SKULL"),
    ...Array(5).fill("MASK"),
    ...Array(2).fill("GOLD_BAR"),

    // Special symbols
    ...Array(5).fill("WILD"),
    ...Array(2).fill("STICKY_WILD"),
    ...Array(4).fill("SCATTER"),
    ...Array(3).fill("MULTI"),
    ...Array(2).fill("EXPANDING_MULTI"),
    ...Array(2).fill("XWAYS"),
    ...Array(1).fill("XSPLIT"),
    ...Array(2).fill("XNUDGE"),
];

export default [
    [...baseStrip],
    [...baseStrip],
    [...baseStrip],
    [...baseStrip],
    [...baseStrip],
    [...baseStrip]
];
