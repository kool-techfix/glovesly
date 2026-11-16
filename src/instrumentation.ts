/**
 * Runs once when a Next.js server instance starts. Validates the environment
 * so a misconfigured deploy fails fast with a list of what is wrong.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { getEnv } = await import("@/lib/env");
  getEnv();
}
