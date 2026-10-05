"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CoursePicker, type CourseOption } from "./course-picker";
import { defaultCourseId } from "@/lib/courses";
export function GoalForm({
  courses = [],
  initial = 10,
  timezone,
  onboard = false,
}: {
  courses?: CourseOption[];
  initial?: number;
  timezone?: string;
  onboard?: boolean;
}) {
  const [selectedCourseId, setCourse] = useState<string>(defaultCourseId);
  const [goal, setGoal] = useState(initial),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const router = useRouter();
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMessage("");
        try {
          const r = await fetch("/api/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...(onboard ? { selectedCourseId } : {}),
              goal,
              timezone:
                timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            }),
          });
          if (!r.ok) throw Error("Could not save your goal.");
          if (onboard) {
            router.push("/learn");
            router.refresh();
          } else setMessage("Your goal is saved.");
        } catch (e) {
          setMessage((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      {onboard && (
        <CoursePicker
          options={courses}
          selected={selectedCourseId}
          onSelect={setCourse}
          disabled={busy}
        />
      )}
      <div className="goal-options">
        {[5, 10, 15].map((n, i) => (
          <button
            type="button"
            className={`card ${goal === n ? "selected" : ""}`}
            aria-pressed={goal === n}
            onClick={() => setGoal(n)}
            key={n}
          >
            <strong>{n}</strong>
            <span>new exercises / day</span>
            <small>
              {["Easy start", "A steady rhythm", "A little extra"][i]}
            </small>
          </button>
        ))}
      </div>
      <button
        className="button"
        disabled={busy || (onboard && !courses.length)}
      >
        {busy ? "Saving…" : onboard ? "Start my trail →" : "Save daily goal"}
      </button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
