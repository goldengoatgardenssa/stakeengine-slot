import fs from "fs";
import SlotEngine from "../engine/SlotEngine.js";
import { toMathRound } from "./RoundSerializer.js";

const MODES = [
    "base",
    "bonus_3",
    "bonus_4",
    "bonus_5",
    "super_bonus",
    "feature_spin",
    "bonus_buy_base",
    "bonus_buy_super"
];

const ROUNDS_PER_MODE = 10000;

function simulateMode(mode) {
    const engine = new SlotEngine();
    const rounds = [];
    let totalWin = 0;
    let totalBet = 0;

    for (let i = 0; i < ROUNDS_PER_MODE; i++) {
        const spin = engine.spin(mode);
        totalWin += spin.win;
        totalBet += spin.bet;
        rounds.push(toMathRound(i, spin));
    }

    const rtp = totalBet > 0 ? totalWin / totalBet : 0;

    return { rounds, rtp };
}

function writeJsonl(path, rounds) {
    const stream = fs.createWriteStream(path);
    for (const r of rounds) {
        stream.write(JSON.stringify(r) + "\n");
    }
    stream.end();
}

function writeCsv(path, rounds) {
    const stream = fs.createWriteStream(path);
    stream.write("simulation_id,probability,payoutMultiplier\n");

    const count = rounds.length;
    const prob = 1 / count;

    for (const r of rounds) {
        stream.write(`${r.id},${prob},${r.payoutMultiplier}\n`);
    }
    stream.end();
}

function main() {
    MODES.forEach(mode => {
        const { rounds, rtp } = simulateMode(mode);
        console.log(`Mode ${mode} RTP: ${rtp.toFixed(4)}`);

        writeJsonl(`math/${mode}.jsonl`, rounds);
        writeCsv(`math/lookup_${mode}.csv`, rounds);
    });

    console.log("Math files generated. Compress JSONL to .jsonl.zst externally.");
}

main();