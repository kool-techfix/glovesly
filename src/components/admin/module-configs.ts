import {
  PARTNER_TYPE_LABELS,
  PARTNER_TYPES,
  PROJECT_SECTOR_LABELS,
  PROJECT_SECTORS,
  PROJECT_STATUS_LABELS,
  PROJECT_STATUSES,
  type UploadFolder,
} from "@/lib/domain";
import { isNigeriaState, NIGERIA_STATES } from "@/lib/nigeria-states";
import type { ContentDtoBase } from "@/Services/content.service";

/*
 * One ModuleConfig per content module. Field names match the API schemas
 * exactly (src/Schemas/*.schema.ts); ModuleManager renders any of them.
 */

export type ModuleKey = "services" | "projects" | "news" | "team" | "partners";

export type FieldKind =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "list"
  | "lines"
  | "boolean"
  | "url"
  | "slug"
  | "asset"
  | "assets";

export type SelectOption = { value: string; label: string };

export type FieldConfig = {
  name: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  help?: string;
  placeholder?: string;
  /** select */
  options?: readonly SelectOption[];
  /** select: label for the empty choice */
  emptyLabel?: string;
  /** textarea */
  rows?: number;
  /** number */
  min?: number;
  max?: number;
  step?: number | "any";
  /** asset / assets: the paired *PublicId field(s) */
  publicIdField?: string;
  /** asset / assets: Cloudinary folder */
  folder?: UploadFolder;
  /** assets */
  maxItems?: number;
  /** asset: preview background, "dark" for white artwork. */
  previewTone?: "light" | "dark";
  /** Shown in the form but never sent. */
  readOnly?: boolean;
  /** Value for a new record. */
  defaultValue?: string | boolean;
  /** Full row width in the two-column form grid. */
  wide?: boolean;
};

export type AdminItem = ContentDtoBase & Record<string, unknown>;

export type ModuleConfig = {
  key: ModuleKey;
  /** Plural label, e.g. "Projects". */
  label: string;
  /** Singular label, e.g. "project". */
  singular: string;
  description: string;
  apiPath: string;
  folder: UploadFolder;
  /** Field shown as the row title. */
  titleKey: string;
  /** Secondary line under the title. */
  subtitle?: (item: AdminItem) => string;
  /** Thumbnail column. */
  imageKey?: string;
  /** Public URL for "View on site" (published items only). */
  publicPath?: (item: AdminItem) => string | null;
  /** A warning shown on the row (and counted above the list). */
  flag?: (item: AdminItem) => string | null;
  /** Explains what publishing needs (shown in the form). */
  publishHint: string;
  fields: readonly FieldConfig[];
};

function options<T extends string>(values: readonly T[], labels?: Record<T, string>): SelectOption[] {
  return values.map((value) => ({ value, label: labels?.[value] ?? value }));
}

const str = (value: unknown) => (typeof value === "string" ? value : "");

const slugField = (help: string): FieldConfig => ({
  name: "slug",
  label: "Slug",
  kind: "slug",
  help,
  placeholder: "generated from the title",
});

const sortOrderField: FieldConfig = {
  name: "sortOrder",
  label: "Sort order",
  kind: "number",
  min: 0,
  step: 1,
  defaultValue: "0",
  help: "Lower numbers appear first.",
};

