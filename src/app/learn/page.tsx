export const dynamic = "force-dynamic";
import { dashboard } from "@/lib/dashboard";
import { getDb } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { LearningPath } from "@/components/learning-path";
export default async function Page() {
  const d = await dashboard(),
    all = await getDb().lesson.findMany({
      where: { courseId: d.course.id },
      orderBy: { position: "asc" },
    }),
    done = new Set(d.completions.map((c) => c.lessonId));
  return (
    <AppShell course={d.course} name={d.user.name} xp={d.xp} streak={d.streak}>
      {all.length ? (
        <LearningPath
          lessons={all.map((l, i) => ({
            ...l,
            completed: done.has(l.id),
            unlocked: i === 0 || done.has(all[i - 1].id),
          }))}
          course={d.course}
          name={d.user.name}
          goal={d.profile.goal}
          todayCount={
            d.activities.find((a) => a.day === d.today)?.correctCount || 0
          }
        />
      ) : (
        <p>No lessons yet. Run npm run db:seed.</p>
      )}
    </AppShell>
  );
}
