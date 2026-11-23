"use client";

import Link from "next/link";

import { Notice, PageHeading, TimeAgo } from "@/components/admin/admin-parts";
import { moduleConfigs, type ModuleKey } from "@/components/admin/module-configs";
import { useAdmin } from "@/lib/admin/admin-store";
import { plural } from "@/lib/admin/format";
import type { ActivityDto } from "@/Services/activity.service";

const MODULE_ORDER: ModuleKey[] = ["services", "projects", "news", "team", "partners", "vacancies"];

export function Dashboard({ activity }: { activity: ActivityDto[] }) {
  const { me, summary } = useAdmin();
  const firstName = me.name.split(/\s+/)[0] ?? me.name;

  return (
    <div className="adm-screen">
      <PageHeading title={`Welcome back, ${firstName}`} description="What is on the site and what needs attention." />

      {summary.projectsWithoutState > 0 ? (
        <Notice testId="notice-dashboard-projects-state">
          <strong>{plural(summary.projectsWithoutState, "project")} without a state.</strong>{" "}
          <Link href="/admin/projects" className="adm-link" data-testid="link-dashboard-projects-state">
            Choose a state
          </Link>{" "}
          so they can be published and placed on the map.
        </Notice>
      ) : null}

      <div className="adm-stat-row">
        <Link href="/admin/messages" className="adm-stat" data-testid="link-dashboard-messages">
          <span className="adm-stat-value">{summary.unreadMessages}</span>
          <span className="adm-stat-label">Unread {summary.unreadMessages === 1 ? "message" : "messages"}</span>
        </Link>
        <Link href="/admin/applications" className="adm-stat" data-testid="link-dashboard-applications">
          <span className="adm-stat-value">{summary.newApplications}</span>
          <span className="adm-stat-label">New {summary.newApplications === 1 ? "application" : "applications"}</span>
        </Link>
        <div className="adm-stat">
          <span className="adm-stat-value">{summary.reviewQueue}</span>
          <span className="adm-stat-label">Waiting for review</span>
        </div>
      </div>

      <section aria-labelledby="dashboard-content" className="adm-section">
        <h2 id="dashboard-content" className="adm-section-title">
          Content
        </h2>
        <ul className="adm-card-grid">
          {MODULE_ORDER.map((key) => {
            const counts = summary.modules[key];
            const config = moduleConfigs[key];
            return (
              <li key={key}>
                <Link href={`/admin/${key}`} className="adm-card adm-module-card" data-testid={`link-dashboard-module-${key}`}>
                  <span className="adm-module-card-title">{config.label}</span>
                  <span className="adm-module-card-main">
                    <span className="adm-stat-value">{counts.PUBLISHED}</span> published
                  </span>
                  <span className="adm-module-card-meta">
                    {counts.REVIEW} in review · {counts.DRAFT} draft · {counts.ARCHIVED} archived
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="dashboard-activity" className="adm-section">
        <h2 id="dashboard-activity" className="adm-section-title">
          Recent activity
        </h2>
        {activity.length ? (
          <ol className="adm-activity adm-card">
            {activity.map((entry) => (
              <li key={entry.id} className="adm-activity-item">
                <p className="adm-activity-summary">{entry.summary ?? `${entry.action} ${entry.entityType}`}</p>
                <p className="adm-activity-meta">
                  {entry.actor?.name ?? "System"} · <TimeAgo iso={entry.createdAt} />
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="adm-muted">No activity yet.</p>
        )}
      </section>
    </div>
  );
}
