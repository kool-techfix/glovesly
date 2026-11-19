# Content still needed from the owner

Everything below is a placeholder. None of it is a company fact. Replace each item with content from the owner or the WordPress export before launch, then tick it off.

## Seeded placeholder rows (`prisma/seed.ts`, development only)

- [ ] **Services:** "Sample Service One" to "Sample Service Four", with placeholder summaries, bodies and capabilities. Real service lines, descriptions, capabilities and images are needed.
- [ ] **Projects:** "Sample Project One" to "Sample Project Five". The client is "Sample Client" and the location is "Sample location". The states (FCT, Lagos, Kano, Rivers, Enugu) were picked at random because the field is required. They are **not** places the company has worked. Real projects, clients, states, coordinates, years and photos are needed.
- [ ] **News:** "Sample News Post One" to "Sample News Post Four". Real posts or the WordPress posts (old `/wp/lavarai`) are needed.
- [ ] **Team:** "Sample Person One" to "Sample Person Four" with the role "Sample role". Real names, roles, bios and photos are needed.
- [ ] **Partners:** "Sample Partner One" to "Sample Partner Five". Real client and partner names, logos and website links are needed, and permission to show each logo.
- [ ] **Workspace settings:**
  - contact email `contact@example.com`
  - phone `+234 000 000 0000`
  - address "Sample address"
  - office "Sample Head Office" (FCT)
  - three "Sample stat" figures shown as "00"

## Decisions pending

- [ ] **Partner groups:** the `PartnerType` values (GOVERNMENT, PRIVATE_CLIENT, TECHNOLOGY_PARTNER) are provisional.
- [ ] **Accent colour:** about `#463DE1` (see CLAUDE.md), unconfirmed.
- [ ] **Fonts:** Inter and Plus Jakarta Sans are placeholders.

## Page copy (`src/data/content.ts`)

Everything in this file except `companySummary` (taken from the brief) is a placeholder that starts with "Placeholder".

- [ ] **Logo:** the site uses `public/brand/glovely-logo.png` (header, footer, admin, favicon and app icons). For a sharper result, ask the owner for:
  - **A proper export.** The file is a 500×500 JPEG saved with a `.png` name. It has a white background and no transparency, so on dark backgrounds it sits on a white tile.
  - **The full lockup.** The image has no "Glovesly" wordmark, so the site shows the name as text beside it. The bottom edge also shows a cut-off line under "RC:1310011", so it appears to be cropped from a larger lockup.
  - **An SVG**, or a transparent PNG of at least 1000px, with a light version for dark backgrounds.
  - **A simplified icon** without the RC number for the favicon. "RC:1310011" is unreadable at favicon sizes.
  - **The filename:** it is spelled "glovely". Rename it with the next file.
- [ ] **Home hero slideshow (`heroSlides`):**
  - **Photos:** one per slide, five in all (vision, aviation infrastructure, construction, security solutions, energy solutions). Landscape, at least 1920px wide, uploaded to Cloudinary. Until then each slide shows a solid accent background. Replace the placeholder alt text with a description of each photo.
  - **Slide 1:** the title "Your vision, our expertise" and the strapline about "providing solutions around the globe" come from the current site. Confirm the full sentence against the WordPress export.
  - **Slides 2 to 5:** one sentence from the owner for each business line. The seeded services only have placeholder descriptions, so there was nothing real to summarise.
  - **Service links:** each business-line slide links to `/services/aviation-infrastructure`, `/services/construction`, `/services/security-solutions` and `/services/energy-solutions` once a published service with that slug exists. Until then it falls back to `/services`. Use these slugs when creating the services, or change the hrefs in `heroSlides`.
- [ ] **Home:**
  - sectors introduction
  - one or two sentences for each of the four sectors
  - services introduction
  - projects introduction
- [ ] **About:**
  - page headline
  - company story (two paragraphs: history, founding, milestones)
  - mission statement
  - vision statement
  - three values, each with a sentence
  - team introduction
- [ ] **Page intros:** the headline and introduction for the Services, Projects, News, Our team and Contact pages.
- [ ] **Clients and partners section:** a one-sentence introduction, plus a title and one-line description for each partner group (`partnerGroups`). The groups themselves (Government, Private clients, Technology partners) are provisional.
- [ ] **Nigeria map section:** a one-sentence introduction. The stats beside the map and the office locations come from the admin Settings and are seeded placeholders.
- [ ] **Call-to-action band:** a supporting sentence under "Have a project in mind?"
- [ ] **Contact page:** an introduction, including how quickly the team replies.

## Before launch

- [ ] **Old WordPress URLs:** check each one against the WordPress export (`next.config.ts`). The redirects are in place but unverified:
  - `/wp` → `/`
  - `/wp/about` → `/about`
  - `/wp/services` → `/services`
  - `/wp/projects` → `/projects`
  - `/wp/our-team` → `/our-team`
  - `/wp/lavarai` → `/news`
  - `/wp/contact` → `/contact`
- [ ] **Temporary preview:** remove the `/design` page.
