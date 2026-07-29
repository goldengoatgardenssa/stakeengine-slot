import { GAME_CONFIG } from "./GameConfig.js";

const { REGULAR, PREMIUM, SPECIAL } = GAME_CONFIG.symbols;

const baseStrip = [
    ...REGULAR,
    ...PREMIUM,
    ...SPECIAL,
    ...Array(10).fill("A"),
    ...Array(8).fill("K"),
    ...Array(5).fill("SCATTER"),
    ...Array(7).fill("WILD"),
    ...Array(6).fill("MULTI")
];

export default [
    [...baseStrip],
    [...baseStrip],
    [...baseStrip],
    [...baseStrip],
    [...baseStrip],
    [...baseStrip] // 6 reels
];