# CryptoCoffee

> Open-source, fully static crypto tipping app.  
> No backend. No database. All profile data lives in the URL hash.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)

CryptoCoffee is an open-source alternative to Buy Me a Coffee for crypto donations.  
Creators generate a shareable `/tip#...` link, and supporters pay using wallet extension, deep link, or QR code.

## Live Demo

### Try It Now

- App: [https://srpvpn.github.io/CryptoCoffee/](https://srpvpn.github.io/CryptoCoffee/)
- Example tip page: [Open prebuilt tip profile](https://srpvpn.github.io/CryptoCoffee/tip#JTdCJTIybmFtZSUyMiUzQSUyMnNycHZwbiUyMiUyQyUyMmRlc2NyaXB0aW9uJTIyJTNBJTIyQ3J5cHRvQ29mZmVlJTIyJTJDJTIyYXZhdGFyVXJsJTIyJTNBJTIyaHR0cHMlM0ElMkYlMkZhdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbSUyRnUlMkYyMDk2NTQ3MjElM0ZzJTNENDAwJTI2diUzRDQlMjIlMkMlMjJ3YWxsZXRzJTIyJTNBJTVCJTdCJTIybmV0d29ya0lkJTIyJTNBJTIydHJvbiUyMiUyQyUyMmFkZHJlc3MlMjIlM0ElMjJUQTcxUldZeVN4elNDQlRUbmQzcGVmZUw2WkpwUkFQQzRlJTIyJTJDJTIybGFiZWwlMjIlM0ElMjJtYWluJTIyJTdEJTJDJTdCJTIybmV0d29ya0lkJTIyJTNBJTIyc29sYW5hJTIyJTJDJTIyYWRkcmVzcyUyMiUzQSUyMkh2OEQ3ODM2VVdoTHJlZmlIUm11Q2d3RURxQkJ5dTdKdVhhQ041Mnc0ODM2JTIyJTJDJTIybGFiZWwlMjIlM0ElMjJtYWluJTIyJTdEJTJDJTdCJTIybmV0d29ya0lkJTIyJTNBJTIyYm5iJTIyJTJDJTIyYWRkcmVzcyUyMiUzQSUyMjB4MzZFZEU0RDcwMmYxQ2VBZjIwM2VhOWYzRDNCM2EwNTQ2MjdFNTA1ZSUyMiUyQyUyMmxhYmVsJTIyJTNBJTIybWFpbiUyMiU3RCUyQyU3QiUyMm5ldHdvcmtJZCUyMiUzQSUyMmV0aGVyZXVtJTIyJTJDJTIyYWRkcmVzcyUyMiUzQSUyMjB4MzZFZEU0RDcwMmYxQ2VBZjIwM2VhOWYzRDNCM2EwNTQ2MjdFNTA1ZSUyMiUyQyUyMmxhYmVsJTIyJTNBJTIybWFpbiUyMiU3RCUyQyU3QiUyMm5ldHdvcmtJZCUyMiUzQSUyMmFyYml0cnVtJTIyJTJDJTIyYWRkcmVzcyUyMiUzQSUyMjB4MzZFZEU0RDcwMmYxQ2VBZjIwM2VhOWYzRDNCM2EwNTQ2MjdFNTA1ZSUyMiUyQyUyMmxhYmVsJTIyJTNBJTIybWFpbiUyMiU3RCUyQyU3QiUyMm5ldHdvcmtJZCUyMiUzQSUyMmJhc2UlMjIlMkMlMjJhZGRyZXNzJTIyJTNBJTIyMHgzNkVkRTRENzAyZjFDZUFmMjAzZWE5ZjNEM0IzYTA1NDYyN0U1MDVlJTIyJTJDJTIybGFiZWwlMjIlM0ElMjJtYWluJTIyJTdEJTJDJTdCJTIybmV0d29ya0lkJTIyJTNBJTIyYml0Y29pbiUyMiUyQyUyMmFkZHJlc3MlMjIlM0ElMjJiYzFxbXVzenVtZ2dzZzY1ODRkZnhleGQ1aDZoN2ZldDRzZTV5cmF4dGYlMjIlMkMlMjJsYWJlbCUyMiUzQSUyMm1haW4lMjIlN0QlNUQlMkMlMjJwcmVzZXRzJTIyJTNBJTVCMSUyQzUlMkMxMCU1RCUyQyUyMmN1cnJlbmN5JTIyJTNBJTIyVVNEJTIyJTdE)

## Support This Project

If you want to support development, you can tip here:

[Send a tip to srpvpn](https://srpvpn.github.io/CryptoCoffee/tip#JTdCJTIybmFtZSUyMiUzQSUyMnNycHZwbiUyMiUyQyUyMmRlc2NyaXB0aW9uJTIyJTNBJTIyQ3J5cHRvQ29mZmVlJTIyJTJDJTIyYXZhdGFyVXJsJTIyJTNBJTIyaHR0cHMlM0ElMkYlMkZhdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbSUyRnUlMkYyMDk2NTQ3MjElM0ZzJTNENDAwJTI2diUzRDQlMjIlMkMlMjJ3YWxsZXRzJTIyJTNBJTVCJTdCJTIybmV0d29ya0lkJTIyJTNBJTIydHJvbiUyMiUyQyUyMmFkZHJlc3MlMjIlM0ElMjJUQTcxUldZeVN4elNDQlRUbmQzcGVmZUw2WkpwUkFQQzRlJTIyJTJDJTIybGFiZWwlMjIlM0ElMjJtYWluJTIyJTdEJTJDJTdCJTIybmV0d29ya0lkJTIyJTNBJTIyc29sYW5hJTIyJTJDJTIyYWRkcmVzcyUyMiUzQSUyMkh2OEQ3ODM2VVdoTHJlZmlIUm11Q2d3RURxQkJ5dTdKdVhhQ041Mnc0ODM2JTIyJTJDJTIybGFiZWwlMjIlM0ElMjJtYWluJTIyJTdEJTJDJTdCJTIybmV0d29ya0lkJTIyJTNBJTIyYm5iJTIyJTJDJTIyYWRkcmVzcyUyMiUzQSUyMjB4MzZFZEU0RDcwMmYxQ2VBZjIwM2VhOWYzRDNCM2EwNTQ2MjdFNTA1ZSUyMiUyQyUyMmxhYmVsJTIyJTNBJTIybWFpbiUyMiU3RCUyQyU3QiUyMm5ldHdvcmtJZCUyMiUzQSUyMmV0aGVyZXVtJTIyJTJDJTIyYWRkcmVzcyUyMiUzQSUyMjB4MzZFZEU0RDcwMmYxQ2VBZjIwM2VhOWYzRDNCM2EwNTQ2MjdFNTA1ZSUyMiUyQyUyMmxhYmVsJTIyJTNBJTIybWFpbiUyMiU3RCUyQyU3QiUyMm5ldHdvcmtJZCUyMiUzQSUyMmFyYml0cnVtJTIyJTJDJTIyYWRkcmVzcyUyMiUzQSUyMjB4MzZFZEU0RDcwMmYxQ2VBZjIwM2VhOWYzRDNCM2EwNTQ2MjdFNTA1ZSUyMiUyQyUyMmxhYmVsJTIyJTNBJTIybWFpbiUyMiU3RCUyQyU3QiUyMm5ldHdvcmtJZCUyMiUzQSUyMmJhc2UlMjIlMkMlMjJhZGRyZXNzJTIyJTNBJTIyMHgzNkVkRTRENzAyZjFDZUFmMjAzZWE5ZjNEM0IzYTA1NDYyN0U1MDVlJTIyJTJDJTIybGFiZWwlMjIlM0ElMjJtYWluJTIyJTdEJTJDJTdCJTIybmV0d29ya0lkJTIyJTNBJTIyYml0Y29pbiUyMiUyQyUyMmFkZHJlc3MlMjIlM0ElMjJiYzFxbXVzenVtZ2dzZzY1ODRkZnhleGQ1aDZoN2ZldDRzZTV5cmF4dGYlMjIlMkMlMjJsYWJlbCUyMiUzQSUyMm1haW4lMjIlN0QlNUQlMkMlMjJwcmVzZXRzJTIyJTNBJTVCMSUyQzUlMkMxMCU1RCUyQyUyMmN1cnJlbmN5JTIyJTNBJTIyVVNEJTIyJTdE)

## Screenshots

### Constructor

![CryptoCoffee Constructor](./docs/screenshots/constructor.png)

### Tip Page

![CryptoCoffee Tip Page](./docs/screenshots/tip-page.png)

## How It Works

1. Creator opens `/` and configures profile, wallets, and tip presets.
2. App serializes config as JSON and encodes it into Base64 URL hash.
3. Creator shares a link like `/tip#eyJ...`.
4. Donor opens the link, selects amount/network/asset, and sends payment.
5. App builds payment URI and uses extension/deep link/QR flow.

All state is client-side and embedded in hash payload.

## Local Development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Create Your Tip Page

1. Open `https://srpvpn.github.io/CryptoCoffee/`.
2. Fill profile and wallets in constructor.
3. Click `Generate my page`.
4. Copy generated `/tip#...` link.
5. Open `Preview my page` to test.

## Security / Privacy Notes

- No backend and no custody.
- Config data in URL hash is visible to anyone with the link.
- Debug logging is development-only.

## SEO Ops

For post-deploy indexing and validation steps, see [docs/seo-checklist.md](./docs/seo-checklist.md).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT — see [LICENSE](./LICENSE).
