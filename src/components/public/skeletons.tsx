import { cn } from "@/lib/utils";

/* Route skeletons for loading.tsx: flat grey blocks with a slow pulse (.skeleton). */

export function Bone({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <span className={cn("skeleton", className)} style={style} aria-hidden="true" />;
}

/** Wrapper: announces loading once; the blocks themselves are hidden from assistive tech. */
export function SkeletonPage({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div aria-busy="true" data-testid="skeleton-page">
      <p className="sr-only" role="status">
        {label}
      </p>
      {children}
    </div>
  );
}

/** Same box as the compact PageHero. */
export function CompactHeroSkeleton({ withTabs = false }: { withTabs?: boolean }) {
  return (
    <section className="hero hero--compact" aria-hidden="true">
      <div className="container-wide hero-content">
        <Bone className="skeleton-line" style={{ width: "6rem" }} />
        <Bone className="mt-4" style={{ width: "min(22rem, 70%)", height: "clamp(2.4rem, 6vw, 4.5rem)" }} />
        {withTabs ? (
          <div className="mt-8 flex gap-6 pb-3">
            {[3, 5, 7].map((w) => (
              <Bone key={w} className="skeleton-line" style={{ width: `${w}rem` }} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** One card in the shared .card-grid layout. */
export function CardSkeleton({ ratio = "4 / 3" }: { ratio?: string }) {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <Bone style={{ aspectRatio: ratio }} />
      <div className="grid gap-3 p-6">
        <Bone className="skeleton-line" style={{ width: "40%" }} />
        <Bone style={{ width: "85%", height: "1.3rem" }} />
        <Bone className="skeleton-line" style={{ width: "60%" }} />
      </div>
    </div>
  );
}
