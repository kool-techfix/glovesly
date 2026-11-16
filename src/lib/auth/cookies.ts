import { cookies } from "next/headers";

export const SESSION_COOKIE = "glovesly_session";

const baseOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

/**
 * Sets the session cookie. `persistent: false` ("remember me" off) omits
 * Expires, so the browser drops it when it closes; the Session row still
 * expires on its own schedule.
 */
export async function setSessionCookie(token: string, options: { expiresAt: Date; persistent: boolean }) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    ...baseOptions,
    ...(options.persistent ? { expires: options.expiresAt } : {}),
  });
}

export async function readSessionCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { ...baseOptions, maxAge: 0 });
}
