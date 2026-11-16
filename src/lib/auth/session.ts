import { jwtVerify, SignJWT } from "jose";

import { getEnv } from "@/lib/env";

/*
 * The session cookie holds an HS256 JWT whose `jti` is the Session row id and
 * whose `sub` is the user id. The JWT alone is never trusted: resolveSession()
 * (auth-guard.ts) re-loads the row on every request, so revocation is instant.
 */

export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const ISSUER = "glovesly";
const AUDIENCE = "glovesly-admin";

export type SessionClaims = { sessionId: string; userId: string };

function secretKey() {
  return new TextEncoder().encode(getEnv().SESSION_SECRET);
}

export function sessionExpiry(from = new Date()): Date {
  return new Date(from.getTime() + SESSION_TTL_SECONDS * 1000);
}

export async function signSessionToken(claims: SessionClaims, expiresAt: Date): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(claims.userId)
    .setJti(claims.sessionId)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(secretKey());
}

/** Returns the claims, or null for a malformed, tampered or expired token. */
export async function verifySessionToken(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (typeof payload.jti !== "string" || typeof payload.sub !== "string") return null;
    return { sessionId: payload.jti, userId: payload.sub };
  } catch {
    return null;
  }
}
