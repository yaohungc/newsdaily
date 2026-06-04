import './SkeletonCard.css';

interface SkeletonCardProps {
  count?: number;
}

function SkeletonItem() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-card__image skeleton-shine" />
      <div className="skeleton-card__body">
        <div className="skeleton-card__meta">
          <div className="skeleton skeleton-source" />
          <div className="skeleton skeleton-time" />
        </div>
        <div className="skeleton skeleton-headline" />
        <div className="skeleton skeleton-headline skeleton-headline--short" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line skeleton-line--short" />
        <div className="skeleton skeleton-line skeleton-line--shorter" />
        <div className="skeleton-card__footer">
          <div className="skeleton skeleton-badge" />
          <div className="skeleton skeleton-btn" />
        </div>
      </div>
    </div>
  );
}

export default function SkeletonCard({ count = 6 }: SkeletonCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonItem key={i} />
      ))}
    </>
  );
}
