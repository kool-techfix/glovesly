/*
 * One-off: builds src/data/nigeria-map.json (SVG paths for the Nigeria map).
 * Run with: pnpm exec tsx scripts/build-nigeria-map.ts
 *
 * DATA AND LICENCE
 * Source: geoBoundaries gbOpen, NGA ADM1 (states), simplified geometry,
 * release commit 9469f09 (https://www.geoboundaries.org/api/current/gbOpen/NGA/ADM1/).
 * The geoBoundaries API reports: boundarySource "GRID3", boundaryYearRepresented
 * 2022, boundaryLicense "Creative Commons Attribution 4.0 International
 * (CC BY 4.0)", licenseSource data.grid3.org (GRID3 Nigeria state boundaries).
 * CC BY 4.0 requires attribution, so the map shows a credit line (the
 * `attribution` field written below).
 *
 * d3-geo is a dev dependency used only here; the site ships no d3. The
 * Mercator parameters are written out so the site can place office dots with
 * a few lines of maths (src/lib/nigeria-map.ts).
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { geoArea, geoMercator, geoPath } from "d3-geo";

import { NIGERIA_STATES } from "../src/lib/nigeria-states";

const SOURCE_URL =
  "https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/NGA/ADM1/geoBoundaries-NGA-ADM1_simplified.geojson";
const ATTRIBUTION = "State boundaries: GRID3 via geoBoundaries, CC BY 4.0";
const WIDTH = 800;
const HEIGHT = 680;
const PADDING = 16;
const OUTPUT = resolve(import.meta.dirname, "../src/data/nigeria-map.json");

/** geoBoundaries spellings that differ from src/lib/nigeria-states.ts. */
const NAME_FIXES: Record<string, string> = {
  "Abuja Federal Capital Territory": "Federal Capital Territory",
  "Federal Capital Territory (FCT)": "Federal Capital Territory",
  FCT: "Federal Capital Territory",
  Abuja: "Federal Capital Territory",
  Nassarawa: "Nasarawa",
  "Cross-River": "Cross River",
  "Akwa-Ibom": "Akwa Ibom",
};

// Minimal GeoJSON types (only what this script reads).
type Position = number[];
type Polygon = { type: "Polygon"; coordinates: Position[][] };
type MultiPolygon = { type: "MultiPolygon"; coordinates: Position[][][] };
type StateFeature = { type: "Feature"; geometry: Polygon | MultiPolygon; properties: { shapeName: string } };
type StateCollection = { type: "FeatureCollection"; features: StateFeature[] };

/**
 * d3 expects clockwise exterior rings (spherical convention); GeoJSON (RFC 7946)
 * uses counter-clockwise. A ring wound the "wrong" way covers the rest of the
 * globe, so reverse any feature whose area exceeds a hemisphere.
 */
function rewind(feature: StateFeature): StateFeature {
  if (geoArea(feature) <= 2 * Math.PI) return feature;
  const flip = (rings: Position[][]) => rings.map((ring) => [...ring].reverse());
  const geometry =
    feature.geometry.type === "Polygon"
      ? { ...feature.geometry, coordinates: flip(feature.geometry.coordinates) }
      : { ...feature.geometry, coordinates: feature.geometry.coordinates.map(flip) };
  return { ...feature, geometry };
}

const round = (value: number) => Math.round(value * 10) / 10;

/** Douglas-Peucker in projected (pixel) space. */
function simplify(points: Array<[number, number]>, tolerance: number): Array<[number, number]> {
  if (points.length <= 2) return points;
  const [ax, ay] = points[0]!;
  const [bx, by] = points[points.length - 1]!;
  const length = Math.hypot(bx - ax, by - ay);
  let maxDistance = -1;
  let index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i]!;
    const distance =
      length === 0 ? Math.hypot(px - ax, py - ay) : Math.abs((bx - ax) * (ay - py) - (ax - px) * (by - ay)) / length;
    if (distance > maxDistance) {
      maxDistance = distance;
      index = i;
    }
  }
  if (maxDistance <= tolerance) return [points[0]!, points[points.length - 1]!];
  return [...simplify(points.slice(0, index + 1), tolerance).slice(0, -1), ...simplify(points.slice(index), tolerance)];
}

