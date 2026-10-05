import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { getDb, configured } from "./db";
function createAuth() {
  return betterAuth({
    appName: "LingoTrail",
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    database: prismaAdapter(getDb(), { provider: "postgresql" }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 10,
      maxPasswordLength: 128,
    },
    trustedOrigins:
      process.env.NODE_ENV === "development"
        ? [
            process.env.BETTER_AUTH_URL!,
            "http://localhost:3000",
            "http://127.0.0.1:3000",
          ]
        : [process.env.BETTER_AUTH_URL!],
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 60,
      customRules: {
        "/sign-up/email": { window: 60, max: 5 },
        "/sign-in/email": { window: 60, max: 10 },
      },
    },
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  });
}
let instance: ReturnType<typeof createAuth> | undefined;
export function getAuth() {
  if (!configured())
    throw new Error(
      "Configure DATABASE_URL, BETTER_AUTH_SECRET and BETTER_AUTH_URL first.",
    );
  return (instance ??= createAuth());
}
