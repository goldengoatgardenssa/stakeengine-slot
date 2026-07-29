# Hybrid NoLimit x Hacksaw Slot (StakeEngine-ready)

Features:
- 6x4 reels, bidirectional wins
- 3/4/5 scatter bonuses + super bonus
- Big multipliers via MULTI symbols
- Feature spins, bonus buys
- Math modes aligned with StakeEngine `index.json`

## Run demo

```bash
npm install
npm run dev

## Math generation

To generate StakeEngine-style math files:

```bash
node math/GenerateMathFiles.js
```

## StakeEngine Publishing Checklist

Before submitting your game to StakeEngine, ensure the following:

### Math Files
- All modes simulated using `node math/GenerateMathFiles.js`
- JSONL files compressed to `.jsonl.zst`
- CSV lookup tables generated for each mode
- Filenames match `index.json`

### Validation
Run:
node math/ValidateRTP.js

Confirm:
- RTP is within allowed StakeEngine limits
- Volatility is acceptable for your game design

### Required Uploads
Upload to StakeEngine:
- index.json
- All `.jsonl.zst` files
- All `lookup_*.csv` files

### Frontend
- Demo deployed to Vercel
- Buttons for base spin, feature spin, and bonus buys
- Clear display of mode, bet, win, and bonus type

Your game is now ready for StakeEngine ingestion.

## StakeEngine Submission Package

To prepare your game for StakeEngine submission:

### 1. Generate math files
node math/GenerateMathFiles.js

### 2. Compress JSONL files
zstd math/<mode>.jsonl -o math/<mode>.jsonl.zst

### 3. Validate math integrity
node scripts/CheckMathIntegrity.js

### 4. Validate RTP and volatility
node math/ValidateRTP.js

### 5. Build submission package
node scripts/BuildStakePackage.js

This creates:
stakeengine_package/
  math/
    *.jsonl.zst
    lookup_*.csv
    index.json
  metadata/
    provider.json
    game.json
    game-format.json

Upload this folder to StakeEngine.