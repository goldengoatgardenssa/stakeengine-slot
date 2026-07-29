import fs from "fs";

function checkCsv(path) {
    const data = fs.readFileSync(path, "utf8").trim().split("\n");
    if (data.length < 2) return false;
    const header = data[0];
    return header === "simulation_id,probability,payoutMultiplier";
}

function main() {
    const files = fs.readdirSync("math");

    files.forEach(file => {
        if (file.startsWith("lookup_") && file.endsWith(".csv")) {
            const ok = checkCsv(`math/${file}`);
            console.log(`${file}: ${ok ? "OK" : "INVALID"}`);
        }
    });

    console.log("Integrity check complete.");
}

main();