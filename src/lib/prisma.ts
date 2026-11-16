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

// Reuse one client across hot reloads in development.
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
