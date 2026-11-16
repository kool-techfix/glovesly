import { ApiError } from "@/lib/api/api-error";
import { readSessionCookie } from "@/lib/auth/cookies";
import { verifySessionToken } from "@/lib/auth/session";
import { sessionRepository } from "@/Repositories/session.repository";
import type { UserRole } from "@/Schemas/common.schema";

/** The signed-in user, as seen by services. */
export type Actor = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  sessionId: string;
};

type SessionState =
  | { kind: "none" }
  | { kind: "disabled" }
  | { kind: "active"; actor: Actor };

// Update Session.lastSeenAt at most this often.
const TOUCH_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Verifies the cookie JWT, then re-checks the database on every request:
 * the session must exist, belong to the JWT subject, be unrevoked and
 * unexpired, and its user must be ACTIVE.
 */
async function loadSession(): Promise<SessionState> {
  const token = await readSessionCookie();
  if (!token) return { kind: "none" };

  const claims = await verifySessionToken(token);
  if (!claims) return { kind: "none" };

  const session = await sessionRepository.findWithUser(claims.sessionId);
  const now = Date.now();
  if (
    !session ||
    session.userId !== claims.userId ||
    session.revokedAt !== null ||
    session.expiresAt.getTime() <= now
  ) {
    return { kind: "none" };
  }

  if (session.user.status !== "ACTIVE") return { kind: "disabled" };

  if (!session.lastSeenAt || now - session.lastSeenAt.getTime() > TOUCH_INTERVAL_MS) {
    await sessionRepository.touch(session.id).catch(() => undefined);
  }

  const { user } = session;
  return {
    kind: "active",
    actor: { id: user.id, email: user.email, name: user.name, role: user.role, sessionId: session.id },
  };
}

/** The current actor, or null. For server layouts and pages (no throwing). */
export async function resolveSession(): Promise<Actor | null> {
  const state = await loadSession();
  return state.kind === "active" ? state.actor : null;
}

/** Alias used by the admin workspace layout. */
export const getCurrentActor = resolveSession;

/** Any signed-in, active user. 401 when signed out, 403 when disabled. */
export async function requireAuth(): Promise<Actor> {
  const state = await loadSession();
  if (state.kind === "none") throw ApiError.unauthorized();
  if (state.kind === "disabled") throw ApiError.forbidden("This account is disabled.");
  return state.actor;
}

/** EDITOR or ADMIN. */
export async function requireEditor(): Promise<Actor> {
  const actor = await requireAuth();
  if (actor.role !== "EDITOR" && actor.role !== "ADMIN") throw ApiError.forbidden();
  return actor;
}

/** ADMIN only. */
export async function requireAdmin(): Promise<Actor> {
  const actor = await requireAuth();
  if (actor.role !== "ADMIN") throw ApiError.forbidden("Only administrators can do that.");
  return actor;
}
