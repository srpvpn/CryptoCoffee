import { useMemo, useState } from 'react';
import type { PaymentAsset } from '../types';
import NetworkIcon from './NetworkIcon';

type Props = {
  asset: PaymentAsset;
  networkId: string;
  className?: string;
};

const ASSET_ICON_PATHS: Record<string, string> = {
  usdt: '/icons/assets/usdt.svg',
  usdc: '/icons/assets/usdc.svg'
};

export default function AssetIcon({ asset, networkId, className = 'h-4 w-4' }: Props) {
  const [broken, setBroken] = useState(false);
  const src = useMemo(() => {
    const path = ASSET_ICON_PATHS[asset.id];
    if (!path) return '';
    return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
  }, [asset.id]);

  if (asset.type === 'native') {
    return <NetworkIcon networkId={networkId} className={className} />;
  }

  if (!src || broken) {
    return (
      <div className={`${className} rounded-full bg-border text-[10px] font-semibold text-text flex items-center justify-center`}>
        {asset.symbol.slice(0, 2)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${asset.symbol} icon`}
      className={`${className} rounded-full object-contain`}
      loading="lazy"
      onError={() => setBroken(true)}
    />
  );
}
