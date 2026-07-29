import SlotEngine from "../engine/SlotEngine.js";
import ReelStrips from "../engine/ReelStrips.js";
import Paytable from "../engine/Paytable.js";

export function simulate(spinCount = 10000) {
    const engine = new SlotEngine({
        reels: ReelStrips,
        paytable: Paytable
    });

    const spins = [];
    for (let i = 0; i < spinCount; i++) {
        spins.push(engine.spin());
    }

    return spins;
}