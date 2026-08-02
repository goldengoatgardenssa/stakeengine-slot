import { getSymbolSVG } from "../utils/symbolSVGs.js";

export default {
  title: "Game/Base Reel",
  tags: ["autodocs"],
};

export const FullGrid = () => {
  const reelsEl = document.createElement("div");
  reelsEl.className = "story-reels";

  const symbols = [
    "traystrees50_goat_hybrid",
    "perpertium_goat_hybrid",
    "golden_goat_chrome",
    "secure_the_bag_duffel",
    "perp_coin_neon",
    "smoke_wild",
    "money_stack",
    "neon_lighter",
    "rolling_tray",
    "goat_coin",
    "A", "K", "Q", "J", "10"
  ];

  const rows = 4;
  const cols = 6;

  for (let c = 0; c < cols; c++) {
    const colDiv = document.createElement("div");
    colDiv.className = "story-reel-column";

    for (let r = 0; r < rows; r++) {
      const idx = (c * rows + r) % symbols.length;
      const sym = symbols[idx];
      const div = document.createElement("div");
      div.className = "story-symbol";
      div.innerHTML = getSymbolSVG(sym);
      colDiv.appendChild(div);
    }

    reelsEl.appendChild(colDiv);
  }

  return reelsEl;
};
