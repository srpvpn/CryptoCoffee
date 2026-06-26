import NetworkIcon from './NetworkIcon';
import { isValidImageUrl, truncateAddress } from '../lib/validation';
import { NETWORKS, type UserConfig } from '../types';

type Props = {
  config: UserConfig;
};

function networkName(networkId: string): string {
  return NETWORKS.find((network) => network.id === networkId)?.name ?? networkId;
}

function networkSymbol(networkId: string): string {
  return NETWORKS.find((network) => network.id === networkId)?.symbol ?? networkId.toUpperCase();
}

export default function ProfilePreview({ config }: Props) {
  const cleanName = config.name.trim() || 'Your name';
  const cleanDescription = config.description.trim() || 'A short note about what supporters are funding.';
  const validAvatar = config.avatarUrl && isValidImageUrl(config.avatarUrl);
  const presets = config.presets.length > 0 ? config.presets : [5, 10, 20];

  return (
    <aside className="app-card p-5 sm:p-6 space-y-5 lg:sticky lg:top-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-muted font-semibold">Live preview</p>
        <p className="text-sm text-muted mt-1">See how your tip page will look before generating a link.</p>
      </div>

      <div className="rounded-2xl border border-border bg-bg p-5 space-y-5">
        <div className="flex items-center gap-4">
          {validAvatar ? (
            <img
              src={config.avatarUrl}
              alt="profile preview avatar"
              className="h-16 w-16 rounded-2xl border border-border object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-2xl border border-border bg-accent/10 flex items-center justify-center text-2xl">
              ☕
            </div>
          )}

          <div className="min-w-0">
            <h2 className="text-xl font-bold truncate">{cleanName}</h2>
            <p className="text-sm text-muted mt-1 line-clamp-2">{cleanDescription}</p>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-muted font-semibold mb-2">Tip amount</p>
          <div className="grid grid-cols-3 gap-2">
            {presets.slice(0, 3).map((preset, index) => (
              <div
                key={`${preset}-${index}`}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-center text-sm font-semibold"
              >
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: config.currency,
                  maximumFractionDigits: 0
                }).format(preset)}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-muted font-semibold mb-2">Payment options</p>
          {config.wallets.length > 0 ? (
            <div className="space-y-2">
              {config.wallets.slice(0, 4).map((wallet, index) => (
                <div
                  key={`${wallet.networkId}-${wallet.address}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-3"
                >
                  <div className="min-w-0 flex items-center gap-3">
                    <NetworkIcon networkId={wallet.networkId} className="h-5 w-5" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{wallet.label || networkName(wallet.networkId)}</p>
                      <p className="text-xs text-muted font-mono">{truncateAddress(wallet.address)}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted">{networkSymbol(wallet.networkId)}</span>
                </div>
              ))}
              {config.wallets.length > 4 && (
                <p className="text-xs text-muted text-center">+{config.wallets.length - 4} more wallets</p>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted text-center">
              Add a wallet to preview payment options.
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
