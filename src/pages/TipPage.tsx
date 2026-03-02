import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AmountSelector from '../components/AmountSelector';
import AssetIcon from '../components/AssetIcon';
import DonorAvatar from '../components/DonorAvatar';
import NetworkIcon from '../components/NetworkIcon';
import PaymentModal from '../components/PaymentModal';
import { decodeConfig } from '../lib/encode';
import { getAssetsForNetwork } from '../lib/assets';
import { buildPaymentURI } from '../lib/paymentUri';
import { fetchPrices, fiatToUsd, formatCryptoAmount, usdToCrypto, type PriceMap } from '../lib/prices';
import { isValidImageUrl, truncateAddress } from '../lib/validation';
import { NETWORKS, type AssetId, type Network, type PaymentAsset, type UserConfig, type WalletEntry } from '../types';

function isUserConfig(value: UserConfig | null): value is UserConfig {
  if (!value) return false;
  if (!value.name || !Array.isArray(value.wallets) || value.wallets.length === 0) return false;
  if (!Array.isArray(value.presets) || value.presets.length === 0) return false;
  if (value.currency !== 'USD' && value.currency !== 'EUR') return false;
  return true;
}

function networkName(networkId: string): string {
  return NETWORKS.find((network) => network.id === networkId)?.name ?? networkId;
}

type ModalData = {
  wallet: WalletEntry;
  network: Network;
  asset: PaymentAsset;
  fiatAmount: number;
  cryptoAmount: number;
  paymentURI: string;
};

