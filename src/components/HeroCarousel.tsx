import { useState, useEffect, useCallback } from 'react';
import type { NewsArticle } from '../types';
import { SOURCE_CONFIGS, CATEGORY_CONFIG } from '../types';
import { formatRelativeTime } from '../utils/dateFormatter';
import './HeroCarousel.css';

interface HeroCarouselProps {
  articles: NewsArticle[];
}

const SLIDE_INTERVAL = 6000;

export default function HeroCarousel({ articles }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const topArticles = articles.slice(0, 5);

  const goTo = useCallback((index: number) => {
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(index);
      setTransitioning(false);
    }, 300);
  }, []);

  const next = useCallback(() => {
    goTo((current + 1) % topArticles.length);
  }, [current, topArticles.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + topArticles.length) % topArticles.length);
  }, [current, topArticles.length, goTo]);

  useEffect(() => {
    if (paused || topArticles.length <= 1) return;
    const timer = setInterval(next, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [paused, next, topArticles.length]);

  if (topArticles.length === 0) return null;

  const article = topArticles[current];
  const config = SOURCE_CONFIGS[article.source];
  const catConfig = CATEGORY_CONFIG[article.category];

  return (
    <section
      className="hero-carousel"
      aria-label="Featured stories"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={`hero-carousel__slide ${transitioning ? 'transitioning' : ''}`}>
        {/* Background */}
        <div className="hero-carousel__bg">
          {article.thumbnail ? (
            <img
              src={article.thumbnail}
              alt=""
              className="hero-carousel__bg-img"
              loading="eager"
            />
          ) : (
            <div
              className="hero-carousel__bg-gradient"
              style={{ background: `linear-gradient(135deg, ${config.color}33, #0A0E1A)` }}
            />
          )}
          <div className="hero-carousel__overlay" />
        </div>

        {/* Content */}
        <div className="hero-carousel__content">
          <div className="hero-carousel__meta">
            <span
              className="hero-carousel__source"
              style={{ backgroundColor: config.color, color: config.textColor }}
            >
              {config.shortName}
            </span>
            <span className={`badge badge-${article.category}`} style={{ marginLeft: 8 }}>
              {catConfig.emoji} {catConfig.label.replace(/.*\s/, '')}
            </span>
            <span className="hero-carousel__time">{formatRelativeTime(article.pubDate)}</span>
          </div>

          <h2 className="hero-carousel__headline">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Read: ${article.title}`}
            >
              {article.title}
            </a>
          </h2>

          {article.description && (
            <p className="hero-carousel__excerpt">
              {article.description.slice(0, 200)}
              {article.description.length > 200 ? '…' : ''}
            </p>
          )}

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hero-carousel__cta"
          >
            Read Full Story <span aria-hidden>→</span>
          </a>
        </div>
      </div>

      {/* Navigation dots */}
      {topArticles.length > 1 && (
        <div className="hero-carousel__dots" role="tablist" aria-label="Story navigation">
          {topArticles.map((_, i) => (
            <button
              key={i}
              className={`hero-carousel__dot ${i === current ? 'active' : ''}`}
              onClick={() => goTo(i)}
              role="tab"
              aria-selected={i === current}
              aria-label={`Go to story ${i + 1}`}
              id={`hero-dot-${i}`}
            />
          ))}
        </div>
      )}

      {/* Arrow controls */}
      {topArticles.length > 1 && (
        <>
          <button className="hero-carousel__arrow hero-carousel__arrow--prev" onClick={prev} aria-label="Previous story">
            ‹
          </button>
          <button className="hero-carousel__arrow hero-carousel__arrow--next" onClick={next} aria-label="Next story">
            ›
          </button>
        </>
      )}

      {/* Progress bar */}
      {!paused && (
        <div className="hero-carousel__progress" key={`${current}-${paused}`} />
      )}
    </section>
  );
}
