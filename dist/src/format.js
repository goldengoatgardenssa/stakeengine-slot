export const API_AMOUNT = 1_000_000;

export const CURRENCIES = {
  USD: { symbol: "$", decimals: 2 },
  CAD: { symbol: "CA$", decimals: 2 },
  JPY: { symbol: "¥", decimals: 0 },
  EUR: { symbol: "€", decimals: 2 },
  RUB: { symbol: "₽", decimals: 2 },
  CNY: { symbol: "CN¥", decimals: 2 },
  PHP: { symbol: "₱", decimals: 2 },
  INR: { symbol: "₹", decimals: 2 },
  IDR: { symbol: "Rp", decimals: 0 },
  KRW: { symbol: "₩", decimals: 0 },
  BRL: { symbol: "R$", decimals: 2 },
  MXN: { symbol: "MX$", decimals: 2 },
  DKK: { symbol: "KR", decimals: 2, symbolAfter: true },
  PLN: { symbol: "zł", decimals: 2, symbolAfter: true },
  VND: { symbol: "₫", decimals: 0, symbolAfter: true },
  TRY: { symbol: "₺", decimals: 2 },
  CLP: { symbol: "CLP", decimals: 0, symbolAfter: true },
  ARS: { symbol: "ARS", decimals: 2, symbolAfter: true },
  PEN: { symbol: "S/", decimals: 2 },
  XGC: { symbol: "GC", decimals: 2, symbolAfter: true, social: true },
  XSC: { symbol: "SC", decimals: 2, symbolAfter: true, social: true },
};

export function fromApi(amount) {
  return Number(amount) / API_AMOUNT;
}

export function toApi(amount) {
  return Math.round(Number(amount) * API_AMOUNT);
}

function neededDecimals(value, minimum) {
  if (!Number.isFinite(value) || value === 0) return minimum;
  const abs = Math.abs(value);
  if (abs >= 1 / 10 ** minimum - 1e-12) return minimum;
  const digits = Math.min(6, Math.max(minimum, Math.ceil(-Math.log10(abs))));
  return digits;
}

export function formatMoney(amount, currency = "USD") {
  const meta = CURRENCIES[currency] || { symbol: currency, decimals: 2, symbolAfter: true };
  const sign = amount < 0 ? "-" : "";
  const decimals = neededDecimals(amount, meta.decimals);
  const body = Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: meta.decimals === 0 && decimals === 0 ? 0 : Math.max(meta.decimals, decimals === meta.decimals ? meta.decimals : decimals),
    maximumFractionDigits: decimals,
  });
  if (meta.social || meta.symbolAfter) return `${sign}${body} ${meta.symbol}`;
  return `${sign}${meta.symbol}${body}`;
}

export function formatMultiplier(hundredths) {
  const value = hundredths / 100;
  const text = value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return `${text}×`;
}
