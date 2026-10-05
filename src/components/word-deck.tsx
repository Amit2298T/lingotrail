"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { courses, type CourseInfo } from "@/lib/courses";
import type { VocabularyWord } from "@/lib/curriculum";
import { useCourseSpeech } from "./use-course-speech";
export function WordDeck({
  words,
  course = courses[0],
}: {
  words: VocabularyWord[];
  course?: CourseInfo;
}) {
  const [i, setI] = useState(0),
    [flip, setFlip] = useState(false);
  const w = words[i];
  const { speak, notice } = useCourseSpeech(
    course.locale,
    `${course.id}:${i}:${flip}`,
  );
  if (!w) return <p>No vocabulary is available yet.</p>;
  return (
    <div className="word-deck">
      <div className="deck-stage">
        <div className="deck-back one" />
        <div className="deck-back two" />
        <motion.button
          key={i + String(flip)}
          initial={{ opacity: 0, rotate: -4, y: 12 }}
          animate={{ opacity: 1, rotate: 0, y: 0 }}
          className="word-card"
          onClick={() => setFlip(!flip)}
        >
          <span className="eyebrow">
            {flip ? course.sourceLanguage : "YOUR NEXT WORD"}
          </span>
          <strong lang={flip ? course.explanationLocale : course.locale}>
            {flip ? w.meaning : w.target}
          </strong>
          <span>{flip ? w.target : "Tap to discover the meaning"}</span>
          {!flip && w.reading && <span className="reading">{w.reading}</span>}
          <small>
            {w.topic} <span>✦</span>
          </small>
        </motion.button>
      </div>
      <div className="deck-controls">
        <button
          aria-label="Previous word"
          onClick={() => {
            setI((i + words.length - 1) % words.length);
            setFlip(false);
          }}
        >
          ←
        </button>
        <span>
          {i + 1} / {words.length}
        </span>
        <button onClick={() => speak(w.target)} aria-label="Hear word">
          ♪
        </button>
        <button
          aria-label="Next word"
          onClick={() => {
            setI((i + 1) % words.length);
            setFlip(false);
          }}
        >
          →
        </button>
      </div>
      {notice && (
        <p role="status">
          {notice} <span lang={course.locale}>{w.target}</span>
          {w.reading && ` (${w.reading})`}
        </p>
      )}
    </div>
  );
}
