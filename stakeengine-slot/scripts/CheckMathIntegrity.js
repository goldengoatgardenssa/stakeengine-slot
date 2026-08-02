import fs from "fs";

function checkCsv(path) {
    const lines = fs.readFileSync(path, "utf8").trim().split("\n").filter(l => l.trim() !== "");
    if (lines.length < 1) return { ok: false, reason: "empty file" };

    // First line must be a data row (no header), format: int,uint64int,int
    const first = lines[0].split(",");
    if (first.length !== 3) return { ok: false, reason: `expected 3 columns, got ${first.length}` };

    const [id, prob, payout] = first;
    if (isNaN(Number(id))) return { ok: false, reason: `id not a number: ${id}` };
    if (!/^\d+$/.test(prob.trim())) return { ok: false, reason: `probability not uint64: ${prob}` };
    if (isNaN(Number(payout))) return { ok: false, reason: `payout not a number: ${payout}` };

    return { ok: true, rows: lines.length };
}

function main() {
    const files = fs.readdirSync("math");

    files.forEach(file => {
        if (file.startsWith("lookup_") && file.endsWith(".csv")) {
            const result = checkCsv(`math/${file}`);
            console.log(`${file}: ${result.ok ? `OK (${result.rows} rows)` : `INVALID — ${result.reason}`}`);
        }
    });

    console.log("Integrity check complete.");
}

main();
