import fs from "fs";

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

const UINT64_MAX = 2n ** 64n;

function parseCsv(path) {
    const data = fs.readFileSync(path, "utf8").trim().split("\n").slice(1);
    return data.map(line => {
        const [id, probability, payoutMultiplier] = line.split(",");
        return {
            id: Number(id),
            probability: BigInt(probability),
            payoutMultiplier: Number(payoutMultiplier)
        };
    });
}

function calculateRTP(rows) {
    let rtp = 0n;
    for (const r of rows) {
        rtp += r.probability * BigInt(r.payoutMultiplier);
    }
    return Number(rtp) / Number(UINT64_MAX) / 100;
}

function calculateVolatility(rows) {
    const payouts = rows.map(r => r.payoutMultiplier / 100);
    const mean = payouts.reduce((a, b) => a + b, 0) / payouts.length;
    const variance = payouts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / payouts.length;
    return Math.sqrt(variance);
}

function main() {
    MODES.forEach(mode => {
        const csvPath = `stakeengine_package/lookup_${mode}.csv`;
        if (!fs.existsSync(csvPath)) {
            console.log(`Missing CSV for mode: ${mode}`);
            return;
        }

        const rows = parseCsv(csvPath);
        const rtp = calculateRTP(rows);
        const vol = calculateVolatility(rows);

        console.log(`Mode: ${mode}`);
        console.log(`  RTP: ${(rtp * 100).toFixed(4)}%`);
        console.log(`  Volatility: ${vol.toFixed(4)}`);
        console.log("");
    });
}

main();