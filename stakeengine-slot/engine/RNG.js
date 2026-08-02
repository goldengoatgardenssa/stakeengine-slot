export default class RNG {
    constructor(seed = 12345) {
        this.seed = seed >>> 0;
    }

    // Mulberry32 — fast, high-quality 32-bit seeded PRNG
    _next() {
        this.seed |= 0;
        this.seed = this.seed + 0x6D2B79F5 | 0;
        let t = Math.imul(this.seed ^ this.seed >>> 15, 1 | this.seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    randomIndex(max) {
        return Math.floor(this._next() * max);
    }
}
