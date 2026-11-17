import type { Content } from './types';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load ${url} (${res.status})`);
  return (await res.json()) as T;
}

/** Loads the compiled content for a language, falling back to English. */
export async function loadContent(lang: string): Promise<Content> {
  const manifest = await fetchJson<{ langs: string[] }>('generated/manifest.json');
  const use = manifest.langs.includes(lang) ? lang : 'en';
  return fetchJson<Content>(`generated/content.${use}.json`);
}

/** URL of a file inside customization/. */
export function customAsset(file: string): string {
  return `generated/customization/${file}`;
}
