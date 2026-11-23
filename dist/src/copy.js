import { MATH } from "./math-config.js";
import { SYMBOL_META } from "../shared/engine.js";

const DISCLAIMER =
  "Malfunction voids all wins and plays. A consistent internet connection is required. In the event of a disconnection, reload the game to finish any uncompleted rounds. The expected return is calculated over many plays. The game display is not representative of any physical device and is for illustrative purposes only. Winnings are settled according to the amount received from the Remote Game Server and not from events within the web browser. TM and © 2026 Engine.";

function pct(rtp) {
  return `${(rtp * 100).toFixed(2)}%`;
}

function modeLine(social, mode) {
  const info = MATH.modes[mode];
  const played = social ? "played for" : "costs";
  return `${mode === "base" ? "Base" : "Lantern"} ${played} ${info.cost}×. Return ${pct(info.rtp)}. Maximum win ${MATH.maxWinX}×.`;
}

export function createCopy(social) {
  const spin = social ? "Play" : "Spin";
  const bet = social ? "Play" : "Bet";
  const auto = social ? "Automatic play" : "Autoplay";
  const table = social ? "Wins" : "Paytable";
  const feature = social ? "Get Lantern" : "Lantern";
  const strings = {
    gameName: MATH.gameName,
    tagline: "A sunlit orchard, a copper bell, and wins that ripen.",
    spin,
    bet,
    auto,
    table,
    feature,
    balance: "Balance",
    win: "Win",
    soundOn: "Sound on",
    soundOff: "Sound off",
    info: "Game info",
    turbo: "Fast play",
    stop: "Stop",
    confirm: "Confirm",
    cancel: "Cancel",
    play: "Play",
    playAgain: "Play again",
    replay: "Replay",
    close: "Close",
    rules: "Rules",
    insufficient: social ? "Not enough coins for that play." : "Not enough balance for that bet.",
    connectFail: "The game server could not be reached. Check the session link and try again.",
    replayFail: "This replay could not be loaded.",
    autoTitle: social ? "Start automatic play?" : "Start autoplay?",
    autoBody: (count) =>
      social
        ? `This will place ${count} plays, one after another. You can stop at any time.`
        : `This will place ${count} bets, one after another. You can stop at any time.`,
    featureTitle: social ? "Get the Lantern feature?" : "Play the Lantern feature?",
    featureBody: social
      ? `Lantern Watch can be played for ${MATH.modes.lantern.cost}× the play amount. It starts the free spins immediately.`
      : `Lantern Watch costs ${MATH.modes.lantern.cost}× your bet. It starts the free spins immediately.`,
    featureIntro: (spins) => `Lantern Watch\n${spins} free spins`,
    featureOutro: "The watch is over",
    bloom: "Bell bloom",
    freespins: "Free spins",
    big: "Big win",
    mega: "Mega win",
    epic: "Epic win",
    max: "Max win",
    preview: "Local preview",
    disclaimer: DISCLAIMER,
    uiGuide: [
      `${spin} starts one round.`,
      `${bet} steps through every amount offered for this session.`,
      `${auto} asks before it repeats plays.`,
      "Fast play shortens the reels and keeps every result readable.",
      "The sound control mutes music and effects.",
      "The space bar starts a round when no panel is open.",
    ],
  };

  const rules = [
    "Copperbell Orchard is a 5-reel, 3-row game with 20 lines. Wins count from the left, on consecutive reels.",
    "The Copperbell Goat is wild and stands in for every symbol except the Orchard Lantern.",
    "Three or more Orchard Lanterns anywhere start Lantern Watch: 8, 10 or 12 free spins for 3, 4 or 5 lanterns.",
    "During Lantern Watch the bell bloom starts at 1× and grows by 1 after each winning spin, up to 3×. The bloom multiplies that spin.",
    "Three or more lanterns during the feature add 3 spins. The feature stops at 14 spins, or sooner if the maximum win is reached.",
    "The maximum win in every mode is 5,000× the base play amount. Further wins in that round are not added.",
    modeLine(social, "base"),
    modeLine(social, "lantern"),
    "Lantern Watch does not carry anything into the next round.",
    "Displayed wins follow the result sent by the server.",
  ];

  return { strings, rules, symbols: SYMBOL_META, math: MATH };
}

const BANNED = [
  "bet",
  "bets",
  "betting",
  "wager",
  "stake",
  "cash",
  "money",
  "buy",
  "pay",
  "paid",
  "pays",
  "payout",
  "deposit",
  "withdraw",
  "gamble",
  "credit",
  "purchase",
  "rebet",
];

function collectText(value, out) {
  if (typeof value === "string") out.push(value);
  else if (typeof value === "function") out.push(value(8));
  else if (Array.isArray(value)) value.forEach((item) => collectText(item, out));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => collectText(item, out));
}

export function findRestricted(copy) {
  const texts = [];
  collectText(copy.strings, texts);
  collectText(copy.rules, texts);
  const blob = texts.join("\n").toLowerCase();
  return BANNED.filter((word) => new RegExp(`\\b${word}\\b`, "i").test(blob));
}
