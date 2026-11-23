import { MemberPhoto } from "@/components/public/team";
import { toParagraphs } from "@/lib/display";
import { ScrollReveal } from "@/components/motion/reveal";
import type { TeamMemberDto } from "@/Services/team.service";

/*
 * Featured (leadership) member: photo on the left, their message on the right
 * (stacked on mobile), with the name and role beneath it. The bio is shown in
 * full here, so no modal is needed.
 */
export function FeaturedMember({ member, index }: { member: TeamMemberDto; index: number }) {
  const paragraphs = toParagraphs(member.bio);
  const nameId = `team-featured-${member.slug}`;
  return (
    <section className="team-featured" aria-labelledby={nameId} data-testid={`section-team-featured-${member.slug}`}>
      <ScrollReveal>
        <MemberPhoto member={member} sizes="(max-width: 860px) 100vw, 26rem" preload={index === 0} className="team-featured-photo" />
      </ScrollReveal>
      <ScrollReveal as="figure" className="team-featured-copy" delay={0.1}>
        {paragraphs.length ? (
          <blockquote className="prose-body prose-measure team-featured-message">
            {paragraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </blockquote>
        ) : null}
        <figcaption className="team-featured-cite">
          <h2 id={nameId} className="display team-featured-name">
            {member.name}
          </h2>
          <p className="team-featured-role">{member.role}</p>
        </figcaption>
      </ScrollReveal>
    </section>
  );
}
