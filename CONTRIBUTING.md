# Contributing to CryptoCoffee

Thanks for contributing.

## Development Setup

```bash
npm install
npm run dev
```

Run checks before pushing:

```bash
npm run build
```

## Pull Request Guidelines

- Keep changes focused and small.
- Do not add backend or wallet custody logic.
- Keep app fully static and hash-driven.
- Use English UI copy.
- Add/update docs when behavior changes.

## Adding a New Network

Update these files:

1. `src/types.ts`
- Add network in `NETWORKS` with `id`, `symbol`, `decimals`, and `chainId` for EVM.

2. `src/components/NetworkIcon.tsx`
- Add icon mapping for new network file in `public/icons/networks/`.

3. `src/lib/assets.ts`
- Add native `coingeckoId`.
- Optionally add `usdt/usdc` contract or mint only if verified.

4. `src/lib/paymentUri.ts`
- Ensure payment URI builder supports network/asset safely.

5. `src/lib/extensionPayments.ts`
- Add extension transfer support only if reliable and safe.

6. `src/lib/prices.ts`
- Ensure required CoinGecko IDs are included in fetch/validation.

## Token Contract Safety

- Only add verified token contracts/mints.
- If not fully sure, skip the token.
- Prefer official issuer or canonical bridge addresses.

## Commit Style

Use clear commit messages:
- `feat: ...`
- `fix: ...`
- `chore: ...`
- `docs: ...`
