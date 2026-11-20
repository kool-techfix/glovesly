/*
 * The four Glovesly service lines, from the owner's copy on the current site.
 *
 * Use the wording exactly as supplied: do not rewrite, shorten or correct it.
 * The only formatting applied is splitting each body into paragraphs at
 * sentence boundaries (a blank line between paragraphs). The summary is the
 * body's first sentence.
 *
 * Titles: the old site's headings were "Construction Services" and "Security
 * Solution". The titles here ("Aviation", "Construction", "Security Solutions",
 * "Energy Solutions") match the navigation and the capability lists.
 *
 * No photos exist yet (imageUrl stays null); public pages show a solid accent
 * block instead. See docs/TODO-content.md.
 */

export type SeedService = {
  slug: string;
  title: string;
  sector: "AVIATION" | "CONSTRUCTION" | "SECURITY" | "ENERGY";
  sortOrder: number;
  summary: string;
  /** Paragraphs, joined with a blank line when stored. */
  paragraphs: string[];
  capabilities: string[];
};

export const SEED_SERVICES: SeedService[] = [
  {
    slug: "aviation",
    title: "Aviation",
    sector: "AVIATION",
    sortOrder: 10,
    summary:
      "At Glovesly Pro-Project, our aviation services seamlessly integrate cutting-edge design, engineering precision, and expert execution to deliver world-class results.",
    paragraphs: [
      "At Glovesly Pro-Project, our aviation services seamlessly integrate cutting-edge design, engineering precision, and expert execution to deliver world-class results. We prioritize safety, efficiency, and innovation, ensuring each project exceeds expectations.",
      "By collaborating with public and private clients, we have successfully executed projects of all sizes, enhancing both airside and landside operations. Our approach empowers airport authorities and fixed-base operators to elevate passenger safety, revolutionize the travel experience, and extend the lifecycle of facilities—all while ensuring uninterrupted day-to-day operations.",
      "We specialize in designing and constructing terminals, aprons, and taxiways tailored to meet modern aviation demands. Our expertise extends to deploying advanced security solutions through state-of-the-art surveillance systems for unparalleled safety and monitoring. Additionally, we provide essential equipment, including Disabled Aircraft Recovery Systems, Fire/Smoke Simulators, and other critical safety tools.",
      "With a deep understanding of aviation regulations, including those governing military and federal installations, we address industry challenges with innovative solutions that benefit clients, airlines, and passengers. By upgrading aging infrastructure and building state-of-the-art airports, Glovesly Pro-Project Ltd continues to redefine excellence in aviation construction, solidifying its reputation as a trusted leader in the industry.",
    ],
    capabilities: [
      "Fire and Safety Equipment",
      "Airfield Lighting System",
      "General Power Supply",
      "Lifts, Escalators & Travelators",
      "Scanning Machines",
      "Terminal Buildings",
      "Aprons",
      "Taxiways & Runways",
      "HVAC Systems",
      "Building Automation",
      "Hangars & Equipment",
      "ILS",
    ],
  },
  {
    slug: "construction",
    title: "Construction",
    sector: "CONSTRUCTION",
    sortOrder: 20,
    summary: "At Glovesly pro project, we don’t just build structures—we create enduring legacies with passion and precision.",
    paragraphs: [
      "At Glovesly pro project, we don’t just build structures—we create enduring legacies with passion and precision. As a market leader in construction, we are renowned for delivering quality, reliability, safety, and exceeding client expectations while staying within budget. Operating across Nigeria, our expert teams deliver diverse public and private projects with a commitment to excellence. We specialize in sectors including commercial offices, residential buildings, healthcare facilities, schools, warehouses, and general construction services.",
      "Our Civil Engineering and Infrastructure division brings global expertise and innovation to complex projects, excelling in industrial plants, water infrastructure, and renewable energy. Similarly, our Roads and Earthworks division leverages modern fleets and logistical agility to deliver infrastructure like roads, bridges, dams, and runway resurfacing, enhancing regional connectivity and growth.",
      "The Projects Division handles high-value initiatives such as airports, toll roads, renewable energy, and serviced accommodation. We excel in public-private partnerships, concession arrangements, and turnkey design-and-construct solutions, ensuring long-term value for our clients. Through our Materials Supply Division, we produce and supply premium long-steel products, ensuring quality across all projects.",
      "At Glovesly, we combine expertise, experience, and innovation to deliver superior results, making us your trusted partner in construction.",
    ],
    capabilities: [
      "Roads & Earthworks",
      "Building & Housing Developments",
      "Energy Infrastructure",
      "Dams/Water Infrastructure",
      "Bridges",
    ],
  },
  {
    slug: "security-solutions",
    title: "Security Solutions",
    sector: "SECURITY",
    sortOrder: 30,
    summary: "Glovesly offers advanced surveillance solutions designed to enhance security and operational effectiveness.",
    paragraphs: [
      "Glovesly offers advanced surveillance solutions designed to enhance security and operational effectiveness. Our systems integrate the latest technology to meet modern security needs, providing reliable and high-quality protection for a wide range of applications.",
      "We specialize in mobile surveillance systems, equipped with high-definition cameras, thermal sensors, and radar, ideal for dynamic environments such as border patrols, event security, and crowd monitoring. Our multi-sensor systems combine cameras, thermal imaging, motion detection, and radar for 360-degree coverage, ensuring optimal security in low-visibility conditions like night-time or adverse weather. These systems are ideal for airports, military sites, and critical infrastructure.",
      "For permanent installations, our fixed surveillance systems provide continuous monitoring with PTZ cameras and thermal imaging, ensuring high-level security at industrial sites, stadiums, and airports. We also offer terminal cameras (long, medium, and short-range) and day/night imaging cameras for 24/7 surveillance.",
      "Our radar systems offer real-time tracking, while scanning machines enhance checkpoint security by detecting threats like explosives and narcotics. SOVA Command and Control Software integrates all systems into a unified platform for real-time monitoring and data analysis.",
      "Additionally, we provide naval/coastal security systems and portable border patrol solutions for comprehensive coverage in remote and high-risk areas. At Glovesly, we deliver reliable, flexible, and high-performance surveillance systems to safeguard assets and achieve strategic security objectives",
    ],
    capabilities: [
      "Multi-sensor Systems",
      "Fixed Surveillance Systems",
      "Mobile Surveillance Systems",
      "Portable Patrol Systems",
      "Radars",
      "Scanning Machines",
      "Command & Control Software",
      "Laser Range Finders",
      "Drones",
      "Naval/Coastal Security System",
      "CCTV",
    ],
  },
  {
    slug: "energy-solutions",
    title: "Energy Solutions",
    sector: "ENERGY",
    sortOrder: 40,
    // TODO(content): the owner has not supplied a summary or body. Do not write one.
    summary: "",
    paragraphs: [],
    capabilities: ["Management System (EMS)", "Renewable Energy", "Backup Power Solution"],
  },
];

/** Placeholder rows from earlier seeds, removed now that the real services exist. */
export const RETIRED_SAMPLE_SERVICE_SLUGS = [
  "sample-service-one",
  "sample-service-two",
  "sample-service-three",
  "sample-service-four",
];
