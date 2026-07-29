import fs from "fs";
import path from "path";

const OUTPUT = "stakeengine_package";

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
}

function copy(src, dest) {
    fs.copyFileSync(src, dest);
}

function main() {
    ensureDir(OUTPUT);
    ensureDir(`${OUTPUT}/math`);
    ensureDir(`${OUTPUT}/metadata`);

    // Copy math files
    const mathFiles = fs.readdirSync("math");
    mathFiles.forEach(file => {
        if (file.endsWith(".zst") || file.endsWith(".csv") || file === "index.json") {
            copy(`math/${file}`, `${OUTPUT}/math/${file}`);
        }
    });

    // Copy metadata
    copy("stakeengine/provider.json", `${OUTPUT}/metadata/provider.json`);
    copy("stakeengine/game.json", `${OUTPUT}/metadata/game.json`);
    copy("stakeengine/game-format.json", `${OUTPUT}/metadata/game-format.json`);

    console.log("StakeEngine package built at:", OUTPUT);
}

main();