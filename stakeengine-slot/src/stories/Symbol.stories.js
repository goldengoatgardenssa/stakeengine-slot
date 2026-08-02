import symbolSVGs, { getSymbolSVG, renderSymbolToDOM } from "../utils/symbolSVGs.js";

export default {
  title: "Symbols/All Tiers",
  tags: ["autodocs"],
};

export const Premium = () => {
  const container = document.createElement("div");
  container.className = "symbol-showcase";

  const keys = Object.keys(symbolSVGs.premium);
  keys.forEach((key) => {
    const card = document.createElement("div");
    card.className = "symbol-card premium";

    const visual = document.createElement("div");
    visual.className = "symbol-visual";
    visual.innerHTML = getSymbolSVG(key);

    const label = document.createElement("div");
    label.className = "symbol-label";
    label.textContent = key;

    card.appendChild(visual);
    card.appendChild(label);
    container.appendChild(card);
  });

  return container;
};

export const Mid = () => {
  const container = document.createElement("div");
  container.className = "symbol-showcase";

  const keys = Object.keys(symbolSVGs.mid);
  keys.forEach((key) => {
    const card = document.createElement("div");
    card.className = "symbol-card mid";

    const visual = document.createElement("div");
    visual.className = "symbol-visual";
    visual.innerHTML = getSymbolSVG(key);

    const label = document.createElement("div");
    label.className = "symbol-label";
    label.textContent = key;

    card.appendChild(visual);
    card.appendChild(label);
    container.appendChild(card);
  });

  return container;
};

export const Low = () => {
  const container = document.createElement("div");
  container.className = "symbol-showcase";

  const keys = Object.keys(symbolSVGs.low);
  keys.forEach((key) => {
    const card = document.createElement("div");
    card.className = "symbol-card low";

    const visual = document.createElement("div");
    visual.className = "symbol-visual";
    visual.innerHTML = getSymbolSVG(key);

    const label = document.createElement("div");
    label.className = "symbol-label";
    label.textContent = key;

    card.appendChild(visual);
    card.appendChild(label);
    container.appendChild(card);
  });

  return container;
};
