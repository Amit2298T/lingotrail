"use client";
import { motion } from "motion/react";
import { Languages, Check } from "lucide-react";
import { courses } from "@/lib/courses";
export type CourseOption = { id: string; total: number; completed: number };
export function CoursePicker({
  options,
  selected,
  onSelect,
  disabled = false,
}: {
  options: CourseOption[];
  selected: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset className="course-fieldset" disabled={disabled}>
      <legend>Choose your learning course</legend>
      <div className="course-grid">
        {courses.map((c) => {
          const progress = options.find((o) => o.id === c.id);
          if (!progress) return null;
          return (
            <motion.label
              layout
              key={c.id}
              className={`card course-card ${c.color} ${selected === c.id ? "selected" : ""}`}
            >
              <input
                type="radio"
                name="course"
                value={c.id}
                checked={selected === c.id}
                onChange={() => onSelect(c.id)}
              />
              <span className="course-card-top">
                <Languages size={25} aria-hidden="true" />
                {selected === c.id && <Check size={20} aria-hidden="true" />}
              </span>
              <strong>{c.title}</strong>
              <span>Learning language: {c.targetLanguage}</span>
              <span>Explanation language: {c.sourceLanguage}</span>
              <small>Beginner starter course · {progress.total} lessons</small>
              <span>
                {progress.completed} / {progress.total} lessons complete
              </span>
              <progress
                max={Math.max(1, progress.total)}
                value={progress.completed}
                aria-label={`${c.title} completion`}
              />
            </motion.label>
          );
        })}
      </div>
    </fieldset>
  );
}
