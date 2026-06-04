import type { SourceKey, Category } from '../types';

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  breaking: ['breaking', 'urgent', 'alert', 'flash', 'just in', 'developing'],
  us: [
    'united states', 'america', 'congress', 'senate', 'white house', 'biden',
    'trump', 'washington', 'federal', 'democrat', 'republican', 'supreme court',
    'pentagon', 'fbi', 'cia', 'california', 'new york', 'florida', 'texas',
  ],
  world: [
    'china', 'russia', 'europe', 'ukraine', 'israel', 'middle east', 'africa',
    'asia', 'india', 'japan', 'nato', 'un ', 'united nations', 'war', 'conflict',
    'treaty', 'sanctions', 'diplomacy', 'global', 'international', 'korea',
    'taiwan', 'iran', 'saudi', 'pakistan', 'australia', 'canada', 'france', 'germany',
  ],
  economy: [
    'gdp', 'inflation', 'interest rate', 'fed', 'federal reserve', 'recession',
    'trade', 'tariff', 'imf', 'world bank', 'currency', 'dollar', 'euro',
    'oil', 'energy', 'commodity', 'bond', 'yield', 'market crash', 'economic',
    'central bank', 'monetary', 'fiscal', 'debt', 'deficit', 'export', 'import',
  ],
  business: [
    'company', 'ceo', 'earnings', 'revenue', 'profit', 'acquisition', 'merger',
    'ipo', 'startup', 'investment', 'stock', 'shares', 'nasdaq', 'dow jones',
    's&p', 'tech', 'apple', 'google', 'microsoft', 'amazon', 'meta', 'tesla',
    'ai ', 'artificial intelligence', 'corporate', 'quarter', 'billion', 'deal',
  ],
};

export function categorizeArticle(
  title: string,
  description: string,
  sourceDefault: Category
): Category {
  const text = `${title} ${description}`.toLowerCase();

  for (const keyword of CATEGORY_KEYWORDS.breaking) {
    if (text.includes(keyword)) return 'breaking';
  }

  const scores: Record<Category, number> = {
    breaking: 0,
    us: 0,
    world: 0,
    economy: 0,
    business: 0,
  };

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as [Category, string[]][]) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        scores[category]++;
      }
    }
  }

  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return sourceDefault;

  const bestCategory = (Object.entries(scores) as [Category, number][]).find(
    ([, score]) => score === maxScore
  );

  return bestCategory ? bestCategory[0] : sourceDefault;
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();
}

export function extractThumbnail(item: Record<string, unknown>): string {
  // Try various RSS thumbnail fields
  const thumbnail = item['thumbnail'] as string | undefined;
  if (thumbnail) return thumbnail;

  const enclosure = item['enclosure'] as { link?: string; url?: string } | undefined;
  if (enclosure?.link) return enclosure.link;
  if (enclosure?.url) return enclosure.url;

  const mediaContent = item['media:content'] as { url?: string } | undefined;
  if (mediaContent?.url) return mediaContent.url;

  const mediaThumbnail = item['media:thumbnail'] as { url?: string } | undefined;
  if (mediaThumbnail?.url) return mediaThumbnail.url;

  return '';
}

export function generateArticleId(url: string, source: SourceKey): string {
  return `${source}-${btoa(url).slice(0, 16)}`;
}
