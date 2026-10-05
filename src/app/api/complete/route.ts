import { z } from "zod";
import { getDb } from "@/lib/db";
import { mutationUser, body, failure, ApiError } from "@/lib/api";
import { completeLesson } from "@/lib/learning-store";
export async function POST(req: Request) {
  try {
    const user = await mutationUser(req);
    const p = z
      .object({ lessonId: z.string().min(1).max(100) })
      .safeParse(await body(req));
    if (!p.success) throw new ApiError(400, "Invalid lesson.");
    return Response.json(
      await completeLesson(getDb(), user.id, p.data.lessonId),
    );
  } catch (e) {
    return failure(e);
  }
}
