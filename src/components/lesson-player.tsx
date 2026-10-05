"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Volume2, X, Check, Trophy } from "lucide-react";
import type { PublicExercise, Feedback } from "@/lib/types";
import { courses, type CourseInfo } from "@/lib/courses";
import { useCourseSpeech } from "./use-course-speech";
import { joinTokens, isCorrect } from "@/lib/learning";
type Q = PublicExercise & { answer?: string; explanation?: string };
export function LessonPlayer({
  course = courses[0],
  title,
  lessonId,
  exercises,
  demo = false,
  review = false,
}: {
  course?: CourseInfo;
  title: string;
  lessonId: string;
  exercises: Q[];
  demo?: boolean;
  review?: boolean;
}) {
  const [index, setIndex] = useState(0),
    [selected, setSelected] = useState(""),
    [tokens, setTokens] = useState<number[]>([]),
    [feedback, setFeedback] = useState<Feedback | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [finished, setFinished] = useState(false),
    [xp, setXp] = useState(0);
  const lock = useRef(false),
    heading = useRef<HTMLHeadingElement>(null);
  const q = exercises[index];
  const { speak, notice: audioNotice } = useCourseSpeech(
    course.locale,
    `${q.id}:${finished}`,
  );
  useEffect(() => {
    heading.current?.focus();
    return () => {
      if ("speechSynthesis" in window) speechSynthesis.cancel();
    };
  }, [index]);
  function reset() {
    setSelected("");
    setTokens([]);
    setFeedback(null);
    setError("");
  }
  async function request(path: string, data: object) {
    const r = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await r.json();
    if (!r.ok) throw Error(body.error || "Could not save. Please try again.");
    return body;
  }
  async function act() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      if (feedback?.correct) {
        if (index + 1 === exercises.length) {
          if (!demo && !review) {
            const r = await request("/api/complete", { lessonId });
            setXp(r.xp);
          }
          setFinished(true);
        } else {
          reset();
          setIndex(index + 1);
        }
      } else if (feedback) {
        reset();
      } else {
        const answer =
          q.kind === "order"
            ? joinTokens(
                tokens.map((i) => q.options[i]),
                q.tokenJoiner,
              )
            : selected;
        setFeedback(
          demo
            ? {
                correct: isCorrect(answer, q.answer || ""),
                answer: q.answer || "",
                explanation: q.explanation || "",
              }
            : await request("/api/answer", { exerciseId: q.id, answer }),
        );
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  if (finished)
    return (
      <main className="finish">
        <motion.div
          initial={{ scale: 0.5, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          className="trophy"
        >
          <Trophy size={64} />
        </motion.div>
        <span className="eyebrow">ONE LITTLE WIN. A BIG STEP FORWARD.</span>
        <h1>{demo ? "You’ve found your first words." : "Look at you go!"}</h1>
        <p>
          {demo
            ? "That’s what a lesson feels like. Start your own trail to save your progress."
            : review
              ? "A little practice makes things stick."
              : "Your lesson is saved. Ready for the next chapter?"}
        </p>
        <div className="stats">
          <div className="card">
            <strong>{exercises.length}</strong>
            <span>exercises practised</span>
          </div>
          {!demo && !review && (
            <div className="card">
              <strong>+{xp}</strong>
              <span>{xp ? "XP earned" : "Replay · already earned"}</span>
            </div>
          )}
        </div>
        <Link
          className="button"
          href={demo ? "/signup" : review ? "/review" : "/learn"}
        >
          {demo ? "Start my trail →" : "Back to my trail →"}
        </Link>
        {demo && (
          <Link href="/" className="muted">
            Back home
          </Link>
        )}
      </main>
    );
  const ready =
    q.kind === "order" ? tokens.length === q.options.length : !!selected;
  return (
    <main className="lesson-page">
      <header className="lesson-header">
        <Link
          href={demo ? "/" : review ? "/review" : "/learn"}
          aria-label="Exit lesson"
        >
          <X />
        </Link>
        <div
          className="progress-track"
          role="progressbar"
          aria-valuenow={index}
          aria-valuemin={0}
          aria-valuemax={exercises.length}
        >
          <motion.div
            animate={{ width: `${(index / exercises.length) * 100}%` }}
          />
        </div>
        <span>
          {index + 1} / {exercises.length}
        </span>
      </header>
      <div className="lesson-body">
        <span className="eyebrow">
          {demo ? "SAMPLE LESSON" : review ? "A LITTLE EXTRA PRACTICE" : title}
        </span>
        <motion.section
          key={q.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 ref={heading} tabIndex={-1}>
            {q.prompt}
          </h1>
          <p>{q.hint}</p>
          {q.kind !== "listen" && q.reading && (
            <p className="reading">Reading: {q.reading}</p>
          )}
          {q.kind === "listen" && (
            <>
              <button
                className="audio-button"
                onClick={() => speak(q.spokenText || "")}
              >
                <Volume2 /> Listen to the phrase
              </button>
              {audioNotice && (
                <p role="status">
                  {audioNotice} Read instead:{" "}
                  <strong lang={course.locale}>{q.spokenText}</strong>
                  {q.reading && <span className="reading"> ({q.reading})</span>}
                </p>
              )}
            </>
          )}
          {q.kind === "order" ? (
            <>
              <div className="answer-tray" aria-label="Your sentence">
                {tokens.length ? (
                  tokens.map((n, i) => (
                    <button
                      disabled={!!feedback || busy}
                      key={n}
                      onClick={() =>
                        setTokens(tokens.filter((_, j) => i !== j))
                      }
                    >
                      {q.options[n]}
                    </button>
                  ))
                ) : (
                  <span>Build your sentence here…</span>
                )}
              </div>
              <div className="word-bank">
                {q.options.map((word, i) => (
                  <button
                    key={i}
                    disabled={tokens.includes(i) || !!feedback || busy}
                    onClick={() => setTokens([...tokens, i])}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="options">
              {q.options.map((s, i) => (
                <button
                  key={s}
                  className={`option ${selected === s ? "selected" : ""}`}
                  disabled={!!feedback || busy}
                  aria-pressed={selected === s}
                  onClick={() => setSelected(s)}
                >
                  <small>{i + 1}</small>
                  {s}
                  {selected === s && <Check size={18} />}
                </button>
              ))}
            </div>
          )}
        </motion.section>
      </div>
      <footer
        className={`lesson-footer ${feedback ? (feedback.correct ? "right" : "wrong") : ""}`}
      >
        <div>
          <div aria-live="polite">
            {feedback ? (
              <>
                <h3>
                  {feedback.correct
                    ? "Nicely done!"
                    : "Let’s give it another go."}
                </h3>
                <p>{feedback.explanation}</p>
                {!feedback.correct && <p>Answer: {feedback.answer}</p>}
              </>
            ) : (
              <p className="muted">Little by little, it starts to stick.</p>
            )}
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
          </div>
          <button
            className="button"
            disabled={busy || (!feedback && !ready)}
            onClick={act}
          >
            {busy
              ? "Saving…"
              : feedback
                ? feedback.correct
                  ? index + 1 === exercises.length
                    ? "Finish lesson →"
                    : "Continue →"
                  : "Try again"
                : "Check answer"}
          </button>
        </div>
      </footer>
    </main>
  );
}
