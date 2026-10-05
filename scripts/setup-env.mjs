import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
if (existsSync(".env")) console.log(".env already exists; nothing changed.");
else {
  writeFileSync(
    ".env",
    readFileSync(".env.example", "utf8").replace(
      'BETTER_AUTH_SECRET=""',
      `BETTER_AUTH_SECRET="${randomBytes(32).toString("hex")}"`,
    ),
  );
  console.log(
    "Created .env with a unique secret. Add Neon URLs locally; never share them in chat.",
  );
}
