import { MATH } from "./math-config.js";
import { SYMBOL_META } from "../shared/engine.js";

const DISCLAIMER =
  "Malfunction voids all wins and plays. A consistent internet connection is required. In the event of a disconnection, reload the game to finish any uncompleted rounds. The expected return is calculated over many plays. The game display is not representative of any physical device and is for illustrative purposes only. Winnings are settled according to the amount received from the Remote Game Server and not from events within the web browser. TM and © 2026 Engine.";

function pct(rtp) {
  return `${(rtp * 100).toFixed(2)}%`;
}

function modeLine(social, mode, label) {
  const info = MATH.modes[mode];
  const played = social ? "played for" : "costs";
  return `${label} ${played} ${info.cost}×. Return ${pct(info.rtp)}. Maximum win ${MATH.maxWinX}×.`;
}

export function createCopy(social) {
  const spin = social ? "Play" : "Spin";
  const bet = social ? "Play" : "Bet";
  const auto = social ? "Automatic play" : "Autoplay";
  const table = social ? "Wins" : "Paytable";
  const feature = social ? "Get Heist" : "Heist";
  const strings = {
    gameName: MATH.gameName,
    tagline: "A gentleman goat, a village vault, and tumbles that pile the loot.",
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
    start: "Start",
    collect: "Collect",
    insufficient: social ? "Not enough coins for that play." : "Not enough balance for that bet.",
    connectFail: "The game server could not be reached. Check the session link and try again.",
    replayFail: "This replay could not be loaded.",
    autoTitle: social ? "Start automatic play?" : "Start autoplay?",
    autoBody: (count) =>
      social
        ? `This will place ${count} plays, one after another. You can stop at any time.`
        : `This will place ${count} bets, one after another. You can stop at any time.`,
    featureTitle: social ? "Get a heist?" : "Open a heist?",
    featureIntro: (tier, spins) => `${tier}\n${spins} free tumbles`,
    featureOutro: "The sack is full",
    freespins: "Free tumbles",
    meter: "Heist meter",
    nice: "Nice",
    big: "Big win",
    mega: "Mega win",
    epic: "Epic win",
    legendary: "Legendary",
    max: "Max win",
    preview: "Local preview",
    deeper: "The vault goes deeper",
    disclaimer: DISCLAIMER,
    uiGuide: [
      `${spin} starts one round.`,
      `${bet} steps through every amount offered for this session.`,
      `${auto} asks before it repeats plays.`,
      "Fast play shortens the tumbles. A second press stops the round early.",
      "Sound keeps music and effects apart.",
      "The space bar starts a round when no panel is open.",
    ],
  };

  const rules = [
    "LE GOATY is a 6-reel, 5-row cluster game. Five or more matching symbols touching by a side tumble away, and new symbols fall in.",
    "The Goat is wild and joins any cluster except clovers, coins, bells and the loot sack.",
    "Copper, silver and gold coins show a value. The loot sack gathers every coin on the grid.",
    "Heist bells multiply that tumble. In a heist the meter grows when a bell rings.",
    "Winning cells can turn golden and stick. In Super and Epic they stay for the whole heist and can rise through three glow levels.",
    "Three Alpine Clovers open a Normal heist, four open Super, five open Epic. Some three-clover heists reveal a deeper vault.",
    "Epic begins with golden cells already on the grid. Every heist waits for Start and ends on Collect.",
    `The maximum win in every mode is ${MATH.maxWinX}× the base play amount. Further wins in that round are not added.`,
    modeLine(social, "base", "Base"),
    modeLine(social, "ante", "Ante"),
    modeLine(social, "bonus", "Heist"),
    modeLine(social, "super", "Super"),
    modeLine(social, "epic", "Epic"),
    "Nothing on the grid carries into the next round.",
    "Displayed wins follow the result sent by the server.",
  ];

  return { strings, rules, symbols: SYMBOL_META, math: MATH };
}

const BANNED = [
  "bet", "bets", "betting", "wager", "stake", "cash", "money", "buy", "pay", "paid", "pays",
  "payout", "deposit", "withdraw", "gamble", "credit", "purchase", "rebet",
];

function collectText(value, out) {
  if (typeof value === "string") out.push(value);
  else if (typeof value === "function") out.push(value("EPIC", 8));
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
