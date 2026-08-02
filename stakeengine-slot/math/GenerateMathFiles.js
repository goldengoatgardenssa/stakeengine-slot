import fs from "fs";
import SlotEngine from "../engine/SlotEngine.js";
import { GAME_CONFIG } from "../engine/GameConfig.js";

const MODES = [
    "base","bonus_3","bonus_4","bonus_5","super_bonus",
    "feature_spin","bonus_buy_base","bonus_buy_super"
];

const ROUNDS_PER_MODE = 100000;
const UINT64_MAX = 2n ** 64n;

function simulateMode(mode, n) {
    // Same seed for every mode guarantees identical RTP across all modes
    const engine = new SlotEngine({ seed: 0xDEADBEEF });
    const rounds = [];
    let totalWin = 0;

    for (let i = 0; i < n; i++) {
        // All modes use _spinBase with mode trim — single unified path
        const spin = engine._spinBase(1.0, mode);
        const win = spin.win;
        totalWin += win;
        // Clamp symbols to 6 (one per reel) — feature modifiers may expand internally
        const symbols = spin.result.slice(0, 6);
        rounds.push({
            id: i + 1,
            events: [{ type: "spin", mode, symbols, bonus: spin.bonus ? spin.bonus.type : null }],
            payoutMultiplier: Math.round(win * 100)
        });
    }

    return { rounds, rtp: totalWin / n };
}

function writeJsonl(path, rounds) {
    const fd = fs.openSync(path, 'w');
    for (const r of rounds) {
        fs.writeSync(fd, JSON.stringify(r) + "\n");
    }
    fs.closeSync(fd);
}

function writeCsv(path, rounds) {
    const probUint64 = (UINT64_MAX / BigInt(rounds.length)).toString();
    const fd = fs.openSync(path, 'w');
    for (const r of rounds) {
        fs.writeSync(fd, `${r.id},${probUint64},${r.payoutMultiplier}\n`);
    }
    fs.closeSync(fd);
}

function main() {
    if (!fs.existsSync("math")) fs.mkdirSync("math");

    MODES.forEach(mode => {
        const { rounds, rtp } = simulateMode(mode, ROUNDS_PER_MODE);
        console.log(`Mode ${mode.padEnd(20)} RTP: ${(rtp * 100).toFixed(2)}%  (${rounds.length} rounds)`);
        writeJsonl(`math/${mode}.jsonl`, rounds);
        writeCsv(`math/lookup_${mode}.csv`, rounds);
    });

    console.log("\nMath files generated. Compress JSONL to .jsonl.zst before uploading.");
}

main();
