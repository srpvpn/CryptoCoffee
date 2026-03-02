import { useState } from 'react';
import NetworkIcon from '../components/NetworkIcon';
import ShareLink from '../components/ShareLink';
import WalletForm from '../components/WalletForm';
import { encodeConfig } from '../lib/encode';
import { isValidImageUrl, truncateAddress } from '../lib/validation';
import { NETWORKS, type UserConfig, type WalletEntry } from '../types';

const DEFAULT_PRESETS = [5, 10, 20];

function networkName(networkId: string): string {
  return NETWORKS.find((network) => network.id === networkId)?.name ?? networkId;
}

export default function Constructor() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [wallets, setWallets] = useState<WalletEntry[]>([]);
  const [presets, setPresets] = useState<number[]>(DEFAULT_PRESETS);
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');
  const [walletFormOpen, setWalletFormOpen] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const avatarIsValid = isValidImageUrl(avatarUrl);

  const handleAddWallet = (entry: WalletEntry) => {
    setWallets((prev) => [...prev, entry]);
    setWalletFormOpen(false);
    setError(null);
  };

  const handleDeleteWallet = (index: number) => {
    setWallets((prev) => prev.filter((_, walletIndex) => walletIndex !== index));
  };

  const updatePreset = (index: number, value: string) => {
    const parsed = Number(value);
    setPresets((prev) => {
      const next = [...prev];
      next[index] = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
      return next;
    });
  };

  const handleGenerate = () => {
    const cleanName = name.trim();

    if (!cleanName) {
      setError('Name is required.');
      return;
    }

    if (wallets.length === 0) {
      setError('Add at least one wallet.');
      return;
    }

    const finalPresets = presets.map((preset) => (preset > 0 ? preset : 1));
    const config: UserConfig = {
      name: cleanName,
      description: description.trim(),
      avatarUrl: avatarIsValid ? avatarUrl.trim() : undefined,
      wallets,
      presets: finalPresets,
      currency
    };

    const hash = encodeConfig(config);
    const url = `${window.location.origin}/tip#${hash}`;

    console.debug('[constructor] generated config', config);

    setGeneratedUrl(url);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
        <section className="app-card p-5 sm:p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Create your CryptoCoffee page</h1>
            <p className="text-sm text-muted mt-1">Generate a fully static donation link in your URL hash.</p>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted font-semibold mb-3">Profile</p>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted block mb-2">Name *</label>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Satoshi Nakamoto"
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted flex items-center justify-between mb-2">
                    <span>Description</span>
                    <span className="text-xs">{description.length}/200</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value.slice(0, 200))}
                    placeholder="What are you building?"
                    rows={4}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted block mb-2">Avatar URL (optional)</label>
                  <input
                    value={avatarUrl}
                    onChange={(event) => setAvatarUrl(event.target.value)}
                    placeholder="https://example.com/avatar.png"
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  {avatarUrl && !avatarIsValid && (
                    <p className="text-xs text-danger mt-1">Please use a valid http(s) URL.</p>
                  )}
                  {avatarIsValid && (
                    <img
                      src={avatarUrl}
                      alt="avatar url preview"
                      className="mt-2 h-14 w-14 rounded-xl border border-border object-cover"
                    />
                  )}
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-muted font-semibold mb-3">Wallets</p>

              <div className="space-y-2">
                {wallets.map((wallet, index) => (
                  <div
                    key={`${wallet.networkId}-${wallet.address}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-bg p-3"
                  >
                    <div className="min-w-0 flex items-center gap-3">
                      <NetworkIcon networkId={wallet.networkId} className="h-5 w-5" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{networkName(wallet.networkId)}</div>
                        <div className="text-xs text-muted font-mono">{truncateAddress(wallet.address)}</div>
                        {wallet.label && <div className="text-xs text-muted">{wallet.label}</div>}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteWallet(index)}
                      className="text-xs text-danger hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setWalletFormOpen((open) => !open)}
                className="mt-3 rounded-lg border border-border px-4 py-2 text-sm text-text hover:border-accent"
              >
                {walletFormOpen ? 'Close wallet form' : 'Add wallet'}
              </button>

              {walletFormOpen && (
                <WalletForm
                  onAdd={handleAddWallet}
                  onCancel={() => setWalletFormOpen(false)}
                  initialNetworkId={wallets[0]?.networkId || 'ethereum'}
                />
              )}
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-muted font-semibold mb-3">Tip presets</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {presets.map((preset, index) => (
                  <input
                    key={index}
                    type="number"
                    min="1"
                    step="1"
                    value={preset || ''}
                    onChange={(event) => updatePreset(index, event.target.value)}
                    placeholder={`Preset ${index + 1}`}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                ))}
              </div>

              <div className="mt-3">
                <label className="text-sm text-muted block mb-2">Currency</label>
                <select
                  value={currency}
                  onChange={(event) => setCurrency(event.target.value as 'USD' | 'EUR')}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={handleGenerate}
                className="w-full rounded-lg bg-accent hover:bg-accent-hover transition-colors px-4 py-3 text-black font-semibold"
              >
                Generate my page
              </button>

              {error && <p className="text-sm text-danger mt-2">{error}</p>}
            </div>

            {generatedUrl && <ShareLink url={generatedUrl} />}
          </div>
        </section>
      </div>
    </div>
  );
}
