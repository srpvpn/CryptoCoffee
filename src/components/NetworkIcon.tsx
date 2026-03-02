import { useMemo, useState, type SVGProps } from 'react';

type Props = {
  networkId: string;
  className?: string;
};

const NETWORK_ICON_PATHS: Record<string, string> = {
  bitcoin: '/icons/networks/bitcoin.svg',
  ethereum: '/icons/networks/ethereum.svg',
  solana: '/icons/networks/solana.svg',
  bnb: '/icons/networks/bnb.svg',
  polygon: '/icons/networks/polygon.svg',
  arbitrum: '/icons/networks/arbitrum.svg',
  base: '/icons/networks/base.svg',
  tron: '/icons/networks/tron.svg'
};

function Svg(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props} />;
}

function FallbackIcon({ className }: { className: string }) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="12" fill="#2A2A2A" />
      <path d="M8 8h8v8H8z" fill="#888" />
    </Svg>
  );
}

export default function NetworkIcon({ networkId, className = 'h-5 w-5' }: Props) {
  const [broken, setBroken] = useState(false);
  const src = useMemo(() => {
    const path = NETWORK_ICON_PATHS[networkId];
    if (!path) return '';
    return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
  }, [networkId]);

  if (!src || broken) {
    return <FallbackIcon className={className} />;
  }

  return (
    <img
      src={src}
      alt={`${networkId} icon`}
      className={`${className} rounded-full object-contain bg-transparent`}
      loading="lazy"
      onError={() => setBroken(true)}
    />
  );
}