/** Projects, simplifies (0.75px) and rounds one feature to an SVG path string. */
function toPath(feature: StateFeature, project: (point: [number, number]) => [number, number] | null): string {
  const polygons = feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates;
  const parts: string[] = [];
  for (const polygon of polygons) {
    for (const ring of polygon) {
      const projected = ring.map((position) => project([position[0]!, position[1]!])!).filter(Boolean);
      const simplified = simplify(projected, 0.75).map(([x, y]) => [Math.round(x), Math.round(y)] as const);
      const deduped = simplified.filter((point, i) => i === 0 || point[0] !== simplified[i - 1]![0] || point[1] !== simplified[i - 1]![1]);
      if (deduped.length < 3) continue; // ring collapsed below a pixel
      parts.push(`M${deduped.map(([x, y]) => `${x},${y}`).join("L")}Z`);
    }
  }
  return parts.join("");
}

async function main() {
  console.info(`Downloading ${SOURCE_URL}`);
  const response = await fetch(SOURCE_URL);
  if (!response.ok) throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  const source = (await response.json()) as StateCollection;

  const features = source.features.map((feature) => rewind(feature));
  const collection: StateCollection = { type: "FeatureCollection", features };

  const projection = geoMercator().fitExtent(
    [
      [PADDING, PADDING],
      [WIDTH - PADDING, HEIGHT - PADDING],
    ],
    collection,
  );
  const path = geoPath(projection);

  const known = new Set<string>(NIGERIA_STATES);
  const states = features.map((feature) => {
    const raw = feature.properties.shapeName.trim();
    const state = NAME_FIXES[raw] ?? raw;
    if (!known.has(state)) throw new Error(`Unrecognised state name "${raw}". Add it to NAME_FIXES.`);
    const d = toPath(feature, (point) => projection(point));
    if (!d) throw new Error(`No path for ${state}`);
    const [cx, cy] = path.centroid(feature);
    return { state, path: d, centroid: [round(cx), round(cy)] as [number, number] };
  });

  const missing = NIGERIA_STATES.filter((state) => !states.some((s) => s.state === state));
  if (missing.length || states.length !== NIGERIA_STATES.length) {
    throw new Error(`Expected ${NIGERIA_STATES.length} states; missing: ${missing.join(", ") || "none"}; got ${states.length}.`);
  }
  states.sort((a, b) => a.state.localeCompare(b.state));

  // Check the hand-written Mercator in src/lib/nigeria-map.ts against d3.
  const scale = projection.scale();
  const [tx, ty] = projection.translate();
  const probe: [number, number] = [7.49, 9.06]; // Abuja (approximate)
  const expected = projection(probe)!;
  const rad = Math.PI / 180;
  const manual = [scale * probe[0] * rad + tx, ty - scale * Math.log(Math.tan(Math.PI / 4 + (probe[1] * rad) / 2))];
  if (Math.hypot(expected[0] - manual[0], expected[1] - manual[1]) > 0.01) {
    throw new Error("Manual Mercator does not match d3; check src/lib/nigeria-map.ts.");
  }

  const output = {
    width: WIDTH,
    height: HEIGHT,
    attribution: ATTRIBUTION,
    source: SOURCE_URL,
    projection: { type: "mercator", scale: Math.round(scale * 1000) / 1000, translate: [Math.round(tx * 1000) / 1000, Math.round(ty * 1000) / 1000] },
    states,
  };
  writeFileSync(OUTPUT, `${JSON.stringify(output)}\n`);
  const kb = (JSON.stringify(output).length / 1024).toFixed(1);
  console.info(`Wrote ${states.length} states to ${OUTPUT} (${kb} KB).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
