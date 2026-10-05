import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
const globalDb = globalThis as unknown as {
  lingoDb?: PrismaClient;
  lingoDbSchemaVersion?: string;
};
const schemaVersion = "multi-course-v1";
export function getDb() {
  if (!process.env.DATABASE_URL) throw new Error("Database is not configured.");
  // Replace a development singleton generated before the additive migration.
  if (globalDb.lingoDb && globalDb.lingoDbSchemaVersion !== schemaVersion) {
    void globalDb.lingoDb.$disconnect().catch(() => {});
    globalDb.lingoDb = undefined;
  }
  globalDb.lingoDbSchemaVersion = schemaVersion;
  return (globalDb.lingoDb ??= new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
      max: 3,
    }),
  }));
}
export function configured() {
  return Boolean(
    process.env.DATABASE_URL &&
    process.env.BETTER_AUTH_SECRET &&
    process.env.BETTER_AUTH_URL,
  );
}