export const moduleConfigs: Record<ModuleKey, ModuleConfig> = {
  services: {
    key: "services",
    label: "Services",
    singular: "service",
    description: "The service lines shown on the home page and the Services page.",
    apiPath: "/api/admin/services",
    folder: "services",
    titleKey: "title",
    subtitle: (item) => {
      const count = Array.isArray(item.capabilities) ? item.capabilities.length : 0;
      return `${count} ${count === 1 ? "capability" : "capabilities"}`;
    },
    imageKey: "imageUrl",
    publicPath: (item) => `/services/${item.slug}`,
    publishHint: "Publishing needs an image and at least one capability.",
    fields: [
      { name: "title", label: "Title", kind: "text", required: true, wide: true },
      slugField("Used in the address: /services/your-slug"),
      sortOrderField,
      { name: "summary", label: "Summary", kind: "textarea", rows: 3, wide: true, help: "One or two sentences for cards." },
      { name: "body", label: "Body", kind: "textarea", rows: 10, wide: true },
      {
        name: "capabilities",
        label: "Capabilities",
        kind: "lines",
        rows: 6,
        wide: true,
        help: "One capability per line.",
      },
      {
        name: "sector",
        label: "Project sector",
        kind: "select",
        options: options(PROJECT_SECTORS, PROJECT_SECTOR_LABELS),
        emptyLabel: "No sector",
        help: "Published projects in this sector are listed on the service page.",
      },
      { name: "imageUrl", label: "Image", kind: "asset", publicIdField: "imagePublicId", folder: "services", wide: true },
    ],
  },

  projects: {
    key: "projects",
    label: "Projects",
    singular: "project",
    description: "Project case studies, shown on the Projects page and the Nigeria map.",
    apiPath: "/api/admin/projects",
    folder: "projects",
    titleKey: "title",
    subtitle: (item) =>
      [PROJECT_SECTOR_LABELS[item.sector as keyof typeof PROJECT_SECTOR_LABELS], str(item.state), item.year]
        .filter(Boolean)
        .join(" · "),
    imageKey: "coverImageUrl",
    publicPath: (item) => `/projects/${item.slug}`,
    flag: (item) => (isNigeriaState(item.state) ? null : "No state set"),
    publishHint: "Publishing needs a cover image, a sector and a state.",
    fields: [
      { name: "title", label: "Title", kind: "text", required: true, wide: true },
      slugField("Used in the address: /projects/your-slug"),
      sortOrderField,
      {
        name: "sector",
        label: "Sector",
        kind: "select",
        required: true,
        options: options(PROJECT_SECTORS, PROJECT_SECTOR_LABELS),
        emptyLabel: "Choose a sector",
      },
      {
        name: "projectStatus",
        label: "Project status",
        kind: "select",
        required: true,
        options: options(PROJECT_STATUSES, PROJECT_STATUS_LABELS),
        defaultValue: "ONGOING",
      },
      {
        name: "state",
        label: "State",
        kind: "select",
        required: true,
        options: options(NIGERIA_STATES),
        emptyLabel: "Choose a state",
        help: "Places the project on the Nigeria map.",
      },
      { name: "locationLabel", label: "Location", kind: "text", placeholder: "e.g. town or site name" },
      { name: "client", label: "Client", kind: "text" },
      { name: "year", label: "Year", kind: "number", min: 1950, max: 2100, step: 1 },
      {
        name: "latitude",
        label: "Latitude",
        kind: "number",
        step: "any",
        min: 4,
        max: 14,
        help: "Optional. Set both latitude and longitude, or neither.",
      },
      { name: "longitude", label: "Longitude", kind: "number", step: "any", min: 2.5, max: 15 },
      { name: "summary", label: "Summary", kind: "textarea", rows: 3, wide: true },
      { name: "body", label: "Body", kind: "textarea", rows: 10, wide: true },
      {
        name: "coverImageUrl",
        label: "Cover image",
        kind: "asset",
        publicIdField: "coverImagePublicId",
        folder: "projects",
        wide: true,
      },
      {
        name: "galleryUrls",
        label: "Gallery",
        kind: "assets",
        publicIdField: "galleryPublicIds",
        folder: "projects",
        maxItems: 24,
        wide: true,
      },
    ],
  },

  news: {
    key: "news",
    label: "News",
    singular: "news post",
    description: "News and updates, newest first.",
    apiPath: "/api/admin/news",
    folder: "news",
    titleKey: "title",
    subtitle: (item) => {
      const author = item.author as { name: string } | null;
      return author ? `By ${author.name}` : "No author";
    },
    imageKey: "coverImageUrl",
    publicPath: (item) => `/news/${item.slug}`,
    publishHint: "Publishing needs a cover image.",
    fields: [
      { name: "title", label: "Title", kind: "text", required: true, wide: true },
      slugField("Used in the address: /news/your-slug"),
      sortOrderField,
      { name: "excerpt", label: "Excerpt", kind: "textarea", rows: 3, wide: true, help: "Shown on cards and in search results." },
      { name: "body", label: "Body", kind: "textarea", rows: 14, wide: true },
      { name: "tags", label: "Tags", kind: "list", wide: true, help: "Comma-separated." },
      {
        name: "coverImageUrl",
        label: "Cover image",
        kind: "asset",
        publicIdField: "coverImagePublicId",
        folder: "news",
        wide: true,
      },
      {
        name: "sourceName",
        label: "Source name",
        kind: "text",
        placeholder: "e.g. Daily Trust",
        help: "The outlet that first reported the story. Fill in both source fields or neither.",
      },
      {
        name: "sourceUrl",
        label: "Source link",
        kind: "url",
        placeholder: "https://",
        help: "Link to the original report. The article ends with \"Read the original report on …\".",
      },
    ],
  },

  team: {
    key: "team",
    label: "Team",
    singular: "team member",
    description: "People shown on the Our team page.",
    apiPath: "/api/admin/team",
    folder: "team",
    titleKey: "name",
    subtitle: (item) => str(item.role),
    imageKey: "photoUrl",
    publicPath: () => "/our-team",
    publishHint: "Publishing needs a photo.",
    fields: [
      { name: "name", label: "Name", kind: "text", required: true },
      { name: "role", label: "Role", kind: "text", required: true },
      slugField("Used for links to this person."),
      sortOrderField,
      { name: "bio", label: "Bio", kind: "textarea", rows: 8, wide: true },
      {
        name: "featured",
        label: "Featured on the team page",
        kind: "boolean",
        defaultValue: false,
        wide: true,
        help: "Shown at the top of Our team with their bio, for leadership.",
      },
      { name: "linkedinUrl", label: "LinkedIn URL", kind: "url", placeholder: "https://www.linkedin.com/in/…", wide: true },
      { name: "photoUrl", label: "Photo", kind: "asset", publicIdField: "photoPublicId", folder: "team", wide: true },
    ],
  },

  partners: {
    key: "partners",
    label: "Partners",
    singular: "partner",
    description: "Clients and partners shown in the logo carousel.",
    apiPath: "/api/admin/partners",
    folder: "partners",
    titleKey: "name",
    subtitle: (item) => PARTNER_TYPE_LABELS[item.type as keyof typeof PARTNER_TYPE_LABELS] ?? "",
    imageKey: "logoUrl",
    publicPath: () => "/",
    publishHint: "Publishing needs a logo.",
    fields: [
      { name: "name", label: "Name", kind: "text", required: true },
      {
        name: "type",
        label: "Type",
        kind: "select",
        required: true,
        options: options(PARTNER_TYPES, PARTNER_TYPE_LABELS),
        emptyLabel: "Choose a type",
      },
      slugField("Internal identifier."),
      sortOrderField,
      { name: "websiteUrl", label: "Website", kind: "url", placeholder: "https://…", wide: true },
      {
        name: "logoUrl",
        label: "Logo",
        kind: "asset",
        publicIdField: "logoPublicId",
        folder: "partners",
        wide: true,
        help: "The version for light backgrounds (dark lettering). Required to publish.",
      },
      {
        name: "logoOnDarkUrl",
        label: "Logo for dark backgrounds",
        kind: "asset",
        publicIdField: "logoOnDarkPublicId",
        folder: "partners",
        wide: true,
        previewTone: "dark",
        help: "Optional white or light version. Without one, dark sections show the logo above on a white tile.",
      },
    ],
  },
};
