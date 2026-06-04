import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { NewsArticle, SourceKey, Category } from '../types';
import { fetchAllFeeds } from '../services/rssFetcher';
import { setLastRefreshTime, getLastRefreshTime } from '../services/cacheService';

const ALL_SOURCES: SourceKey[] = ['wsj', 'nyt', 'bbc', 'economist', 'bloomberg', 'ft', 'reuters', 'guardian'];
const REFRESH_INTERVAL_MS = 30 * 60 * 1000;

interface NewsState {
  articles: NewsArticle[];
  loading: boolean;
  loadingSources: SourceKey[];
  errors: SourceKey[];
  activeSources: SourceKey[];
  activeCategory: Category | 'all';
  searchQuery: string;
  lastRefresh: Date | null;
}

type NewsAction =
  | { type: 'FETCH_START' }
  | { type: 'SOURCE_LOADED'; source: SourceKey; articles: NewsArticle[] }
  | { type: 'FETCH_COMPLETE'; errors: SourceKey[]; lastRefresh: Date }
  | { type: 'TOGGLE_SOURCE'; source: SourceKey }
  | { type: 'SET_CATEGORY'; category: Category | 'all' }
  | { type: 'SET_SEARCH'; query: string }
  | { type: 'SET_ALL_SOURCES'; articles: NewsArticle[] };

function newsReducer(state: NewsState, action: NewsAction): NewsState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, loadingSources: ALL_SOURCES, errors: [] };
    case 'SOURCE_LOADED': {
      const newArticles = [
        ...state.articles.filter(a => a.source !== action.source),
        ...action.articles,
      ].sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
      const remaining = state.loadingSources.filter(s => s !== action.source);
      return {
        ...state,
        articles: newArticles,
        loadingSources: remaining,
        loading: remaining.length > 0,
      };
    }
    case 'FETCH_COMPLETE':
      return { ...state, loading: false, loadingSources: [], errors: action.errors, lastRefresh: action.lastRefresh };
    case 'TOGGLE_SOURCE': {
      const isActive = state.activeSources.includes(action.source);
      return {
        ...state,
        activeSources: isActive
          ? state.activeSources.length > 1 ? state.activeSources.filter(s => s !== action.source) : state.activeSources
          : [...state.activeSources, action.source],
      };
    }
    case 'SET_CATEGORY':
      return { ...state, activeCategory: action.category };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.query };
    default:
      return state;
  }
}

interface NewsContextValue {
  state: NewsState;
  filteredArticles: NewsArticle[];
  dispatch: React.Dispatch<NewsAction>;
  refresh: () => void;
}

const NewsContext = createContext<NewsContextValue | null>(null);

export function NewsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(newsReducer, {
    articles: [],
    loading: true,
    loadingSources: ALL_SOURCES,
    errors: [],
    activeSources: ALL_SOURCES,
    activeCategory: 'all',
    searchQuery: '',
    lastRefresh: getLastRefreshTime(),
  });

  const fetchNews = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    const errors: SourceKey[] = [];

    await fetchAllFeeds(ALL_SOURCES, (source, articles) => {
      dispatch({ type: 'SOURCE_LOADED', source, articles });
      if (articles.length === 0) errors.push(source);
    });

    const now = new Date();
    setLastRefreshTime();
    dispatch({ type: 'FETCH_COMPLETE', errors, lastRefresh: now });
  }, []);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchNews]);

  const filteredArticles = React.useMemo(() => {
    let articles = state.articles.filter(a => state.activeSources.includes(a.source));

    if (state.activeCategory !== 'all') {
      articles = articles.filter(a => a.category === state.activeCategory);
    }

    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      articles = articles.filter(
        a =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.source.toLowerCase().includes(q)
      );
    }

    return articles;
  }, [state.articles, state.activeSources, state.activeCategory, state.searchQuery]);

  return (
    <NewsContext.Provider value={{ state, filteredArticles, dispatch, refresh: fetchNews }}>
      {children}
    </NewsContext.Provider>
  );
}

export function useNews() {
  const ctx = useContext(NewsContext);
  if (!ctx) throw new Error('useNews must be used within NewsProvider');
  return ctx;
}
