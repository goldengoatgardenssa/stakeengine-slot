function wrap(id, body) {
  return `<svg class="sym sym-${id}" viewBox="0 0 120 120" aria-hidden="true">
    <rect class="tile" x="5" y="5" width="110" height="110" rx="22"/>
    ${body}
  </svg>`;
}

export const SYMBOL_SVG = {
  W: wrap(
    "W",
    `<g class="goat">
      <path class="horn" d="M40 46c-2-18 10-24 14-8"/>
      <path class="horn" d="M80 46c2-18-10-24-14-8"/>
      <path class="fur" d="M34 70c0-22 10-34 26-34s26 12 26 34c-6 16-16 22-26 22s-20-6-26-22z"/>
      <path class="ear" d="M34 62c-16 2-18 16-4 18"/>
      <path class="ear" d="M86 62c16 2 18 16 4 18"/>
      <circle class="eye" cx="50" cy="68" r="2.4"/>
      <circle class="eye" cx="70" cy="68" r="2.4"/>
      <path class="nose" d="M56 76h8l-2 4h-4z"/>
      <g class="bell">
        <path d="M54 88h12l2 12c-2 4-14 4-16 0z"/>
        <circle cx="60" cy="102" r="2.5"/>
      </g>
    </g>`,
  ),
  S: wrap(
    "S",
    `<g class="lantern">
      <path class="hook" d="M60 14v12"/>
      <path class="cap" d="M44 26h32l-4 10H48z"/>
      <path class="frame" d="M46 36h28l8 34c-6 16-38 16-44 0z"/>
      <path class="flame" d="M60 46c8 10 6 20 0 26-6-6-8-16 0-26z"/>
      <path class="glass" d="M52 48h16M52 62h16"/>
    </g>`,
  ),
  H1: wrap(
    "H1",
    `<g class="hive">
      <path class="skep" d="M38 84c2-36 10-52 22-52s20 16 22 52c-6 8-14 12-22 12s-16-4-22-12z"/>
      <path class="band" d="M40 58h40M41 70h38"/>
      <path class="drip" d="M72 84c3 10-1 16-6 16"/>
      <ellipse class="bee" cx="88" cy="36" rx="6" ry="4"/>
      <path class="wing" d="M82 32c8-10 16-4 10 4"/>
    </g>`,
  ),
  H2: wrap(
    "H2",
    `<g class="can">
      <path class="spout" d="M38 58H18l4 14h14"/>
      <path class="body" d="M36 46h36l10 40c-2 12-16 16-28 16s-26-6-28-18z"/>
      <path class="handle" d="M72 50c18 2 20 28 2 34"/>
      <path class="sprig" d="M24 78c-10 6-6 14 2 8"/>
    </g>`,
  ),
  H3: wrap(
    "H3",
    `<g class="pouch">
      <path class="bag" d="M36 46c0-10 48-10 48 0l6 40c-2 14-16 18-30 18s-28-4-30-18z"/>
      <path class="tie" d="M48 46c4 8 20 8 24 0"/>
      <circle class="seed" cx="52" cy="78" r="3"/>
      <circle class="seed" cx="64" cy="86" r="3"/>
      <circle class="seed" cx="74" cy="74" r="2.5"/>
      <path class="clover" d="M58 64c4-6 10-2 6 4-6 2-8-2-6-4z"/>
    </g>`,
  ),
  H4: wrap(
    "H4",
    `<g class="crock">
      <path class="pot" d="M34 62h52l-6 30c-2 10-14 14-20 14s-18-4-20-14z"/>
      <path class="rim" d="M30 54h60v10H30z"/>
      <g class="berries">
        <circle cx="48" cy="48" r="7"/>
        <circle cx="62" cy="42" r="8"/>
        <circle cx="76" cy="50" r="6"/>
      </g>
    </g>`,
  ),
  L1: wrap(
    "L1",
    `<g class="fern">
      <path class="stem" d="M60 96c2-30 0-52-2-70"/>
      <path class="frond" d="M58 78c-16-4-22-14-14-20M58 66c-18-2-24-14-12-18M58 54c-14 0-20-10-8-14"/>
      <path class="frond right" d="M60 80c16-2 22-12 12-18M60 68c16 0 22-12 10-16M60 56c14-2 16-12 6-14"/>
    </g>`,
  ),
  L2: wrap(
    "L2",
    `<g class="acorn">
      <path class="cap" d="M34 52c4-18 48-20 54-2-8 8-46 10-54 2z"/>
      <path class="nut" d="M40 56c2 28 38 30 42 0"/>
      <path class="shine" d="M70 70c6 8 4 16-2 18"/>
    </g>`,
  ),
  L3: wrap(
    "L3",
    `<g class="stool">
      <path class="cap" d="M24 62c6-28 66-28 72 0-8 10-64 10-72 0z"/>
      <path class="gill" d="M40 66c4 8 36 8 40 0"/>
      <path class="stem" d="M52 74h16l4 22H48z"/>
      <circle class="spot" cx="46" cy="52" r="4"/>
      <circle class="spot" cx="66" cy="46" r="5"/>
      <circle class="spot" cx="80" cy="56" r="3"/>
    </g>`,
  ),
  L4: wrap(
    "L4",
    `<g class="thistle">
      <path class="stalk" d="M58 100c4-24 2-40 0-58"/>
      <path class="leaf" d="M58 78c-16 4-20-8-8-12M60 70c14 6 18-8 6-12"/>
      <path class="head" d="M60 42c14 2 16 18 0 24-16-6-14-22 0-24z"/>
      <path class="spine" d="M48 40l-8-10M60 34V22M74 40l8-10M52 48l-10-2M70 48l10-2"/>
    </g>`,
  ),
};

export function symbolMarkup(id) {
  return SYMBOL_SVG[id] || SYMBOL_SVG.L4;
}
