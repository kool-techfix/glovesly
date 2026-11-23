import { Bone, CompactHeroSkeleton, SkeletonPage } from "@/components/public/skeletons";

/* /news: compact hero, the latest article (text-led), then text rows. */
export default function NewsLoading() {
  return (
    <SkeletonPage label="Loading news">
      <CompactHeroSkeleton />
      <section className="section-pad" aria-hidden="true">
        <div className="container-wide">
          <div className="news-feature">
            <div className="news-feature-text grid gap-4">
              <Bone className="skeleton-line" style={{ width: "12rem" }} />
              <Bone style={{ width: "min(36rem, 90%)", height: "2.4rem" }} />
              <Bone className="skeleton-line" style={{ width: "min(40rem, 100%)" }} />
              <Bone className="skeleton-line" style={{ width: "min(28rem, 75%)" }} />
            </div>
          </div>
          <ul className="news-rows news-more">
            {[0, 1].map((i) => (
              <li key={i}>
                <div className="news-row">
                  <div className="news-row-text grid gap-3">
                    <Bone className="skeleton-line" style={{ width: "11rem" }} />
                    <Bone style={{ width: "min(30rem, 85%)", height: "1.5rem" }} />
                    <Bone className="skeleton-line" style={{ width: "min(38rem, 100%)" }} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </SkeletonPage>
  );
}
