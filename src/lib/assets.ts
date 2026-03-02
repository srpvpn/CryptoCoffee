import { NETWORKS, type AssetId, type PaymentAsset } from '../types';

const NATIVE_COINGECKO_IDS: Record<string, string> = {
  bitcoin: 'bitcoin',
  ethereum: 'ethereum',
  solana: 'solana',
  bnb: 'binancecoin',
  polygon: 'matic-network',
  arbitrum: 'ethereum',
  base: 'ethereum',
  tron: 'tron'
};

const TOKEN_BY_NETWORK: Partial<Record<string, Partial<Record<Exclude<AssetId, 'native'>, PaymentAsset>>>> = {
  ethereum: {
    usdt: {
      id: 'usdt',
      name: 'Tether USD',
      symbol: 'USDT',
      type: 'token',
      decimals: 6,
      coingeckoId: 'tether',
      contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    },
    usdc: {
      id: 'usdc',
      name: 'USD Coin',
      symbol: 'USDC',
      type: 'token',
      decimals: 6,
      coingeckoId: 'usd-coin',
      contractAddress: '0xA0b86991c6218b36c1d19d4a2e9Eb0cE3606eB48'
    }
  },
  solana: {
    usdt: {
      id: 'usdt',
      name: 'Tether USD',
      symbol: 'USDT',
      type: 'token',
      decimals: 6,
      coingeckoId: 'tether',
      mintAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
    },
    usdc: {
      id: 'usdc',
      name: 'USD Coin',
      symbol: 'USDC',
      type: 'token',
      decimals: 6,
      coingeckoId: 'usd-coin',
      mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    }
  },
  polygon: {
    usdc: {
      id: 'usdc',
      name: 'USD Coin',
      symbol: 'USDC',
      type: 'token',
      decimals: 6,
      coingeckoId: 'usd-coin',
      contractAddress: '0x3c499c542cEF5E3811e1192ce70d8cc03d5c3359'
    }
  },
  arbitrum: {
    usdt: {
      id: 'usdt',
      name: 'Tether USD',
      symbol: 'USDT',
      type: 'token',
      decimals: 6,
      coingeckoId: 'tether',
      contractAddress: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'
    },
    usdc: {
      id: 'usdc',
      name: 'USD Coin',
      symbol: 'USDC',
      type: 'token',
      decimals: 6,
      coingeckoId: 'usd-coin',
      contractAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
    }
  },
  base: {
    usdc: {
      id: 'usdc',
      name: 'USD Coin',
      symbol: 'USDC',
      type: 'token',
      decimals: 6,
      coingeckoId: 'usd-coin',
      contractAddress: '0x833589fCD6EDb6E08f4c7C32D4f71b54bdA02913'
    }
  }
};

export function getAssetsForNetwork(networkId: string): PaymentAsset[] {
  const network = NETWORKS.find((item) => item.id === networkId);
  if (!network) return [];

  const nativeAsset: PaymentAsset = {
    id: 'native',
    name: network.name,
    symbol: network.symbol,
    type: 'native',
    decimals: network.decimals,
    coingeckoId: NATIVE_COINGECKO_IDS[network.id] ?? network.id
  };

  const tokens = TOKEN_BY_NETWORK[networkId]
    ? Object.values(TOKEN_BY_NETWORK[networkId] ?? {})
      .filter((value): value is PaymentAsset => Boolean(value))
    : [];

  return [nativeAsset, ...tokens];
}

export function isNativeAsset(asset: PaymentAsset): boolean {
  return asset.type === 'native';
}
