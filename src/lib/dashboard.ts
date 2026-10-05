import "server-only";
import { getDb } from "./db";
import { requireUser } from "./session";
import { redirect } from "next/navigation";
import { dayKey, streak } from "./learning";
import { courseInfo } from "./courses";
export async function dashboard() {
  const user = await requireUser(),
    db = getDb();
  const [profile, completions, activities] = await Promise.all([
    db.profile.findUnique({ where: { userId: user.id } }),
    db.completion.findMany({ where: { userId: user.id } }),
    db.activity.findMany({
      where: { userId: user.id },
      orderBy: { day: "desc" },
    }),
  ]);
  if (!profile) redirect("/onboarding");
  const course = courseInfo(profile.selectedCourseId);
  if (!course) redirect("/courses");
  const courseCompletions = await db.completion.findMany({
    where: { userId: user.id, lesson: { courseId: course.id } },
  });
  const lessonCount = await db.lesson.count({ where: { courseId: course.id } });
  const today = dayKey(new Date(), profile.timezone);
  return {
    user,
    profile,
    completions: courseCompletions,
    course,
    lessonCount,
    activities,
    today,
    xp: completions.reduce((n, c) => n + c.xp, 0),
    streak: streak(
      activities.filter((a) => a.correctCount > 0).map((a) => a.day),
      today,
    ),
  };
}
