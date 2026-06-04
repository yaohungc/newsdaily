import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNews } from '../context/NewsContext';
import { useTheme } from '../context/ThemeContext';
import { formatRelativeTime } from '../utils/dateFormatter';
import './Navbar.css';

export default function Navbar() {
  const { state, dispatch, refresh } = useNews();
  const { theme, toggleTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleSearchToggle = () => {
    if (searchOpen && state.searchQuery) {
      dispatch({ type: 'SET_SEARCH', query: '' });
    }
    setSearchOpen(v => !v);
  };

  const articleCount = state.articles.length;
  const lastRefreshText = state.lastRefresh
    ? formatRelativeTime(state.lastRefresh.toISOString())
    : 'Never';

  return (
    <header className="navbar" role="banner">
      <div className="navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo" aria-label="NewsDaily Home">
          <span className="navbar__logo-icon">◈</span>
          <div className="navbar__logo-text">
            <span className="navbar__logo-name">NewsDaily</span>
            <span className="navbar__logo-tagline">Global Intelligence</span>
          </div>
        </Link>

        {/* Center — search bar */}
        <div className={`navbar__search-wrap ${searchOpen ? 'open' : ''}`}>
          <div className="navbar__search">
            <span className="navbar__search-icon">⌕</span>
            <input
              ref={searchRef}
              id="global-search"
              type="search"
              placeholder="Search articles across all sources…"
              value={state.searchQuery}
              onChange={e => dispatch({ type: 'SET_SEARCH', query: e.target.value })}
              aria-label="Search news articles"
              className="navbar__search-input"
            />
            {state.searchQuery && (
              <button
                className="navbar__search-clear"
                onClick={() => dispatch({ type: 'SET_SEARCH', query: '' })}
                aria-label="Clear search"
              >✕</button>
            )}
          </div>
        </div>

        {/* Right controls */}
        <div className="navbar__controls">
          {/* Article count + last refresh */}
          <div className="navbar__meta" aria-live="polite">
            {state.loading ? (
              <span className="navbar__loading-text">Fetching news…</span>
            ) : (
              <span className="navbar__meta-text">{articleCount} articles · {lastRefreshText}</span>
            )}
          </div>

          {/* Mobile search toggle */}
          <button
            className="navbar__icon-btn navbar__search-toggle"
            onClick={handleSearchToggle}
            aria-label="Toggle search"
            title="Search"
          >
            {searchOpen ? '✕' : '⌕'}
          </button>

          {/* Saved */}
          <Link
            to="/saved"
            className="navbar__icon-btn"
            aria-label="Saved articles"
            title="Reading list"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </Link>

          {/* Refresh */}
          <button
            className={`navbar__icon-btn ${refreshing ? 'spinning' : ''}`}
            onClick={handleRefresh}
            aria-label="Refresh news"
            title="Refresh"
            disabled={state.loading}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
          </button>

          {/* Theme toggle */}
          <button
            id="theme-toggle"
            className="navbar__theme-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title="Toggle theme"
          >
            {theme === 'dark' ? '☀' : '◑'}
          </button>
        </div>
      </div>
    </header>
  );
}
