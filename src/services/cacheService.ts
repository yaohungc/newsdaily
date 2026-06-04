import type { FeedCache, NewsArticle } from '../types';

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const CACHE_PREFIX = 'newsdaily_cache_';
const CACHE_VERSION = 'v4'; // bump to force-clear all caches

// On load, clear any caches from old versions
(function clearOldVersionCaches() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(k => {
      if (k.startsWith(CACHE_PREFIX) && !k.startsWith(`${CACHE_PREFIX}${CACHE_VERSION}_`)) {
        localStorage.removeItem(k);
      }
    });
  } catch { /* ignore */ }
})();

export function getCachedFeed(key: string): NewsArticle[] | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${CACHE_VERSION}_${key}`);
    if (!raw) return null;
    const cache: FeedCache = JSON.parse(raw);
    if (Date.now() - cache.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(`${CACHE_PREFIX}${CACHE_VERSION}_${key}`);
      return null;
    }
    return cache.articles;
  } catch {
    return null;
  }
}

export function setCachedFeed(key: string, articles: NewsArticle[]): void {
  try {
    const cache: FeedCache = { articles, timestamp: Date.now() };
    localStorage.setItem(`${CACHE_PREFIX}${CACHE_VERSION}_${key}`, JSON.stringify(cache));
  } catch {
    clearOldCaches();
  }
}

export function clearOldCaches(): void {
  const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
  keys.forEach(k => localStorage.removeItem(k));
}

export function getLastRefreshTime(): Date | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}last_refresh`);
    if (!raw) return null;
    return new Date(parseInt(raw));
  } catch {
    return null;
  }
}

export function setLastRefreshTime(): void {
  localStorage.setItem(`${CACHE_PREFIX}last_refresh`, Date.now().toString());
}
