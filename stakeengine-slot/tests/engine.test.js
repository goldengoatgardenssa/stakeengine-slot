import { describe, test } from 'node:test';
import assert from 'node:assert';
import SlotEngine from "../engine/SlotEngine.js";

describe("SlotEngine", () => {
    test("spin returns result + win", () => {
        const engine = new SlotEngine({
            reels: [["A","K"],["A","K"],["A","K"]],
            paytable: { calculate: () => 0 }
        });

        const spin = engine.spin();
        assert.strictEqual(spin.result.length, 3);
    });
});