import { CardSkeleton, CompactHeroSkeleton, SkeletonPage } from "@/components/public/skeletons";

/* /projects while it renders (it reads ?sector=, so it renders per request). */
export default function ProjectsLoading() {
  return (
    <SkeletonPage label="Loading projects">
      <CompactHeroSkeleton withTabs />
      <section className="section-pad">
        <div className="container-wide">
          <ul className="card-grid">
            {Array.from({ length: 6 }, (_, i) => (
              <li key={i}>
                <CardSkeleton />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </SkeletonPage>
  );
}
