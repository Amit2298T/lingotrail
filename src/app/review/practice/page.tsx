export const dynamic = "force-dynamic";
import { reviewAttempts } from "@/lib/course-store";
import { dashboard } from "@/lib/dashboard";
import { getDb } from "@/lib/db";
import { redirect } from "next/navigation";
import { LessonPlayer } from "@/components/lesson-player";
export default async function Page() {
  const d = await dashboard();
  const attempts = await reviewAttempts(getDb(), d.user.id, d.course.id);
  if (!attempts.length) redirect("/review");
  return (
    <LessonPlayer
      course={d.course}
      title="Review"
      lessonId="review"
      review
      exercises={attempts.map((a) => ({
        ...a.exercise,
        options: a.exercise.options as string[],
      }))}
    />
  );
}
