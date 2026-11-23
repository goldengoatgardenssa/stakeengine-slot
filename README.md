# Copperbell Orchard

Publish-ready Stake Engine slot for studio `goldengoatgardenssa`. It replaces the rejected **Secure the Bag PERP Edition** (front v10, math v6, rated 3.7/9).

LE GOATY is an original alpine-heist cluster game: a 6×5 tumbling grid, coin values, a loot sack, heist bells, and golden cells. Modes are base, ante, bonus, super and epic. Each stays inside the 96.00–96.70% band. The maximum win is 10,000×, which still fits the $1,000 max-bet template. Art-v5 drops in through `game/src/manifest.js` by file name; until those files arrive the reels use inked placeholders.

## Play locally

```bash
node game/server.mjs
```

Open `http://127.0.0.1:8080/?mock=1`. Add `&social=true` or `&currency=JPY` to check wording and money. A real session must pass `sessionID`, `lang`, `device`, and `rgs_url`. An invalid `rgs_url` shows an error and does not fall back to the preview.

## Upload packages

- `upload/copperbell-orchard-math.zip` — math files for Studio
- `upload/copperbell-orchard-frontend.zip` — static front end (`index.html` at the root of the zip)

Step-by-step dashboard notes are in `launch/UPLOAD.md`. The requirement ledger is `SUBMISSION.md`.
