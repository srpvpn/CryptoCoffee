type Props = {
  presets: number[];
  currency: 'USD' | 'EUR';
  selectedPreset: number;
  isCustom: boolean;
  customAmount: string;
  onSelectPreset: (amount: number) => void;
  onToggleCustom: () => void;
  onCustomAmountChange: (value: string) => void;
};

function formatFiat(amount: number, currency: 'USD' | 'EUR') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

export default function AmountSelector({
  presets,
  currency,
  selectedPreset,
  isCustom,
  customAmount,
  onSelectPreset,
  onToggleCustom,
  onCustomAmountChange
}: Props) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {presets.map((preset) => {
          const active = !isCustom && selectedPreset === preset;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className={[
                'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-muted hover:text-text hover:border-accent/40'
              ].join(' ')}
            >
              {formatFiat(preset, currency)}
            </button>
          );
        })}

        <button
          type="button"
          onClick={onToggleCustom}
          className={[
            'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
            isCustom
              ? 'border-accent bg-accent/10 text-accent'
              : 'border-border text-muted hover:text-text hover:border-accent/40'
          ].join(' ')}
        >
          Custom
        </button>
      </div>

      {isCustom && (
        <input
          type="number"
          min="0"
          step="0.01"
          value={customAmount}
          onChange={(event) => onCustomAmountChange(event.target.value)}
          placeholder={`Enter amount in ${currency}`}
          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
        />
      )}
    </div>
  );
}
