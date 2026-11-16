import { ApiError } from "@/lib/api/api-error";
import type { Actor } from "@/lib/auth/auth-guard";
import { verifyAgainstDummy, verifyPassword } from "@/lib/auth/password";
import { sessionExpiry, signSessionToken, verifySessionToken } from "@/lib/auth/session";
import { enforceRateLimit, MINUTE, resetRateLimit } from "@/lib/rate-limit";
import { sessionRepository } from "@/Repositories/session.repository";
import { userRepository } from "@/Repositories/user.repository";
import type { LoginInput } from "@/Schemas/auth.schema";
import { activityService } from "@/Services/activity.service";
import { toUserDto, type UserDto } from "@/Services/user.service";

// One message for unknown email, wrong password, disabled or not-yet-activated
// accounts, so the response never reveals which it was.
const INVALID_CREDENTIALS = "Incorrect email or password.";

export type LoginResult = {
  user: UserDto;
  token: string;
  expiresAt: Date;
  persistent: boolean;
};

export const authService = {
  async login(
    input: LoginInput,
    context: { ip: string; userAgent: string | null },
  ): Promise<LoginResult> {
    const pairKey = `login:ip-email:${context.ip}:${input.email}`;
    enforceRateLimit(
      [pairKey, { limit: 5, windowMs: 15 * MINUTE }],
      [`login:ip:${context.ip}`, { limit: 30, windowMs: 15 * MINUTE }],
    );

    const user = await userRepository.findByEmail(input.email);
    // Always run one bcrypt compare so timing does not reveal whether the email exists.
    const passwordOk = user?.passwordHash
      ? await verifyPassword(input.password, user.passwordHash)
      : await verifyAgainstDummy(input.password);

    if (!user || !passwordOk || user.status !== "ACTIVE") {
      throw ApiError.unauthorized(INVALID_CREDENTIALS);
    }

    resetRateLimit(pairKey);

    const expiresAt = sessionExpiry();
    const session = await sessionRepository.create({
      userId: user.id,
      expiresAt,
      ipAddress: context.ip === "unknown" ? null : context.ip,
      userAgent: context.userAgent,
    });
    const token = await signSessionToken({ sessionId: session.id, userId: user.id }, expiresAt);
    const updated = await userRepository.touchLastLogin(user.id);

    await activityService.record(user, {
      action: "signed_in",
      entityType: "user",
      entityId: user.id,
      summary: `${user.email} signed in`,
    });

    return { user: toUserDto(updated), token, expiresAt, persistent: input.remember };
  },

  /** Revokes the session behind a cookie token. Silent if the token is unusable. */
  async logout(token: string | null) {
    if (!token) return;
    const claims = await verifySessionToken(token);
    if (claims) await sessionRepository.revoke(claims.sessionId);
  },

  async me(actor: Actor): Promise<UserDto> {
    const user = await userRepository.findById(actor.id);
    if (!user) throw ApiError.unauthorized();
    return toUserDto(user);
  },
};
