import type { Metadata } from "next";

import { TeamCard } from "@/components/public/cards";
import { CtaBand, EmptyNote } from "@/components/public/sections";
import { PageHero } from "@/components/site";
import { pageIntros } from "@/data/content";
import { teamService } from "@/Services/team.service";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Our team",
  description: pageIntros.team.description,
};

export default async function TeamPage() {
  const members = await teamService.listPublished();
  return (
    <>
      <PageHero eyebrow={pageIntros.team.eyebrow} title={pageIntros.team.title} description={pageIntros.team.description} />
      <section className="section-pad">
        <div className="container-wide">
          <h2 className="sr-only">Team members</h2>
          {members.length ? (
            <ul className="team-grid">
              {members.map((member) => (
                <li key={member.id}>
                  <TeamCard member={member} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyNote>Team profiles will appear here once they are published.</EmptyNote>
          )}
        </div>
      </section>
      <CtaBand area="team" />
    </>
  );
}
