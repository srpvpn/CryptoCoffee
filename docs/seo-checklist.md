# SEO Checklist

Use this after each production deploy to keep CryptoCoffee discoverable in search engines and AI assistants.

## URLs To Submit

- Main site: `https://srpvpn.github.io/CryptoCoffee/`
- Tip route: `https://srpvpn.github.io/CryptoCoffee/tip`
- Sitemap: `https://srpvpn.github.io/CryptoCoffee/sitemap.xml`
- Robots: `https://srpvpn.github.io/CryptoCoffee/robots.txt`
- LLM hints: `https://srpvpn.github.io/CryptoCoffee/llms.txt`

## Google Search Console

1. Add the GitHub Pages site property if it is not already verified.
2. Open URL Inspection for the homepage and request indexing.
3. Submit the sitemap URL.
4. Re-check Coverage and Page Indexing after Google recrawls.
5. Re-run after meaningful metadata or content changes.

## Bing Webmaster Tools

1. Add and verify the same site property.
2. Submit the sitemap URL.
3. Use URL inspection or submission for the homepage.
4. Review crawl issues and mobile usability warnings.

## IndexNow

GitHub Pages does not emit IndexNow automatically. If you later move behind a server or edge function, add IndexNow submission for:

- `https://srpvpn.github.io/CryptoCoffee/`
- `https://srpvpn.github.io/CryptoCoffee/tip`

For the current static setup, prioritize sitemap submission in Google and Bing.

## Rich Results Validation

1. Validate the homepage with a structured data test.
2. Confirm `WebSite` and `SoftwareApplication` JSON-LD are detected.
3. Re-test after changing title, description, schema, or canonical URL.

## AI Crawlers

1. Confirm `robots.txt` returns `200` and allows `GPTBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-SearchBot`, `PerplexityBot`, and `Google-Extended`.
2. Confirm `llms.txt` returns `200` and describes the project accurately.
3. Keep the homepage copy plain, factual, and crawlable without interaction.

## Practical Checks

1. Run `npm run build` before deploy.
2. Open the deployed homepage and inspect the final `<title>`, `<meta name="description">`, canonical link, and Open Graph tags.
3. Verify `og-image.svg` loads directly.
4. Verify `robots.txt`, `sitemap.xml`, and `llms.txt` are publicly reachable.
5. Search for `site:srpvpn.github.io/CryptoCoffee` a few days after submission to confirm indexing progress.

## Important Limitation

Individual `/tip#...` links are not good SEO landing pages because the meaningful state lives in the URL hash. Search engines and chatbots generally do not treat different hash values as separate pages.

If per-creator pages need to rank, move from hash-only config to crawlable path or query URLs with prerenderable content.
