# Copperbell Orchard — art set v4

Style: hand-inked comic/graphic-novel, heavy ink keyline, 3-tone cel shading + ember rim light, paper/ink grain,
palette ink navy / aged copper / moss / ember / bone. All images generated, then post-processed in PIL
(`_tools/`): white-key background removal with edge decontamination, palette grade, consistent outer ink keyline
(~5px at 512), paper grain, trim + fit. Raw generations are in `_src/` so everything can be re-run.

## Symbol id → asset (ids from game/src/symbols.js on branch cursor/copperbell-orchard-b50c)
| id | asset | notes |
|---|---|---|
| W  | symbols/W_wild_goat.png | belled goat bust in suit, WILD plate lettered in PIL (Cinzel Black) |
| S  | symbols/S_scatter_lantern.png | glowing copper lantern (Orchard Lantern scatter) |
| H1 | symbols/H1_h1_honey_hive.png | honey skep with bees and bell |
| H2 | symbols/H2_h2_copper_can.png | engraved copper watering can |
| H3 | symbols/H3_h3_coin_pouch.png | leather coin pouch, goat clasp |
| H4 | symbols/H4_h4_jam_crock.png | navy crackle-glaze jam crock |
| L1 | symbols/L1_l1_apple.png | crimson apple (was fern in v3) |
| L2 | symbols/L2_l2_pear.png | russet pear (was acorn) |
| L3 | symbols/L3_l3_plums.png | plum cluster (was toadstool) |
| L4 | symbols/L4_l4_cherries.png | cherry pair (was thistle) |

Each symbol has `symbols/layers/<id>_*_{base,glow,highlight}.png` at the same 512x512 registration
(stack: glow (additive, pulse) → base → highlight (screen/add, flash or sweep with a mask)).
`ui/particles/glint_star.png` is the sparkle sprite for glints.

Reel frame metadata: `frame/reel_frame_5x3.json` gives the transparent reel window rect and cell size.
Runtime text (bet, prices, spin counts) should be live text; lettered versions are references.
