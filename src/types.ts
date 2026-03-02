export interface Network {
  id: string;
  name: string;
  chainId?: number;
  symbol: string;
  decimals: number;
}

export interface WalletEntry {
  networkId: string;
  address: string;
  label?: string;
}

export type AssetId = 'native' | 'usdt' | 'usdc';

export interface PaymentAsset {
  id: AssetId;
  name: string;
  symbol: string;
  type: 'native' | 'token';
  decimals: number;
  coingeckoId: string;
  contractAddress?: string;
  mintAddress?: string;
}

export interface UserConfig {
  name: string;
  description: string;
  avatarUrl?: string;
  wallets: WalletEntry[];
  presets: number[];
  currency: 'USD' | 'EUR';
}

export const NETWORKS: Network[] = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', decimals: 8 },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', decimals: 18, chainId: 1 },
  { id: 'solana', name: 'Solana', symbol: 'SOL', decimals: 9 },
  { id: 'bnb', name: 'BNB Chain', symbol: 'BNB', decimals: 18, chainId: 56 },
  { id: 'polygon', name: 'Polygon', symbol: 'MATIC', decimals: 18, chainId: 137 },
  { id: 'arbitrum', name: 'Arbitrum', symbol: 'ETH', decimals: 18, chainId: 42161 },
  { id: 'base', name: 'Base', symbol: 'ETH', decimals: 18, chainId: 8453 },
  { id: 'tron', name: 'Tron', symbol: 'TRX', decimals: 6 }
];
