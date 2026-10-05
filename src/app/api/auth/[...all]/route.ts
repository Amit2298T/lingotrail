import { getAuth } from "@/lib/auth";
import { configured } from "@/lib/db";
export const runtime = "nodejs";
async function handle(r: Request) {
  if (!configured())
    return Response.json(
      { message: "Connect your database first. See START-HERE.md." },
      { status: 503 },
    );
  return getAuth().handler(r);
}
export { handle as GET, handle as POST };
