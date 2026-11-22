import type { Metadata } from "next";

import { ClosingBand, EmptyNote } from "@/components/public/sections";
import { TeamGrid } from "@/components/public/team";
import { FeaturedMember } from "@/components/public/team-featured";
import { PageHero } from "@/components/site";
import { pageIntros, teamClosing } from "@/data/content";
import { teamService } from "@/Services/team.service";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Our team",
  description: "Meet the Glovesly Pro-Project team.",
};

export default async function TeamPage() {
  // Published members in sortOrder (service → repository).
  const members = await teamService.listPublished();
  const featured = members.filter((member) => member.featured);
  const others = members.filter((member) => !member.featured);
  const intro = pageIntros.team;

  return (
    <>
      <PageHero variant="compact" eyebrow={intro.eyebrow} title={intro.title} description={intro.description || undefined} />

      {featured.length ? (
        <div className="section-pad">
          <div className="container-wide team-featured-list">
            {featured.map((member, index) => (
              <FeaturedMember key={member.id} member={member} index={index} />
            ))}
          </div>
        </div>
      ) : null}

      <section className={featured.length ? "section-pad section-band" : "section-pad"} aria-labelledby="team-members-title">
        <div className="container-wide">
          <h2 id="team-members-title" className="sr-only">
            Team members
          </h2>
          {others.length ? (
            <TeamGrid members={others} />
          ) : members.length ? null : (
            <EmptyNote>Team profiles will appear here once they are published.</EmptyNote>
          )}
        </div>
      </section>

      <ClosingBand id="team-closing-title" content={teamClosing} primaryTestId="link-team-contact" secondaryTestId="link-team-services" />
    </>
  );
}
