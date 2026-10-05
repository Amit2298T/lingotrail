export const dynamic = "force-dynamic";
import { requireUser } from "@/lib/session";
import { getDb } from "@/lib/db";
import { redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { GoalForm } from "@/components/goal-form";
import { courseProgress } from "@/lib/course-store";
export default async function Page() {
  const u = await requireUser();
  if (await getDb().profile.findUnique({ where: { userId: u.id } }))
    redirect("/learn");
  const all = await courseProgress(getDb(), u.id);
  return (
    <main className="onboarding wrap">
      <Brand />
      <span className="eyebrow">MAKE IT YOURS</span>
      <h1>
        A little time.
        <br />A lot to look forward to.
      </h1>
      <p>
        Choose your course and daily goal. You can change it whenever you like.
      </p>
      <GoalForm
        onboard
        courses={all.map((c) => ({
          id: c.id,
          total: c.lessons.length,
          completed: 0,
        }))}
      />
      <p className="muted">Your timezone is saved for daily progress.</p>
    </main>
  );
}
