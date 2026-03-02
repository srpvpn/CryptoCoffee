const COINGECKO_IDS = [
  'bitcoin',
  'ethereum',
  'solana',
  'binancecoin',
  'matic-network',
  'tron',
  'tether',
  'usd-coin'
];

const COINGECKO_PRICE_URL =
  `https://api.coingecko.com/api/v3/simple/price?ids=${COINGECKO_IDS.join(',')}&vs_currencies=usd,eur`;

const CRYPTOCOMPARE_PRICE_URL =
  'https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,SOL,BNB,MATIC,TRX,USDT,USDC&tsyms=USD,EUR';

export type PriceMap = Record<string, number>;

let cachedPrices: PriceMap | null = null;
let cachedUsdPerEur = 1;
let pendingRequest: Promise<PriceMap> | null = null;

const STORAGE_KEY = 'cryptocoffee_prices_v1';
const STORAGE_TTL_MS = 30 * 60 * 1000;

const FALLBACK_PRICES: PriceMap = {
  bitcoin: 65000,
  ethereum: 3500,
  solana: 150,
  'binancecoin': 600,
  'matic-network': 1,
  tron: 0.12,
  tether: 1,
  'usd-coin': 1
};

type FetchedPrices = {
  usdByCoinId: PriceMap;
  usdPerEur: number;
};

function withTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { signal: controller.signal })
    .finally(() => clearTimeout(timeout));
}

function readStoredPrices(): PriceMap | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as {
      timestamp: number;
      usdByCoinId: PriceMap;
      usdPerEur: number;
    };

    if (!parsed.timestamp || Date.now() - parsed.timestamp > STORAGE_TTL_MS) {
      return null;
    }

    cachedUsdPerEur = parsed.usdPerEur || 1;
    return parsed.usdByCoinId;
  } catch (error) {
    console.debug('[prices] failed to read localStorage cache', error);
    return null;
  }
}

function writeStoredPrices(usdByCoinId: PriceMap, usdPerEur: number): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        usdByCoinId,
        usdPerEur
      })
    );
  } catch (error) {
    console.debug('[prices] failed to write localStorage cache', error);
  }
}

function normalizeUsdByCoinId(sourceByCoinId: PriceMap): PriceMap {
  return {
    bitcoin: sourceByCoinId.bitcoin,
    ethereum: sourceByCoinId.ethereum,
    solana: sourceByCoinId.solana,
    'binancecoin': sourceByCoinId['binancecoin'],
    'matic-network': sourceByCoinId['matic-network'],
    tron: sourceByCoinId.tron,
    tether: sourceByCoinId.tether,
    'usd-coin': sourceByCoinId['usd-coin']
  };
}

async function fetchFromCoinGecko(): Promise<FetchedPrices> {
  const response = await withTimeout(COINGECKO_PRICE_URL, 10_000);
  if (!response.ok) {
    throw new Error(`CoinGecko failed: ${response.status}`);
  }

  const data = (await response.json()) as Record<string, { usd?: number; eur?: number }>;

  const sourceByCoinId: PriceMap = {
    bitcoin: data.bitcoin?.usd ?? 0,
    ethereum: data.ethereum?.usd ?? 0,
    solana: data.solana?.usd ?? 0,
    'binancecoin': data.binancecoin?.usd ?? 0,
    'matic-network': data['matic-network']?.usd ?? 0,
    tron: data.tron?.usd ?? 0,
    tether: data.tether?.usd ?? 0,
    'usd-coin': data['usd-coin']?.usd ?? 0
  };

  const btcUsd = data.bitcoin?.usd ?? 0;
  const btcEur = data.bitcoin?.eur ?? 0;
  const usdPerEur = btcUsd && btcEur ? btcUsd / btcEur : 1;

  return {
    usdByCoinId: normalizeUsdByCoinId(sourceByCoinId),
    usdPerEur
  };
}

