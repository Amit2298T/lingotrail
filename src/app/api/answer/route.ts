import { z } from "zod";
import { getDb } from "@/lib/db";
import { mutationUser, body, failure, ApiError } from "@/lib/api";
import { saveAnswer } from "@/lib/learning-store";
export async function POST(req: Request) {
  try {
    const user = await mutationUser(req);
    const p = z
      .object({
        exerciseId: z.string().min(1).max(100),
        answer: z.string().min(1).max(500),
      })
      .safeParse(await body(req));
    if (!p.success) throw new ApiError(400, "Choose an answer first.");
    return Response.json(
      await saveAnswer(getDb(), user.id, p.data.exerciseId, p.data.answer),
    );
  } catch (e) {
    return failure(e);
  }
}
