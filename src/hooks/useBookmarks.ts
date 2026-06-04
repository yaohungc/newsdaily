import { useState, useEffect } from 'react';
import type { NewsArticle } from '../types';

const BOOKMARKS_KEY = 'newsdaily_bookmarks';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<NewsArticle[]>(() => {
    try {
      const raw = localStorage.getItem(BOOKMARKS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  const addBookmark = (article: NewsArticle) => {
    setBookmarks(prev => {
      if (prev.find(b => b.id === article.id)) return prev;
      return [article, ...prev];
    });
  };

  const removeBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const isBookmarked = (id: string) => bookmarks.some(b => b.id === id);

  const toggleBookmark = (article: NewsArticle) => {
    if (isBookmarked(article.id)) {
      removeBookmark(article.id);
    } else {
      addBookmark(article);
    }
  };

  return { bookmarks, addBookmark, removeBookmark, isBookmarked, toggleBookmark };
}
