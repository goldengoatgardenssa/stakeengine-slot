const ink = "#1a120e";
const paper = "#f6ead2";
const copper = "#c4622d";
const copperDeep = "#7a3a18";
const moss = "#2d5c3c";
const mossDeep = "#1b3a26";
const leaf = "#7ea85a";
const gold = "#e2b15a";
const goldDeep = "#a8742a";
const berry = "#8a3450";
const cream = "#fff6e4";
const fur = "#e4c48a";
const furDeep = "#b8884e";

function frame(id, body) {
  return `<svg class="sym sym-${id}" viewBox="0 0 200 200" aria-hidden="true">
    <rect class="plate" x="6" y="6" width="188" height="188" rx="28" fill="${paper}" stroke="${ink}" stroke-width="7"/>
    <rect x="16" y="16" width="168" height="168" rx="18" fill="none" stroke="${copperDeep}" stroke-width="2" opacity="0.45"/>
    ${body}
  </svg>`;
}

export const SYMBOL_SVG = {
  L4: frame(
    "L4",
    `<g class="idle">
      <path d="M100 168c6-28 4-52 0-78" fill="none" stroke="${mossDeep}" stroke-width="8" stroke-linecap="round"/>
      <path d="M98 150c-28 6-36-10-16-20 14 2 22 10 16 20z" fill="${leaf}" stroke="${ink}" stroke-width="5"/>
      <path d="M104 128c26 8 34-12 12-22-16 2-24 12-12 22z" fill="${moss}" stroke="${ink}" stroke-width="5"/>
      <path d="M100 96c22-28 8-48-6-36-10 16 0 28 6 36z" fill="${berry}" stroke="${ink}" stroke-width="6"/>
      <path d="M86 78l-16-18M100 70V50M118 80l16-16M84 96l-14 2M120 98l14 4" fill="none" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="92" cy="88" rx="6" ry="4" fill="${gold}" stroke="${ink}" stroke-width="3"/>
    </g>`,
  ),
  L3: frame(
    "L3",
    `<g class="idle">
      <path d="M78 150h44l8 22H70z" fill="${cream}" stroke="${ink}" stroke-width="6"/>
      <path d="M70 118c8 28 52 28 60 0-10 16-50 16-60 0z" fill="${furDeep}" stroke="${ink}" stroke-width="6"/>
      <path d="M46 112c8-40 100-40 108 0-16 18-92 18-108 0z" fill="${berry}" stroke="${ink}" stroke-width="7"/>
      <path d="M64 112c6 10 66 10 72 0" fill="none" stroke="${ink}" stroke-width="4"/>
      <circle cx="78" cy="92" r="8" fill="${cream}" stroke="${ink}" stroke-width="4"/>
      <circle cx="108" cy="84" r="10" fill="${cream}" stroke="${ink}" stroke-width="4"/>
      <circle cx="132" cy="98" r="6" fill="${gold}" stroke="${ink}" stroke-width="3"/>
    </g>`,
  ),
  L2: frame(
    "L2",
    `<g class="idle">
      <path d="M58 96c8-36 78-38 86 0-14 12-72 14-86 0z" fill="${copperDeep}" stroke="${ink}" stroke-width="7"/>
      <path d="M70 92c6-8 54-8 60 2" fill="none" stroke="${gold}" stroke-width="4"/>
      <path d="M64 100c4 48 68 50 74 2-18 16-56 16-74-2z" fill="${fur}" stroke="${ink}" stroke-width="7"/>
      <path d="M118 124c10 12 6 24-6 26" fill="none" stroke="${cream}" stroke-width="5" stroke-linecap="round"/>
      <path d="M96 58c4-16 18-16 16 2" fill="none" stroke="${moss}" stroke-width="5" stroke-linecap="round"/>
    </g>`,
  ),
  L1: frame(
    "L1",
    `<g class="idle">
      <path d="M102 170c4-40 2-70-4-100" fill="none" stroke="${mossDeep}" stroke-width="8" stroke-linecap="round"/>
      <path d="M98 150c-36-4-48-28-22-40 16 8 28 20 22 40z" fill="${leaf}" stroke="${ink}" stroke-width="5"/>
      <path d="M100 128c34-2 46-26 18-40-16 10-26 22-18 40z" fill="${moss}" stroke="${ink}" stroke-width="5"/>
      <path d="M96 104c-30 0-40-24-14-34 14 8 24 18 14 34z" fill="${leaf}" stroke="${ink}" stroke-width="5"/>
      <path d="M104 86c28 2 36-20 10-32-14 10-20 18-10 32z" fill="${moss}" stroke="${ink}" stroke-width="5"/>
      <circle cx="96" cy="62" r="7" fill="${gold}" stroke="${ink}" stroke-width="4"/>
    </g>`,
  ),
  H4: frame(
    "H4",
    `<g class="idle">
      <path d="M48 118h104l-12 48c-4 14-28 18-40 18s-36-6-40-20z" fill="${copper}" stroke="${ink}" stroke-width="7"/>
      <path d="M58 132h78" stroke="${copperDeep}" stroke-width="6"/>
      <path d="M40 104h120v18H40z" fill="${copperDeep}" stroke="${ink}" stroke-width="7"/>
      <circle cx="78" cy="86" r="16" fill="${berry}" stroke="${ink}" stroke-width="6"/>
      <circle cx="104" cy="70" r="18" fill="${berry}" stroke="${ink}" stroke-width="6"/>
      <circle cx="132" cy="88" r="14" fill="${goldDeep}" stroke="${ink}" stroke-width="6"/>
      <circle cx="74" cy="80" r="4" fill="${cream}"/>
      <circle cx="100" cy="64" r="4" fill="${cream}"/>
      <path d="M70 150c8 10 40 8 48-4" fill="none" stroke="${gold}" stroke-width="4"/>
    </g>`,
  ),
  H3: frame(
    "H3",
    `<g class="idle">
      <path d="M52 78c0-22 96-22 96 2l8 62c-4 28-32 36-56 36s-52-10-56-36z" fill="${fur}" stroke="${ink}" stroke-width="7"/>
      <path d="M64 78c8 16 64 16 72 0" fill="none" stroke="${ink}" stroke-width="6"/>
      <path d="M78 70c6-16 28-14 30 4" fill="${moss}" stroke="${ink}" stroke-width="5"/>
      <circle cx="86" cy="118" r="6" fill="${goldDeep}" stroke="${ink}" stroke-width="3"/>
      <circle cx="108" cy="132" r="5" fill="${ink}"/>
      <circle cx="124" cy="114" r="4" fill="${copper}"/>
      <path d="M70 104c20 8 48 4 62-8" fill="none" stroke="${copperDeep}" stroke-width="4"/>
    </g>`,
  ),
  H2: frame(
    "H2",
    `<g class="idle">
      <path d="M70 78H36l6 22h26" fill="${copper}" stroke="${ink}" stroke-width="7" stroke-linejoin="round"/>
      <path d="M62 64h62l16 70c-4 22-30 30-50 30s-46-10-50-32z" fill="${copper}" stroke="${ink}" stroke-width="7"/>
      <path d="M124 70c28 4 30 48 2 58" fill="none" stroke="${ink}" stroke-width="8" stroke-linecap="round"/>
      <path d="M78 96h40" stroke="${gold}" stroke-width="6" stroke-linecap="round"/>
      <path d="M28 112c-16 10-8 22 6 14" fill="${leaf}" stroke="${ink}" stroke-width="5"/>
      <ellipse cx="92" cy="150" rx="16" ry="6" fill="${copperDeep}" opacity="0.35"/>
    </g>`,
  ),
  H1: frame(
    "H1",
    `<g class="idle">
      <path d="M58 168c4-62 16-90 42-90s38 28 42 90c-12 14-30 20-42 20s-30-6-42-20z" fill="${gold}" stroke="${ink}" stroke-width="7"/>
      <path d="M70 120h64M72 142h58" stroke="${goldDeep}" stroke-width="6"/>
      <path d="M118 168c6 16-2 24-12 24" fill="${goldDeep}" stroke="${ink}" stroke-width="5"/>
      <ellipse class="glint" cx="150" cy="70" rx="14" ry="9" fill="${ink}"/>
      <path d="M138 62c14-16 30-6 18 8" fill="${cream}" stroke="${ink}" stroke-width="4"/>
      <circle cx="92" cy="100" r="5" fill="${cream}"/>
    </g>`,
  ),
  S: frame(
    "S",
    `<g class="idle">
      <path d="M100 28v22" stroke="${ink}" stroke-width="6" stroke-linecap="round"/>
      <path d="M68 50h64l-8 16H76z" fill="${copperDeep}" stroke="${ink}" stroke-width="6"/>
      <path d="M72 66h56l14 58c-10 28-74 28-84 0z" fill="${copper}" stroke="${ink}" stroke-width="7"/>
      <path class="flame" d="M100 84c16 18 10 40 0 52-10-12-16-34 0-52z" fill="${gold}" stroke="${ink}" stroke-width="5"/>
      <path d="M86 96h28M86 118h28" stroke="${goldDeep}" stroke-width="4"/>
      <circle class="glow" cx="100" cy="120" r="26" fill="${gold}" opacity="0.28"/>
    </g>`,
  ),
  W: frame(
    "W",
    `<g class="idle">
      <path d="M62 78c-2-28 16-40 22-14" fill="none" stroke="${furDeep}" stroke-width="10" stroke-linecap="round"/>
      <path d="M138 78c2-28-16-40-22-14" fill="none" stroke="${furDeep}" stroke-width="10" stroke-linecap="round"/>
      <path d="M48 118c2-40 20-62 52-62s50 22 52 62c-12 28-32 40-52 40s-40-12-52-40z" fill="${fur}" stroke="${ink}" stroke-width="7"/>
      <path d="M46 112c-26 4-28 28-6 30" fill="${furDeep}" stroke="${ink}" stroke-width="6"/>
      <path d="M154 112c26 4 28 28 6 30" fill="${furDeep}" stroke="${ink}" stroke-width="6"/>
      <circle cx="82" cy="112" r="4" fill="${ink}"/>
      <circle cx="118" cy="112" r="4" fill="${ink}"/>
      <path d="M92 126h16l-2 8h-12z" fill="${berry}" stroke="${ink}" stroke-width="4"/>
      <g class="bell">
        <path d="M88 146h24l4 22c-4 8-28 8-32 0z" fill="${copper}" stroke="${ink}" stroke-width="6"/>
        <circle cx="100" cy="172" r="5" fill="${gold}" stroke="${ink}" stroke-width="3"/>
      </g>
      <path d="M126 86c16-12 28 4 14 16-12 4-18-6-14-16z" fill="${leaf}" stroke="${ink}" stroke-width="4"/>
    </g>`,
  ),
};

const ART = {
  W: "W_wild_goat",
  S: "S_scatter_lantern",
  H1: "H1_h1_honey_hive",
  H2: "H2_h2_copper_can",
  H3: "H3_h3_coin_pouch",
  H4: "H4_h4_jam_crock",
  L1: "L1_l1_apple",
  L2: "L2_l2_pear",
  L3: "L3_l3_plums",
  L4: "L4_l4_cherries",
};

export function symbolMarkup(id) {
  const file = ART[id] || ART.L4;
  const root = `assets/art-v4/symbols/layers/${file}`;
  return `<div class="sym sym-${id}" data-sym="${id}">
    <img class="ly glow" alt="" src="${root}_glow.webp" />
    <img class="ly base" alt="" src="${root}_base.webp" />
    <img class="ly hi" alt="" src="${root}_highlight.webp" />
  </div>`;
}