export default function TipPage() {
  const hash = window.location.hash.slice(1);
  const decoded = useMemo(() => decodeConfig(hash), [hash]);
  const config = isUserConfig(decoded) ? decoded : null;

  const [selectedNetworkId, setSelectedNetworkId] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<AssetId>('native');
  const [selectedWalletIndex, setSelectedWalletIndex] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [isCustom, setIsCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copiedWallet, setCopiedWallet] = useState(false);

  const [prices, setPrices] = useState<PriceMap | null>(null);
  const [priceLoading, setPriceLoading] = useState(true);
  const [priceError, setPriceError] = useState<string | null>(null);

  const [modalData, setModalData] = useState<ModalData | null>(null);

  useEffect(() => {
    if (!config) return;

    const firstWallet = config.wallets[0];
    setSelectedNetworkId(firstWallet.networkId);
    setSelectedAssetId('native');
    setSelectedWalletIndex(0);
    setSelectedPreset(config.presets[0]);
    setIsCustom(false);
    setCustomAmount('');
  }, [config]);

  const loadPrices = async () => {
    setPriceLoading(true);
    setPriceError(null);

    try {
      const fetched = await fetchPrices();
      setPrices(fetched);
    } catch (fetchError) {
      console.error(fetchError);
      setPriceError('Could not fetch price. Try again.');
    } finally {
      setPriceLoading(false);
    }
  };

  useEffect(() => {
    loadPrices();
  }, []);

  if (!config) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center p-4">
        <div className="app-card p-6 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-2">Invalid link</h1>
          <p className="text-muted mb-5">This donation link is missing or corrupted.</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-accent hover:bg-accent-hover text-black font-semibold px-4 py-2"
          >
            Go to constructor
          </Link>
        </div>
      </div>
    );
  }

  const networkIds = Array.from(new Set(config.wallets.map((wallet) => wallet.networkId)));
  const activeNetworkId = selectedNetworkId || networkIds[0];
  const walletsByNetwork = config.wallets.filter((wallet) => wallet.networkId === activeNetworkId);
  const selectedWallet = walletsByNetwork[selectedWalletIndex] ?? walletsByNetwork[0];
  const selectedNetwork = NETWORKS.find((network) => network.id === activeNetworkId);
  const assets = getAssetsForNetwork(activeNetworkId);
  const selectedAsset = assets.find((asset) => asset.id === selectedAssetId) ?? assets[0];

  const displayAmount = isCustom ? Number(customAmount || 0) : selectedPreset;
  const usdAmount = fiatToUsd(displayAmount || 0, config.currency);
  const cryptoAmount = prices && selectedAsset
    ? usdToCrypto(usdAmount, selectedAsset.coingeckoId, prices)
    : 0;

  const approxText = selectedAsset
    ? `≈ ${formatCryptoAmount(cryptoAmount, selectedAsset.symbol, selectedAsset.decimals)}`
    : '';

  const handleSend = () => {
    if (!selectedWallet) {
      setError('No wallet selected.');
      return;
    }

    if (!selectedNetwork) {
      setError('Network not found.');
      return;
    }

    if (!selectedAsset) {
      setError('Asset not found for selected network.');
      return;
    }

    if (!displayAmount || displayAmount <= 0) {
      setError('Select a valid amount.');
      return;
    }

    if (!prices || priceError) {
      setError('Could not fetch price. Try again.');
      return;
    }

    const nextCryptoAmount = usdToCrypto(usdAmount, selectedAsset.coingeckoId, prices);
    if (!nextCryptoAmount || nextCryptoAmount <= 0) {
      setError('Could not calculate crypto amount.');
      return;
    }

    try {
      const paymentURI = buildPaymentURI(selectedWallet, nextCryptoAmount, selectedNetwork, selectedAsset);
      if (import.meta.env.DEV) {
        console.debug('[tip] payment uri', paymentURI);
      }

      setModalData({
        wallet: selectedWallet,
        network: selectedNetwork,
        asset: selectedAsset,
        fiatAmount: displayAmount,
        cryptoAmount: nextCryptoAmount,
        paymentURI
      });
      setError(null);
    } catch (sendError) {
      console.error(sendError);
      setError('Could not build payment URI.');
    }
  };

  const handleCopyWallet = async () => {
    if (!selectedWallet?.address) return;
    try {
      await navigator.clipboard.writeText(selectedWallet.address);
      setCopiedWallet(true);
      setTimeout(() => setCopiedWallet(false), 1500);
    } catch (copyError) {
      console.error(copyError);
      setError('Could not copy address. Please copy it manually from the card.');
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text px-4 py-8">
      <div className="max-w-lg mx-auto app-card p-5 sm:p-6 space-y-5">
        <header className="text-center">
          {config.avatarUrl && isValidImageUrl(config.avatarUrl) ? (
            <img
              src={config.avatarUrl}
              alt={config.name}
              className="mx-auto h-20 w-20 rounded-2xl object-cover border border-border"
            />
          ) : (
            <div className="mx-auto w-fit">
              <DonorAvatar address={selectedWallet?.address || config.name} size={80} />
            </div>
          )}

          <h1 className="text-2xl font-bold mt-3">{config.name}</h1>
          <p className="text-sm text-muted mt-1">{config.description || 'Support this creator with a crypto tip.'}</p>
        </header>

        <section className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-muted font-semibold">Amount</p>
          <AmountSelector
            presets={config.presets}
            currency={config.currency}
            selectedPreset={selectedPreset}
            isCustom={isCustom}
            customAmount={customAmount}
            onSelectPreset={(amount) => {
              setSelectedPreset(amount);
              setIsCustom(false);
              setCustomAmount('');
            }}
            onToggleCustom={() => {
              setIsCustom((value) => !value);
              setCustomAmount('');
            }}
            onCustomAmountChange={setCustomAmount}
          />

          {!priceLoading && !priceError && approxText && (
            <p className="text-sm text-muted">{approxText}</p>
          )}
        </section>

        <section className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-muted font-semibold">Network</p>
          <div className="flex flex-wrap gap-2">
            {networkIds.map((networkId) => (
              <button
                key={networkId}
                type="button"
                onClick={() => {
                  setSelectedNetworkId(networkId);
                  setSelectedAssetId('native');
                  setSelectedWalletIndex(0);
                }}
                className={[
                  'rounded-lg border px-3 py-2 text-sm transition-colors flex items-center gap-2',
                  activeNetworkId === networkId
                    ? 'border-accent text-accent bg-accent/10'
                    : 'border-border text-muted hover:text-text'
                ].join(' ')}
              >
                <NetworkIcon networkId={networkId} className="h-4 w-4" />
                {networkName(networkId)}
              </button>
            ))}
          </div>

          {assets.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-muted font-semibold">Asset</p>
              <div className="flex flex-wrap gap-2">
                {assets.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => setSelectedAssetId(asset.id)}
                    className={[
                      'rounded-lg border px-3 py-2 text-sm transition-colors',
                      selectedAsset?.id === asset.id
                        ? 'border-accent text-accent bg-accent/10'
                        : 'border-border text-muted hover:text-text'
                    ].join(' ')}
                  >
                    <span className="inline-flex items-center gap-2">
                      <AssetIcon asset={asset} networkId={activeNetworkId} className="h-4 w-4" />
                      {asset.symbol}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {walletsByNetwork.length > 1 && (
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider text-muted font-semibold">Choose wallet</p>
              <div className="space-y-2">
                {walletsByNetwork.map((wallet, index) => (
                  <button
                    key={`${wallet.address}-${index}`}
                    type="button"
                    onClick={() => setSelectedWalletIndex(index)}
                    className={[
                      'w-full text-left rounded-lg border px-3 py-2',
                      index === selectedWalletIndex
                        ? 'border-accent bg-accent/10'
                        : 'border-border bg-bg'
                    ].join(' ')}
                  >
                    <p className="font-mono text-sm">{truncateAddress(wallet.address)}</p>
                    {wallet.label && <p className="text-xs text-muted mt-0.5">{wallet.label}</p>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedWallet && (
            <div className="rounded-lg border border-border bg-bg p-3">
              <p className="text-xs uppercase tracking-wider text-muted">Selected wallet</p>
              <p className="font-mono mt-1 text-sm">{truncateAddress(selectedWallet.address)}</p>
              {selectedWallet.label && <p className="text-xs text-muted mt-1">{selectedWallet.label}</p>}
              <button
                type="button"
                onClick={handleCopyWallet}
                className="mt-2 rounded-md border border-border px-3 py-1.5 text-xs text-text hover:border-accent"
              >
                {copiedWallet ? 'Copied!' : 'Copy wallet address'}
              </button>
            </div>
          )}
        </section>

        <section className="space-y-3">
          <button
            type="button"
            disabled={priceLoading || Boolean(priceError) || !prices}
            onClick={handleSend}
            className="w-full rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-70 transition-colors px-4 py-3 font-semibold text-black"
          >
            {priceLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-4 w-4 rounded-full border-2 border-black/60 border-t-black animate-spin" />
                Fetching price...
              </span>
            ) : (
              `Send ${displayAmount || 0} ${config.currency} in ${selectedAsset?.symbol || selectedNetwork?.symbol || 'CRYPTO'}`
            )}
          </button>

          {priceError && (
            <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger space-y-2">
              <p>{priceError}</p>
              <button
                type="button"
                onClick={loadPrices}
                className="rounded-md border border-danger/40 px-3 py-1.5 text-xs hover:bg-danger/10"
              >
                Retry
              </button>
            </div>
          )}

          {error && <p className="text-sm text-danger">{error}</p>}
        </section>

        <footer className="border-t border-border pt-4 text-center text-xs text-muted space-y-2">
          <p>
            Powered by CryptoCoffee — open source
          </p>
          <Link to="/" className="text-accent hover:text-accent-hover">
            Create your own page
          </Link>
        </footer>
      </div>

      {modalData && (
        <PaymentModal
          isOpen={Boolean(modalData)}
          onClose={() => setModalData(null)}
          wallet={modalData.wallet}
          network={modalData.network}
          asset={modalData.asset}
          fiatAmount={modalData.fiatAmount}
          currency={config.currency}
          cryptoAmount={modalData.cryptoAmount}
          paymentURI={modalData.paymentURI}
        />
      )}
    </div>
  );
}
