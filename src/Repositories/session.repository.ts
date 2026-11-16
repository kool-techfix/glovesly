import type { Session, User } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";

export type SessionWithUser = Session & { user: User };

export const sessionRepository = {
  create(data: { userId: string; expiresAt: Date; ipAddress?: string | null; userAgent?: string | null }) {
    return getPrisma().session.create({ data: { ...data, lastSeenAt: new Date() } });
  },

  findWithUser(id: string): Promise<SessionWithUser | null> {
    return getPrisma().session.findUnique({ where: { id }, include: { user: true } });
  },

  touch(id: string) {
    return getPrisma().session.update({ where: { id }, data: { lastSeenAt: new Date() } });
  },

  revoke(id: string) {
    return getPrisma().session.updateMany({
      where: { id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  /** Revokes every live session of a user, optionally keeping one (the caller's). */
  revokeAllForUser(userId: string, exceptSessionId?: string) {
    return getPrisma().session.updateMany({
      where: {
        userId,
        revokedAt: null,
        ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}),
      },
      data: { revokedAt: new Date() },
    });
  },

  /** Housekeeping: drop sessions that expired or were revoked over `olderThanDays` ago. */
  deleteStale(olderThanDays = 30) {
    const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    return getPrisma().session.deleteMany({
      where: { OR: [{ expiresAt: { lt: cutoff } }, { revokedAt: { lt: cutoff } }] },
    });
  },
};
