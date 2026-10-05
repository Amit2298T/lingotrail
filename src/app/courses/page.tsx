import { dashboard } from "@/lib/dashboard";
import { getDb } from "@/lib/db";
import { courseProgress } from "@/lib/course-store";
import { AppShell } from "@/components/app-shell";
import { CourseForm } from "@/components/course-form";
export const dynamic = "force-dynamic";
export default async function Page() {
  const d = await dashboard();
  const all = await courseProgress(getDb(), d.user.id);
  return (
    <AppShell course={d.course} name={d.user.name} xp={d.xp} streak={d.streak}>
      <span className="eyebrow">FOUR LANGUAGES. YOUR NEXT CHAPTER.</span>
      <h1>Choose your trail.</h1>
      <p>
        Your progress stays saved in every course. XP, daily goal and streak are
        shared across courses.
      </p>
      <CourseForm
        initial={d.course.id}
        options={all.map((c) => ({
          id: c.id,
          total: c.lessons.length,
          completed: c.lessons.filter((l) => l.completions.length > 0).length,
        }))}
      />
    </AppShell>
  );
}
