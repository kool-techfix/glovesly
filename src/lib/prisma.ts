import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";
import { getEnv } from "@/lib/env";

// Only src/Repositories/ (and prisma/seed.ts) may import this module.

function createPrismaClient() {
  const env = getEnv();
  const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL,
    ...(env.DATABASE_POOL_MAX ? { max: env.DATABASE_POOL_MAX } : {}),
  });
  return new PrismaClient({ adapter });
}

type AppPrismaClient = ReturnType<typeof createPrismaClient>;

// One client per process; reused across hot reloads in development.
const globalForPrisma = globalThis as unknown as { prisma?: AppPrismaClient };

/** Lazily creates the client so importing a repository never touches env or the DB. */
export function getPrisma(): AppPrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}
