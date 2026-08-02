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
    const engine = new SlotEngine({ seed: 0xDEADBEEF });
    const rounds = [];
    let totalWin = 0;

    for (let i = 0; i < n; i++) {
        const spin = engine._spinBase(1.0, mode);
        const win = spin.win;
        totalWin += win;
        const symbols = spin.result.slice(0, 6);

        const isBonus = mode !== "base" && mode !== "feature_spin";
        const events = [];

        if (isBonus) {
            const bonusType = mode === "bonus_buy_base" ? "BONUS_3_SCATTER" :
                              mode === "bonus_buy_super" ? "SUPER_BONUS" :
                              mode.toUpperCase().replace("_", "_");
            events.push(
                { index: 0, type: "freeSpinTrigger", totalFs: spin.bonus ? 10 : 8, positions: [] },
                { index: 1, type: "reveal", symbols, mode, gameType: "freegame" },
                { index: 2, type: "setTotalWin", amount: Math.round(win * 100) },
                { index: 3, type: "finalWin", amount: Math.round(win * 100) }
            );
        } else {
            events.push(
                { index: 0, type: "reveal", symbols, mode, gameType: "basegame" },
                { index: 1, type: "setTotalWin", amount: Math.round(win * 100) },
                { index: 2, type: "finalWin", amount: Math.round(win * 100) }
            );
        }

        rounds.push({
            id: i + 1,
            events,
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
    const n = BigInt(rounds.length);
    const baseProb = UINT64_MAX / n;
    const remainder = UINT64_MAX % n;
    const fd = fs.openSync(path, 'w');
    for (let i = 0; i < rounds.length; i++) {
        const prob = baseProb + (i < Number(remainder) ? 1n : 0n);
        fs.writeSync(fd, `${rounds[i].id},${prob.toString()},${rounds[i].payoutMultiplier}\n`);
    }
    fs.closeSync(fd);
}

function main() {
    const outputDir = "stakeengine_package";
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    MODES.forEach(mode => {
        const { rounds, rtp } = simulateMode(mode, ROUNDS_PER_MODE);
        console.log(`Mode ${mode.padEnd(20)} RTP: ${(rtp * 100).toFixed(2)}%  (${rounds.length} rounds)`);
        writeJsonl(`${outputDir}/${mode}.jsonl`, rounds);
        writeCsv(`${outputDir}/lookup_${mode}.csv`, rounds);
    });

    console.log("\nMath files generated in stakeengine_package/");
}

main();
