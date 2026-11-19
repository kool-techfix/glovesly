import { partnerRepository, type PartnerRecord } from "@/Repositories/partner.repository";
import type { PartnerType } from "@/Schemas/common.schema";
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
  websiteUrl: string | null;
  type: PartnerType;
};

export function toPartnerDto(record: PartnerRecord): PartnerDto {
  return {
    ...toContentDtoBase(record),
    name: record.name,
    logoUrl: record.logoUrl,
    logoPublicId: record.logoPublicId,
    websiteUrl: record.websiteUrl,
    type: record.type,
  };
}

export const partnerService = createContentService({
  module: "partners",
  entityType: "partner",
  label: "Partner",
  repository: partnerRepository,
  toDto: toPartnerDto,
  titleOf: (record) => record.name,
  slugSource: (input) => input.name,
  publishProblems: (record) => problems(mediaProblem(record.logoUrl, "A logo")),
});
