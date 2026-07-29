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

## Production Front-End

The `demo` folder contains a production-ready UI:
- Animated reels
- HUD for mode, bet, win, multiplier
- Buttons for base, feature spins, and bonus buys
- Basic sound hooks for spin, win, and bonus

Run with:

```bash
npm run dev
```

## Advanced Features (NoLimit & Hacksaw Style)

This game includes both NoLimit and Hacksaw-style mechanics:

### NoLimit Features
- **xWays**: Expand one symbol into two of the same type, increasing win potential
- **xSplit**: Duplicate a premium symbol for extra wins
- **xNudge**: Convert a WILD into a STICKY_WILD that persists across spins
- **Persistent Multipliers**: MULTI and EXPANDING_MULTI symbols grow the multiplier across bonus rounds

### Hacksaw-Style Features
- **Expanding Multipliers**: EXPANDING_MULTI adds +3x to the total multiplier
- **Sticky Wilds**: STICKY_WILD symbols remain in place for bonus rounds
- **Super Multis**: SUPER_BONUS mode with a base 5x multiplier and growing persistent multi

### Bonus Triggers
- **3 Scatters** → BONUS_3_SCATTER (8 free spins, 1.5x base multi)
- **4 Scatters** → BONUS_4_SCATTER (10 free spins, 2x base multi)
- **5 Scatters** → BONUS_5_SCATTER (12 free spins, 3x base multi)
- **5+ Scatters** → SUPER_BONUS (15 free spins, 5x base multi)

## Math Tuning (RTP & Volatility)

Generate and tune math files:

```bash
node math/GenerateMathFiles.js
node math/TuneRTP.js
node math/TuneVolatilityAdvanced.js
```

Adjust:

- `engine/GameConfig.rtpTuning`
- `engine/Paytable.js`
- `engine/ReelStrips.js`

until RTP is in the 96–98% range and volatility matches your design.

## Assets & Branding

Sound and image references are defined in:

- `public/sounds/config.json`
- `public/images/config.json`

Hook these into your hosting/CDN and update paths as needed for production.

### Post-Deployment Steps

After Kilo applies all of these:

1. Re-run `node math/GenerateMathFiles.js`
2. Compress JSONL → `.jsonl.zst`
3. Run `node math/TuneRTP.js` and `node math/TuneVolatilityAdvanced.js`
4. Rebuild package: `node scripts/BuildStakePackage.js`

You'll have a feature-rich, branded, production-ready slot ready for StakeEngine ingestion.