export type Category = 'breaking' | 'us' | 'world' | 'economy' | 'business';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  pubDate: string;
  source: SourceKey;
  category: Category;
  author?: string;
}

export type SourceKey = 'wsj' | 'nyt' | 'bbc' | 'economist' | 'bloomberg' | 'ft' | 'reuters' | 'guardian';

export interface SourceConfig {
  key: SourceKey;
  name: string;
  shortName: string;
  url: string;
  rssUrl: string;
  color: string;
  textColor: string;
  defaultCategory: Category;
  categories: Category[];
}

export interface FeedCache {
  articles: NewsArticle[];
  timestamp: number;
}

export const SOURCE_CONFIGS: Record<SourceKey, SourceConfig> = {
  wsj: {
    key: 'wsj',
    name: 'Wall Street Journal',
    shortName: 'WSJ',
    url: 'https://www.wsj.com',
    rssUrl: 'https://feeds.a.dj.com/rss/RSSWorldNews.xml',
    color: '#004B87',
    textColor: '#ffffff',
    defaultCategory: 'business',
    categories: ['business', 'economy', 'world'],
  },
  nyt: {
    key: 'nyt',
    name: 'New York Times',
    shortName: 'NYT',
    url: 'https://www.nytimes.com',
    rssUrl: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
    color: '#000000',
    textColor: '#ffffff',
    defaultCategory: 'us',
    categories: ['us', 'world', 'business'],
  },
  bbc: {
    key: 'bbc',
    name: 'BBC News',
    shortName: 'BBC',
    url: 'https://www.bbc.com/news',
    rssUrl: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    color: '#BB1919',
    textColor: '#ffffff',
    defaultCategory: 'world',
    categories: ['world', 'us', 'business'],
  },
  economist: {
    key: 'economist',
    name: 'The Economist',
    shortName: 'ECO',
    url: 'https://www.economist.com',
    rssUrl: 'https://www.economist.com/the-world-this-week/rss.xml',
    color: '#E3120B',
    textColor: '#ffffff',
    defaultCategory: 'economy',
    categories: ['economy', 'world', 'business'],
  },
  bloomberg: {
    key: 'bloomberg',
    name: 'Bloomberg',
    shortName: 'BBG',
    url: 'https://www.bloomberg.com',
    rssUrl: 'https://feeds.bloomberg.com/technology/news.rss',
    color: '#F5A623',
    textColor: '#000000',
    defaultCategory: 'economy',
    categories: ['economy', 'business', 'world'],
  },
  ft: {
    key: 'ft',
    name: 'MarketWatch',
    shortName: 'MW',
    url: 'https://www.marketwatch.com',
    rssUrl: 'https://feeds.content.dowjones.io/public/rss/mw_topstories',
    color: '#00AC4E',
    textColor: '#ffffff',
    defaultCategory: 'economy',
    categories: ['economy', 'business', 'world'],
  },
  reuters: {
    key: 'reuters',
    name: 'Sky News',
    shortName: 'SKY',
    url: 'https://news.sky.com',
    rssUrl: 'https://feeds.skynews.com/feeds/rss/world.xml',
    color: '#E4002B',
    textColor: '#ffffff',
    defaultCategory: 'world',
    categories: ['world', 'breaking', 'business'],
  },
  guardian: {
    key: 'guardian',
    name: 'The Guardian',
    shortName: 'GRD',
    url: 'https://www.theguardian.com',
    rssUrl: 'https://www.theguardian.com/world/rss',
    color: '#052962',
    textColor: '#ffffff',
    defaultCategory: 'world',
    categories: ['world', 'us', 'economy'],
  },
};

export const CATEGORY_CONFIG = {
  breaking: { label: '⚡ Breaking', emoji: '⚡', color: '#FF4444' },
  us: { label: '🇺🇸 US News', emoji: '🇺🇸', color: '#3B82F6' },
  world: { label: '🌍 World', emoji: '🌍', color: '#10B981' },
  economy: { label: '📈 Economy', emoji: '📈', color: '#F5A623' },
  business: { label: '💼 Business', emoji: '💼', color: '#8B5CF6' },
};
