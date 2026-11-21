# Content still needed from the owner

Everything below is a placeholder. None of it is a company fact. Replace each item with content from the owner or the WordPress export before launch, then tick it off.

## Seeded placeholder rows (`prisma/seed.ts`, development only)

- [x] **Services:** the four real services (Aviation, Construction, Security Solutions, Energy Solutions) are seeded from the owner's copy in `prisma/seed-services.ts`, in every environment. The old "Sample Service" rows are removed by the seed.
- [ ] **Projects:** "Sample Project One" to "Sample Project Five". The client is "Sample Client" and the location is "Sample location". The states (FCT, Lagos, Kano, Rivers, Enugu) were picked at random because the field is required. They are **not** places the company has worked. Real projects, clients, states, coordinates, years and photos are needed.
- [ ] **News:** "Sample News Post One" to "Sample News Post Four". Real posts or the WordPress posts (old `/wp/lavarai`) are needed.
- [ ] **Team:** "Sample Person One" to "Sample Person Four" with the role "Sample role". Real names, roles, bios and photos are needed.
- [x] **Partners:** five real international partners (Alpine Metal Tech UK Ltd, AMS Aircraft Recovery Limited, DAT-CON, STRUCTURUS, ADB SAFEGATE) are seeded with logos from `pnpm partners:upload`, in every environment. The old "Sample Partner" rows are removed by the seed.
- [x] **Contact details** (supplied by the owner): `info@gloveslyproject.com`, +234 704 780 0065, 37 Yakubu Gowon Crescent, Abuja, Federal Capital Territory, Nigeria.
- [ ] **Workspace settings:**
  - office "Abuja office" (FCT): confirm whether it is the head office, the office name to show, and its coordinates (the map uses the FCT centre until then)
  - any other offices
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
  - **Slides 2 to 5:** the text is each service's summary, read from the database, and the button links to `/services/aviation`, `/services/construction`, `/services/security-solutions` and `/services/energy-solutions`. The Energy Solutions slide has no text until that service has a summary.
- [ ] **Home:**
  - sectors introduction
  - one or two sentences for each of the four sectors
  - services introduction
  - projects introduction
- [ ] **Services:**
  - **Energy Solutions: write summary and body.** The owner has not supplied either, so the page shows only the capabilities list and the home slide shows no text. Add them in the admin.
  - **Photos:** one per service (Aviation, Construction, Security Solutions, Energy Solutions), landscape, at least 1600px wide, uploaded in the admin. Until then `/services` and each service page show a solid accent block.
  - **Titles:** the old site used the headings "Construction Services" and "Security Solution". The new titles match the navigation and capability lists; confirm with the owner.
- [ ] **Partners (Clients & Partners section):**
  - **Confirm each partner consents to its logo being shown** (all five international partners).
  - **Partner website URLs:** none supplied, so the logos are not links. Add them in the admin; each logo then opens the site in a new tab.
  - **International partners group description:** one line for `partnerGroups.INTERNATIONAL_PARTNER` in `src/data/content.ts`. Until then no description is shown.
  - **Better source files:** SVG for ADB SAFEGATE, AMS Aircraft Recovery and DAT-CON, and a horizontal DAT-CON logo. The AMS file is only 291×87 (and is a WebP saved as `.png`), so it is slightly soft on high-density screens; the square DAT-CON mark reads small in a horizontal strip.
- [ ] **Message from the CEO** (`ceoMessage`): the text, name and title are from the owner. Still needed: a portrait of the CEO (at least 1200px, uploaded to Cloudinary) with alt text. The home page teaser can be removed by setting `showCeoTeaserOnHome` to `false`.
- [ ] **About (`aboutPage`):** the copy (title, three paragraphs, vision, mission) is the owner's text from the current About page, used verbatim. Still needed:
  - **Hero photo:** the team photo with branded caps from the old About page. Landscape, at least 1920px wide, uploaded to Cloudinary, with alt text. Until then the hero is a solid accent background.
  - **Second photo:** the one shown beside the first paragraph on the old About page, at least 1200px wide, with alt text. Set it as `howWeWorkImage`; until then "How we work" is full-width text.
  - **Portfolio list:** the seven items under "What we deliver" are taken from paragraph 3. Confirm the wording.
- [ ] **Page intros:** the headline and introduction for the Projects, News, Our team and Contact pages. (Services uses the owner's copy.)
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
