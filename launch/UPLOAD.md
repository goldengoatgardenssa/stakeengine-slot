# Upload Copperbell Orchard

Do this in Studio while signed in as the owner. This package is not submitted for you.

Sign in at [https://studio.engine.io](https://studio.engine.io) (the publisher sign-in is also linked from [https://stake-engine.com/signin](https://stake-engine.com/signin)). Use the team **goldengoatgardenssa**.

Create a **new game** named **Copperbell Orchard**. Leave the rejected game `secure-the-bag-perp-edition` as history. Its math v6 is blocked, and its mode list does not match this game. A new game gets a clean review instead of a resubmit of the 3.7/9 thread.

## 1. Math

Unzip `upload/copperbell-orchard-math.zip`. In the game’s math upload, send these files together, from the same folder:

- `index.json`
- `books_base.jsonl.zst`
- `books_lantern.jsonl.zst`
- `lookup_base.csv`
- `lookup_lantern.csv`

Do not upload `VERIFICATION.json` or the `metadata/` folder unless Studio asks for them. They are records, not RGS inputs. Publish the math version. Publishing identical files again does not create a new version.

Confirmed on 100,000 rounds per mode (see `publish/VERIFICATION.json`):

| Mode | Cost | RTP | Hit rate | Top win | Std dev | ETL > 40× (÷ cost) | CVaR ÷ cost |
| --- | --- | --- | --- | --- | --- | --- | --- |
| base | 1× | 96.399% | 28.02% | 5,000× | 24.30 | 0.381 | 241.2 |
| lantern | 17.8× | 96.332% | 99.65% | 5,000× | 35.37 | 0.006 | 26.1 |

Template: **1kmax_1cent** ($1,000 max bet). Top win 5,000× is inside the 25,000× template cap. The dearest mode is 17.8×, inside the 500× cap. A $1,000 base amount on Lantern debits $17,800, under the $500,000 round-cost ceiling. Worst-case payout at that bet is $5,000,000, under the $50,000,000 exposure cap.

Replay ids for reviewers:

| Mode | Loss | Ordinary win | Big win (15×–100×) | Large win | Max win | Feature |
| --- | --- | --- | --- | --- | --- | --- |
| base | 9 | 10 | 438 | 81 | 1 | 28 |
| lantern | 35 | 9 | 10 | 13 | 1 | 9 (the mode is the feature) |

## 2. Front end

Unzip `upload/copperbell-orchard-frontend.zip` and upload that folder as the front version. `index.html` is the entry. Publish the front version. The build does not call a hardcoded RGS host, bet ladder, or default bet.

## 3. Media and profile

In Media, create the tile. The editor wants layers, not a flattened poster.

- Background: `launch/tile-background.png` (bright orchard, no words). The 408×546 export is `launch/tile-408x546.png` if you need a preview.
- Foreground: `launch/tile-foreground.png` (transparent goat).
- Cover, 16:9: `launch/cover-1920x1080.jpg`, exported in the editor at 640×360 (`launch/cover-640x360.jpg`).
- Profile banner: `launch/banner-1920x1080.jpg`. Keep the goat near the centre so a crop still shows it.
- Tagline and description: `launch/LISTING.md`. Tagline is under 400 characters. Description is under 2,000.

Set the team logo once in team Settings, not on this game. Do not paint “NEW”, “BONUS”, or a multiplier into the art.

## 4. Before submit

- Open the published front with Studio’s social toggle. Buttons say Play and Get Lantern. Coin amounts show as `SC` or `GC` with no dollar sign.
- Read the info panel and confirm the disclaimer, both RTPs, the 5,000× cap, and the 17.8× Lantern price.
- Pick distribution (Stake only, or Stake and the Engine network). It cannot be changed after launch.
- Stay inside the open-review limit: one review at a time until the first game is live.
- Submit the published front version and the published math version together.

After approval, only small visual fixes are allowed. Do not change math, modes, or rules after that.
