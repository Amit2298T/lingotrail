import { dashboard } from "@/lib/dashboard";
import { getDb } from "@/lib/db";
import { allowedLesson } from "@/lib/course-service";
import { ApiError } from "@/lib/api";
import { notFound, redirect } from "next/navigation";
import { LessonPlayer } from "@/components/lesson-player";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const d = await dashboard(),
    { id } = await params;
  let lesson;
  try {
    lesson = await allowedLesson(d.user.id, id);
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 403) redirect("/learn");
      if (e.status === 404) notFound();
    }
    throw e;
  }
  const questions = await getDb().exercise.findMany({
    where: { lessonId: id },
    orderBy: { position: "asc" },
    select: {
      id: true,
      position: true,
      kind: true,
      prompt: true,
      hint: true,
      options: true,
      spokenText: true,
      tokenJoiner: true,
      reading: true,
    },
  });
  if (!questions.length) notFound();
  return (
    <LessonPlayer
      course={d.course}
      title={lesson.title}
      lessonId={id}
      exercises={questions.map((q) => ({
        ...q,
        options: q.options as string[],
      }))}
    />
  );
}
