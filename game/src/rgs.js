import { API_AMOUNT, fromApi } from "./format.js";

const MOCK_LEVELS = [
  100000, 200000, 500000, 1000000, 2000000, 5000000, 10000000, 25000000, 50000000, 100000000, 250000000,
  1000000000,
];

function jurisdiction(social) {
  return {
    socialCasino: social,
    disabledFullscreen: false,
    disabledTurbo: false,
    disabledAutoplay: false,
    disabledSlamstop: false,
    disabledSpacebar: false,
    disabledBuyFeature: false,
    displayNetPosition: false,
    displayRTP: true,
    displaySessionTimer: false,
    minimumRoundDuration: 0,
  };
}

const LOCAL_HOST = /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i;

/** Stake sends rgs_url as a host, not an absolute URL. */
export function normalizeRgsUrl(raw) {
  if (typeof raw !== "string" || raw.trim() === "" || /\s/.test(raw)) {
    throw new Error("network");
  }
  const trimmed = raw.trim().replace(/\/+$/, "");
  const hasScheme = /^https?:\/\//i.test(trimmed);
  const candidate = hasScheme
    ? trimmed
    : `${LOCAL_HOST.test(trimmed) ? "http" : "https"}://${trimmed}`;
  let url;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error("network");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("network");
  if (!url.hostname || url.username || url.password) throw new Error("network");
  if (url.pathname !== "/" && url.pathname !== "") throw new Error("network");
  if (url.search || url.hash) throw new Error("network");
  return url.origin;
}

async function post(rgsUrl, pathname, body) {
  const endpoint = `${normalizeRgsUrl(rgsUrl)}${pathname}`;
  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (error) {
    const failure = new Error("network");
    failure.cause = error;
    throw failure;
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const failure = new Error(data?.code || data?.error || "request");
    failure.payload = data;
    throw failure;
  }
  return data;
}

function roundFromBook(book, amount, mode, cost) {
  const payout = Math.round((amount * book.payoutMultiplier) / 100);
  return {
    betID: book.id,
    amount,
    payout,
    payoutMultiplier: book.payoutMultiplier / 100,
    active: payout > 0,
    state: book.events,
    mode,
    cost,
    event: null,
  };
}

function createMock(params) {
  let pack = null;
  const social = params.get("social") === "true" || params.get("social") === "1";
  const currency = params.get("currency") || (social ? "XSC" : "USD");
  let balance = 1_000 * API_AMOUNT;
  let open = null;
  const levels = MOCK_LEVELS;

  async function load() {
    if (pack) return pack;
    const response = await fetch("./mock/pack.json");
    if (!response.ok) throw new Error("mock pack missing");
    pack = await response.json();
    return pack;
  }

  function pick(mode, force) {
    const entry = pack.modes[mode];
    if (!entry) throw new Error("mode");
    if (force) {
      const found = entry.books.find((book) => String(book.id) === String(force));
      if (found) return { book: found, cost: entry.cost };
    }
    let total = 0;
    for (const book of entry.books) total += book.weight || 1;
    let roll = Math.random() * total;
    for (const book of entry.books) {
      roll -= book.weight || 1;
      if (roll <= 0) return { book, cost: entry.cost };
    }
    return { book: entry.books[0], cost: entry.cost };
  }

  return {
    kind: "mock",
    async authenticate() {
      await load();
      return {
        balance: { amount: balance, currency },
        config: {
          gameID: "copperbell-orchard",
          minBet: levels[0],
          maxBet: levels[levels.length - 1],
          stepBet: 10000,
          defaultBetLevel: 1_000_000,
          betLevels: levels,
          jurisdiction: jurisdiction(social),
        },
        round: open,
      };
    },
    async play({ amount, mode, force }) {
      await load();
      const picked = pick(mode, force);
      const debit = amount * picked.cost;
      if (balance < debit) {
        const error = new Error("ERR_IPB");
        throw error;
      }
      balance -= debit;
      const round = roundFromBook(picked.book, amount, mode, picked.cost);
      open = round.active ? round : null;
      return { balance: { amount: balance, currency }, round };
    },
    async endRound() {
      if (open?.payout) balance += open.payout;
      open = null;
      return { balance: { amount: balance, currency } };
    },
    async event() {
      return { ok: true };
    },
    async replay({ mode, event }) {
      await load();
      const entry = pack.modes[mode];
      const book = entry?.books.find((item) => String(item.id) === String(event));
      if (!book) throw new Error("404");
      return {
        payoutMultiplier: book.payoutMultiplier / 100,
        costMultiplier: entry.cost,
        state: book.events,
      };
    },
    displayBalance: () => fromApi(balance),
  };
}

function createRemote(params) {
  const rgsUrl = normalizeRgsUrl(params.get("rgs_url"));
  const sessionID = params.get("sessionID") || "";
  const language = params.get("lang") || "en";
  return {
    kind: "remote",
    authenticate: () => post(rgsUrl, "/wallet/authenticate", { sessionID, language }),
    play: ({ amount, mode, currency }) =>
      post(rgsUrl, "/wallet/play", { sessionID, amount, mode, currency }),
    endRound: () => post(rgsUrl, "/wallet/end-round", { sessionID }),
    event: (eventIndex) => post(rgsUrl, "/bet/event", { sessionID, event: String(eventIndex) }),
    async replay({ game, version, mode, event }) {
      const url = `${rgsUrl}/bet/replay/${game}/${version}/${mode}/${event}`;
      let response;
      try {
        response = await fetch(url);
      } catch (error) {
        const failure = new Error("network");
        failure.cause = error;
        throw failure;
      }
      if (!response.ok) throw new Error("replay");
      return response.json();
    },
  };
}

function mockRequested(params) {
  return params.get("mock") === "1";
}

export async function connect(params) {
  const replay = params.get("replay") === "true";
  const rgsRaw = params.get("rgs_url");
  if (!rgsRaw) {
    if (!mockRequested(params)) throw new Error("network");
    const client = createMock(params);
    if (replay) {
      const data = await client.replay({
        mode: params.get("mode") || "base",
        event: params.get("event"),
      });
      return {
        replay: true,
        mock: true,
        client,
        replayData: data,
        currency: params.get("currency") || "USD",
      };
    }
    const auth = await client.authenticate();
    return normalizeAuth(auth, client, true);
  }
  const client = createRemote(params);
  if (replay) {
    const data = await client.replay({
      game: params.get("game"),
      version: params.get("version"),
      mode: params.get("mode") || "base",
      event: params.get("event"),
    });
    return { replay: true, mock: false, client, replayData: data, currency: params.get("currency") || "USD" };
  }
  const auth = await client.authenticate();
  return normalizeAuth(auth, client, false);
}

function normalizeAuth(auth, client, mock) {
  const currency = auth.balance?.currency || "USD";
  const levels = auth.config?.betLevels || [];
  return {
    replay: false,
    mock,
    client,
    currency,
    balance: fromApi(auth.balance?.amount || 0),
    betLevels: levels.map((level) => fromApi(level)),
    betLevelsApi: levels,
    defaultBet: fromApi(auth.config?.defaultBetLevel || levels[0] || 0),
    jurisdiction: auth.config?.jurisdiction || jurisdiction(false),
    resume: auth.round?.active ? auth.round : null,
  };
}
