import { useState } from 'react';
import { useNews } from '../context/NewsContext';
import { SOURCE_CONFIGS } from '../types';
import type { Category, SourceKey } from '../types';
import './Sidebar.css';

const CATEGORIES: Array<{ key: Category | 'all'; label: string; emoji: string }> = [
  { key: 'all', label: 'All Stories', emoji: '📰' },
  { key: 'breaking', label: 'Breaking', emoji: '⚡' },
  { key: 'us', label: 'US News', emoji: '🇺🇸' },
  { key: 'world', label: 'World', emoji: '🌍' },
  { key: 'economy', label: 'Economy', emoji: '📈' },
  { key: 'business', label: 'Business', emoji: '💼' },
];

export default function Sidebar() {
  const { state, dispatch } = useNews();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getCategoryCount = (cat: Category | 'all') => {
    if (cat === 'all') return state.articles.filter(a => state.activeSources.includes(a.source)).length;
    return state.articles.filter(a => a.category === cat && state.activeSources.includes(a.source)).length;
  };

  const getSourceCount = (source: SourceKey) =>
    state.articles.filter(a => a.source === source).length;

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="sidebar__mobile-toggle"
        onClick={() => setMobileOpen(v => !v)}
        aria-label="Toggle filters"
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? '✕ Close' : '⚙ Filters'}
      </button>

      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`} aria-label="News filters">
        <div className="sidebar__inner">

          {/* Categories */}
          <section className="sidebar__section">
            <h2 className="sidebar__section-title">Categories</h2>
            <nav role="navigation" aria-label="Category filter">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  className={`sidebar__nav-item ${state.activeCategory === cat.key ? 'active' : ''}`}
                  onClick={() => {
                    dispatch({ type: 'SET_CATEGORY', category: cat.key as Category | 'all' });
                    setMobileOpen(false);
                  }}
                  aria-current={state.activeCategory === cat.key ? 'page' : undefined}
                  id={`cat-${cat.key}`}
                >
                  <span className="sidebar__nav-emoji">{cat.emoji}</span>
                  <span className="sidebar__nav-label">{cat.label}</span>
                  <span className="sidebar__nav-count">{getCategoryCount(cat.key)}</span>
                </button>
              ))}
            </nav>
          </section>

          <div className="sidebar__divider" />

          {/* Sources */}
          <section className="sidebar__section">
            <h2 className="sidebar__section-title">
              Sources
              <button
                className="sidebar__toggle-all"
                onClick={() => {
                  const allActive = Object.keys(SOURCE_CONFIGS).every(s =>
                    state.activeSources.includes(s as SourceKey)
                  );
                  if (!allActive) {
                    Object.keys(SOURCE_CONFIGS).forEach(s => {
                      if (!state.activeSources.includes(s as SourceKey)) {
                        dispatch({ type: 'TOGGLE_SOURCE', source: s as SourceKey });
                      }
                    });
                  }
                }}
                aria-label="Select all sources"
              >All</button>
            </h2>
            <div className="sidebar__sources">
              {(Object.keys(SOURCE_CONFIGS) as SourceKey[]).map(sourceKey => {
                const config = SOURCE_CONFIGS[sourceKey];
                const isActive = state.activeSources.includes(sourceKey);
                const count = getSourceCount(sourceKey);
                const hasError = state.errors.includes(sourceKey);

                return (
                  <button
                    key={sourceKey}
                    className={`sidebar__source ${isActive ? 'active' : ''} ${hasError ? 'error' : ''}`}
                    onClick={() => dispatch({ type: 'TOGGLE_SOURCE', source: sourceKey })}
                    aria-pressed={isActive}
                    id={`source-${sourceKey}`}
                    title={hasError ? `${config.name} — failed to load` : config.name}
                  >
                    <span
                      className="sidebar__source-badge"
                      style={{ backgroundColor: config.color, color: config.textColor }}
                    >
                      {config.shortName}
                    </span>
                    <span className="sidebar__source-name">{config.name}</span>
                    <span className="sidebar__source-meta">
                      {hasError ? (
                        <span className="sidebar__source-error" title="Load error">!</span>
                      ) : (
                        <span className="sidebar__source-count">{count}</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Loading indicator per source */}
          {state.loadingSources.length > 0 && (
            <div className="sidebar__loading-sources">
              <div className="sidebar__loading-label">Loading…</div>
              <div className="sidebar__loading-list">
                {state.loadingSources.map(s => (
                  <span key={s} className="sidebar__loading-source">
                    {SOURCE_CONFIGS[s].shortName}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
