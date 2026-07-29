import fs from "fs";

const MODES = ["base","bonus_3","bonus_4","bonus_5","super_bonus"];

function parseCsv(path) {
    const data = fs.readFileSync(path, "utf8").trim().split("\n").slice(1);
    return data.map(line => {
        const [id, probability, payoutMultiplier] = line.split(",");
        return {
            id: Number(id),
            probability: Number(probability),
            payout: Number(payoutMultiplier) / 100
        };
    });
}

function main() {
    MODES.forEach(mode => {
        const csvPath = `math/lookup_${mode}.csv`;
        if (!fs.existsSync(csvPath)) {
            console.log(`Missing CSV for mode: ${mode}`);
            return;
        }

        const rows = parseCsv(csvPath);
        const payouts = rows.map(r => r.payout);
        const mean = payouts.reduce((a,b)=>a+b,0) / payouts.length;
        const variance = payouts.reduce((a,b)=>a + Math.pow(b - mean, 2), 0) / payouts.length;
        const vol = Math.sqrt(variance);

        console.log(`Mode: ${mode}`);
        console.log(`  Mean payout: ${mean.toFixed(4)}`);
        console.log(`  Volatility: ${vol.toFixed(4)}`);
        console.log("");
    });

    console.log("Use volatility + mean to shape hit rate and feature frequency.");
}

main();