import Link from "next/link";
import { SignOut } from "@/components/sign-out";
export const dynamic = "force-dynamic";
import { dashboard } from "@/lib/dashboard";
import { AppShell } from "@/components/app-shell";
import { GoalForm } from "@/components/goal-form";
export default async function Page() {
  const d = await dashboard();
  return (
    <AppShell course={d.course} name={d.user.name} xp={d.xp} streak={d.streak}>
      <span className="eyebrow">YOUR TRAIL, YOUR PACE</span>
      <h1>A little about you.</h1>
      <section className="card">
        <h2>{d.user.name}</h2>
        <p>{d.user.email}</p>
        <p className="muted">
          {d.course.title} · {d.profile.timezone}
        </p>
        <Link className="text-link" href="/courses">
          Switch course →
        </Link>
      </section>
      <section className="card">
        <h2>Make learning fit your day.</h2>
        <p>Choose how many new exercises you want to solve each day.</p>
        <GoalForm initial={d.profile.goal} timezone={d.profile.timezone} />
      </section>
      <SignOut />
    </AppShell>
  );
}
