import "server-only";
import { getAuth } from "./auth";
import { configured } from "./db";
import { ApiError } from "./errors";
export { ApiError } from "./errors";
export async function mutationUser(req: Request) {
  if (!configured()) throw new ApiError(503, "Database is not configured.");
  const allowed = [process.env.BETTER_AUTH_URL!];
  if (process.env.NODE_ENV === "development")
    allowed.push("http://localhost:3000", "http://127.0.0.1:3000");
  if (!allowed.includes(req.headers.get("origin") || ""))
    throw new ApiError(403, "Request origin is not allowed.");
  if (!req.headers.get("content-type")?.startsWith("application/json"))
    throw new ApiError(415, "Use application/json.");
  const s = await getAuth().api.getSession({ headers: req.headers });
  if (!s) throw new ApiError(401, "Please sign in again.");
  return s.user;
}
export async function body(req: Request) {
  const raw = await req.text();
  if (raw.length > 4096) throw new ApiError(413, "Request is too large.");
  try {
    return JSON.parse(raw);
  } catch {
    throw new ApiError(400, "Invalid JSON.");
  }
}
export function failure(e: unknown) {
  if (e instanceof ApiError)
    return Response.json({ error: e.message }, { status: e.status });
  console.error("Request failed", e instanceof Error ? e.name : "UnknownError");
  return Response.json(
    { error: "Something went wrong. Please try again." },
    { status: 500 },
  );
}
