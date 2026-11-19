import { teamMemberRepository, type TeamMemberRecord } from "@/Repositories/team-member.repository";
import {
  createContentService,
  mediaProblem,
  problems,
  toContentDtoBase,
  type ContentDtoBase,
} from "@/Services/content.service";

export type TeamMemberDto = ContentDtoBase & {
  name: string;
  role: string;
  bio: string;
  photoUrl: string | null;
  photoPublicId: string | null;
  linkedinUrl: string | null;
};

export function toTeamMemberDto(record: TeamMemberRecord): TeamMemberDto {
  return {
    ...toContentDtoBase(record),
    name: record.name,
    role: record.role,
    bio: record.bio,
    photoUrl: record.photoUrl,
    photoPublicId: record.photoPublicId,
    linkedinUrl: record.linkedinUrl,
  };
}

export const teamService = createContentService({
  module: "team",
  entityType: "team_member",
  label: "Team member",
  repository: teamMemberRepository,
  toDto: toTeamMemberDto,
  titleOf: (record) => record.name,
  slugSource: (input) => input.name,
  publishProblems: (record) => problems(mediaProblem(record.photoUrl, "A photo")),
});
