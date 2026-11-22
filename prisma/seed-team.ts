/*
 * The Glovesly team, as supplied by the owner. Names (with titles such as
 * "Dr." and "Engr.") and roles are used exactly as written. Only the Director
 * of Operations has a bio (the Director's message, verbatim). No photos, emails, social
 * links or departments: the owner adds those in the admin. See
 * docs/TODO-content.md.
 */

export type SeedTeamMember = {
  sortOrder: number;
  name: string;
  slug: string;
  role: string;
  featured: boolean;
  bio: string;
};

/** Verbatim. The old page's drop cap split the first word; it reads "As" here. */
const DIRECTOR_MESSAGE =
  "As Director of Operations, I am proud to contribute to the growth and success of Glovesly by ensuring our operational excellence supports the company's strategic vision. My role centers on optimizing processes, fostering collaboration, and driving efficiency to meet the evolving needs of our clients and stakeholders. Over the years, I’ve had the privilege of working closely with our talented teams across the globe. Their dedication and innovation inspire me daily as we tackle complex challenges and deliver impactful solutions. Together, we are committed to building on our strong foundation, creating lasting value, and advancing our mission to make a positive difference in the world.";

const member = (sortOrder: number, name: string, slug: string, role: string): SeedTeamMember => ({
  sortOrder,
  name,
  slug,
  role,
  featured: false,
  bio: "",
});

export const SEED_TEAM: SeedTeamMember[] = [
  {
    sortOrder: 10,
    name: "Aminu Tijjani Abdullahi",
    slug: "aminu-tijjani-abdullahi",
    role: "Director of Operations",
    featured: true,
    bio: DIRECTOR_MESSAGE,
  },
  member(20, "Aliyu Ahmad Gaanda", "aliyu-ahmad-gaanda", "Head of Admin"),
  member(30, "Oprah Umaru", "oprah-umaru", "HR"),
  member(40, "Abdullahi Ibrahim Yusuf", "abdullahi-ibrahim-yusuf", "Accountant"),
  member(50, "Mercy Lawrence", "mercy-lawrence", "QC & Logistics"),
  member(60, "Cynthia Augustine", "cynthia-augustine", "Customer Care"),
  member(70, "Sulaiman K. Barda", "sulaiman-k-barda", "Team Manager"),
  member(80, "Abdullahi Ibrahim", "abdullahi-ibrahim", "Head of ICT"),
  member(90, "Dr. Abdullahi Garba", "dr-abdullahi-garba", "Head of Electrical"),
  member(100, "Engr. Ibrahim Musa Pashir", "engr-ibrahim-musa-pashir", "Head of Mechanical"),
  member(110, "Engr. Ahmad I. Sayaya", "engr-ahmad-i-sayaya", "Head of Civil"),
  member(120, "Muhammad Liman", "muhammad-liman", "Team Manager"),
];
