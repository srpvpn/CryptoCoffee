import { ChangeEvent, useRef, useState } from 'react';
import NetworkIcon from '../components/NetworkIcon';
import Seo from '../components/Seo';
import ShareLink from '../components/ShareLink';
import WalletForm from '../components/WalletForm';
import { encodeConfig } from '../lib/encode';
import { isValidImageUrl, truncateAddress } from '../lib/validation';
import { NETWORKS, type UserConfig, type WalletEntry } from '../types';

const DEFAULT_PRESETS = [5, 10, 20];
const PROFILE_EXPORT_VERSION = 1;

type ExportedProfile = {
  version: number;
  exportedAt: string;
  profile: UserConfig;
};

function networkName(networkId: string): string {
  return NETWORKS.find((network) => network.id === networkId)?.name ?? networkId;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isWalletEntry(value: unknown): value is WalletEntry {
  if (!isRecord(value)) return false;

  return (
    typeof value.networkId === 'string' &&
    typeof value.address === 'string' &&
    value.address.trim().length > 0 &&
    (value.label === undefined || typeof value.label === 'string')
  );
}

function parseProfileImport(value: unknown): UserConfig | null {
  const candidate = isRecord(value) && isRecord(value.profile) ? value.profile : value;
  if (!isRecord(candidate)) return null;

  if (typeof candidate.name !== 'string' || candidate.name.trim().length === 0) return null;
  if (!Array.isArray(candidate.wallets) || !candidate.wallets.every(isWalletEntry)) return null;

  const presets = Array.isArray(candidate.presets)
    ? candidate.presets.filter((preset): preset is number => typeof preset === 'number' && Number.isFinite(preset) && preset > 0).slice(0, 3)
    : DEFAULT_PRESETS;

  return {
    name: candidate.name.trim(),
    description: typeof candidate.description === 'string' ? candidate.description.slice(0, 200) : '',
    avatarUrl: typeof candidate.avatarUrl === 'string' && isValidImageUrl(candidate.avatarUrl) ? candidate.avatarUrl : undefined,
    wallets: candidate.wallets,
    presets: presets.length > 0 ? presets : DEFAULT_PRESETS,
    currency: candidate.currency === 'EUR' ? 'EUR' : 'USD'
  };
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function safeFilename(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'cryptocoffee-profile';
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
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const avatarIsValid = isValidImageUrl(avatarUrl);

  const currentConfig = (): UserConfig => ({
    name: name.trim(),
    description: description.trim(),
    avatarUrl: avatarIsValid ? avatarUrl.trim() : undefined,
    wallets,
    presets: presets.map((preset) => (preset > 0 ? preset : 1)),
    currency
  });

  const handleAddWallet = (entry: WalletEntry) => {
    setWallets((prev) => [...prev, entry]);
    setWalletFormOpen(false);
    setError(null);
    setProfileMessage(null);
  };

  const handleDeleteWallet = (index: number) => {
    setWallets((prev) => prev.filter((_, walletIndex) => walletIndex !== index));
    setProfileMessage(null);
  };

  const updatePreset = (index: number, value: string) => {
    const parsed = Number(value);
    setPresets((prev) => {
      const next = [...prev];
      next[index] = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
      return next;
    });
    setProfileMessage(null);
  };

  const handleExportProfile = () => {
    const cleanName = name.trim();

    if (!cleanName) {
      setError('Name is required before exporting.');
      return;
    }

    if (wallets.length === 0) {
      setError('Add at least one wallet before exporting.');
      return;
    }

    const payload: ExportedProfile = {
      version: PROFILE_EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      profile: currentConfig()
    };

    downloadTextFile(`${safeFilename(cleanName)}.json`, `${JSON.stringify(payload, null, 2)}\n`);
    setError(null);
    setProfileMessage('Profile exported as JSON.');
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportProfile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    try {
      const parsed = JSON.parse(await file.text());
      const imported = parseProfileImport(parsed);

      if (!imported) {
        setError('Could not import this file. Please select a valid CryptoCoffee profile JSON.');
        setProfileMessage(null);
        return;
      }

      setName(imported.name);
      setDescription(imported.description ?? '');
      setAvatarUrl(imported.avatarUrl ?? '');
      setWallets(imported.wallets);
      setPresets(imported.presets.length === 3 ? imported.presets : DEFAULT_PRESETS);
      setCurrency(imported.currency);
      setGeneratedUrl('');
      setWalletFormOpen(false);
      setError(null);
      setProfileMessage('Profile imported. Review it, then generate a new page link.');
    } catch (importError) {
      console.error(importError);
      setError('Could not read this JSON file.');
      setProfileMessage(null);
    }
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

    const config = currentConfig();
    const hash = encodeConfig(config);
    const baseUrl = new URL(import.meta.env.BASE_URL, window.location.origin);
    const tipUrl = new URL('tip', baseUrl);
    tipUrl.hash = hash;
    const url = tipUrl.toString();

    if (import.meta.env.DEV) {
      console.debug('[constructor] generated config', config);
    }

    setGeneratedUrl(url);
    setError(null);
    setProfileMessage(null);
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      <Seo
        title="CryptoCoffee | Create Static Crypto Tip Pages"
        description="Create open-source static crypto tipping pages with no backend, no fees, and support for Bitcoin, Ethereum, Solana and more."
        path="/"
      />
      <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
        <section className="app-card p-5 sm:p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Create your CryptoCoffee page</h1>
            <p className="text-sm text-muted mt-1">Generate a fully static donation link in your URL hash.</p>
          </div>

          <div className="rounded-xl border border-border bg-bg/60 p-4 space-y-3">
            <div>
              <p className="text-sm font-semibold">Profile backup</p>
              <p className="text-xs text-muted mt-1">Export this setup as JSON or import a saved profile later.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleExportProfile}
                className="rounded-lg border border-border px-4 py-2 text-sm text-text hover:border-accent"
              >
                Export JSON
              </button>
              <button
                type="button"
                onClick={handleImportClick}
                className="rounded-lg border border-border px-4 py-2 text-sm text-text hover:border-accent"
              >
                Import JSON
              </button>
              <input
                ref={importInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleImportProfile}
                className="hidden"
              />
            </div>
            {profileMessage && <p className="text-xs text-success">{profileMessage}</p>}
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted font-semibold mb-3">Profile</p>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted block mb-2">Name *</label>
                  <input
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      setProfileMessage(null);
                    }}
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
                    onChange={(event) => {
                      setDescription(event.target.value.slice(0, 200));
                      setProfileMessage(null);
                    }}
                    placeholder="What are you building?"
                    rows={4}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted block mb-2">Avatar URL (optional)</label>
                  <input
                    value={avatarUrl}
                    onChange={(event) => {
                      setAvatarUrl(event.target.value);
                      setProfileMessage(null);
                    }}
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
                  onChange={(event) => {
                    setCurrency(event.target.value as 'USD' | 'EUR');
                    setProfileMessage(null);
                  }}
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
