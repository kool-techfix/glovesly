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

- [ ] **Logo:** the header and footer use a text wordmark with a "G" mark (`src/components/public/logo.tsx`). The real logo file (SVG preferred) is needed, plus a favicon.
- [ ] **Home:**
  - hero headline
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
