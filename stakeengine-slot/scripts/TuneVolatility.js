import fs from "fs";

function parseCsv(path) {
    const rows = fs.readFileSync(path, "utf8").trim().split("\n").slice(1);
    return rows.map(line => {
        const [id, prob, payout] = line.split(",");
        return {
            id: Number(id),
            prob: Number(prob),
            payout: Number(payout) / 100
        };
    });
}

function main() {
    const files = fs.readdirSync("math").filter(f => f.startsWith("lookup_"));

    files.forEach(file => {
        const rows = parseCsv(`math/${file}`);
        const payouts = rows.map(r => r.payout);
        const mean = payouts.reduce((a,b)=>a+b,0) / payouts.length;
        const variance = payouts.reduce((a,b)=>a + Math.pow(b - mean, 2), 0) / payouts.length;
        const vol = Math.sqrt(variance);

        console.log(`${file}: Volatility ${vol.toFixed(4)} (mean payout ${mean.toFixed(4)})`);
    });
}

main();