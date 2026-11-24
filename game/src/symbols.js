import { MANIFEST } from "./manifest.js";

const INK = "#1a120e";
const CREAM = "#f4e7cf";
const COPPER = "#c4622d";
const GOLD = "#e2b15a";
const PINE = "#1e3a32";
const SNOW = "#f7f1e4";
const BERRY = "#8a3450";

function svg(body) {
  return `<svg viewBox="0 0 64 64" aria-hidden="true">${body}</svg>`;
}

const DRAWINGS = {
  W: svg(`<circle cx="32" cy="34" r="22" fill="${CREAM}" stroke="${INK}" stroke-width="3"/>
    <path d="M16 28c2-10 8-14 12-8 2 4 6 4 8 0 4-6 10-2 12 8" fill="${SNOW}" stroke="${INK}" stroke-width="3"/>
    <path d="M18 40c6 10 22 10 28 0" fill="${BERRY}" stroke="${INK}" stroke-width="3"/>
    <circle cx="26" cy="34" r="2" fill="${INK}"/><circle cx="38" cy="34" r="2" fill="${INK}"/>
    <path d="M29 40h6" stroke="${INK}" stroke-width="2"/>`),
  S: svg(`<path d="M32 8c6 8 6 14 0 18-6-4-6-10 0-18z" fill="#3f8f55" stroke="${INK}" stroke-width="3"/>
    <path d="M32 20c10 2 14 10 8 16-8-2-14-8-8-16z" fill="#2f7a44" stroke="${INK}" stroke-width="3"/>
    <path d="M32 20c-10 2-14 10-8 16 8-2 14-8 8-16z" fill="#4ea364" stroke="${INK}" stroke-width="3"/>
    <path d="M32 30c6 8 6 14 0 20-6-6-6-12 0-20z" fill="#2f7a44" stroke="${INK}" stroke-width="3"/>
    <circle cx="32" cy="28" r="3" fill="${GOLD}" stroke="${INK}"/>`),
  C1: svg(`<circle cx="32" cy="32" r="20" fill="${COPPER}" stroke="${INK}" stroke-width="3"/>
    <circle cx="32" cy="32" r="12" fill="none" stroke="${INK}" stroke-width="2"/>
    <text x="32" y="38" text-anchor="middle" font-size="14" font-family="Georgia" fill="${INK}">1</text>`),
  C2: svg(`<circle cx="32" cy="32" r="20" fill="#c0c6ce" stroke="${INK}" stroke-width="3"/>
    <circle cx="32" cy="32" r="12" fill="none" stroke="${INK}" stroke-width="2"/>
    <text x="32" y="38" text-anchor="middle" font-size="14" font-family="Georgia" fill="${INK}">2</text>`),
  C3: svg(`<circle cx="32" cy="32" r="20" fill="${GOLD}" stroke="${INK}" stroke-width="3"/>
    <circle cx="32" cy="32" r="12" fill="none" stroke="${INK}" stroke-width="2"/>
    <text x="32" y="38" text-anchor="middle" font-size="14" font-family="Georgia" fill="${INK}">3</text>`),
  M: svg(`<path d="M20 18h24l-3 22a9 9 0 0 1-18 0z" fill="${GOLD}" stroke="${INK}" stroke-width="3"/>
    <path d="M24 18c2 6 14 6 16 0" fill="none" stroke="${INK}" stroke-width="2"/>
    <circle cx="32" cy="48" r="4" fill="${COPPER}" stroke="${INK}" stroke-width="2"/>`),
  K: svg(`<path d="M18 26h28l4 26H14z" fill="${BERRY}" stroke="${INK}" stroke-width="3"/>
    <path d="M22 26c2-8 18-8 20 0" fill="${CREAM}" stroke="${INK}" stroke-width="3"/>
    <path d="M24 40h16" stroke="${GOLD}" stroke-width="3"/>`),
  H1: svg(`<circle cx="32" cy="32" r="18" fill="${CREAM}" stroke="${INK}" stroke-width="3"/>
    <circle cx="32" cy="32" r="3" fill="${INK}"/>
    <path d="M32 20v12l8 4" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`),
  H2: svg(`<circle cx="22" cy="32" r="8" fill="none" stroke="${INK}" stroke-width="3"/>
    <path d="M30 32h20l-4-6 4-4" fill="none" stroke="${GOLD}" stroke-width="4" stroke-linecap="round"/>`),
  H3: svg(`<circle cx="32" cy="32" r="16" fill="${BERRY}" stroke="${INK}" stroke-width="3"/>
    <circle cx="32" cy="32" r="6" fill="${GOLD}" stroke="${INK}" stroke-width="2"/>`),
  H4: svg(`<path d="M28 10c8 8 8 20 0 28" fill="none" stroke="${INK}" stroke-width="3"/>
    <ellipse cx="30" cy="42" rx="10" ry="8" fill="${COPPER}" stroke="${INK}" stroke-width="3"/>
    <path d="M20 42h8" stroke="${INK}" stroke-width="3"/>`),
  H5: svg(`<path d="M22 18h20v10c0 12-4 20-10 22-6-2-10-10-10-22z" fill="${GOLD}" stroke="${INK}" stroke-width="3"/>
    <path d="M22 28h20" stroke="${INK}" stroke-width="2"/>`),
  L1: svg(`<rect x="12" y="12" width="40" height="40" rx="6" fill="${SNOW}" stroke="${INK}" stroke-width="3"/>
    <text x="32" y="40" text-anchor="middle" font-size="22" font-family="Georgia" fill="${INK}">A</text>`),
  L2: svg(`<rect x="12" y="12" width="40" height="40" rx="6" fill="${SNOW}" stroke="${INK}" stroke-width="3"/>
    <text x="32" y="40" text-anchor="middle" font-size="22" font-family="Georgia" fill="${INK}">K</text>`),
  L3: svg(`<rect x="12" y="12" width="40" height="40" rx="6" fill="${SNOW}" stroke="${INK}" stroke-width="3"/>
    <text x="32" y="40" text-anchor="middle" font-size="22" font-family="Georgia" fill="${INK}">Q</text>`),
  L4: svg(`<rect x="12" y="12" width="40" height="40" rx="6" fill="${SNOW}" stroke="${INK}" stroke-width="3"/>
    <text x="32" y="40" text-anchor="middle" font-size="22" font-family="Georgia" fill="${PINE}">J</text>`),
};

