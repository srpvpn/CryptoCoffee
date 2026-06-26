import { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

type Props = {
  url: string;
};

function downloadBlob(filename: string, blob: Blob) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}

export default function ShareLink({ url }: Props) {
  const [copied, setCopied] = useState(false);
  const [qrStatus, setQrStatus] = useState<string | null>(null);
  const qrWrapperRef = useRef<HTMLDivElement | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const createQrBlob = async (): Promise<Blob | null> => {
    const svg = qrWrapperRef.current?.querySelector('svg');
    if (!svg) return null;

    const serializedSvg = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([serializedSvg], { type: 'image/svg+xml;charset=utf-8' });
    const imageUrl = URL.createObjectURL(svgBlob);

    try {
      const image = new Image();
      image.decoding = 'async';
      image.src = imageUrl;
      await image.decode();

      const canvas = document.createElement('canvas');
      const padding = 48;
      const size = 512;
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext('2d');
      if (!context) return null;

      context.fillStyle = '#0f0f0f';
      context.fillRect(0, 0, size, size);
      context.drawImage(image, padding, padding, size - padding * 2, size - padding * 2);

      return await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png');
      });
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  };

  const handleDownloadQr = async () => {
    setQrStatus(null);
    const blob = await createQrBlob();
    if (!blob) {
      setQrStatus('Could not generate QR image.');
      return;
    }

    downloadBlob('cryptocoffee-qr.png', blob);
    setQrStatus('QR downloaded.');
    window.setTimeout(() => setQrStatus(null), 2000);
  };

  const handleShareQr = async () => {
    setQrStatus(null);
    const blob = await createQrBlob();
    if (!blob) {
      setQrStatus('Could not generate QR image.');
      return;
    }

    const file = new File([blob], 'cryptocoffee-qr.png', { type: 'image/png' });

    if (navigator.canShare?.({ files: [file] }) && navigator.share) {
      try {
        await navigator.share({
          title: 'CryptoCoffee tip page',
          text: 'Scan this QR code to open my CryptoCoffee page.',
          url,
          files: [file]
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        console.error(error);
      }
    }

    downloadBlob('cryptocoffee-qr.png', blob);
    setQrStatus('Sharing is not supported here, so the QR was downloaded.');
    window.setTimeout(() => setQrStatus(null), 2500);
  };

  return (
    <div className="app-card p-4 space-y-4">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-muted">Share link</p>
        <div className="flex gap-2">
          <div className="flex-1 truncate rounded-lg border border-border bg-bg px-3 py-2 text-xs text-muted">
            {url}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="min-w-20 rounded-lg bg-accent hover:bg-accent-hover transition-colors px-3 py-2 text-sm font-semibold text-black"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div ref={qrWrapperRef} className="flex items-center justify-center rounded-lg border border-border p-3 bg-bg">
        <QRCodeSVG value={url} size={140} bgColor="#0F0F0F" fgColor="#F7931A" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={handleDownloadQr}
          className="inline-flex w-full items-center justify-center rounded-lg border border-border px-3 py-2 text-sm text-text hover:border-accent"
        >
          Download QR PNG
        </button>
        <button
          type="button"
          onClick={handleShareQr}
          className="inline-flex w-full items-center justify-center rounded-lg border border-border px-3 py-2 text-sm text-text hover:border-accent"
        >
          Share QR
        </button>
      </div>

      {qrStatus && <p className="text-xs text-muted">{qrStatus}</p>}

      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex w-full items-center justify-center rounded-lg border border-border px-3 py-2 text-sm text-text hover:border-accent"
      >
        Preview my page
      </a>
    </div>
  );
}
