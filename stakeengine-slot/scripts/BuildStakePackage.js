import fs from "fs/promises";
import { readFile, writeFile, copyFile, mkdir, readdir, stat, unlink } from "fs/promises";
import zstd from "@mongodb-js/zstd";
import AdmZip from "adm-zip";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_DIR = path.join(__dirname, "..", "stakeengine_package");
const ZIP_PATH = path.join(__dirname, "..", "stakeengine_package.zip");

async function ensureDir(dir) {
    try { await mkdir(dir, { recursive: true }); } catch (e) { if (e.code !== "EEXIST") throw e; }
}

async function compressFile(src, dest) {
    const data = await readFile(src);
    const compressed = await zstd.compress(data);
    await writeFile(dest, compressed);
    console.log(`  Compressed: ${path.basename(src)} -> ${path.basename(dest)}`);
}

async function collectFiles(dir, base = "") {
    const entries = await readdir(dir);
    const files = [];
    for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const s = await stat(fullPath);
        if (s.isDirectory()) {
            files.push(...await collectFiles(fullPath, base ? path.join(base, entry) : entry));
        } else {
            files.push({ zipPath: base ? path.join(base, entry) : entry, fsPath: fullPath });
        }
    }
    return files;
}

async function main() {
    await ensureDir(PACKAGE_DIR);
    await ensureDir(path.join(PACKAGE_DIR, "metadata"));

    await copyFile("stakeengine/provider.json", path.join(PACKAGE_DIR, "metadata/provider.json"));
    await copyFile("stakeengine/game.json", path.join(PACKAGE_DIR, "metadata/game.json"));
    await copyFile("stakeengine/game-format.json", path.join(PACKAGE_DIR, "metadata/game-format.json"));
    console.log("Metadata copied.");

    const jsonlFiles = await readdir(PACKAGE_DIR);
    const toCompress = jsonlFiles.filter(f => f.endsWith(".jsonl"));
    const existingZst = new Set(jsonlFiles.filter(f => f.endsWith(".jsonl.zst")).map(f => f.replace(/\.jsonl\.zst$/, ".jsonl")));

    if (toCompress.length === 0 && existingZst.size === 0) {
        console.log("No JSONL files found. Run math/GenerateMathFiles.js first.");
        return;
    }

    console.log("\nCompressing JSONL files...");
    for (const jsonl of toCompress) {
        if (existingZst.has(jsonl)) continue;
        const src = path.join(PACKAGE_DIR, jsonl);
        const dest = path.join(PACKAGE_DIR, jsonl.replace(/\.jsonl$/, ".jsonl.zst"));
        await compressFile(src, dest);
        await unlink(src);
    }

    console.log("\nBuilding zip package...");
    const zip = new AdmZip();
    const files = await collectFiles(PACKAGE_DIR);
    for (const { zipPath, fsPath } of files) {
        zip.addLocalFile(fsPath, "", zipPath);
        console.log(`  Added: ${zipPath}`);
    }

    zip.writeZip(ZIP_PATH);
    console.log(`\nZip created: ${ZIP_PATH}`);
    console.log(`Package directory: ${PACKAGE_DIR}/`);
    console.log("\nUpload the contents of stakeengine_package/ to StakeEngine.");
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
