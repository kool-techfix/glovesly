import { ApiError } from "@/lib/api/api-error";
import { pageMeta } from "@/lib/api/response";
import type { Actor } from "@/lib/auth/auth-guard";
import { hashPassword } from "@/lib/auth/password";
import { sessionRepository } from "@/Repositories/session.repository";
import { userRepository, type UserRecord } from "@/Repositories/user.repository";
import type { UserRole, UserStatus } from "@/Schemas/common.schema";
import type { UserCreateInput, UserListQuery, UserUpdateInput } from "@/Schemas/user.schema";
import { activityService } from "@/Services/activity.service";
import { passwordService } from "@/Services/password.service";

/** Public view of a user. passwordHash never leaves the repository layer. */
export type UserDto = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  /** True until the invite is accepted and a password is set. */
  invitePending: boolean;
  preferences: unknown;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export function toUserDto(user: UserRecord): UserDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    invitePending: user.passwordHash === null,
    preferences: user.preferences,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

async function getRecord(id: string): Promise<UserRecord> {
  const user = await userRepository.findById(id);
  if (!user) throw ApiError.notFound("User not found.");
  return user;
}

const isActiveAdmin = (user: UserRecord) => user.role === "ADMIN" && user.status === "ACTIVE";

async function assertNotLastAdmin(user: UserRecord, message: string) {
  if (isActiveAdmin(user) && (await userRepository.countActiveAdmins(user.id)) === 0) {
    throw ApiError.conflict(message);
  }
}

/** ADMIN-only user management (routes guard with requireAdmin). */
export const userService = {
  async list(query: UserListQuery) {
    const { items, total } = await userRepository.list(query);
    return { items: items.map(toUserDto), meta: pageMeta(query.page, query.pageSize, total) };
  },

  async get(id: string) {
    return toUserDto(await getRecord(id));
  },

  /** Creates the account without a password and emails an invite link. */
  async invite(input: UserCreateInput, actor: Actor) {
    const user = await userRepository.create({ ...input, passwordHash: null });
    await passwordService.issueLink(user, "INVITE", actor.name);
    await activityService.record(actor, {
      action: "invited",
      entityType: "user",
      entityId: user.id,
      summary: `Invited ${user.email} as ${user.role}`,
    });
    return toUserDto(user);
  },

  async update(id: string, input: UserUpdateInput, actor: Actor) {
    const target = await getRecord(id);
    const isSelf = target.id === actor.id;
    const roleChange = input.role !== undefined && input.role !== target.role;
    const statusChange = input.status !== undefined && input.status !== target.status;

    if (isSelf && (roleChange || statusChange)) {
      throw ApiError.forbidden("You cannot change your own role or status.");
    }
    if ((roleChange && input.role !== "ADMIN") || (statusChange && input.status === "DISABLED")) {
      await assertNotLastAdmin(target, "The last active administrator cannot be demoted or disabled.");
    }

    const user = await userRepository.update(id, {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(roleChange ? { role: input.role } : {}),
      ...(statusChange ? { status: input.status } : {}),
      ...(input.password !== undefined ? { passwordHash: await hashPassword(input.password) } : {}),
    });

    // Disabling or an admin-set password signs the user out everywhere
    // (an admin setting their own password keeps their current session).
    if ((statusChange && input.status === "DISABLED") || input.password !== undefined) {
      await sessionRepository.revokeAllForUser(id, isSelf ? actor.sessionId : undefined);
    }

    const changes = [
      input.name !== undefined && input.name !== target.name ? "name" : null,
      roleChange ? `role → ${input.role}` : null,
      statusChange ? `status → ${input.status}` : null,
      input.password !== undefined ? "password set" : null,
    ].filter(Boolean);
    await activityService.record(actor, {
      action: "updated",
      entityType: "user",
      entityId: id,
      summary: `Updated ${user.email}${changes.length ? ` (${changes.join(", ")})` : ""}`,
    });
    return toUserDto(user);
  },

  /** Deletes the user; their sessions and tokens cascade. */
  async remove(id: string, actor: Actor) {
    if (id === actor.id) throw ApiError.forbidden("You cannot delete your own account.");
    const target = await getRecord(id);
    await assertNotLastAdmin(target, "The last active administrator cannot be deleted.");

    await userRepository.delete(id);
    await activityService.record(actor, {
      action: "deleted",
      entityType: "user",
      entityId: id,
      summary: `Deleted ${target.email}`,
    });
    return { id };
  },

  /** Emails an invite (no password yet) or a reset link (has a password). */
  async sendPasswordLink(id: string, actor: Actor) {
    const target = await getRecord(id);
    if (target.status !== "ACTIVE") {
      throw ApiError.validation("Enable this account before sending a password link.");
    }
    const purpose = target.passwordHash === null ? "INVITE" : "RESET";
    await passwordService.issueLink(target, purpose, actor.name);
    await activityService.record(actor, {
      action: "password_link_sent",
      entityType: "user",
      entityId: id,
      summary: `Sent ${purpose === "INVITE" ? "an invite" : "a password reset"} link to ${target.email}`,
    });
    return { sent: true as const, purpose };
  },

  /** "Sign out everywhere": revokes every session of the user. */
  async signOutEverywhere(id: string, actor: Actor) {
    const target = await getRecord(id);
    const { count } = await sessionRepository.revokeAllForUser(id);
    await activityService.record(actor, {
      action: "sessions_revoked",
      entityType: "user",
      entityId: id,
      summary: `Signed ${target.email} out everywhere (${count} session${count === 1 ? "" : "s"})`,
    });
    return { revoked: count };
  },
};
