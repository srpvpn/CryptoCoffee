import { useEffect, useMemo, useState } from 'react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import type { Network, PaymentAsset, WalletEntry } from '../types';
import AssetIcon from './AssetIcon';
import { truncateAddress } from '../lib/validation';
import { formatCryptoAmount } from '../lib/prices';
import { toLamports, toWeiAmountString } from '../lib/paymentUri';
import {
  detectPaymentMethod,
  getEvmWalletName,
  getSolanaWalletName,
  hasEvmExtension,
  hasSolanaExtension,
  isEvmNetwork,
  isMobileDevice,
  isSolanaNetwork,
  sendViaEthereumExtension,
  sendViaSolanaExtension,
  type PaymentMethod
} from '../lib/extensionPayments';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletEntry;
  network: Network;
  asset: PaymentAsset;
  fiatAmount: number;
  currency: 'USD' | 'EUR';
  cryptoAmount: number;
  paymentURI: string;
};

type Tab = 'mobile' | 'qr' | 'extension';
type CopyField = 'address' | 'amount' | null;

type ExtensionStatus =
  | { kind: 'success'; txHash: string }
  | { kind: 'error'; message: string }
  | null;

const EXPLORERS: Record<string, string> = {
  ethereum: 'https://etherscan.io/tx/',
  bnb: 'https://bscscan.com/tx/',
  polygon: 'https://polygonscan.com/tx/',
  arbitrum: 'https://arbiscan.io/tx/',
  base: 'https://basescan.org/tx/',
  solana: 'https://solscan.io/tx/'
};

const TRUST_WALLET_COIN_ID: Record<string, string> = {
  ethereum: '60',
  bnb: '714',
  polygon: '966'
};

function formatFiat(amount: number, currency: 'USD' | 'EUR') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

function formatWalletAmount(amount: number, decimals: number): string {
  const fixed = amount.toFixed(Math.min(decimals, 8));
  return fixed.replace(/\.?0+$/, '');
}

function walletIcon(method: PaymentMethod): string {
  if (method === 'EXTENSION_EVM') return '🦊';
  if (method === 'EXTENSION_SOLANA') return '🟣';
  return '👛';
}

