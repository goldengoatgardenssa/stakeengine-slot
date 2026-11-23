# LE GOATY — submission ledger

This revision re-themes the same Studio slug as an original alpine heist. It is not submitted.

## Modes (60,000 books each, `publish/MATH_REPORT.json`)

Sixty thousand simulations keep every book file under GitHub's 100MB file limit. The package is still the Stake set: index, zstd books, lookup CSV.

6×5 clusters tumble. Coins carry values and the loot sack gathers them. Heist bells multiply a tumble, and a meter grows during the heist. Winning cells turn golden; Super and Epic keep them, and they rise through three levels. Epic starts with golden cells already placed. Hidden is a surprise upgrade inside some Normal heists.

Max win is **10,000×**. That is the highest cap that still qualifies for the $1,000 max-bet template (top win limit 25,000×) and gives the heist a legendary ceiling.

| Mode | Cost | RTP | Hit rate | Top win | Volatility |
| --- | --- | --- | --- | --- | --- |
| base | 1× | 96.397% | 33.79% | 10,000× | 47.24 |
| ante | 1.25× | 96.384% | 12.06% | 10,000× | 47.42 |
| bonus | 13.9× | 96.190% | 100% | 10,000× | 47.71 |
| super | 26× | 96.352% | 100% | 10,000× | 48.99 |
| epic | 37.3× | 96.311% | 100% | 10,000× | 49.48 |

The five returns sit inside 96.00–96.70% and within 0.21% of each other. Every heist pauses for Start and ends on Collect. P(max win) is about 1 in 45,000 in every mode.

## Pre-check

Books are zstd JSONL. Payouts are integer hundredths and multiples of 10. The cap books pay 10,000× exactly. Dashboard checks in `publish/MATH_REPORT.json` all pass, including std ≤ 60, ETL and CVaR.

