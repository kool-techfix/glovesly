import type { PasswordToken, User } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import type { PasswordTokenPurpose } from "@/Schemas/common.schema";

export type PasswordTokenWithUser = PasswordToken & { user: User };

export const passwordTokenRepository = {
  /** Stores a new token hash and invalidates the user's older unused links. */
  async issue(data: { userId: string; tokenHash: string; purpose: PasswordTokenPurpose; expiresAt: Date }) {
    const prisma = getPrisma();
    const [, token] = await prisma.$transaction([
      prisma.passwordToken.updateMany({
        where: { userId: data.userId, usedAt: null },
        data: { usedAt: new Date() },
      }),
      prisma.passwordToken.create({ data }),
    ]);
    return token;
  },

  findByHash(tokenHash: string): Promise<PasswordTokenWithUser | null> {
    return getPrisma().passwordToken.findUnique({ where: { tokenHash }, include: { user: true } });
  },

  /**
   * Single-use redemption in one transaction: marks the token used (only if
   * still unused and unexpired), sets the password,
   * and revokes every session of the user. Returns false if the token was
   * already used or expired by the time the transaction ran.
   */
  async redeem(tokenId: string, userId: string, passwordHash: string): Promise<boolean> {
    return getPrisma().$transaction(async (tx) => {
      const now = new Date();
      const consumed = await tx.passwordToken.updateMany({
        where: { id: tokenId, userId, usedAt: null, expiresAt: { gt: now } },
        data: { usedAt: now },
      });
      if (consumed.count !== 1) return false;

      await tx.user.update({ where: { id: userId }, data: { passwordHash } });
      await tx.session.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: now },
      });
      return true;
    });
  },
};
