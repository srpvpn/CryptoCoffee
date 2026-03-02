import { isAddress } from 'ethers';

const EVM_NETWORKS = new Set(['ethereum', 'bnb', 'polygon', 'arbitrum', 'base']);
const BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]+$/;

export function validateWalletAddress(networkId: string, address: string): { isValid: boolean; error?: string } {
  const value = address.trim();

  if (!value) {
    return { isValid: false, error: 'Address is required.' };
  }

  if (networkId === 'bitcoin') {
    if (value.startsWith('1') || value.startsWith('3') || value.toLowerCase().startsWith('bc1')) {
      return { isValid: true };
    }
    return { isValid: false, error: 'Bitcoin address must start with 1, 3, or bc1.' };
  }

  if (EVM_NETWORKS.has(networkId)) {
    if (value.startsWith('0x') && value.length === 42 && isAddress(value)) {
      return { isValid: true };
    }
    return { isValid: false, error: 'EVM address must start with 0x and be 42 chars long.' };
  }

  if (networkId === 'solana') {
    if (value.length >= 32 && value.length <= 44 && BASE58_RE.test(value)) {
      return { isValid: true };
    }
    return { isValid: false, error: 'Solana address must be base58 and 32-44 chars long.' };
  }

  if (networkId === 'tron') {
    if (value.startsWith('T') && value.length === 34 && BASE58_RE.test(value)) {
      return { isValid: true };
    }
    return { isValid: false, error: 'Tron address must start with T and be 34 chars long.' };
  }

  return { isValid: false, error: 'Unsupported network.' };
}

export function isValidImageUrl(url: string): boolean {
  if (!url.trim()) {
    return false;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function truncateAddress(address: string, start = 6, end = 4): string {
  if (!address) return '';
  if (address.length <= start + end + 3) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}
