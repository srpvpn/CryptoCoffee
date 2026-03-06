import { useEffect } from 'react';

type SeoProps = {
  title: string;
  description: string;
  path: string;
};

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let element = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

function buildCanonical(path: string) {
  const baseUrl = new URL(import.meta.env.BASE_URL, window.location.origin);
  return new URL(path.replace(/^\//, ''), baseUrl).toString();
}

export default function Seo({ title, description, path }: SeoProps) {
  useEffect(() => {
    const canonical = buildCanonical(path);

    document.title = title;
    upsertCanonical(canonical);
    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
  }, [description, path, title]);

  return null;
}
