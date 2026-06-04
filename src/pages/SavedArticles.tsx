import { useBookmarks } from '../hooks/useBookmarks';
import NewsCard from '../components/NewsCard';
import './SavedArticles.css';

export default function SavedArticles() {
  const { bookmarks } = useBookmarks();

  return (
    <main className="saved-page" id="main-content">
      <div className="saved-page__header">
        <h1 className="section-title">★ Reading List</h1>
        {bookmarks.length > 0 && (
          <span className="saved-page__count">{bookmarks.length} saved</span>
        )}
      </div>

      {bookmarks.length === 0 ? (
        <div className="empty-state animate-fade-in">
          <div className="empty-state__icon">🔖</div>
          <h3>Your reading list is empty</h3>
          <p>Save articles by clicking the ☆ bookmark icon on any news card.</p>
        </div>
      ) : (
        <div className="news-grid saved-page__grid">
          {bookmarks.map((article, i) => (
            <NewsCard key={article.id} article={article} index={i} />
          ))}
        </div>
      )}
    </main>
  );
}
