import { describe, test } from 'node:test';
import assert from 'node:assert';
import ReelStrips from "../engine/ReelStrips.js";

describe("ReelStrips", () => {
    test("reel strips contain symbols", () => {
        assert.ok(ReelStrips[0].length > 0);
    });
});