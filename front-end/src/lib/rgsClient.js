import { RGSClient } from 'stake-engine';

let rgsClient = null;
let balanceListeners = [];
let roundActiveListeners = [];

function initRGSClient() {
  if (typeof window === 'undefined') return null;
  if (rgsClient) return rgsClient;

  try {
    const clientUrl = new URL(window.location.href);
    if (clientUrl.searchParams.get('lang') !== 'en') {
      clientUrl.searchParams.set('lang', 'en');
    }

    rgsClient = RGSClient({
      url: clientUrl.toString(),
      protocol: window.location.protocol.replace(':', ''),
    });

    window.addEventListener('balanceUpdate', (event) => {
      const balance = event.detail;
      balanceListeners.forEach((cb) => cb(balance));
    });

    window.addEventListener('roundActive', (event) => {
      const { active } = event.detail;
      roundActiveListeners.forEach((cb) => cb(active));
    });

    return rgsClient;
  } catch (error) {
    console.error('Failed to initialize RGS client:', error);
    return null;
  }
}

function getRGSClient() {
  if (!rgsClient) {
    rgsClient = initRGSClient();
  }
  return rgsClient;
}

function subscribeBalance(callback) {
  balanceListeners.push(callback);
  const index = balanceListeners.length - 1;
  return () => {
    balanceListeners.splice(index, 1);
  };
}

function subscribeRoundActive(callback) {
  roundActiveListeners.push(callback);
  const index = roundActiveListeners.length - 1;
  return () => {
    roundActiveListeners.splice(index, 1);
  };
}

async function authenticate() {
  const client = getRGSClient();
  if (!client) {
    return { error: 'RGS client not initialized' };
  }

  try {
    const response = await client.Authenticate();
    return response;
  } catch (error) {
    console.error('Authentication failed:', error);
    return { error: error.message || 'Authentication failed' };
  }
}

async function play(amount, mode = 'BASE') {
  const client = getRGSClient();
  if (!client) {
    return { error: 'RGS client not initialized' };
  }

  try {
    const response = await client.Play({ amount, mode });
    return response;
  } catch (error) {
    console.error('Play request failed:', error);
    return { error: error.message || 'Play request failed' };
  }
}

async function endRound() {
  const client = getRGSClient();
  if (!client) {
    return { error: 'RGS client not initialized' };
  }

  try {
    const response = await client.EndRound();
    return response;
  } catch (error) {
    console.error('End round request failed:', error);
    return { error: error.message || 'End round request failed' };
  }
}

async function sendEvent(eventValue) {
  const client = getRGSClient();
  if (!client) {
    return null;
  }

  try {
    const response = await client.Event(eventValue);
    return response;
  } catch (error) {
    console.error('Event request failed:', error);
    return null;
  }
}

function getUrlParams() {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  return result;
}

export {
  initRGSClient,
  getRGSClient,
  authenticate,
  play,
  endRound,
  sendEvent,
  subscribeBalance,
  subscribeRoundActive,
  getUrlParams,
};
