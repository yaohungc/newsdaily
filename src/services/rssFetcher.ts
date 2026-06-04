import type { NewsArticle, SourceKey } from '../types';
import { SOURCE_CONFIGS } from '../types';
import { categorizeArticle, stripHtml, generateArticleId } from '../utils/categoryMapper';
import { getCachedFeed, setCachedFeed } from './cacheService';

// ---------------------------------------------------------------------------
// CORS Proxies — tried in order until one works
// allorigins.win is confirmed working and returns JSON { contents: "...xml..." }
// ---------------------------------------------------------------------------
const CORS_PROXIES = [
  (url: string) => url, // Direct fetch (e.g. NYT supports CORS natively)
  (url: string) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
];

// ---------------------------------------------------------------------------
// Verified working RSS feed URLs (tested June 2026)
// ---------------------------------------------------------------------------
export const RSS_FEEDS: Record<SourceKey, string> = {
  wsj:       'https://feeds.a.dj.com/rss/RSSWorldNews.xml',
  nyt:       'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
  bbc:       'https://feeds.bbci.co.uk/news/world/rss.xml',
  economist: 'https://www.economist.com/the-world-this-week/rss.xml',
  bloomberg: 'https://feeds.bloomberg.com/markets/news.rss',
  ft:        'https://www.ft.com/?format=rss',
  reuters:   'https://news.google.com/rss/search?q=site:reuters.com&hl=en-US&gl=US&ceid=US:en',
  guardian:  'https://www.theguardian.com/world/rss',
};

// ---------------------------------------------------------------------------
// XML parser — extracts <item> elements from RSS
// ---------------------------------------------------------------------------
function parseRssXml(xmlText: string): Array<Record<string, string>> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) throw new Error('XML parse error');

  const items = Array.from(doc.querySelectorAll('item'));

  return items.map(item => {
    const get = (tag: string) => item.querySelector(tag)?.textContent?.trim() || '';
    const getAttr = (tag: string, attr: string) =>
      item.querySelector(tag)?.getAttribute(attr) || '';

    // Try multiple thumbnail locations
    const thumbnail =
      getAttr('media\\:content, media\\:thumbnail, enclosure', 'url') ||
      getAttr('enclosure', 'url') ||
      '';

    return {
      title:       get('title'),
      description: get('description') || get('summary'),
      link:        get('link') || get('guid'),
      pubDate:     get('pubDate') || get('published') || get('dc\\:date') || new Date().toISOString(),
      author:      get('dc\\:creator') || get('author') || get('creator') || '',
      thumbnail,
    };
  });
}

// ---------------------------------------------------------------------------
// Fetch via one proxy URL
// ---------------------------------------------------------------------------
async function fetchViaProxy(
  proxyFn: (url: string) => string,
  rssUrl: string
): Promise<string> {
  const res = await fetch(proxyFn(rssUrl), {
    signal: AbortSignal.timeout(12000),
    headers: { 'Accept': 'application/xml, text/xml, */*' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  // allorigins returns JSON with .contents
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const json = await res.json() as { contents?: string };
    return json.contents || '';
  }
  return res.text();
}

// ---------------------------------------------------------------------------
// Fetch one source feed, trying each proxy in sequence
// ---------------------------------------------------------------------------
export async function fetchSourceFeed(sourceKey: SourceKey): Promise<NewsArticle[]> {
  const cached = getCachedFeed(sourceKey);
  if (cached && cached.length > 0) return cached;

  const config = SOURCE_CONFIGS[sourceKey];
  const rssUrl = RSS_FEEDS[sourceKey];

  for (const proxyFn of CORS_PROXIES) {
    try {
      const xml = await fetchViaProxy(proxyFn, rssUrl);
      if (!xml || xml.length < 100) continue;

      const rawItems = parseRssXml(xml);
      if (rawItems.length === 0) continue;

      const articles: NewsArticle[] = rawItems.slice(0, 20).map(item => {
        const title       = stripHtml(item.title || 'Untitled');
        const description = stripHtml(item.description || '').slice(0, 320);
        const url         = item.link || '#';
        const pubDate     = item.pubDate || new Date().toISOString();
        const category    = categorizeArticle(title, description, config.defaultCategory);

        return {
          id:          generateArticleId(url, sourceKey),
          title,
          description,
          url,
          thumbnail:   item.thumbnail || '',
          pubDate,
          source:      sourceKey,
          category,
          author:      item.author || config.name,
        };
      });

      setCachedFeed(sourceKey, articles);
      return articles;
    } catch (err) {
      console.warn(`[rssFetcher] ${sourceKey} via proxy failed:`, err);
      // Try next proxy
    }
  }

  console.error(`[rssFetcher] All proxies failed for ${sourceKey}`);
  return [];
}

// ---------------------------------------------------------------------------
// Fetch all feeds in parallel
// ---------------------------------------------------------------------------
export async function fetchAllFeeds(
  sources: SourceKey[],
  onSourceComplete?: (source: SourceKey, articles: NewsArticle[]) => void
): Promise<{ articles: NewsArticle[]; errors: SourceKey[] }> {
  const errors: SourceKey[] = [];
  const allArticles: NewsArticle[] = [];

  await Promise.allSettled(
    sources.map(async source => {
      try {
        const articles = await fetchSourceFeed(source);
        if (articles.length === 0) errors.push(source);
        allArticles.push(...articles);
        onSourceComplete?.(source, articles);
      } catch {
        errors.push(source);
        onSourceComplete?.(source, []);
      }
    })
  );

  allArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  return { articles: allArticles, errors };
}
