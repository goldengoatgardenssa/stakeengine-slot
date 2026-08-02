import fs from "fs";
import SlotEngine from "../engine/SlotEngine.js";
import { GAME_CONFIG } from "../engine/GameConfig.js";
import { runBonusRound } from "../engine/BonusFlow.js";

const MODES = [
    "base","bonus_3","bonus_4","bonus_5","super_bonus",
    "feature_spin","bonus_buy_base","bonus_buy_super"
];

const MODE_COSTS = {
    base: 1.0,
    bonus_3: 1.0,
    bonus_4: 1.0,
    bonus_5: 1.0,
    super_bonus: 1.0,
    feature_spin: GAME_CONFIG.featureSpins.costMultiplier,
    bonus_buy_base: GAME_CONFIG.bonusBuy.baseBonusCost,
    bonus_buy_super: GAME_CONFIG.bonusBuy.superBonusCost
};

const ROUNDS_PER_MODE = 100000;
const UINT64_MAX = 2n ** 64n;

const BONUS_MODE_MAP = {
    bonus_3: { type: "BONUS_3_SCATTER", freeSpins: 8,  baseMulti: 1.0, maxMulti: 2.0 },
    bonus_4: { type: "BONUS_4_SCATTER", freeSpins: 10, baseMulti: 1.0, maxMulti: 2.5 },
    bonus_5: { type: "BONUS_5_SCATTER", freeSpins: 12, baseMulti: 1.0, maxMulti: 3.0 },
    super_bonus: { type: "SUPER_BONUS", freeSpins: 15, baseMulti: 1.0, maxMulti: 4.0 },
    bonus_buy_base: { type: "BONUS_3_SCATTER", freeSpins: 20, baseMulti: 1.0, maxMulti: 6.0 },
    bonus_buy_super: { type: "SUPER_BONUS", freeSpins: 30, baseMulti: 1.0, maxMulti: 10.0 }
};

function findBestWin(result) {
    const wilds = result.filter(s => s === "WILD" || s === "STICKY_WILD").length;
    let bestWin = 0;
    let bestSymbol = null;
    let bestCount = 0;

    const linePayouts = {
        "A": 0.1120, "K": 0.0840, "Q": 0.0560, "J": 0.0560,
        "10": 0.0420, "9": 0.0280,
        "SKULL": 1.400, "MASK": 1.120, "GOLD_BAR": 2.730
    };

    for (const [symbol, payout] of Object.entries(linePayouts)) {
        const symCount = result.filter(s => s === symbol).length;
        const count = symCount + wilds;
        if (count >= 3) {
            const win = payout * count;
            if (win > bestWin) {
                bestWin = win;
                bestSymbol = symbol;
                bestCount = count;
            }
        }
    }

    if (bestWin === 0 && wilds >= 3) {
        bestWin = linePayouts["9"] * wilds;
        bestSymbol = "WILD";
        bestCount = wilds;
    }

    return { win: bestWin, symbol: bestSymbol, count: bestCount };
}

function buildBoard(result) {
    return [result.map(s => ({ name: s }))];
}

function buildRevealEvent(index, result, gameType) {
    const event = {
        index,
        type: "reveal",
        board: buildBoard(result),
        paddingPositions: [],
        gameType,
        anticipation: []
    };
    return event;
}

function buildWinInfoEvent(index, result, totalWin) {
    const best = findBestWin(result);
    const wins = [];
    if (best.win > 0 && best.symbol) {
        const positions = [];
        result.forEach((s, i) => {
            if (s === best.symbol || s === "WILD" || s === "STICKY_WILD") {
                positions.push({ reel: i, row: 0 });
            }
        });
        wins.push({
            symbol: best.symbol,
            kind: best.count,
            win: Math.round(best.win * 100),
            positions,
            meta: {}
        });
    }
    return {
        index,
        type: "winInfo",
        totalWin: Math.round(totalWin * 100),
        wins
    };
}

function buildSetWinEvent(index, amount) {
    return {
        index,
        type: "setWin",
        amount: Math.round(amount * 100),
        winLevel: amount > 0 ? 2 : 1
    };
}

function buildSetTotalWinEvent(index, amount) {
    return {
        index,
        type: "setTotalWin",
        amount: Math.round(amount * 100)
    };
}

function buildFinalWinEvent(index, amount) {
    return {
        index,
        type: "finalWin",
        amount: Math.round(amount * 100)
    };
}

function buildFreeSpinTriggerEvent(index, totalFs, positions) {
    return {
        index,
        type: "freeSpinTrigger",
        totalFs,
        positions: positions.map((p, i) => ({ reel: p, row: 0 }))
    };
}

