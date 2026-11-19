import { NigeriaMapInteractive } from "@/components/public/nigeria-map-interactive";
import { Eyebrow } from "@/components/site";
import { home } from "@/data/content";
import { NIGERIA_MAP, projectLatLng, stateCentroid } from "@/lib/nigeria-map";
import { cn } from "@/lib/utils";
import type { ProjectsByState } from "@/Services/project.service";
import type { WorkspaceSettingsDto } from "@/Services/settings.service";

/*
 * Nigeria map band. The SVG (37 state paths, office dots) renders here on the
 * server; NigeriaMapInteractive only adds tooltip, selection and the panel.
 */

function projectCountLabel(count: number) {
  return count === 0 ? "no projects" : count === 1 ? "1 project" : `${count} projects`;
}

export function NigeriaMapSection({
  projectsByState,
  settings,
}: {
  projectsByState: ProjectsByState;
  settings: Pick<WorkspaceSettingsDto, "stats" | "officeLocations">;
}) {
  const offices = settings.officeLocations
    .map((office) => {
      const point =
        office.latitude !== null && office.longitude !== null
          ? projectLatLng(office.latitude, office.longitude)
          : stateCentroid(office.state);
      return point ? { ...office, point } : null;
    })
    .filter((office) => office !== null);
  const hasBranchOffices = offices.some((office) => !office.isHeadOffice);
  const projectStates = Object.keys(projectsByState).length;
  const viewBox = `0 0 ${NIGERIA_MAP.width} ${NIGERIA_MAP.height}`;

  return (
    <section className="map-band" aria-labelledby="map-title">
      <div className="container-wide">
        <div className="max-w-3xl">
          <Eyebrow onDark>{home.map.eyebrow}</Eyebrow>
          <h2 id="map-title" className="display section-heading-title text-white">
            {home.map.title}
          </h2>
          <p className="lede map-band-lede">{home.map.description}</p>
        </div>

        {settings.stats.length ? (
          <dl className="map-stats">
            {settings.stats.map((stat) => (
              <div key={`${stat.label}-${stat.value}`} className="map-stat">
                <dt className="map-stat-label">{stat.label}</dt>
                <dd className="map-stat-value display">{stat.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <NigeriaMapInteractive projectsByState={projectsByState} viewBox={viewBox}>
          <svg
            viewBox={viewBox}
            className="map-svg"
            role="group"
            aria-label={`Map of Nigeria. Projects in ${projectStates} ${projectStates === 1 ? "state" : "states"}. Each state is a button that lists its projects.`}
          >
            <g className="map-states">
              {NIGERIA_MAP.states.map(({ state, path }) => {
                const count = projectsByState[state]?.length ?? 0;
                return (
                  <path
                    key={state}
                    d={path}
                    data-state={state}
                    role="button"
                    tabIndex={0}
                    aria-label={`${state}: ${projectCountLabel(count)}`}
                    aria-controls="map-panel"
                    aria-expanded={false}
                    className={cn("map-state", count > 0 && "has-projects")}
                    data-testid={`button-map-state-${state.toLowerCase().replace(/\s+/g, "-")}`}
                  />
                );
              })}
            </g>
            <g className="map-offices" aria-hidden="true">
              {offices.map((office) => (
                <g key={`${office.name}-${office.state}`} transform={`translate(${office.point[0]} ${office.point[1]})`}>
                  <circle r={office.isHeadOffice ? 7 : 5} className={cn("map-office-pulse", office.isHeadOffice && "is-head")} />
                  <circle r={office.isHeadOffice ? 7 : 5} className={cn("map-office-dot", office.isHeadOffice && "is-head")} />
                </g>
              ))}
            </g>
          </svg>
        </NigeriaMapInteractive>

        <div className="map-footer">
          <ul className="map-legend" aria-label="Map legend">
            <li>
              <span className="map-legend-dot is-head" aria-hidden="true" /> Head office
            </li>
            {hasBranchOffices ? (
              <li>
                <span className="map-legend-dot" aria-hidden="true" /> Office
              </li>
            ) : null}
            <li>
              <span className="map-legend-swatch" aria-hidden="true" /> Project locations
            </li>
          </ul>
          {offices.length ? (
            <p className="sr-only">
              Offices: {offices.map((office) => `${office.name}${office.isHeadOffice ? " (head office)" : ""}, ${office.state}`).join("; ")}.
            </p>
          ) : null}
          <p className="map-attribution">{NIGERIA_MAP.attribution}</p>
        </div>
      </div>
    </section>
  );
}
