import "dotenv/config";
import pg from "pg";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
const path = new URL("../.course-verification-baseline.json", import.meta.url);
try {
  await client.connect();
  const snapshot = {};
  for (const table of ["Attempt", "Completion", "Activity"]) {
    const result = await client.query(`SELECT * FROM "${table}" ORDER BY "id"`);
    snapshot[table] = {
      count: result.rows.length,
      hash: createHash("sha256")
        .update(JSON.stringify(result.rows))
        .digest("hex"),
    };
  }
  for (const [table, sql] of [
    [
      "Profiles",
      'SELECT "userId", "goal", "timezone", "createdAt" FROM "Profile" ORDER BY "userId"',
    ],
    ["Users", 'SELECT "id" FROM "user" ORDER BY "id"'],
    [
      "EnglishIDs",
      `SELECT l.id AS lesson, e.id AS exercise FROM "Lesson" l JOIN "Exercise" e ON e."lessonId" = l.id WHERE l."courseId" = 'english-hi' ORDER BY l.id, e.id`,
    ],
  ]) {
    const result = await client.query(sql);
    snapshot[table] = {
      count: result.rows.length,
      hash: createHash("sha256")
        .update(JSON.stringify(result.rows))
        .digest("hex"),
    };
  }
  if (process.argv.includes("--check")) {
    if (JSON.stringify(snapshot) !== readFileSync(path, "utf8"))
      throw new Error("preservation mismatch");
    unlinkSync(path);
    console.log(
      "Existing learner data and all English lesson/exercise IDs unchanged.",
    );
  } else {
    writeFileSync(path, JSON.stringify(snapshot));
    console.log(
      "Stored aggregate preservation hashes; no credentials or learner data printed.",
    );
  }
} catch {
  console.error(
    "Preservation verification failed; inspect database connectivity or aggregate comparison.",
  );
  process.exitCode = 1;
} finally {
  await client.end();
}
