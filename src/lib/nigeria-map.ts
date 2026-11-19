import mapData from "@/data/nigeria-map.json";

/*
 * Pre-projected Nigeria state outlines (built by scripts/build-nigeria-map.ts
 * from GRID3 / geoBoundaries data, CC BY 4.0). Server-only by convention:
 * import it from Server Components so the paths are rendered, not bundled.
 */

export type MapState = { state: string; path: string; centroid: [number, number] };

export const NIGERIA_MAP = mapData as unknown as {
  width: number;
  height: number;
  attribution: string;
  projection: { type: "mercator"; scale: number; translate: [number, number] };
  states: MapState[];
};

/** Same Mercator projection d3 used for the paths (verified by the build script). */
export function projectLatLng(latitude: number, longitude: number): [number, number] {
  const { scale, translate } = NIGERIA_MAP.projection;
  const rad = Math.PI / 180;
  const x = scale * longitude * rad + translate[0];
  const y = translate[1] - scale * Math.log(Math.tan(Math.PI / 4 + (latitude * rad) / 2));
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
}

export function stateCentroid(state: string): [number, number] | null {
  return NIGERIA_MAP.states.find((entry) => entry.state === state)?.centroid ?? null;
}
