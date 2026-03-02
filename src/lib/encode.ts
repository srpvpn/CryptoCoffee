import type { UserConfig } from '../types';

export function encodeConfig(config: UserConfig): string {
  const json = JSON.stringify(config);
  return btoa(encodeURIComponent(json));
}

export function decodeConfig(hash: string): UserConfig | null {
  try {
    const json = decodeURIComponent(atob(hash));
    return JSON.parse(json) as UserConfig;
  } catch {
    return null;
  }
}
