/**
 * Single art manifest for LE GOATY.
 * Drop art-v5 files at these paths and they replace the inked placeholders.
 * A boot probe sets useArt when symbols/W.webp is present.
 */
export const MANIFEST = {
  game: "le-goaty",
  useArt: false,
  frame: {
    id: "frame_6x5",
    image: "assets/art/frame/frame_6x5.webp",
    window: "assets/art/frame/frame_6x5.json",
  },
  background: [
    "assets/art/background/bg_1_sky.webp",
    "assets/art/background/bg_2_peaks.webp",
    "assets/art/background/bg_3_village.webp",
    "assets/art/background/bg_4_lights.webp",
  ],
  mascot: {
    idle: "assets/art/mascot/goat_idle.webp",
    anticipate: "assets/art/mascot/goat_anticipate.webp",
    celebrate: "assets/art/mascot/goat_celebrate.webp",
    shock: "assets/art/mascot/goat_shock.webp",
  },
  symbols: {
    W: "assets/art/symbols/W.webp",
    S: "assets/art/symbols/S.webp",
    C1: "assets/art/symbols/C1.webp",
    C2: "assets/art/symbols/C2.webp",
    C3: "assets/art/symbols/C3.webp",
    M: "assets/art/symbols/M.webp",
    K: "assets/art/symbols/K.webp",
    H1: "assets/art/symbols/H1.webp",
    H2: "assets/art/symbols/H2.webp",
    H3: "assets/art/symbols/H3.webp",
    H4: "assets/art/symbols/H4.webp",
    H5: "assets/art/symbols/H5.webp",
    L1: "assets/art/symbols/L1.webp",
    L2: "assets/art/symbols/L2.webp",
    L3: "assets/art/symbols/L3.webp",
    L4: "assets/art/symbols/L4.webp",
  },
  ui: {
    winNice: "assets/art/ui/win_nice.webp",
    winBig: "assets/art/ui/win_big.webp",
    winMega: "assets/art/ui/win_mega.webp",
    winEpic: "assets/art/ui/win_epic.webp",
    winLegendary: "assets/art/ui/win_legendary.webp",
    fsIntro: "assets/art/ui/fs_intro.webp",
    fsOutro: "assets/art/ui/fs_outro.webp",
    buyCard: "assets/art/ui/heist_card.webp",
  },
  particles: {
    coin: "assets/art/particles/coin.webp",
    spark: "assets/art/particles/spark.webp",
    dust: "assets/art/particles/dust.webp",
  },
};

export async function detectArt() {
  try {
    const response = await fetch(MANIFEST.symbols.W, { method: "HEAD" });
    MANIFEST.useArt = response.ok;
  } catch {
    MANIFEST.useArt = false;
  }
  return MANIFEST.useArt;
}
