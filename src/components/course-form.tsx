"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CoursePicker, type CourseOption } from "./course-picker";
export function CourseForm({
  initial,
  options,
}: {
  initial: string;
  options: CourseOption[];
}) {
  const [selected, setSelected] = useState(initial),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const router = useRouter();
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          const r = await fetch("/api/course", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ courseId: selected }),
          });
          if (!r.ok)
            throw Error((await r.json()).error || "Could not switch course.");
          router.push("/learn");
          router.refresh();
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <CoursePicker
        options={options}
        selected={selected}
        onSelect={setSelected}
        disabled={busy}
      />
      <button className="button" disabled={busy || !options.length}>
        {busy ? "Saving…" : "Continue with this course →"}
      </button>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </form>
  );
}
