import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma CLI config. The CLI (migrate, studio) uses the direct connection;
// the app connects through DATABASE_URL in src/lib/prisma.ts.
// process.env is read directly (not env()) so `prisma generate` still works in
// a fresh clone without a .env file.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
