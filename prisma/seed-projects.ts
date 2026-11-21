/*
 * The six real Glovesly projects, as supplied by the owner.
 *
 * Only the facts given are stored: title, sector, client (abbreviations as
 * written), state and location label. Summary, body, year, coordinates, cover
 * image and gallery are left empty on purpose; the owner adds them in the
 * admin. See docs/TODO-content.md.
 *
 * States must be spelled exactly as in src/lib/nigeria-states.ts (the FCT is
 * "Federal Capital Territory"), which is also the Nigeria map's key.
 */
import type { NigeriaState } from "../src/lib/nigeria-states";

export type SeedProject = {
  slug: string;
  title: string;
  sector: "AVIATION" | "CONSTRUCTION" | "SECURITY" | "ENERGY";
  sortOrder: number;
  /** As supplied; null when the owner gave none. */
  client: string | null;
  state: NigeriaState;
  locationLabel: string;
};

export const SEED_PROJECTS: SeedProject[] = [
  {
    sortOrder: 10,
    title: "Disabled Aircraft Recovery System",
    slug: "disabled-aircraft-recovery-system",
    sector: "AVIATION",
    client: "FAAN",
    state: "Federal Capital Territory",
    locationLabel: "Abuja",
  },
  {
    sortOrder: 20,
    title: "Aircraft Fire Simulator at NCAT Zaria",
    slug: "aircraft-fire-simulator-ncat-zaria",
    sector: "AVIATION",
    client: "FAAN, NCAT",
    state: "Kaduna",
    locationLabel: "NCAT, Zaria",
  },
  {
    sortOrder: 30,
    title: "Mobile and Fixed Surveillance System",
    slug: "mobile-and-fixed-surveillance-system",
    sector: "SECURITY",
    client: null,
    state: "Federal Capital Territory",
    locationLabel: "Abuja",
  },
  {
    sortOrder: 40,
    title: "Zulu Terminal Expansion, Lagos",
    slug: "zulu-terminal-expansion-lagos",
    sector: "AVIATION",
    client: "FAAN",
    state: "Lagos",
    locationLabel: "Lagos",
  },
  {
    sortOrder: 50,
    title: "Pilot Lounge, GAT Lagos",
    slug: "pilot-lounge-gat-lagos",
    sector: "AVIATION",
    client: "FAAN",
    state: "Lagos",
    locationLabel: "GAT, Lagos",
  },
  {
    sortOrder: 60,
    title: "Airfield Lighting, Military Taxiway, Maiduguri",
    slug: "airfield-lighting-military-taxiway-maiduguri",
    sector: "AVIATION",
    client: "FAAN",
    state: "Borno",
    locationLabel: "Maiduguri",
  },
];
