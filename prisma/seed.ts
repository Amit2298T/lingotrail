import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { seedCurriculum } from "./seed-curriculum";
if (!process.env.DATABASE_URL)
  throw new Error("Add DATABASE_URL to .env first.");
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 2 }),
});
seedCurriculum(db)
  .then(() =>
    console.log(
      "Seeded four courses, 50 lessons and 250 exercises; existing learner progress preserved.",
    ),
  )
  .catch(() => {
    console.error("Seed failed. Check database access and migration status.");
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