**Template: `1kmax_1cent`, $1,000 max bet.** At a $1,000 base amount the Epic debit is $37,300 (under $500,000) and the 10,000× payout is $10,000,000 (under $25,000,000 for this template's top-win multiple, and under the $50,000,000 exposure guidance used previously).

Art-v5 is not in the build yet. `game/src/manifest.js` is the swap point: drop webps at the listed file names and the inked placeholders step aside.

Studio: `goldengoatgardenssa`. This replaces Secure the Bag PERP Edition (math v6 blocked, front v10 rated 3.7/9). 2rackjack is out of scope. Nothing here has been submitted.

The 51 guideline rows on [the submission checklist](https://studio.engine.io/docs/approval-guidelines/submission-checklist) are loaded only for a signed-in publisher (`GET /api/guidelines` returns 401). Every rule those public docs actually state is marked below. Tick the in-app list after upload; it can differ slightly once a team has a track record.

## Requirements

| # | Requirement | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Cheapest mode costs 1.0× | Met | `base` cost 1 in `publish/index.json` |
| 2 | Every 1× mode has std ≥ 0.6 | Met | base std 47.24 |
| 3 | Every mode RTP is 96.00–96.70% of its cost | Met | 96.190% to 96.397% |
| 4 | Max win ≤ 1,000,000× and, for this template, ≤ 25,000× | Met | 10,000× in every mode, present as book 1 |
| 5 | Mode cost ≤ 50,000× and, for this template, ≤ 500× | Met | 37.3× |
| 6 | A bet template fits, and a round cannot cost over $500,000 | Met | 1kmax_1cent; max debit $37,300 |
| 7 | Non-critical tail, CVaR, and std limits | Met | Table above. Zero failed classes |
| 8 | 100,000–1,000,000 simulations, diverse, hit rate better than 1 in 50 | Partial | 60,000 each so every book stays under 100MB. Base hit 33.79%. Heist modes hit every round |
| 9 | Max win realistically obtainable (more often than 1 in 10,000,000) | Met | About 1 in 45,000 |
| 10 | `index.json` names each mode, cost, books, and lookup | Met | `publish/index.json`. Names are `base`, `ante`, `bonus`, `super`, and `epic` |
| 11 | Lookup CSV is `id,weight,payout` uint64, no header, row n matches book line n | Met | Verifier compared all 60,000 rows. Mismatches: 0 |
| 12 | Books are zstd JSONL with `id`, `events`, `payoutMultiplier` | Met | Five `books_<mode>.jsonl.zst` files, each under 100MB |
| 13 | Payouts are hundredths of the base amount, not scaled by mode cost | Met | 100 = 1×. RTP divides by cost |
| 14 | At most 20 modes, books under 4.2 GB, under 10,000,000 events | Met | 5 modes |
| 15 | RGS authenticate, play, end-round, balance path, bet event | Met | `game/src/rgs.js`. End-round runs only when the round pays |
| 16 | Replay without a session: Play, then Play again, bet controls hidden, cost shown | Met | `replay=true` with game, version, mode, event. Local preview uses the mock pack |
| 17 | No hardcoded RGS host, bet ladder, or default bet | Met | Taken from authenticate. Invalid `rgs_url` shows the error screen |
| 18 | Active round restores its amount | Met | `authenticate.round.active` is played back before new input |
| 19 | Currencies including USD, EUR, CAD, MXN, JPY, XSC, XGC | Met | `game/src/format.js`. Social coins have no `$`. Sub-cent values keep extra digits |
| 20 | English, with other `lang` values falling back to English | Met | Copy is English. Social mode stays English |
| 21 | Social wording | Met | `createCopy(true)` scanned against the restricted list in [jurisdiction requirements](https://studio.engine.io/docs/approval-guidelines/jurisdiction-requirements) |
| 22 | Rules: RTP, max win, pays, feature, mode cost, disclaimer | Met | Info panel. Disclaimer is the 2026 Engine template from [general disclaimer](https://studio.engine.io/docs/approval-guidelines/general-disclaimer) |
| 23 | Visible bet bar, fast play, autoplay confirmation, sound, space bar | Met | Footer bet bar is always in the layout. Fast play shortens spins. Autoplay and Lantern ask first |
| 24 | Mobile and short popout, no page scroll, no double-tap zoom | Met | `100dvh` grid, `touch-action: manipulation` |
| 25 | Original art and audio, no Engine loader or sample pack | Met | Vector symbols and synthesized sound in the game. Lobby paintings are original to this theme; prompts are in `launch/ART_PROMPTS.md` |
| 26 | Tile 3:4 and cover 16:9, bright, no promo text | Met | `launch/tile-background.png`, `launch/tile-foreground.png`, `launch/cover-1920x1080.jpg` |
| 27 | Banner ≥ 1920×1080, tagline ≤ 400, description ≤ 2000 | Met | `launch/banner-1920x1080.jpg`, `launch/LISTING.md` |
| 28 | Stateless: no jackpot, gamble, or carry-over | Met | Each round is one book |
| 29 | Quality bar that failed last time (assets, animation, performance, bet bar) | Met in this build | See below |
| 30 | Owner publishes math and front, then submits | Unmet, by design | Steps in `launch/UPLOAD.md`. Do not treat this repo as a Studio submission |

## What changed for the rating

The 3.7/9 review named low-quality assets (twice), poor animations (twice), performance, and a bet bar that could not be seen. The new front keeps the bet bar in a cream band with a 44px minimum control size. Reels move on `transform` only. Each symbol has its own idle cycle and its own win motion. The book is animated by the client; the client does not invent the win.

## Owner steps

Follow `launch/UPLOAD.md`. Short version: new game, upload the math zip’s five RGS files, publish math, upload the front zip, publish front, build the tile from the launch layers, paste the listing copy, test social mode, choose distribution, submit.

## Blockers

- Studio login is required to upload, publish, and press submit. This environment cannot do that.
- The in-app 51-row checklist is not visible without that login. The public rules above are covered.
- Distribution (Stake only, or the wider network) is the owner’s choice and cannot be changed after launch.
- If a reviewer wants the lobby goat repainted, use `launch/ART_PROMPTS.md` and keep the vector game.