function buildFreeSpinUpdateEvent(index, current, total) {
    return {
        index,
        type: "freespinUpdate",
        currentSpin: current,
        totalSpins: total
    };
}

function getScatterPositions(result) {
    return result.map((s, i) => s === "SCATTER" ? i : -1).filter(i => i >= 0);
}

function simulateBaseMode(engine, mode) {
    const spin = engine.spin(mode);
    const result = spin.result;
    const win = spin.win;
    const bet = spin.bet;
    const payoutMultiplier = Math.round((win / bet) * 100);

    const events = [];
    events.push(buildRevealEvent(0, result, "basegame"));
    
    if (win > 0) {
        events.push(buildWinInfoEvent(1, result, win));
        events.push(buildSetWinEvent(2, win));
    }
    
    events.push(buildSetTotalWinEvent(events.length, win));
    events.push(buildFinalWinEvent(events.length, win));

    return {
        id: 0,
        events,
        payoutMultiplier,
        criteria: "basegame",
        baseGameWins: win,
        freeGameWins: 0
    };
}

function simulateBonusMode(engine, mode) {
    const bonusConfig = BONUS_MODE_MAP[mode];
    const bonusResult = runBonusRound(engine, bonusConfig, mode);
    
    const events = [];
    const scatterPositions = getScatterPositions(bonusResult.results[0]?.result || []);
    
    events.push(buildFreeSpinTriggerEvent(0, bonusResult.spins, scatterPositions));
    
    let cumulativeWin = 0;
    for (let i = 0; i < bonusResult.results.length; i++) {
        const fsResult = bonusResult.results[i];
        const fsWin = fsResult.win;
        cumulativeWin += fsWin;
        
        events.push(buildFreeSpinUpdateEvent(events.length, i + 1, bonusResult.spins));
        events.push(buildRevealEvent(events.length, fsResult.result, "freegame"));
        
        if (fsWin > 0) {
            events.push(buildWinInfoEvent(events.length, fsResult.result, fsWin));
            events.push(buildSetWinEvent(events.length, fsWin));
        }
        
        events.push(buildSetTotalWinEvent(events.length, cumulativeWin));
    }
    
    events.push(buildFinalWinEvent(events.length, cumulativeWin));

    const totalWin = bonusResult.totalWin;
    const bet = engine.spin(mode).bet;
    const payoutMultiplier = Math.round((totalWin / bet) * 100);

    return {
        id: 0,
        events,
        payoutMultiplier,
        criteria: "freegame",
        baseGameWins: 0,
        freeGameWins: totalWin
    };
}

function simulateMode(mode, n) {
    const engine = new SlotEngine({ seed: 0xDEADBEEF });
    const rounds = [];
    let totalWin = 0;

    for (let i = 0; i < n; i++) {
        let round;
        if (mode === "base" || mode === "feature_spin") {
            round = simulateBaseMode(engine, mode);
        } else {
            round = simulateBonusMode(engine, mode);
        }
        
        round.id = i + 1;
        rounds.push(round);
        totalWin += round.payoutMultiplier / 100;
    }

    const bet = MODE_COSTS[mode];
    const rtp = totalWin / n;
    return { rounds, rtp };
}

function writeJsonl(path, rounds) {
    const fd = fs.openSync(path, 'w');
    for (const r of rounds) {
        fs.writeSync(fd, JSON.stringify(r) + "\n");
    }
    fs.closeSync(fd);
}

function writeCsv(path, rounds) {
    const n = BigInt(rounds.length);
    const baseProb = UINT64_MAX / n;
    const remainder = UINT64_MAX % n;
    const fd = fs.openSync(path, 'w');
    for (let i = 0; i < rounds.length; i++) {
        const prob = baseProb + (i < Number(remainder) ? 1n : 0n);
        fs.writeSync(fd, `${rounds[i].id},${prob.toString()},${rounds[i].payoutMultiplier}\n`);
    }
    fs.closeSync(fd);
}

function main() {
    const outputDir = "stakeengine_package";
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    MODES.forEach(mode => {
        const { rounds, rtp } = simulateMode(mode, ROUNDS_PER_MODE);
        console.log(`Mode ${mode.padEnd(20)} RTP: ${(rtp * 100).toFixed(2)}%  (${rounds.length} rounds)`);
        writeJsonl(`${outputDir}/${mode}.jsonl`, rounds);
        writeCsv(`${outputDir}/lookup_${mode}.csv`, rounds);
    });

    console.log("\nMath files generated in stakeengine_package/");
}

main();