export function mascotMarkup() {
  return `<svg class="goat-svg" viewBox="0 0 120 160" aria-hidden="true">
    <ellipse cx="60" cy="150" rx="28" ry="6" fill="#000" opacity="0.25"/>
    <path d="M34 78c-8 20 4 48 26 50 22-2 34-30 26-50" fill="${BERRY}" stroke="${INK}" stroke-width="3"/>
    <path d="M40 86h40" stroke="${GOLD}" stroke-width="4"/>
    <circle cx="60" cy="58" r="28" fill="${CREAM}" stroke="${INK}" stroke-width="3"/>
    <path d="M36 48c4-22 12-30 16-18" fill="${SNOW}" stroke="${INK}" stroke-width="3"/>
    <path d="M84 48c-4-22-12-30-16-18" fill="${SNOW}" stroke="${INK}" stroke-width="3"/>
    <circle cx="50" cy="58" r="3" fill="${INK}"/><circle cx="70" cy="58" r="3" fill="${INK}"/>
    <path d="M54 68h12" stroke="${INK}" stroke-width="2"/>
    <path d="M46 40c8-6 20-6 28 0" fill="none" stroke="${INK}" stroke-width="3"/>
    <path class="cape" d="M30 90c8 28 52 28 60 0" fill="${PINE}" stroke="${INK}" stroke-width="3"/>
  </svg>`;
}

export function symbolMarkup(cell) {
  const id = cell.name || cell.id;
  const art = MANIFEST.useArt ? `<img alt="" src="${MANIFEST.symbols[id]}" />` : "";
  const coin = cell.coin ? `<em class="coin-value">${(cell.coin / 100).toFixed(1)}</em>` : "";
  const bell = cell.bell ? `<em class="bell-value">${cell.bell}×</em>` : "";
  return `<div class="sym sym-${id}">${art}${DRAWINGS[id] || ""}<i class="dust"></i>${coin}${bell}</div>`;
}
