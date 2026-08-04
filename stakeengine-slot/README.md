# Secure The Bag PERP Edition (StakeEngine-ready)

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
```

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
- **Sticky Wilds**: STICKY_WILD symbols persist during bonus rounds
- **Expanding Multipliers**: EXPANDING_MULTI adds +0.30x to the round multiplier
- **Super Bonus**: SUPER_BONUS mode with 4 free spins and 2.0x max multiplier

### Bonus Triggers
- **3 Scatters** → BONUS_3_SCATTER (3 free spins, 1.0x base multi, 1.5x max multi)
- **4 Scatters** → BONUS_4_SCATTER (3 free spins, 1.0x base multi, 1.5x max multi)
- **5 Scatters** → BONUS_5_SCATTER (3 free spins, 1.0x base multi, 1.5x max multi)
- **6 Scatters** → SUPER_BONUS (4 free spins, 1.0x base multi, 2.0x max multi)

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

## Frontend Deployment

The demo is deployed via Vercel. `vercel.json` configures the demo root with clean URLs and long-term caching for static assets.

## UI & Branding

- **Loading animation**: A spinner overlay is shown while spins resolve.
- **Bonus intro animation**: An animated branded overlay appears when a bonus triggers.
- **Sound pack**: Triggers for spin, win, bonus, and big win are wired via `public/sounds/config.json`.
- **Symbol visuals**: Individual SVG files loaded directly as `<img>` elements with fallback text labels, defined in `public/images/config.json`.
- **Bet controls**: Sidebar buttons to increase/decrease bet size across RGS-provided levels.
- **StakeEngine RGS**: Full wallet integration (authenticate, play, end-round, balance) with jurisdiction-based feature disabling.

## Assets & Branding

Sound and image references are defined in:

- `public/sounds/config.json`
- `public/images/config.json`

After deployment, update `stakeengine/game.json` `"demoUrl"` to the Vercel URL.

### Post-Deployment Steps

After Kilo applies all of these:

1. Re-run `node math/GenerateMathFiles.js`
2. Compress JSONL → `.jsonl.zst`
3. Run `node math/TuneRTP.js` and `node math/TuneVolatilityAdvanced.js`
4. Rebuild package: `node scripts/BuildStakePackage.js`

You'll have a feature-rich, branded, production-ready slot ready for StakeEngine ingestion.

## Production UI & Graphics

### Symbol Assets

Symbol visuals are individual SVG files stored in `demo/images/symbols/`. The demo loads them directly as `<img>` elements with a fallback to text labels if an image fails to load. This ensures a static-only build with no external asset dependencies.

### Bonus Intro Animation

When a bonus trigger occurs, a branded overlay appears with an animated entrance:
- Overlay element: `.bonus-overlay` with a CSS scale+opacity animation
- Bonus intro duration: 2500ms
- The overlay displays the bonus type and a close button

### Loading Overlay

A loading spinner overlay is displayed during spin resolution:
- Overlay element: `.loading-overlay` with a CSS spinning circle animation
- Shown when a spin is initiated, hidden when results are ready
- Prevents user interaction during spin resolution

### Sound Engine

Sound effects are generated procedurally using the Web Audio API in `demo/SoundEngine.js`:
- **Spin**: Short noise burst on reel start
- **Win**: Ascending tone sequence on win
- **Big Win**: Extended celebratory tone sequence
- **Bonus**: Rising arpeggio on bonus trigger
- **Click**: Short tone for button interactions

No external audio files are required.

## Assets & Branding

All game assets are self-contained:
- Symbol SVGs: `demo/images/symbols/`
- Sound engine: `demo/SoundEngine.js` (procedural Web Audio)

After deployment, update `stakeengine/game.json` `"demoUrl"` to the deployed frontend URL.