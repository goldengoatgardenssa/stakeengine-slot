# Copperbell Orchard — submission ledger

Studio: `goldengoatgardenssa`. This replaces Secure the Bag PERP Edition (math v6 blocked, front v10 rated 3.7/9). 2rackjack is out of scope. Nothing here has been submitted.

The 51 guideline rows on [the submission checklist](https://studio.engine.io/docs/approval-guidelines/submission-checklist) are loaded only for a signed-in publisher (`GET /api/guidelines` returns 401). Every rule those public docs actually state is marked below. Tick the in-app list after upload; it can differ slightly once a team has a track record.

## Modes (100,000 books each, `publish/MATH_REPORT.json`)

Copper bell multipliers (2×, 3×, 5×, 10×, 25×, 50×, 100×) land on the reels and multiply that spin. Free spins keep a bell-bloom meter that grows after a winning spin. Super can lock a goat for the next spin. Hidden and epic can expand a reel of goats, and epic can walk one. A locked goat on hidden or epic can multiply that spin (2×, then 3×).

| Mode | Cost | RTP | Hit rate | Top win | Volatility |
| --- | --- | --- | --- | --- | --- |
| base | 1× | 96.410% | 21.58% | 5,000× | 25.71 |
| ante | 1.25× | 96.381% | 18.97% | 5,000× | 25.83 |
| bonus | 21.3× | 96.400% | 95.71% | 5,000× | 46.79 |
| super | 27.1× | 96.400% | 95.42% | 5,000× | 51.94 |

The four returns sit inside 96.00–96.70% and within 0.03% of each other. 3 lanterns open Normal, 4 open Super, 5 open Epic. About 8% of 3-lantern triggers reveal Hidden instead. Each bonus pauses for Start and again for Collect.

## Pre-check (from `publish/VERIFICATION.json`, 100,000 books per mode)

Books were decompressed and compared to the lookup rows in order. Mismatches: 0. Final-win events match `payoutMultiplier`. Payouts are integer hundredths and multiples of 10.

| Mode | Cost | RTP | Hit rate | Top win | Volatility | ETL > 40× ÷ cost | CVaR ÷ cost |
| --- | --- | --- | --- | --- | --- | --- | --- |
| base | 1× | 96.410% | 21.58% | 5,000× | 25.71 | 0.521 | 343.3 |
| ante | 1.25× | 96.381% | 18.97% | 5,000× | 25.83 | 0.494 | 288.4 |
| bonus | 21.3× | 96.400% | 95.71% | 5,000× | 46.79 | 0.006 | 31.6 |
| super | 27.1× | 96.400% | 95.42% | 5,000× | 51.94 | 0.004 | 27.2 |

ETL above 10,000× is 0 in every mode. Limits used: RTP 96.00–96.70%, base std ≥ 0.6, any-mode std ≤ 60, ETL 40× ≤ 0.9, ETL 10,000× ≤ 0.8, ETL sum ≤ 1.5, ETL absolute sum ≤ 10,000, per-stake CVaR ≤ 700, absolute CVaR ≤ 50,000, P(≥ 5,000×) ≤ 0.05. Source: [math verification](https://studio.engine.io/docs/approval-guidelines/math-verification).

**Template: `1kmax_1cent`, $1,000 max bet.** Chosen on purpose. A 5,000× cap is inside that template’s 25,000× top win, and 27.1× is inside its 500× cost cap. At a $1,000 base amount the Super debit is $27,100 (under $500,000) and the 5,000× payout is $5,000,000 (under $50,000,000). No failed risk class, so the caps are not reduced.

## Requirements

| # | Requirement | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Cheapest mode costs 1.0× | Met | `base` cost 1 in `publish/index.json` |
| 2 | Every 1× mode has std ≥ 0.6 | Met | base std 25.71 |
| 3 | Every mode RTP is 96.00–96.70% of its cost | Met | 96.381% to 96.410% |
| 4 | Max win ≤ 1,000,000× and, for this template, ≤ 25,000× | Met | 5,000× in every mode, present as book 1 |
| 5 | Mode cost ≤ 50,000× and, for this template, ≤ 500× | Met | 27.1× |
| 6 | A bet template fits, and a round cannot cost over $500,000 | Met | 1kmax_1cent; max debit $27,100 |
| 7 | Non-critical tail, CVaR, and std limits | Met | Table above. Zero failed classes |
| 8 | 100,000–1,000,000 simulations, diverse, hit rate better than 1 in 50 | Met | 100,000 each. Base hit 21.58%. Feature modes hit about 95% |
| 9 | Max win realistically obtainable (more often than 1 in 10,000,000) | Met | About 1 in 45,000 |
| 10 | `index.json` names each mode, cost, books, and lookup | Met | `publish/index.json`. Names are `base`, `ante`, `bonus`, and `super` (no buy/bet/pay) |
| 11 | Lookup CSV is `id,weight,payout` uint64, no header, row n matches book line n | Met | Verifier compared all 100,000 rows |
| 12 | Books are zstd JSONL with `id`, `events`, `payoutMultiplier` | Met | `books_base.jsonl.zst`, `books_ante.jsonl.zst`, `books_bonus.jsonl.zst`, `books_super.jsonl.zst` |
| 13 | Payouts are hundredths of the base amount, not scaled by mode cost | Met | 100 = 1×. RTP divides by cost |
| 14 | At most 20 modes, books under 4.2 GB, under 10,000,000 events | Met | 4 modes |
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
