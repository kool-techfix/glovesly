import { Bone, CardSkeleton, CompactHeroSkeleton, SkeletonPage } from "@/components/public/skeletons";

/* /news: compact hero, the featured latest article, then the grid. */
export default function NewsLoading() {
  return (
    <SkeletonPage label="Loading news">
      <CompactHeroSkeleton />
      <section className="section-pad pb-0" aria-hidden="true">
        <div className="container-wide">
          <div className="skeleton-card news-featured">
            <Bone className="news-featured-media" />
            <div className="news-featured-body grid content-center gap-4 p-6">
              <Bone className="skeleton-line" style={{ width: "30%" }} />
              <Bone style={{ width: "90%", height: "2rem" }} />
              <Bone className="skeleton-line" style={{ width: "100%" }} />
              <Bone className="skeleton-line" style={{ width: "75%" }} />
            </div>
          </div>
        </div>
      </section>
      <section className="section-pad">
        <div className="container-wide">
          <ul className="card-grid">
            {Array.from({ length: 3 }, (_, i) => (
              <li key={i}>
                <CardSkeleton ratio="16 / 10" />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </SkeletonPage>
  );
}
