import { NETWORKS, type WalletEntry } from '../types';

const NETWORK_TO_COINGECKO: Record<string, string> = {
  bitcoin: 'bitcoin',
  ethereum: 'ethereum',
  solana: 'solana',
  bnb: 'binancecoin',
  polygon: 'matic-network',
  arbitrum: 'ethereum',
  base: 'ethereum',
  tron: 'tron'
};

const COINGECKO_IDS = ['bitcoin', 'ethereum', 'solana', 'binancecoin', 'matic-network', 'tron'];

function formatAmount(value: number, decimals: number): string {
  return value.toFixed(decimals).replace(/\.?0+$/, '');
}

function toBaseUnitString(value: number, decimals: number): string {
  const normalized = formatAmount(value, decimals);
  const [whole, fraction = ''] = normalized.split('.');
  const paddedFraction = (fraction + '0'.repeat(decimals)).slice(0, decimals);
  const units = BigInt(whole || '0') * 10n ** BigInt(decimals) + BigInt(paddedFraction || '0');
  return units.toString();
}

async function fetchPrices(vsCurrencies: string): Promise<Record<string, Record<string, number>>> {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${COINGECKO_IDS.join(',')}&vs_currencies=${vsCurrencies}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch prices from CoinGecko.');
  }
  return (await response.json()) as Record<string, Record<string, number>>;
}

export async function convertFiatToUsd(amount: number, currency: 'USD' | 'EUR'): Promise<number> {
  if (currency === 'USD') {
    return amount;
  }

  const prices = await fetchPrices('usd,eur');
  const btc = prices.bitcoin;
  if (!btc || !btc.usd || !btc.eur) {
    throw new Error('Could not compute EUR to USD conversion.');
  }

  const usdPerEur = btc.usd / btc.eur;
  return amount * usdPerEur;
}

export async function buildDeepLink(wallet: WalletEntry, usdAmount: number): Promise<string> {
  const coingeckoId = NETWORK_TO_COINGECKO[wallet.networkId];
  if (!coingeckoId) {
    throw new Error(`Unsupported network for deep link: ${wallet.networkId}`);
  }

  const prices = await fetchPrices('usd');
  const usdPrice = prices[coingeckoId]?.usd;
  if (!usdPrice || Number.isNaN(usdPrice) || usdPrice <= 0) {
    throw new Error('Price unavailable for selected network.');
  }

  const cryptoAmount = usdAmount / usdPrice;
  const address = wallet.address.trim();

  if (wallet.networkId === 'bitcoin') {
    return `bitcoin:${address}?amount=${formatAmount(cryptoAmount, 8)}`;
  }

  if (wallet.networkId === 'solana') {
    return `solana:${address}?amount=${formatAmount(cryptoAmount, 9)}&label=CryptoCoffee`;
  }

  if (wallet.networkId === 'tron') {
    return `tronlink://address=${encodeURIComponent(address)}&amount=${formatAmount(cryptoAmount, 6)}`;
  }

  const network = NETWORKS.find((item) => item.id === wallet.networkId);
  if (!network?.chainId) {
    throw new Error('Missing chainId for selected EVM network.');
  }

  const amountInWei = toBaseUnitString(cryptoAmount, 18);
  return `ethereum:${address}@${network.chainId}/transfer?value=${amountInWei}`;
}
