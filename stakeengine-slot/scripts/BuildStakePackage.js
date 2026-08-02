import fs from "fs";

const OUTPUT = "stakeengine_package";

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copy(src, dest) {
    if (!fs.existsSync(src)) {
        console.warn(`Skipping missing file: ${src}`);
        return;
    }
    fs.copyFileSync(src, dest);
}

function main() {
    ensureDir(OUTPUT);
    ensureDir(`${OUTPUT}/metadata`);

    copy("stakeengine_package/index.json", `${OUTPUT}/index.json`);

    copy("stakeengine/provider.json", `${OUTPUT}/metadata/provider.json`);
    copy("stakeengine/game.json", `${OUTPUT}/metadata/game.json`);
    copy("stakeengine/game-format.json", `${OUTPUT}/metadata/game-format.json`);

    console.log("StakeEngine package built at:", OUTPUT);
}

main();
