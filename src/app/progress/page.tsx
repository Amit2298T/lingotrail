export const dynamic = "force-dynamic";
import { dashboard } from "@/lib/dashboard";
import { getDb } from "@/lib/db";
import { shiftDay } from "@/lib/learning";
import { AppShell } from "@/components/app-shell";
export default async function Page() {
  const d = await dashboard(),
    days = Array.from({ length: 7 }, (_, i) => {
      const day = shiftDay(d.today, i - 6);
      return {
        day,
        n: d.activities.find((a) => a.day === day)?.correctCount || 0,
      };
    }),
    max = Math.max(d.profile.goal, ...days.map((x) => x.n));
  const recent = await getDb().completion.findMany({
    where: { userId: d.user.id, lesson: { courseId: d.course.id } },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { lesson: true },
  });
  return (
    <AppShell course={d.course} name={d.user.name} xp={d.xp} streak={d.streak}>
      <span className="eyebrow">EVERY LITTLE STEP COUNTS</span>
      <h1>
        Look how far
        <br />
        you’ve come.
      </h1>
      <div className="stats">
        {[
          [d.xp, "total XP"],
          [d.streak, "day streak"],
          [
            `${d.completions.length} / ${d.lessonCount}`,
            `${d.course.targetLanguage} lessons complete`,
          ],
        ].map(([n, label]) => (
          <div className="card" key={label}>
            <strong>{n}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <section className="card">
        <div className="section-heading">
          <h2>Your week, in little wins.</h2>
          <span className="muted">New exercises solved</span>
        </div>
        <div className="chart">
          {days.map((x) => (
            <div key={x.day}>
              <span>{x.n}</span>
              <div
                className="bar"
                style={{ height: `${Math.max(3, (x.n / max) * 150)}px` }}
              />
              <small>
                {new Date(x.day + "T12:00:00Z").toLocaleDateString("en", {
                  weekday: "short",
                  timeZone: "UTC",
                })}
              </small>
            </div>
          ))}
        </div>
        <p className="muted">
          Days follow {d.profile.timezone}. Repeated answers do not add daily
          credit.
        </p>
      </section>
      <section className="card">
        <h2>Milestones along the way.</h2>
        {recent.length ? (
          recent.map((c) => (
            <div className="milestone" key={c.id}>
              <span>✦ {c.lesson.title}</span>
              <strong>+{c.xp} XP</strong>
            </div>
          ))
        ) : (
          <p>Your first completed lesson will appear here.</p>
        )}
      </section>
    </AppShell>
  );
}
