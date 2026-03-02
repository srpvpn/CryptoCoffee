import { useMemo, useState } from 'react';
import { NETWORKS, type WalletEntry } from '../types';
import NetworkIcon from './NetworkIcon';
import { validateWalletAddress } from '../lib/validation';

type Props = {
  onAdd: (entry: WalletEntry) => void;
  onCancel: () => void;
  initialNetworkId?: string;
};

function placeholderByNetwork(networkId: string): string {
  if (networkId === 'bitcoin') return 'bc1q...';
  if (networkId === 'solana') return 'So111111...';
  if (networkId === 'tron') return 'T...';
  return '0x...';
}

export default function WalletForm({ onAdd, onCancel, initialNetworkId = 'ethereum' }: Props) {
  const [networkId, setNetworkId] = useState(initialNetworkId);
  const [address, setAddress] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState<string | null>(null);

  const selectedNetwork = useMemo(
    () => NETWORKS.find((network) => network.id === networkId) ?? NETWORKS[0],
    [networkId]
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = validateWalletAddress(networkId, address);

    if (!result.isValid) {
      setError(result.error ?? 'Invalid address');
      return;
    }

    onAdd({
      networkId,
      address: address.trim(),
      label: label.trim() || undefined
    });

    setAddress('');
    setLabel('');
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 app-card p-4 space-y-3">
      <div>
        <label className="text-sm text-muted block mb-2">Network</label>
        <div className="relative">
          <select
            value={networkId}
            onChange={(event) => setNetworkId(event.target.value)}
            className="w-full appearance-none bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {NETWORKS.map((network) => (
              <option key={network.id} value={network.id}>
                {network.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">▾</div>
        </div>
      </div>

      <div>
        <label className="text-sm text-muted block mb-2">Address</label>
        <div className="flex items-center gap-2 border border-border rounded-lg bg-bg px-3 py-2 focus-within:ring-1 focus-within:ring-accent">
          <NetworkIcon networkId={selectedNetwork.id} className="h-4 w-4" />
          <input
            value={address}
            onChange={(event) => {
              setAddress(event.target.value);
              if (error) setError(null);
            }}
            placeholder={placeholderByNetwork(networkId)}
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-muted block mb-2">Label (optional)</label>
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="Main wallet"
          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="bg-accent hover:bg-accent-hover transition-colors text-black font-semibold rounded-lg px-4 py-2 text-sm"
        >
          Add wallet
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border border-border rounded-lg px-4 py-2 text-sm text-muted hover:text-text"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