export default function PaymentModal({
  isOpen,
  onClose,
  wallet,
  network,
  asset,
  fiatAmount,
  currency,
  cryptoAmount,
  paymentURI
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('mobile');
  const [mobileHint, setMobileHint] = useState('');
  const [copiedField, setCopiedField] = useState<CopyField>(null);
  const [extensionSending, setExtensionSending] = useState(false);
  const [extensionStatus, setExtensionStatus] = useState<ExtensionStatus>(null);

  const isMobile = isMobileDevice();
  const preferredMethod = useMemo(() => detectPaymentMethod(), []);

  const hasEvm = hasEvmExtension();
  const hasSolana = hasSolanaExtension();
  const networkIsEvm = isEvmNetwork(network.id);
  const networkIsSolana = isSolanaNetwork(network.id);

  const canSendViaExtension =
    (networkIsEvm && hasEvm) ||
    (networkIsSolana && hasSolana && asset.type === 'native');

  const amountLabel = formatCryptoAmount(cryptoAmount, asset.symbol, asset.decimals);
  const walletAmountValue = formatWalletAmount(cryptoAmount, asset.decimals);

  useEffect(() => {
    if (!isOpen) return;

    if (preferredMethod === 'EXTENSION_EVM' || preferredMethod === 'EXTENSION_SOLANA') {
      setActiveTab('extension');
    } else if (preferredMethod === 'DEEP_LINK') {
      setActiveTab('mobile');
    } else {
      setActiveTab('qr');
    }

    setMobileHint('');
    setCopiedField(null);
    setExtensionSending(false);
    setExtensionStatus(null);
  }, [isOpen, preferredMethod, wallet.address, network.id, cryptoAmount, asset.id]);

  const walletLinks = useMemo(() => {
    const address = wallet.address;

    if (network.id === 'bitcoin') {
      return {
        primaryLabel: 'Open in Bitcoin wallet',
        links: [] as Array<{ label: string; href: string }>
      };
    }

    if (network.id === 'solana') {
      if (asset.type !== 'native') {
        return {
          primaryLabel: 'Open in wallet app →',
          links: [] as Array<{ label: string; href: string }>
        };
      }

      const lamports = toLamports(cryptoAmount);
      return {
        primaryLabel: 'Open in wallet app →',
        links: [
          {
            label: 'Phantom',
            href: `https://phantom.app/ul/v1/transfer?recipient=${encodeURIComponent(address)}&amount=${lamports}`
          },
          {
            label: 'Solflare',
            href: `solflare://ul/v1/transfer?recipient=${encodeURIComponent(address)}&amount=${lamports}`
          }
        ]
      };
    }

    if (network.id === 'tron') {
      return {
        primaryLabel: 'Open in wallet app →',
        links: [] as Array<{ label: string; href: string }>
      };
    }

    const chainId = network.chainId ?? 1;
    const weiAmount = toWeiAmountString(cryptoAmount);
    const trustCoinId = TRUST_WALLET_COIN_ID[network.id];

    if (asset.type !== 'native') {
      return {
        primaryLabel: 'Open in wallet app →',
        links: [] as Array<{ label: string; href: string }>
      };
    }

    const links: Array<{ label: string; href: string }> = [
      {
        label: 'MetaMask',
        href: `https://metamask.app.link/send/${address}@${chainId}?value=${weiAmount}`
      },
      {
        label: 'Coinbase Wallet',
        href: `https://go.cb-wallet.com/send?address=${encodeURIComponent(address)}&chain=${chainId}&value=${weiAmount}`
      }
    ];

    if (trustCoinId) {
      links.splice(1, 0, {
        label: 'Trust Wallet',
        href: `https://link.trustwallet.com/send?coin=${trustCoinId}&address=${encodeURIComponent(address)}&amount=${walletAmountValue}`
      });
    }

    return {
      primaryLabel: 'Open in wallet app →',
      links
    };
  }, [wallet.address, network.id, network.chainId, cryptoAmount, walletAmountValue, asset.type]);

  if (!isOpen) return null;

  const detectedWalletName =
    networkIsEvm && hasEvm
      ? getEvmWalletName()
      : networkIsSolana && hasSolana
        ? getSolanaWalletName()
        : '';

  const tryCopy = async (field: Exclude<CopyField, null>, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenWallet = () => {
    setMobileHint('');
    window.location.href = paymentURI;

    window.setTimeout(() => {
      if (document.hasFocus()) {
        setActiveTab('qr');
        setMobileHint('No wallet app detected. Scan the QR code instead.');
      }
    }, 1500);
  };

  const handleExtensionSend = async () => {
    if (!canSendViaExtension) {
      if (network.id === 'bitcoin' || network.id === 'tron') {
        setExtensionStatus({ kind: 'error', message: 'Use Mobile wallet or QR for this network.' });
      } else if (networkIsEvm) {
        setExtensionStatus({ kind: 'error', message: 'No EVM extension detected. Install MetaMask or Rabby.' });
      } else if (networkIsSolana) {
        setExtensionStatus({ kind: 'error', message: 'No Solana extension detected. Install Phantom or Solflare.' });
      } else {
        setExtensionStatus({ kind: 'error', message: 'Extension is not supported for this network.' });
      }
      return;
    }

    setExtensionSending(true);
    setExtensionStatus(null);

    try {
      const result = networkIsEvm
        ? await sendViaEthereumExtension(wallet, cryptoAmount, network, asset)
        : await sendViaSolanaExtension(wallet, cryptoAmount, asset);

      if (result.success) {
        setExtensionStatus({ kind: 'success', txHash: result.txHash });
        return;
      }

      if (result.reason === 'rejected') {
        setExtensionStatus({ kind: 'error', message: 'Transaction canceled' });
        return;
      }

      if (result.reason === 'unsupported_network') {
        setExtensionStatus({ kind: 'error', message: `Switch your wallet network to ${network.name}` });
        return;
      }

      setExtensionStatus({ kind: 'error', message: result.message ?? 'Failed to send transaction.' });
    } finally {
      setExtensionSending(false);
    }
  };

  const renderQrPanel = (showDesktopHint: boolean) => (
    <div className="space-y-4">
      <div className="rounded-lg border border-border p-3 bg-bg flex items-center justify-center">
        <QRCode value={paymentURI} size={256} bgColor="#0F0F0F" fgColor="#F7931A" />
      </div>

        <div className="rounded-lg border border-border p-3 bg-bg text-sm space-y-2">
        <div className="flex justify-between gap-3">
          <span className="text-muted">Network:</span>
          <span>{network.name}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted">Asset:</span>
          <span className="inline-flex items-center gap-2">
            <AssetIcon asset={asset} networkId={network.id} className="h-4 w-4" />
            {asset.symbol}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted">Address:</span>
          <div className="flex items-center gap-2">
            <span className="font-mono">{truncateAddress(wallet.address)}</span>
            <button
              type="button"
              onClick={() => tryCopy('address', wallet.address)}
              className="text-xs border border-border rounded px-2 py-1 hover:border-accent"
            >
              {copiedField === 'address' ? 'Copied ✓' : 'Copy'}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted">Amount:</span>
          <div className="flex items-center gap-2">
            <span>{amountLabel}</span>
            <button
              type="button"
              onClick={() => tryCopy('amount', amountLabel)}
              className="text-xs border border-border rounded px-2 py-1 hover:border-accent"
            >
              {copiedField === 'amount' ? 'Copied ✓' : 'Copy'}
            </button>
          </div>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted">Approx:</span>
          <span>{formatFiat(fiatAmount, currency)}</span>
        </div>
      </div>

      <p className="text-xs text-muted text-center">
        Open your wallet → tap Scan QR → confirm transaction
      </p>

      {showDesktopHint && (
        <div className="rounded-lg border border-border p-3 text-xs text-muted space-y-2">
          <p>No wallet installed? Install MetaMask for EVM or Phantom for Solana.</p>
          <div className="flex gap-3">
            <a href="https://metamask.io/" target="_blank" rel="noreferrer" className="text-accent hover:text-accent-hover">
              MetaMask
            </a>
            <a href="https://phantom.app/" target="_blank" rel="noreferrer" className="text-accent hover:text-accent-hover">
              Phantom
            </a>
          </div>
        </div>
      )}
    </div>
  );

  const renderMobilePanel = () => (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleOpenWallet}
        className="w-full rounded-lg bg-accent hover:bg-accent-hover px-4 py-3 text-black font-semibold"
      >
        {network.id === 'bitcoin' ? 'Open in Bitcoin wallet' : walletLinks.primaryLabel}
      </button>

      {mobileHint && (
        <p className="text-sm text-muted rounded-md border border-border bg-bg px-3 py-2">{mobileHint}</p>
      )}

      {walletLinks.links.length > 0 && (
        <div className="space-y-2">
          {walletLinks.links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="block rounded-lg border border-border px-3 py-2 text-sm text-muted hover:text-text hover:border-accent"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}

      {network.id === 'tron' && (
        <p className="text-xs text-muted">
          If TronLink does not open, copy address and amount from the QR tab and send manually.
        </p>
      )}

      {asset.type !== 'native' && (
        <p className="text-xs text-muted">
          For token payments, if direct app links do not open transfer screens, use the QR Code tab.
        </p>
      )}
    </div>
  );

  const renderExtensionPanel = () => (
    <div className="space-y-3">
      {canSendViaExtension && (
        <div className="rounded-lg border border-border bg-bg px-3 py-3 text-sm">
          <p className="font-medium flex items-center gap-2">
            <span>{walletIcon(preferredMethod)}</span>
            <span>Wallet detected: {detectedWalletName}</span>
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={handleExtensionSend}
        disabled={extensionSending}
        className="w-full rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-70 px-4 py-3 text-black font-semibold"
      >
        {extensionSending
          ? 'Waiting for wallet confirmation...'
          : canSendViaExtension
            ? `Send via ${detectedWalletName} →`
            : 'Extension is not available for this network'}
      </button>

      {!canSendViaExtension && (
        <div className="rounded-lg border border-border p-3 text-xs text-muted space-y-2">
          <p>
            {network.id === 'bitcoin' || network.id === 'tron'
              ? 'Browser extension send is not supported for this network. Use Mobile wallet or QR.'
              : networkIsSolana && asset.type !== 'native'
                ? 'Solana token transfers via extension are not enabled in this flow yet. Use QR or Mobile wallet.'
                : networkIsSolana
                  ? 'Phantom or Solflare extension is required for Solana.'
                : 'MetaMask or Rabby extension is required for EVM networks.'}
          </p>
          <div className="flex gap-3">
            <a href="https://metamask.io/" target="_blank" rel="noreferrer" className="text-accent hover:text-accent-hover">
              MetaMask
            </a>
            <a href="https://phantom.app/" target="_blank" rel="noreferrer" className="text-accent hover:text-accent-hover">
              Phantom
            </a>
          </div>
        </div>
      )}

      {extensionStatus?.kind === 'success' && (
        <div className="rounded-lg border border-success/40 bg-success/10 px-3 py-3 text-sm space-y-2">
          <p className="text-success">✅ Transaction sent!</p>
          {EXPLORERS[network.id] && (
            <a
              href={`${EXPLORERS[network.id]}${extensionStatus.txHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:text-accent-hover"
            >
              View transaction →
            </a>
          )}
        </div>
      )}

      {extensionStatus?.kind === 'error' && (
        <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-3 text-sm text-danger">
          {extensionStatus.message}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/75 p-4 flex items-center justify-center" onClick={onClose}>
      <div
        className="w-full max-w-md app-card p-4 sm:p-5 space-y-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">
              Send {formatFiat(fiatAmount, currency)} · {amountLabel}
            </h3>
            <p className="text-xs text-muted mt-1">Network: {network.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-text text-xl leading-none"
            aria-label="Close payment modal"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-lg border border-border p-1 bg-bg">
          <button
            type="button"
            onClick={() => setActiveTab('mobile')}
            className={[
              'rounded-md px-2 py-2 text-xs sm:text-sm transition-colors',
              activeTab === 'mobile' ? 'bg-accent text-black font-semibold' : 'text-muted hover:text-text'
            ].join(' ')}
          >
            Mobile wallet
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={[
              'rounded-md px-2 py-2 text-xs sm:text-sm transition-colors',
              activeTab === 'qr' ? 'bg-accent text-black font-semibold' : 'text-muted hover:text-text'
            ].join(' ')}
          >
            QR Code
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('extension')}
            className={[
              'rounded-md px-2 py-2 text-xs sm:text-sm transition-colors',
              activeTab === 'extension' ? 'bg-accent text-black font-semibold' : 'text-muted hover:text-text'
            ].join(' ')}
          >
            Browser extension
          </button>
        </div>

        {activeTab === 'mobile' && renderMobilePanel()}
        {activeTab === 'qr' && renderQrPanel(!isMobile && !hasEvm && !hasSolana)}
        {activeTab === 'extension' && renderExtensionPanel()}
      </div>
    </div>
  );
}
