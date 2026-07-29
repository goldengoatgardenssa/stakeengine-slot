import fs from "fs";

const MODES = ["base","bonus_3","bonus_4","bonus_5","super_bonus"];

function parseCsv(path) {
    const data = fs.readFileSync(path, "utf8").trim().split("\n").slice(1);
    return data.map(line => {
        const [id, probability, payoutMultiplier] = line.split(",");
        return {
            id: Number(id),
            probability: Number(probability),
            payoutMultiplier: Number(payoutMultiplier)
        };
    });
}

function calculateRTP(rows) {
    let rtp = 0;
    for (const r of rows) {
        rtp += r.probability * (r.payoutMultiplier / 100);
    }
    return rtp;
}

function main() {
    MODES.forEach(mode => {
        const csvPath = `math/lookup_${mode}.csv`;
        if (!fs.existsSync(csvPath)) {
            console.log(`Missing CSV for mode: ${mode}`);
            return;
        }

        const rows = parseCsv(csvPath);
        const rtp = calculateRTP(rows);

        console.log(`Mode: ${mode} RTP: ${(rtp * 100).toFixed(2)}%`);
    });

    console.log("Use these values to adjust GameConfig.rtpTuning and Paytable/strip weights.");
}

main();