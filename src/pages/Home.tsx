import { useState, useEffect, useRef } from 'react';
import { useNews } from '../context/NewsContext';
import HeroCarousel from '../components/HeroCarousel';
import NewsCard from '../components/NewsCard';
import SkeletonCard from '../components/SkeletonCard';
import { CATEGORY_CONFIG } from '../types';
import type { Category } from '../types';
import './Home.css';

const PAGE_SIZE = 12;

export default function Home() {
  const { state, filteredArticles } = useNews();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Reset visible count when category/source/search changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [state.activeCategory, state.activeSources, state.searchQuery]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount(v => v + PAGE_SIZE);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const visibleArticles = filteredArticles.slice(0, visibleCount);
  const hasMore = visibleCount < filteredArticles.length;

  // Hero articles: breaking / top stories
  const heroArticles = state.articles
    .filter(a => ['breaking', 'world', 'us'].includes(a.category))
    .slice(0, 5);

  const categoryLabel =
    state.activeCategory === 'all'
      ? 'All Stories'
      : CATEGORY_CONFIG[state.activeCategory as Category]?.label || state.activeCategory;

  const isSearching = state.searchQuery.trim().length > 0;

  return (
    <main className="home-page" id="main-content">
      {/* Hero — only show on "all" tab and not searching */}
      {state.activeCategory === 'all' && !isSearching && (
        <section className="home-page__hero" aria-label="Featured stories">
          {state.loading && state.articles.length === 0 ? (
            <div className="hero-skeleton" aria-hidden="true" />
          ) : (
            heroArticles.length > 0 && <HeroCarousel articles={heroArticles} />
          )}
        </section>
      )}

      {/* Error banner */}
      {state.errors.length > 0 && !state.loading && (
        <div className="error-banner" role="alert" aria-live="polite">
          <span>⚠</span>
          <span>
            Could not load from: <strong>{state.errors.map(e => e.toUpperCase()).join(', ')}</strong>.
            Showing cached or available content.
          </span>
        </div>
      )}

      {/* Section header */}
      <div className="home-page__header">
        <h1 className="section-title">
          {isSearching ? (
            <>🔍 Results for "{state.searchQuery}"</>
          ) : (
            <>{categoryLabel}</>
          )}
        </h1>
        {!state.loading && (
          <span className="home-page__count">
            {filteredArticles.length} articles
          </span>
        )}
      </div>

      {/* News grid */}
      <section
        className="news-grid"
        aria-label={`${categoryLabel} articles`}
        aria-live="polite"
        aria-busy={state.loading && state.articles.length === 0}
      >
        {state.loading && state.articles.length === 0 ? (
          <SkeletonCard count={9} />
        ) : filteredArticles.length === 0 ? (
          <div className="empty-state" role="status">
            <div className="empty-state__icon">📭</div>
            <h3>No articles found</h3>
            <p>
              {isSearching
                ? `No results for "${state.searchQuery}". Try a different search term.`
                : 'Try selecting a different category or enabling more sources.'}
            </p>
          </div>
        ) : (
          visibleArticles.map((article, i) => (
            <NewsCard key={article.id} article={article} index={i} />
          ))
        )}
      </section>

      {/* Load more sentinel */}
      <div ref={loaderRef} className="home-page__sentinel" aria-hidden="true">
        {hasMore && (
          <div className="home-page__loading-more">
            <span className="home-page__loading-dot" />
            <span className="home-page__loading-dot" />
            <span className="home-page__loading-dot" />
          </div>
        )}
      </div>

      {/* End of feed */}
      {!hasMore && filteredArticles.length > 0 && (
        <div className="home-page__end" aria-label="End of articles">
          <span>◈</span>
          <span>You're all caught up</span>
          <span>◈</span>
        </div>
      )}
    </main>
  );
}
