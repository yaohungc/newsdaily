import { useState } from 'react';
import type { NewsArticle } from '../types';
import { SOURCE_CONFIGS, CATEGORY_CONFIG } from '../types';
import { formatRelativeTime } from '../utils/dateFormatter';
import { useBookmarks } from '../hooks/useBookmarks';
import './NewsCard.css';

interface NewsCardProps {
  article: NewsArticle;
  index?: number;
  compact?: boolean;
}

const SOURCE_FALLBACK_GRADIENTS: Record<string, string> = {
  wsj: 'linear-gradient(135deg, #004B87, #003060)',
  nyt: 'linear-gradient(135deg, #1a1a1a, #333)',
  bbc: 'linear-gradient(135deg, #BB1919, #8B0000)',
  economist: 'linear-gradient(135deg, #E3120B, #9B0000)',
  bloomberg: 'linear-gradient(135deg, #F5A623, #C87F00)',
  ft: 'linear-gradient(135deg, #FCD0A2, #E8A06B)',
  reuters: 'linear-gradient(135deg, #FF8000, #CC5500)',
  guardian: 'linear-gradient(135deg, #052962, #01375B)',
};

export default function NewsCard({ article, index = 0, compact = false }: NewsCardProps) {
  const [imgError, setImgError] = useState(false);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(article.id);

  const config = SOURCE_CONFIGS[article.source];
  const catConfig = CATEGORY_CONFIG[article.category];
  const staggerClass = `stagger-${Math.min((index % 6) + 1, 6)}`;

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(article.url).catch(() => {});
    // Show visual feedback
    const btn = e.currentTarget as HTMLButtonElement;
    btn.textContent = '✓';
    setTimeout(() => { btn.textContent = '⎘'; }, 1500);
  };

  return (
    <article
      className={`news-card animate-fade-in-up ${staggerClass} ${compact ? 'news-card--compact' : ''}`}
      aria-label={`News article: ${article.title}`}
    >
      {/* Thumbnail */}
      <div className="news-card__image-wrap">
        {article.thumbnail && !imgError ? (
          <img
            src={article.thumbnail}
            alt=""
            className="news-card__image"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="news-card__image-fallback"
            style={{ background: SOURCE_FALLBACK_GRADIENTS[article.source] || 'linear-gradient(135deg, #1A1F2E, #0A0E1A)' }}
            aria-hidden="true"
          >
            <span className="news-card__image-fallback-logo">
              {config.shortName}
            </span>
          </div>
        )}
        {/* Category badge overlay */}
        <span className={`badge badge-${article.category} news-card__cat-badge`}>
          {catConfig.emoji}
        </span>
      </div>

      {/* Body */}
      <div className="news-card__body">
        {/* Source + time */}
        <div className="news-card__meta">
          <span
            className="news-card__source-badge"
            style={{ backgroundColor: config.color, color: config.textColor }}
          >
            {config.shortName}
          </span>
          <time className="news-card__time" dateTime={article.pubDate}>
            {formatRelativeTime(article.pubDate)}
          </time>
        </div>

        {/* Headline */}
        <h3 className="news-card__headline">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="news-card__headline-link"
          >
            {article.title}
          </a>
        </h3>

        {/* Description */}
        {!compact && article.description && (
          <p className="news-card__excerpt">{article.description}</p>
        )}

        {/* Footer */}
        <div className="news-card__footer">
          <span className={`badge badge-${article.category}`}>
            {catConfig.label}
          </span>

          <div className="news-card__actions">
            {/* Copy link */}
            <button
              className="news-card__action-btn"
              onClick={handleCopy}
              aria-label="Copy article link"
              title="Copy link"
            >
              ⎘
            </button>

            {/* Bookmark */}
            <button
              className={`news-card__action-btn ${bookmarked ? 'bookmarked' : ''}`}
              onClick={() => toggleBookmark(article)}
              aria-label={bookmarked ? 'Remove bookmark' : 'Save article'}
              aria-pressed={bookmarked}
              title={bookmarked ? 'Saved' : 'Save'}
            >
              {bookmarked ? '★' : '☆'}
            </button>

            {/* Read article */}
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="news-card__read-btn"
              aria-label={`Read full article: ${article.title}`}
            >
              Read →
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
