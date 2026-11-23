import { ArrowRight, Briefcase, CalendarClock, MapPin } from "lucide-react";
import Link from "next/link";

import { formatLongDate } from "@/lib/display";
import { EMPLOYMENT_TYPE_LABELS } from "@/lib/domain";
import type { PublicVacancyDto } from "@/Services/vacancy.service";

/** One vacancy. The whole card is one link target (the title link's ::after covers it). */
export function VacancyCard({ vacancy }: { vacancy: PublicVacancyDto }) {
  const titleId = `vacancy-${vacancy.slug}-title`;
  return (
    <article className="vacancy-card" aria-labelledby={titleId}>
      <p className="vacancy-card-kicker">{vacancy.department}</p>
      <h3 id={titleId} className="vacancy-card-title">
        <Link href={`/careers/${vacancy.slug}`} className="vacancy-card-link focus-ring" data-testid={`link-careers-view-details-${vacancy.slug}`}>
          {vacancy.title}
          <span className="sr-only">, view details</span>
        </Link>
      </h3>
      <ul className="vacancy-card-meta" aria-label="Details">
        {vacancy.employmentType ? (
          <li>
            <Briefcase aria-hidden="true" size={15} />
            {EMPLOYMENT_TYPE_LABELS[vacancy.employmentType]}
          </li>
        ) : null}
        {vacancy.location ? (
          <li>
            <MapPin aria-hidden="true" size={15} />
            {vacancy.location}
          </li>
        ) : null}
        {vacancy.deadline ? (
          <li>
            <CalendarClock aria-hidden="true" size={15} />
            Apply by {formatLongDate(vacancy.deadline)}
          </li>
        ) : null}
      </ul>
      {vacancy.summary ? <p className="vacancy-card-summary">{vacancy.summary}</p> : null}
      <span className="vacancy-card-more" aria-hidden="true">
        View details <ArrowRight size={16} />
      </span>
    </article>
  );
}
