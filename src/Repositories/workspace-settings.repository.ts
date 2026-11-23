import type { Prisma, WorkspaceSettings } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";

export type WorkspaceSettingsRecord = WorkspaceSettings;

/** The single settings row. */
export const WORKSPACE_ID = "workspace";

export const workspaceSettingsRepository = {
  /** Null until the first save (or the seed) creates the row. */
  get(): Promise<WorkspaceSettingsRecord | null> {
    return getPrisma().workspaceSettings.findUnique({ where: { id: WORKSPACE_ID } });
  },

  upsert(data: {
    contactEmail?: string | null;
    recruitmentEmail?: string | null;
    phone?: string | null;
    address?: string | null;
    officeLocations?: unknown[];
    stats?: unknown[];
  }): Promise<WorkspaceSettingsRecord> {
    const values = {
      ...data,
      officeLocations: data.officeLocations as Prisma.InputJsonValue | undefined,
      stats: data.stats as Prisma.InputJsonValue | undefined,
    };
    return getPrisma().workspaceSettings.upsert({
      where: { id: WORKSPACE_ID },
      create: { id: WORKSPACE_ID, ...values },
      update: values,
    });
  },
};
