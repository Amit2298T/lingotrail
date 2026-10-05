import { z } from "zod";
import { getDb } from "@/lib/db";
import { mutationUser, body, failure, ApiError } from "@/lib/api";
import { selectCourse } from "@/lib/course-store";
export async function POST(req: Request) {
  try {
    const user = await mutationUser(req);
    const p = z
      .object({ courseId: z.string().min(1).max(100) })
      .safeParse(await body(req));
    if (!p.success) throw new ApiError(400, "Choose an available course.");
    await selectCourse(getDb(), user.id, p.data.courseId);
    return Response.json({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
