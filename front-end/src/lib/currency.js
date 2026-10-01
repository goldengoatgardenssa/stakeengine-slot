const API_MULTIPLIER = 1_000_000;

const CurrencyMeta = {
  USD: { symbol: '$', decimals: 2, symbolAfter: false },
  CAD: { symbol: 'CA$', decimals: 2, symbolAfter: false },
  JPY: { symbol: '¥', decimals: 0, symbolAfter: false },
  EUR: { symbol: '€', decimals: 2, symbolAfter: false },
  RUB: { symbol: '₽', decimals: 2, symbolAfter: false },
  CNY: { symbol: 'CN¥', decimals: 2, symbolAfter: false },
  PHP: { symbol: '₱', decimals: 2, symbolAfter: false },
  INR: { symbol: '₹', decimals: 2, symbolAfter: false },
  IDR: { symbol: 'Rp', decimals: 0, symbolAfter: false },
  KRW: { symbol: '₩', decimals: 0, symbolAfter: false },
  BRL: { symbol: 'R$', decimals: 2, symbolAfter: false },
  MXN: { symbol: 'MX$', decimals: 2, symbolAfter: false },
  DKK: { symbol: 'KR', decimals: 2, symbolAfter: true },
  PLN: { symbol: 'zł', decimals: 2, symbolAfter: true },
  VND: { symbol: '₫', decimals: 0, symbolAfter: true },
  TRY: { symbol: '₺', decimals: 2, symbolAfter: false },
  CLP: { symbol: 'CLP', decimals: 0, symbolAfter: true },
  ARS: { symbol: 'ARS', decimals: 2, symbolAfter: true },
  PEN: { symbol: 'S/', decimals: 2, symbolAfter: true },
  NGN: { symbol: '₦', decimals: 2, symbolAfter: false },
  SAR: { symbol: 'SAR', decimals: 2, symbolAfter: true },
  ILS: { symbol: '₪', decimals: 2, symbolAfter: false },
  AED: { symbol: 'AED', decimals: 2, symbolAfter: true },
  TWD: { symbol: 'NT$', decimals: 2, symbolAfter: false },
  NOK: { symbol: 'kr', decimals: 2, symbolAfter: true },
  KWD: { symbol: 'KD', decimals: 3, symbolAfter: false },
  JOD: { symbol: 'JD', decimals: 3, symbolAfter: false },
  CRC: { symbol: '₡', decimals: 2, symbolAfter: false },
  TND: { symbol: 'TND', decimals: 3, symbolAfter: true },
  SGD: { symbol: 'SG$', decimals: 2, symbolAfter: false },
  MYR: { symbol: 'RM', decimals: 2, symbolAfter: false },
  OMR: { symbol: 'OMR', decimals: 3, symbolAfter: true },
  QAR: { symbol: 'QAR', decimals: 2, symbolAfter: true },
  BHD: { symbol: 'BD', decimals: 3, symbolAfter: false },
  PKR: { symbol: '₨', decimals: 2, symbolAfter: false },
  EGP: { symbol: 'ج.م', decimals: 2, symbolAfter: false },
  NZD: { symbol: 'NZ$', decimals: 2, symbolAfter: false },
  BOB: { symbol: 'Bs', decimals: 2, symbolAfter: false },
  GHS: { symbol: 'GH₵', decimals: 2, symbolAfter: false },
  KES: { symbol: 'KSh', decimals: 2, symbolAfter: false },
  MAD: { symbol: 'MAD', decimals: 2, symbolAfter: true },
  BAM: { symbol: 'KM', decimals: 2, symbolAfter: false },
  ISK: { symbol: 'kr', decimals: 0, symbolAfter: true },
  TZS: { symbol: 'TSh', decimals: 2, symbolAfter: false },
  UGX: { symbol: 'USh', decimals: 0, symbolAfter: false },
  XOF: { symbol: 'CFA', decimals: 0, symbolAfter: true },
  XGC: { symbol: 'GC', decimals: 0, symbolAfter: true },
  XSC: { symbol: 'SC', decimals: 2, symbolAfter: true },
  XEC: { symbol: 'SC', decimals: 2, symbolAfter: true },
};

function parseBalance(balance) {
  if (!balance) return { amount: 0, currency: 'USD' };
  return {
    amount: balance.amount || 0,
    currency: balance.currency || 'USD',
  };
}

function parseAmount(val) {
  return val / API_MULTIPLIER;
}

function displayAmount(balance, options = {}) {
  const currency = balance.currency || 'USD';
  const meta = CurrencyMeta[currency] || { symbol: currency, decimals: 2, symbolAfter: false };

  const browserLocale = navigator.language || 'en-US';
  const amount = parseAmount(balance.amount);

  let decimals = options.decimals ?? meta.decimals;
  if (options.includeSubcent) {
    const fractionalDigits = String(amount).split('.')[1]?.replace(/0+$/, '').length || 0;
    decimals = Math.max(decimals, Math.min(6, fractionalDigits));
  }

  if (options.trimDecimalForIntegers && amount % 1 === 0) {
    decimals = 0;
  }

  const formattedAmount = new Intl.NumberFormat(browserLocale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

  const removeSymbol = options.removeSymbol || false;

  if (meta.symbolAfter) {
    return `${formattedAmount}${removeSymbol ? '' : ' ' + meta.symbol}`;
  } else {
    return `${removeSymbol ? '' : meta.symbol}${formattedAmount}`;
  }
}

function formatDisplayAmount(amount, currency = 'USD') {
  return displayAmount({ amount, currency });
}

export { parseBalance, parseAmount, displayAmount, formatDisplayAmount, API_MULTIPLIER };
