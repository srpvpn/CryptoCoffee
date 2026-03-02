import type { Network, PaymentAsset, WalletEntry } from '../types';

function trimFixed(amount: number, decimals: number): string {
  return amount.toFixed(decimals).replace(/\.?0+$/, '');
}

function toBaseUnits(amount: number, decimals: number): bigint {
  const normalized = amount.toFixed(decimals);
  const [whole, fraction = ''] = normalized.split('.');
  const padded = (fraction + '0'.repeat(decimals)).slice(0, decimals);
  return BigInt(whole || '0') * 10n ** BigInt(decimals) + BigInt(padded || '0');
}

function toWeiHex(cryptoAmount: number): string {
  const wei = toBaseUnits(cryptoAmount, 18);
  return `0x${wei.toString(16)}`;
}

function buildTronUri(address: string, trxAmount: number): string {
  const payload = `{"url":"tronscan.org","action":"transferAsset","to":"${address}","amount":"${trimFixed(trxAmount, 6)}","tokenId":"_"}`;
  return `tronlinkoutside://pull.activity?param=${payload}`;
}

function buildEvmTokenUri(
  walletAddress: string,
  network: Network,
  asset: PaymentAsset,
  cryptoAmount: number
): string {
  if (!network.chainId) {
    throw new Error('Missing chain id for EVM payment URI');
  }

  if (!asset.contractAddress) {
    throw new Error(`Missing contract address for ${asset.symbol} on ${network.name}`);
  }

  const amountBaseUnits = toBaseUnits(cryptoAmount, asset.decimals).toString();
  return `ethereum:${asset.contractAddress}@${network.chainId}/transfer?address=${walletAddress}&uint256=${amountBaseUnits}`;
}

function buildSolanaUri(
  walletAddress: string,
  asset: PaymentAsset,
  cryptoAmount: number
): string {
  const base = `solana:${walletAddress}?amount=${trimFixed(cryptoAmount, asset.decimals)}`;
  const withToken = asset.type === 'token' && asset.mintAddress
    ? `${base}&spl-token=${asset.mintAddress}`
    : base;

  return `${withToken}&label=CryptoCoffee&message=Thank+you`;
}

export function buildPaymentURI(
  wallet: WalletEntry,
  cryptoAmount: number,
  network: Network,
  asset: PaymentAsset
): string {
  const address = wallet.address.trim();

  if (network.id === 'bitcoin') {
    return `bitcoin:${address}?amount=${trimFixed(cryptoAmount, 8)}&label=CryptoCoffee`;
  }

  if (network.id === 'solana') {
    return buildSolanaUri(address, asset, cryptoAmount);
  }

  if (network.id === 'tron') {
    if (asset.type !== 'native') {
      throw new Error('Tron token deep links are not supported in a wallet-safe way.');
    }
    return buildTronUri(address, cryptoAmount);
  }

  if (asset.type === 'token') {
    return buildEvmTokenUri(address, network, asset, cryptoAmount);
  }

  if (!network.chainId) {
    throw new Error('Missing chain id for EVM payment URI');
  }

  const weiHex = toWeiHex(cryptoAmount);
  return `ethereum:${address}@${network.chainId}?value=${weiHex}`;
}

export function toWeiHexAmount(cryptoAmount: number): string {
  return toWeiHex(cryptoAmount);
}

export function toLamports(cryptoAmount: number): string {
  return toBaseUnits(cryptoAmount, 9).toString();
}
