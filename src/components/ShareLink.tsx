import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

type Props = {
  url: string;
};

export default function ShareLink({ url }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
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

      <div className="flex items-center justify-center rounded-lg border border-border p-3 bg-bg">
        <QRCodeSVG value={url} size={140} bgColor="#0F0F0F" fgColor="#F7931A" />
      </div>

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
