# CryptoCoffee

CryptoCoffee is a fully static crypto donation app.
It is an open-source alternative to Buy Me a Coffee with zero backend and zero database.

## How It Works

1. Creator opens `/` and configures profile, wallets, and tip presets.
2. App serializes config as JSON and stores it in URL hash (`/tip#...`).
3. Creator shares this URL.
4. Donor opens `/tip#...`, chooses amount/network/asset, and sends a payment.
5. Payment is handled via wallet extension, deep link, or QR URI.

All state is client-side and embedded in the URL hash.

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router v6
- ethers.js (address validation)
- @solana/web3.js (extension transfer flow)
- qrcode.react

## Quick Start

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
npm run preview
```

## Create Your Donation Page

1. Run app and open `http://localhost:5173/`.
2. Fill profile and wallets.
3. Click `Generate my page`.
4. Copy generated link (`/tip#...`) and share it.
5. Open `Preview my page` to test donation flow.

## Supported Payment Methods

- Browser extensions:
  - EVM: MetaMask, Rabby, compatible `window.ethereum`
  - Solana: Phantom, Solflare
- Mobile deep links
- QR payment URI (fallback and universal flow)
- Manual wallet address copy

Supported assets are network-dependent:
- Native coin on all supported networks
- USDT/USDC where contract/mint is configured in `src/lib/assets.ts`

## Deployment

### Vercel

1. Import repo into Vercel.
2. Framework preset: `Vite`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Deploy.

### GitHub Pages

This repo includes `public/404.html` SPA fallback.

Recommended:
1. Build static output (`npm run build`).
2. Publish `dist/` to Pages branch (or use GitHub Actions).

About `base` in `vite.config.ts`:
- Current config uses `base: './'` for relative assets.
- If you prefer explicit repo base, set:
  - `base: '/<repo-name>/'`
  - Example: `base: '/CryptoCoffee/'`

## Demo

- Live demo: add your deployed URL here.

## Screenshots

Add screenshots before public launch (recommended):
- Constructor screen
- Tip page screen
- Payment modal (extension / mobile / QR tabs)

## Security & Privacy Notes

- No backend, no database, no wallet custody.
- User profile config is public in URL hash.
- Debug logs are DEV-only.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT, see [LICENSE](./LICENSE).
