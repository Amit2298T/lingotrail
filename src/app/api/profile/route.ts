import { z } from "zod";
import { getDb } from "@/lib/db";
import { mutationUser, body, failure, ApiError } from "@/lib/api";
import { courseInfo } from "@/lib/courses";
export async function POST(req: Request) {
  try {
    const user = await mutationUser(req);
    const p = z
      .object({
        selectedCourseId: z.string().min(1).max(100).optional(),
        goal: z.union([z.literal(5), z.literal(10), z.literal(15)]),
        timezone: z.string().max(100),
      })
      .safeParse(await body(req));
    if (!p.success) throw new ApiError(400, "Choose a valid daily goal.");
    try {
      new Intl.DateTimeFormat("en", { timeZone: p.data.timezone }).format(
        new Date(),
      );
    } catch {
      throw new ApiError(400, "Invalid timezone.");
    }
    if (
      p.data.selectedCourseId &&
      (!courseInfo(p.data.selectedCourseId) ||
        !(await getDb().course.findUnique({
          where: { id: p.data.selectedCourseId },
        })))
    )
      throw new ApiError(400, "Choose an available course.");
    await getDb().profile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...p.data },
      update: { goal: p.data.goal },
    });
    return Response.json({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
