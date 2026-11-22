import { Bone, SkeletonPage } from "@/components/public/skeletons";

/* /services/[slug]: the split hero (text panel and photo), then the body. */
export default function ServiceLoading() {
  return (
    <SkeletonPage label="Loading service">
      <section className="hero hero--split hero--skeleton" aria-hidden="true">
        <Bone className="hero-split-media" />
        <div className="hero-split-body">
          <div className="hero-split-inner grid gap-4">
            <Bone className="skeleton-line" style={{ width: "9rem" }} />
            <Bone className="skeleton-line" style={{ width: "2.5rem" }} />
            <Bone style={{ width: "min(20rem, 80%)", height: "clamp(2.4rem, 6vw, 4.5rem)" }} />
            <Bone className="skeleton-line" style={{ width: "90%" }} />
            <Bone className="skeleton-line" style={{ width: "70%" }} />
          </div>
        </div>
      </section>
      <section className="section-pad" aria-hidden="true">
        <div className="container-wide grid max-w-3xl gap-4">
          {[100, 96, 88, 100, 70].map((w, i) => (
            <Bone key={i} className="skeleton-line" style={{ width: `${w}%` }} />
          ))}
        </div>
      </section>
    </SkeletonPage>
  );
}
