import { useMemo } from 'react';
import makeBlockie from 'ethereum-blockies-base64';

type Props = {
  address: string;
  size?: number;
};

export default function DonorAvatar({ address, size = 32 }: Props) {
  const src = useMemo(() => {
    try {
      return makeBlockie((address || 'anonymous').toLowerCase());
    } catch {
      return '';
    }
  }, [address]);

  if (!src) {
    return (
      <div
        className="rounded-full bg-border"
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
    );
  }

  return (
    <img
      src={src}
      alt="donor avatar"
      width={size}
      height={size}
      className="rounded-full border border-border"
    />
  );
}
