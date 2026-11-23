"use client";

import { ArrowRight, Linkedin, X } from "lucide-react";
import { CloudinaryImage as Image } from "@/components/cloudinary-image";
import { useEffect, useRef, useState } from "react";

import { initials, toParagraphs } from "@/lib/display";
import { cn } from "@/lib/utils";
import type { TeamMemberDto } from "@/Services/team.service";

/*
 * ICAADA's TeamGrid / TeamMemberCard / TeamMemberModal pattern, restyled with
 * the Glovesly tokens. The modal is a native <dialog> (showModal gives focus
 * containment and Escape for free; focus returns to the card on close), so no
 * dialog library is needed.
 *
 * A card is interactive only when the member has a bio. Without one it is a
 * plain article: no button, no hover lift, no "view" affordance.
 */

/** Square photo, or a flat navy tile with the member's initials (titles such as "Dr." dropped). */
export function MemberPhoto({
  member,
  sizes,
  className,
  preload = false,
}: {
  member: Pick<TeamMemberDto, "name" | "role" | "photoUrl">;
  sizes: string;
  className?: string;
  preload?: boolean;
}) {
  return (
    <div className={cn("team-photo", !member.photoUrl && "team-photo--initials", className)} aria-hidden={member.photoUrl ? undefined : true}>
      {member.photoUrl ? (
        <Image
          src={member.photoUrl}
          alt={`${member.name}, ${member.role}`}
          fill
          sizes={sizes}
          className="object-cover object-top"
          {...(preload ? { preload: true } : { loading: "lazy" as const })}
        />
      ) : (
        <span className="team-photo-initials">{initials(member.name)}</span>
      )}
    </div>
  );
}

export function TeamGrid({ members }: { members: TeamMemberDto[] }) {
  return (
    <ul className="team-directory-grid">
      {members.map((member, index) => (
        <li key={member.id} className={cn("reveal", index % 4 === 1 && "reveal-delay-1", index % 4 === 2 && "reveal-delay-2", index % 4 === 3 && "reveal-delay-3")}>
          <TeamMemberCard member={member} />
        </li>
      ))}
    </ul>
  );
}

export function TeamMemberCard({ member }: { member: TeamMemberDto }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const hasBio = toParagraphs(member.bio).length > 0;

  const close = () => {
    setOpen(false);
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  };

  return (
    <article className={cn("team-member-card", hasBio && "is-interactive")} data-testid={`card-team-${member.slug}`}>
      <MemberPhoto member={member} sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw" />
      <div className="team-member-info">
        <h3 className="team-member-name">
          {hasBio ? (
            // The button covers the whole card (::after), so the card is one click target.
            <button
              ref={triggerRef}
              type="button"
              className="team-member-trigger focus-ring"
              onClick={() => setOpen(true)}
              aria-haspopup="dialog"
              data-testid={`button-team-member-${member.slug}`}
            >
              {member.name}
              <span className="sr-only">, view profile</span>
            </button>
          ) : (
            member.name
          )}
        </h3>
        <p className="team-member-position">{member.role}</p>
        {hasBio ? (
          <span className="team-member-button" aria-hidden="true">
            View profile <ArrowRight size={15} />
          </span>
        ) : null}
      </div>
      {open ? <TeamMemberModal member={member} onClose={close} /> : null}
    </article>
  );
}

export function TeamMemberModal({ member, onClose }: { member: TeamMemberDto; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = `team-modal-${member.slug}-name`;

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      className="team-modal"
      aria-labelledby={titleId}
      // Escape fires "cancel"; closing by any route goes through onClose so focus returns.
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose(); // backdrop click
      }}
      data-testid={`dialog-team-${member.slug}`}
    >
      {/* First in the DOM so showModal() puts initial focus on it. */}
      <button type="button" className="team-modal-close focus-ring" onClick={onClose} data-testid="button-team-modal-close">
        <X aria-hidden="true" size={18} />
        <span className="sr-only">Close</span>
      </button>
      <div className="team-modal-layout">
        <div className="team-modal-sidebar">
          <MemberPhoto member={member} sizes="(max-width: 700px) 100vw, 400px" className="team-modal-photo" />
          {member.linkedinUrl ? (
            <div className="team-modal-sidebar-info">
              <a
                href={member.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="team-modal-contact-link focus-ring"
                data-testid={`link-team-linkedin-${member.slug}`}
              >
                <Linkedin aria-hidden="true" size={16} /> LinkedIn
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          ) : null}
        </div>
        <div className="team-modal-body">
          <h2 id={titleId} className="display team-modal-name">
            {member.name}
          </h2>
          <p className="team-modal-position">{member.role}</p>
          <div className="team-modal-bio">
            {toParagraphs(member.bio).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </dialog>
  );
}
