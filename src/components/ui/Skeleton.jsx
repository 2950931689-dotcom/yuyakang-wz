export default function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`.trim()} aria-hidden="true" />;
}

export function CaseCardSkeleton() {
  return (
    <div className="skeleton-card">
      <Skeleton className="skeleton--media" />
      <div className="skeleton-card__body">
        <Skeleton className="skeleton--line" />
        <Skeleton className="skeleton--line skeleton--short" />
        <Skeleton className="skeleton--line skeleton--short" />
      </div>
    </div>
  );
}

export function CasesGridSkeleton({ count = 6 }) {
  return (
    <div className="grid-3">
      {Array.from({ length: count }, (_, i) => (
        <CaseCardSkeleton key={i} />
      ))}
    </div>
  );
}
