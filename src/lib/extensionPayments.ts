import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction
} from '@solana/web3.js';
import type { Network, PaymentAsset, WalletEntry } from '../types';

type SendSuccess = {
  success: true;
  txHash: string;
};

type SendFailure = {
  success: false;
  reason: 'rejected' | 'unsupported_network' | 'error';
  message?: string;
};

export type SendResult = SendSuccess | SendFailure;

export type PaymentMethod = 'EXTENSION_EVM' | 'EXTENSION_SOLANA' | 'DEEP_LINK' | 'QR';

export function isMobileDevice(): boolean {
  return /iPhone|iPad|Android/i.test(navigator.userAgent);
}

export function hasEvmExtension(): boolean {
  return Boolean(window.ethereum);
}

export function hasSolanaExtension(): boolean {
  return Boolean(window.solana || window.solflare);
}

export function isEvmNetwork(networkId: string): boolean {
  return ['ethereum', 'bnb', 'polygon', 'arbitrum', 'base'].includes(networkId);
}

export function isSolanaNetwork(networkId: string): boolean {
  return networkId === 'solana';
}

export function detectPaymentMethod(): PaymentMethod {
  const isMobile = isMobileDevice();

  if (!isMobile && window.ethereum) {
    return 'EXTENSION_EVM';
  }

  if (!isMobile && window.solana) {
    return 'EXTENSION_SOLANA';
  }

  if (!isMobile && window.solflare) {
    return 'EXTENSION_SOLANA';
  }

  if (isMobile) {
    return 'DEEP_LINK';
  }

  return 'QR';
}

export function getEvmWalletName(): string {
  if (window.ethereum?.isMetaMask) return 'MetaMask';
  if (window.ethereum?.isRabby) return 'Rabby';
  return 'EVM Wallet';
}

export function getSolanaWalletName(): string {
  const provider = window.solana ?? window.solflare;
  if (provider?.isPhantom) return 'Phantom';
  if (provider?.isSolflare || window.solflare) return 'Solflare';
  return 'Solana Wallet';
}

function toHexChainId(chainId: number): string {
  return `0x${chainId.toString(16)}`;
}

function toWeiHex(cryptoAmount: number): string {
  const weiAmount = BigInt(Math.round(cryptoAmount * 1e18));
  return `0x${weiAmount.toString(16)}`;
}

function toBaseUnits(amount: number, decimals: number): bigint {
  const normalized = amount.toFixed(decimals);
  const [whole, fraction = ''] = normalized.split('.');
  const paddedFraction = (fraction + '0'.repeat(decimals)).slice(0, decimals);
  return BigInt(whole || '0') * 10n ** BigInt(decimals) + BigInt(paddedFraction || '0');
}

function encodeErc20TransferData(toAddress: string, amountBaseUnits: bigint): string {
  const cleanAddress = toAddress.toLowerCase().replace(/^0x/, '').padStart(64, '0');
  const value = amountBaseUnits.toString(16).padStart(64, '0');
  return `0xa9059cbb${cleanAddress}${value}`;
}

export async function sendViaEthereumExtension(
  wallet: WalletEntry,
  cryptoAmount: number,
  network: Network,
  asset: PaymentAsset
): Promise<SendResult> {
  try {
    if (!window.ethereum) {
      return { success: false, reason: 'error', message: 'No EVM wallet extension detected.' };
    }

    if (!network.chainId) {
      return { success: false, reason: 'unsupported_network', message: 'Network has no chain id.' };
    }

    const accounts = (await window.ethereum.request({
      method: 'eth_requestAccounts'
    })) as string[];

    const currentChainId = (await window.ethereum.request({
      method: 'eth_chainId'
    })) as string;

    if (parseInt(currentChainId, 16) !== network.chainId) {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: toHexChainId(network.chainId) }]
      });
    }

    const txParams =
      asset.type === 'native'
        ? {
          from: accounts[0],
          to: wallet.address,
          value: toWeiHex(cryptoAmount),
          chainId: toHexChainId(network.chainId)
        }
        : (() => {
          if (!asset.contractAddress) {
            throw new Error(`Missing contract address for ${asset.symbol} on ${network.name}`);
          }
          const amountBaseUnits = toBaseUnits(cryptoAmount, asset.decimals);
          return {
            from: accounts[0],
            to: asset.contractAddress,
            value: '0x0',
            data: encodeErc20TransferData(wallet.address, amountBaseUnits),
            chainId: toHexChainId(network.chainId)
          };
        })();

    const txHash = (await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [txParams]
    })) as string;

    return { success: true, txHash };
  } catch (error: unknown) {
    const err = error as { code?: number; message?: string };

    if (err?.code === 4001) {
      return { success: false, reason: 'rejected' };
    }

    if (err?.code === 4902) {
      return { success: false, reason: 'unsupported_network' };
    }

    return {
      success: false,
      reason: 'error',
      message: err?.message ?? 'Unknown extension error'
    };
  }
}

export async function sendViaSolanaExtension(
  wallet: WalletEntry,
  cryptoAmount: number,
  asset: PaymentAsset
): Promise<SendResult> {
  try {
    if (asset.type !== 'native') {
      return {
        success: false,
        reason: 'unsupported_network',
        message: 'Token transfer via Solana extension is not enabled. Use QR or Mobile wallet.'
      };
    }

    const provider = window.solana ?? window.solflare;

    if (!provider) {
      return { success: false, reason: 'error', message: 'No Solana wallet extension detected.' };
    }

    await provider.connect();

    const connection = new Connection('https://api.mainnet-beta.solana.com');
    const fromPubkey =
      provider.publicKey instanceof PublicKey
        ? provider.publicKey
        : new PublicKey(String(provider.publicKey));
    const toPubkey = new PublicKey(wallet.address);
    const lamports = Math.round(cryptoAmount * LAMPORTS_PER_SOL);

    const transaction = new Transaction().add(
      SystemProgram.transfer({ fromPubkey, toPubkey, lamports })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;

    const signed = (await provider.signAndSendTransaction(transaction)) as {
      signature?: string;
    };

    const txHash = signed.signature ?? '';
    if (!txHash) {
      return { success: false, reason: 'error', message: 'Wallet did not return transaction signature.' };
    }

    return { success: true, txHash };
  } catch (error: unknown) {
    const err = error as { code?: number; message?: string };

    if (err?.code === 4001 || err?.message?.toLowerCase().includes('rejected')) {
      return { success: false, reason: 'rejected' };
    }

    return {
      success: false,
      reason: 'error',
      message: err?.message ?? 'Unknown Solana extension error'
    };
  }
}