async function fetchFromCryptoCompare(): Promise<FetchedPrices> {
  const response = await withTimeout(CRYPTOCOMPARE_PRICE_URL, 10_000);
  if (!response.ok) {
    throw new Error(`CryptoCompare failed: ${response.status}`);
  }

  const data = (await response.json()) as Record<string, { USD?: number; EUR?: number }>;

  const sourceByCoinId: PriceMap = {
    bitcoin: data.BTC?.USD ?? 0,
    ethereum: data.ETH?.USD ?? 0,
    solana: data.SOL?.USD ?? 0,
    'binancecoin': data.BNB?.USD ?? 0,
    'matic-network': data.MATIC?.USD ?? 0,
    tron: data.TRX?.USD ?? 0,
    tether: data.USDT?.USD ?? 0,
    'usd-coin': data.USDC?.USD ?? 0
  };

  const btcUsd = data.BTC?.USD ?? 0;
  const btcEur = data.BTC?.EUR ?? 0;
  const usdPerEur = btcUsd && btcEur ? btcUsd / btcEur : 1;

  return {
    usdByCoinId: normalizeUsdByCoinId(sourceByCoinId),
    usdPerEur
  };
}

function validatePrices(usdByCoinId: PriceMap): boolean {
  return COINGECKO_IDS.every((coinId) => {
    const value = usdByCoinId[coinId];
    return Number.isFinite(value) && value > 0;
  });
}

async function fetchFromProviders(): Promise<FetchedPrices> {
  const providers: Array<() => Promise<FetchedPrices>> = [fetchFromCoinGecko, fetchFromCryptoCompare];
  let lastError: unknown = null;

  for (const provider of providers) {
    try {
      const result = await provider();
      if (validatePrices(result.usdByCoinId)) {
        return result;
      }
    } catch (error) {
      lastError = error;
      console.debug('[prices] provider failed', error);
    }
  }

  throw lastError ?? new Error('All price providers failed');
}

export async function fetchPrices(): Promise<PriceMap> {
  if (cachedPrices) {
    return cachedPrices;
  }

  if (pendingRequest) {
    return pendingRequest;
  }

  pendingRequest = (async () => {
    const stored = readStoredPrices();
    if (stored && validatePrices(stored)) {
      cachedPrices = stored;
      return stored;
    }

    try {
      const fetched = await fetchFromProviders();
      cachedUsdPerEur = fetched.usdPerEur || 1;
      cachedPrices = fetched.usdByCoinId;
      writeStoredPrices(fetched.usdByCoinId, cachedUsdPerEur);
      return fetched.usdByCoinId;
    } catch (error) {
      console.debug('[prices] all providers failed, using emergency fallback prices', error);
      cachedPrices = FALLBACK_PRICES;
      cachedUsdPerEur = 1.1;
      return FALLBACK_PRICES;
    }
  })();

  try {
    return await pendingRequest;
  } finally {
    pendingRequest = null;
  }
}

export function clearPriceCache(): void {
  cachedPrices = null;
  pendingRequest = null;
  cachedUsdPerEur = 1;
}

export function fiatToUsd(amount: number, currency: 'USD' | 'EUR'): number {
  if (currency === 'USD') {
    return amount;
  }
  return amount * cachedUsdPerEur;
}

export function usdToCrypto(
  usd: number,
  coingeckoId: string,
  prices: PriceMap
): number {
  const usdPrice = prices[coingeckoId];
  if (!usdPrice || usdPrice <= 0) {
    return 0;
  }
  return usd / usdPrice;
}

function trimFixed(amount: number, decimals: number): string {
  return amount.toFixed(decimals).replace(/\.?0+$/, '');
}

function displayDecimalsForSymbol(symbol: string, maxDecimalsHint: number): number {
  const preferredBySymbol: Record<string, number> = {
    BTC: 8,
    ETH: 6,
    SOL: 6,
    BNB: 6,
    MATIC: 4,
    TRX: 2,
    USDT: 2,
    USDC: 2
  };

  const preferred = preferredBySymbol[symbol] ?? 6;
  return Math.max(2, Math.min(8, Math.min(preferred, maxDecimalsHint)));
}

export function formatCryptoAmount(amount: number, symbol: string, decimals = 6): string {
  let displayDecimals = displayDecimalsForSymbol(symbol, decimals);

  if (amount > 0 && amount < 1 / 10 ** displayDecimals) {
    displayDecimals = Math.min(8, Math.max(displayDecimals + 2, 6));
  }

  const value = trimFixed(amount, displayDecimals);
  return `${value || '0'} ${symbol}`;
}
