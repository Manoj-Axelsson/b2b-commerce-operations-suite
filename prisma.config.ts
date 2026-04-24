import "dotenv/config";
import { defineConfig } from "prisma/config";

// DX Convention: Fallback URL allows 'prisma generate' to run in CI 
// without needing access to the real production/dev database.
const DB_URL = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/rajput_dummy";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    seed: "tsx ./prisma/seed.ts",
  },
  datasource: {
    url: DB_URL,
  },
});