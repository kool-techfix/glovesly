import type { ZodType, ZodTypeDef } from "zod";

import type { Actor } from "@/lib/auth/auth-guard";
import { cachedWorkspace, revalidateWorkspace } from "@/lib/cache";
import {
  workspaceSettingsRepository,
  type WorkspaceSettingsRecord,
} from "@/Repositories/workspace-settings.repository";
import {
  officeLocationsSchema,
  statsSchema,
  type OfficeLocation,
  type SettingsUpdateInput,
  type Stat,
} from "@/Schemas/settings.schema";
import { activityService } from "@/Services/activity.service";

export type WorkspaceSettingsDto = {
  contactEmail: string | null;
  /** Job application alerts (falls back to contactEmail). */
  recruitmentEmail: string | null;
  phone: string | null;
  address: string | null;
  officeLocations: OfficeLocation[];
  stats: Stat[];
  updatedAt: string | null;
};

/** JSON columns are re-validated on read; anything malformed is dropped rather than rendered. */
function parseList<T>(schema: ZodType<T[], ZodTypeDef, unknown>, value: unknown): T[] {
  const result = schema.safeParse(value);
  return result.success ? result.data : [];
}

function toSettingsDto(record: WorkspaceSettingsRecord | null): WorkspaceSettingsDto {
  return {
    contactEmail: record?.contactEmail ?? null,
    recruitmentEmail: record?.recruitmentEmail ?? null,
    phone: record?.phone ?? null,
    address: record?.address ?? null,
    officeLocations: parseList(officeLocationsSchema, record?.officeLocations),
    stats: parseList(statsSchema, record?.stats),
    updatedAt: record?.updatedAt.toISOString() ?? null,
  };
}

export const settingsService = {
  /** Fresh read (admin screens, contact alerts). */
  async get(): Promise<WorkspaceSettingsDto> {
    return toSettingsDto(await workspaceSettingsRepository.get());
  },

  /** Cached read for public pages (footer, contact page, map). */
  getPublic(): Promise<WorkspaceSettingsDto> {
    return cachedWorkspace(["settings"], () => settingsService.get());
  },

  /** ADMIN only (enforced by the route). */
  async update(input: SettingsUpdateInput, actor: Actor): Promise<WorkspaceSettingsDto> {
    const record = await workspaceSettingsRepository.upsert(input);
    const changed = Object.keys(input);
    await activityService.record(actor, {
      action: "updated",
      entityType: "workspace_settings",
      entityId: record.id,
      summary: `Updated workspace settings${changed.length ? ` (${changed.join(", ")})` : ""}`,
    });
    revalidateWorkspace();
    return toSettingsDto(record);
  },
};
