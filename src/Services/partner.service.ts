import type { Actor } from "@/lib/auth/auth-guard";
import { partnerRepository, type PartnerRecord } from "@/Repositories/partner.repository";
import type { PartnerType } from "@/Schemas/common.schema";
import type { PartnerUpdateInput } from "@/Schemas/partner.schema";
import {
  createContentService,
  mediaProblem,
  problems,
  toContentDtoBase,
  type ContentDtoBase,
} from "@/Services/content.service";

export type PartnerDto = ContentDtoBase & {
  name: string;
  logoUrl: string | null;
  logoPublicId: string | null;
  /** Optional white/light version for dark backgrounds. */
  logoOnDarkUrl: string | null;
  logoOnDarkPublicId: string | null;
  /** Intrinsic size of logoUrl; null when unknown (admin uploads). */
  logoWidth: number | null;
  logoHeight: number | null;
  websiteUrl: string | null;
  type: PartnerType;
};

export function toPartnerDto(record: PartnerRecord): PartnerDto {
  return {
    ...toContentDtoBase(record),
    name: record.name,
    logoUrl: record.logoUrl,
    logoPublicId: record.logoPublicId,
    logoOnDarkUrl: record.logoOnDarkUrl,
    logoOnDarkPublicId: record.logoOnDarkPublicId,
    logoWidth: record.logoWidth,
    logoHeight: record.logoHeight,
    websiteUrl: record.websiteUrl,
    type: record.type,
  };
}

const base = createContentService({
  module: "partners",
  entityType: "partner",
  label: "Partner",
  repository: partnerRepository,
  toDto: toPartnerDto,
  titleOf: (record) => record.name,
  slugSource: (input) => input.name,
  publishProblems: (record) => problems(mediaProblem(record.logoUrl, "A logo")),
});

export const partnerService = {
  ...base,

  /**
   * The stored width and height describe logoUrl. When an update replaces the
   * logo without sending new dimensions (every admin upload), clear them so the
   * card falls back to the default width instead of the old logo's shape.
   */
  async update(id: string, input: PartnerUpdateInput, actor: Actor): Promise<PartnerDto> {
    if (input.logoUrl !== undefined && input.logoWidth === undefined && input.logoHeight === undefined) {
      const existing = await partnerRepository.findById(id);
      if (existing && existing.logoUrl !== input.logoUrl) {
        return base.update(id, { ...input, logoWidth: null, logoHeight: null }, actor);
      }
    }
    return base.update(id, input, actor);
  },
};
