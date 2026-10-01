export const SYMBOLS = [
  { id: 'H1', name: 'Golden Goat', type: 'high', pays: [0, 0, 4.5, 22.5, 112.5] },
  { id: 'H2', name: 'Watering Can', type: 'high', pays: [0, 0, 3.6, 13.5, 67.5] },
  { id: 'H3', name: 'Golden Goat', type: 'high', pays: [0, 0, 2.3, 9.0, 45.0] },
  { id: 'H4', name: 'Watering Can', type: 'high', pays: [0, 0, 1.8, 6.8, 33.8] },
  { id: 'L1', name: 'Ace', type: 'low', pays: [0, 0, 0.9, 3.6, 13.5] },
  { id: 'L2', name: 'King', type: 'low', pays: [0, 0, 0.9, 2.7, 11.3] },
  { id: 'L3', name: 'Queen', type: 'low', pays: [0, 0, 0.5, 2.3, 9.0] },
  { id: 'L4', name: 'Jack', type: 'low', pays: [0, 0, 0.5, 1.8, 6.8] },
  { id: 'WILD', name: 'Wild', type: 'wild', pays: [0, 0, 6.8, 45.0, 225.0] },
  { id: 'SCATTER', name: 'Scatter', type: 'scatter', pays: [0, 0, 0, 0, 0] },
];

export const PAYTABLE_MULTIPLIER = 0.9812;

export const RTP = 96.20;
export const MAX_WIN = 220.77;
export const GAME_TITLE = 'Golden Goat Garden SSA';
export const GAME_DESCRIPTION = 'A 5-reel, 3-row garden slot featuring five fixed paylines and wild symbols.';
export const BET_MODES = [
  { id: 'BASE', name: 'Base Game', description: 'Standard spins on the Golden Goat Garden reels.', cost: '1x selected bet per spin' },
];
export const DISCLAIMER =
  'RTP is theoretical and based on 1M simulated spins. Actual results may vary. The displayed paytable multipliers include the RTP adjustment multiplier of ' +
  PAYTABLE_MULTIPLIER +
  '.';

export const WIN_COMBINATIONS = [
  'Winning combinations are evaluated on 5 fixed paylines, left to right.',
  'Wild symbols substitute for all symbols except Scatter.',
  'Scatter symbols do not form part of the regular payline wins.',
  '3+ matching symbols on a payline trigger a payout based on the paytable.',
];

export const FREE_GAME_INFO = [
  'No free games or respins are currently available in this version.',
  'The game features a single base game mode with standard reel spins.',
];

export const LANGUAGES = {
  en: 'English',
};

export const SOCIAL_MODE_NAMES = {
  bet: 'Spin',
  betLabel: 'SPIN',
  balance: 'Balance',
  win: 'Win',
  credits: 'Credits',
};

export const STAKE_MODE_NAMES = {
  bet: 'Bet',
  betLabel: 'SPIN',
  balance: 'Balance',
  win: 'Win',
  credits: 'Credits',
};
