"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Layers,
  ChartNoAxesCombined,
  User,
  LogOut,
  Flame,
  Zap,
} from "lucide-react";
import { Brand } from "./brand";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import type { CourseInfo } from "@/lib/courses";
export function AppShell({
  course,
  children,
  name,
  xp,
  streak,
}: {
  course: CourseInfo;
  children: React.ReactNode;
  name: string;
  xp: number;
  streak: number;
}) {
  const path = usePathname(),
    [error, setError] = useState("");
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Brand />
        <nav>
          {[
            ["/learn", "Learn", BookOpen],
            ["/review", "Review", Layers],
            ["/progress", "Progress", ChartNoAxesCombined],
            ["/profile", "Profile", User],
          ].map(([url, label, Icon]) => {
            const I = Icon as typeof User;
            return (
              <Link
                key={String(url)}
                href={String(url)}
                className={path.startsWith(String(url)) ? "current" : ""}
              >
                <I size={21} />
                <span>{String(label)}</span>
              </Link>
            );
          })}
        </nav>
        <button
          className="logout"
          onClick={async () => {
            try {
              const r = await authClient.signOut();
              if (r.error) throw Error();
              window.location.replace("/");
            } catch {
              setError("Sign out failed. Try again.");
            }
          }}
        >
          <LogOut size={19} />
          <span>Log out</span>
        </button>
        {error && <small role="alert">{error}</small>}
      </aside>
      <div className="app-main">
        <header className="app-header">
          <Link
            href="/courses"
            className="course-switch"
            aria-label={`Switch course. Learning ${course.targetLanguage}, explained in ${course.sourceLanguage}`}
          >
            <strong>
              {course.targetLanguage} <span aria-hidden="true">↗</span>
            </strong>
            <span className="muted">Explained in {course.sourceLanguage}</span>
          </Link>
          <div>
            <span>
              <Flame size={18} /> {streak}
            </span>
            <span>
              <Zap size={18} /> {xp} XP
            </span>
            <span className="avatar">{name.slice(0, 1).toUpperCase()}</span>
          </div>
        </header>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
