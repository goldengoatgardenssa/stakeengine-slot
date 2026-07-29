import { describe, test } from 'node:test';
import assert from 'node:assert';
import { calculateRTP } from "../math/RTP.js";

describe("RTP", () => {
    test("RTP calculation works", () => {
        const spins = [
            { win: 10 },
            { win: 0 },
            { win: 5 }
        ];

        const rtp = calculateRTP(spins);
        assert.strictEqual(rtp, 5);
    });
});