# Compressing JSONL Math Files for StakeEngine

StakeEngine requires `.jsonl.zst` files for each math mode.

## 1. Install Zstandard

Windows:
https://facebook.github.io/zstd/

Mac:
brew install zstd

Linux:
sudo apt install zstd

## 2. Compress each JSONL file

Example:
zstd math/base.jsonl -o math/hybrid_base.jsonl.zst

Repeat for all modes:
- base
- bonus_3
- bonus_4
- bonus_5
- super_bonus
- feature_spin
- bonus_buy_base
- bonus_buy_super

## 3. Verify file names match index.json

index.json expects:
events: "hybrid_base.jsonl.zst"
weights: "lookup_base.csv"

Ensure your compressed files follow the same naming convention.

## 4. Upload to StakeEngine

Upload:
- index.json
- all .jsonl.zst files
- all lookup_*.csv files

StakeEngine will validate RTP, volatility, and event structure.