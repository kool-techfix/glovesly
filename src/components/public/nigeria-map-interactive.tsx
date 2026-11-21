"use client";

import { ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { PROJECT_SECTOR_LABELS } from "@/lib/domain";
import type { ProjectsByState } from "@/Services/project.service";

/*
 * Interaction layer for the server-rendered Nigeria map (passed as children).
 * Uses event delegation on [data-state] paths: hover/focus shows a tooltip,
 * click/Enter/Space selects a state and lists its projects in the panel.
 * On narrow screens the tooltip is hidden (CSS) and the panel sits below the
 * map. The highlight is drawn in an overlay so it is never hidden under a
 * neighbouring state's border.
 */

type Hover = { state: string; x: number; y: number };

function countLabel(count: number) {
  return count === 0 ? "No projects" : count === 1 ? "1 project" : `${count} projects`;
}

function stateFrom(target: EventTarget | null): SVGPathElement | null {
  return target instanceof Element ? (target.closest("[data-state]") as SVGPathElement | null) : null;
}

export function NigeriaMapInteractive({
  projectsByState,
  viewBox,
  children,
}: {
  projectsByState: ProjectsByState;
  /** Same viewBox as the server-rendered map, so the overlay lines up. */
  viewBox: string;
  children: React.ReactNode;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<Hover | null>(null);
  const [selected, setSelected] = useState<{ state: string; path: string } | null>(null);
  const [hoverPath, setHoverPath] = useState<string | null>(null);

  // Reflect the selection on the server-rendered paths (aria-expanded + styling hook).
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    for (const element of frame.querySelectorAll<SVGPathElement>("[data-state]")) {
      const active = element.dataset.state === selected?.state;
      element.setAttribute("aria-expanded", String(active));
      element.classList.toggle("is-selected", active);
    }
  }, [selected]);

  function position(element: Element, clientX?: number, clientY?: number): Hover {
    const frame = frameRef.current!.getBoundingClientRect();
    const box = element.getBoundingClientRect();
    const x = (clientX ?? box.left + box.width / 2) - frame.left;
    const y = (clientY ?? box.top + box.height / 2) - frame.top;
    return { state: (element as SVGPathElement).dataset.state ?? "", x, y };
  }

  function showFor(element: SVGPathElement, clientX?: number, clientY?: number) {
    setHover(position(element, clientX, clientY));
    setHoverPath(element.getAttribute("d"));
  }

  function select(element: SVGPathElement) {
    const state = element.dataset.state ?? "";
    setSelected((current) => (current?.state === state ? null : { state, path: element.getAttribute("d") ?? "" }));
  }

  function selectByName(state: string) {
    const element = frameRef.current?.querySelector<SVGPathElement>(`[data-state="${CSS.escape(state)}"]`);
    if (element) setSelected({ state, path: element.getAttribute("d") ?? "" });
  }

  const statesWithProjects = Object.entries(projectsByState).sort(([a], [b]) => a.localeCompare(b));
  const selectedProjects = selected ? (projectsByState[selected.state] ?? []) : [];
  const hoverCount = hover ? (projectsByState[hover.state]?.length ?? 0) : 0;

  return (
    <div className="map-layout">
      <div
        ref={frameRef}
        className="map-frame"
        onPointerMove={(event) => {
          const element = stateFrom(event.target);
          if (element) showFor(element, event.clientX, event.clientY);
          else if (hover) {
            setHover(null);
            setHoverPath(null);
          }
        }}
        onPointerLeave={() => {
          setHover(null);
          setHoverPath(null);
        }}
        onFocus={(event) => {
          const element = stateFrom(event.target);
          if (element) showFor(element);
        }}
        onBlur={() => {
          setHover(null);
          setHoverPath(null);
        }}
        onClick={(event) => {
          const element = stateFrom(event.target);
          if (element) select(element);
        }}
        onKeyDown={(event) => {
          const element = stateFrom(event.target);
          if (!element) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            select(element);
          } else if (event.key === "Escape") {
            setSelected(null);
          }
        }}
      >
        {children}

        {/* Highlight overlay (hover + selection), drawn above every state. */}
        <svg viewBox={viewBox} className="map-overlay" aria-hidden="true">
          {selected ? <path d={selected.path} className="map-overlay-selected" /> : null}
          {hoverPath && hoverPath !== selected?.path ? <path d={hoverPath} className="map-overlay-hover" /> : null}
        </svg>

        {hover ? (
          <div className="map-tooltip" style={{ left: hover.x, top: hover.y }} aria-hidden="true">
            <strong>{hover.state}</strong>
            <span>{countLabel(hoverCount)}</span>
          </div>
        ) : null}
      </div>

      <div id="map-panel" className="map-panel" aria-live="polite" data-testid="panel-map">
        {selected ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="map-panel-kicker">{countLabel(selectedProjects.length)}</p>
                <h3 className="map-panel-title">{selected.state}</h3>
              </div>
              <button
                type="button"
                className="map-panel-close focus-ring"
                onClick={() => setSelected(null)}
                aria-label="Show all project locations"
                data-testid="button-map-clear"
              >
                <X aria-hidden="true" size={18} />
              </button>
            </div>
            {selectedProjects.length ? (
              <ul className="map-panel-list">
                {selectedProjects.map((project) => (
                  <li key={project.slug}>
                    <Link href={`/projects/${project.slug}`} className="map-panel-link focus-ring" data-testid={`link-map-project-${project.slug}`}>
                      <span>
                        <span className="block font-semibold">{project.title}</span>
                        <span className="map-panel-meta">
                          {[PROJECT_SECTOR_LABELS[project.sector], project.client, project.locationLabel].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                      <ArrowRight aria-hidden="true" size={16} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="map-panel-empty">No published projects in {selected.state} yet.</p>
            )}
          </>
        ) : (
          <>
            <p className="map-panel-kicker">Project locations</p>
            <h3 className="map-panel-title">Choose a state</h3>
            {statesWithProjects.length ? (
              <ul className="map-panel-list">
                {statesWithProjects.map(([state, projects]) => (
                  <li key={state}>
                    <button
                      type="button"
                      className="map-panel-link focus-ring"
                      onClick={() => selectByName(state)}
                      data-testid={`button-map-list-${state.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <span className="font-semibold">{state}</span>
                      <span className="map-panel-meta">{countLabel(projects.length)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="map-panel-empty">Project locations will appear here once projects are published.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
