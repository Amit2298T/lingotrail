"use client";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { motion } from "motion/react";
import { Hand, Utensils, Compass, MessagesSquare } from "lucide-react";
import { Brand } from "./brand";
import { WordDeck } from "./word-deck";
import { courses } from "@/lib/courses";
import type { VocabularyWord } from "@/lib/curriculum";
const topics = [
  {
    title: "Everyday basics",
    word: "Hello",
    meaning: "नमस्ते",
    color: "violet",
    illustration: Hand,
    icon: "✦",
  },
  {
    title: "Food & daily life",
    word: "Delicious",
    meaning: "स्वादिष्ट",
    color: "peach",
    illustration: Utensils,
    icon: "◒",
  },
  {
    title: "Out & about",
    word: "Explore",
    meaning: "खोजें",
    color: "mint",
    illustration: Compass,
    icon: "↗",
  },
  {
    title: "Work & conversations",
    word: "Together",
    meaning: "एक साथ",
    color: "blue",
    illustration: MessagesSquare,
    icon: "◎",
  },
];
export function Home({
  initialUser,
  vocabulary,
  lessonCounts,
}: {
  initialUser: { name: string } | null;
  vocabulary: VocabularyWord[];
  lessonCounts: Record<string, number>;
}) {
  const session = authClient.useSession();
  // The server snapshot supplies the correct first paint; Better Auth keeps it
  // current after navigation and session changes without inventing guest state.
  const user =
    session.isPending || session.error ? initialUser : session.data?.user;
  const [active, setActive] = useState(0),
    [answer, setAnswer] = useState("");
  return (
    <>
      <nav className="home-nav">
        <Brand />
        <div>
          <a href="#courses">Courses</a>
          <a href="#how">How it works</a>
          {user ? (
            <>
              <Link
                href="/profile"
                className="home-profile"
                aria-label={`${user.name}'s profile`}
              >
                <span className="avatar" aria-hidden="true">
                  {user.name.slice(0, 1).toUpperCase()}
                </span>
                <span>Profile</span>
              </Link>
              <Link className="button small" href="/learn">
                Continue learning ↗
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">Log in</Link>
              <Link className="button small" href="/signup">
                Start learning ↗
              </Link>
            </>
          )}
        </div>
      </nav>
      <main>
        <section className="hero wrap">
          <div>
            <span className="eyebrow">SMALL STEPS. REAL CONVERSATIONS.</span>
            <h1>
              A little practice.
              <br />A <em>bigger</em> world.
            </h1>
            <p>
              Find your words, one little win at a time. Learn English through
              Hindi, or Spanish, Japanese and French through English with
              lessons that fit your life.
            </p>
            <div className="actions">
              <Link className="button" href={user ? "/learn" : "/signup"}>
                {user ? "Continue learning ↗" : "Let’s get started ↗"}
              </Link>
              <Link className="button secondary" href="/demo">
                Try a lesson <span>▷</span>
              </Link>
            </div>
            <div className="hero-foot">
              <span className="dots">✦ ✦ ✦</span> A fresh start. Five minutes.
              All you.
            </div>
          </div>
          <div className="hero-art">
            <div className="halo" />
            <span className="float-note top">
              A small word. A new possibility. ↗
            </span>
            <WordDeck words={vocabulary.slice(0, 6)} />
            <span className="float-note bottom">✧ Made for your everyday</span>
          </div>
        </section>
        <div className="ribbon">
          <span>4 beginner courses</span>
          <span>✦</span>
          <span>SMALL STEPS, NEW LANGUAGES</span>
          <span>✦</span>
          <span>One confident you</span>
        </div>
        <section className="wrap section" id="courses">
          <span className="eyebrow">CHOOSE YOUR NEXT CHAPTER</span>
          <h2>Four ways to find your words.</h2>
          <p>Beginner starter courses for everyday practice.</p>
          <div className="course-grid">
            {courses.map((c) => (
              <Link
                key={c.id}
                href="/courses"
                className={`card course-card ${c.color}`}
              >
                <h3>{c.title}</h3>
                <span>Learning language: {c.targetLanguage}</span>
                <span>Explanation language: {c.sourceLanguage}</span>
                <small>
                  {lessonCounts[c.id]} short lessons · Choose course ↗
                </small>
              </Link>
            ))}
          </div>
        </section>
        <section className="wrap section" id="topics">
          <div className="section-heading">
            <div>
              <span className="eyebrow">WORDS THAT GO PLACES</span>
              <h2>
                For life beyond
                <br />
                the lesson.
              </h2>
            </div>
            <p>
              From your first hello to your next big idea.
              <br />
              Start with the things you actually say.
            </p>
          </div>
          <div className="topic-rail">
            {topics.map((t, i) => (
              <motion.button
                layout
                key={t.title}
                className={`topic ${t.color} ${active === i ? "active" : ""}`}
                onClick={() => setActive(i)}
                aria-expanded={active === i}
              >
                <span className="topic-number">
                  0{i + 1} <span>{t.icon}</span>
                </span>
                {active !== i && (
                  <span className="topic-illustration" aria-hidden="true">
                    <t.illustration size={36} strokeWidth={1.5} />
                  </span>
                )}
                <div>
                  <h3>{t.title}</h3>
                  {active === i && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <strong>{t.word}</strong>
                      <p lang="hi">{t.meaning}</p>
                      <small>5 bite-sized lessons →</small>
                    </motion.div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </section>
        <section className="wrap section how" id="how">
          <div>
            <span className="eyebrow">LESS PRESSURE. MORE PROGRESS.</span>
            <h2>
              Your next win
              <br />
              is a tap away.
            </h2>
            <p>
              No endless lectures. Just a little practice, a little feedback,
              and a reason to come back.
            </p>
            {[
              "Choose a daily goal that fits your day.",
              "Learn by choosing, listening, and building.",
              "See your progress, then take the next step.",
            ].map((x, i) => (
              <p className="step" key={x}>
                <b>0{i + 1}</b>
                {x}
              </p>
            ))}
          </div>
          <div className="mini-exercise card">
            <span className="eyebrow">A LITTLE WARM-UP</span>
            <h3>“Thank you” means…</h3>
            <p>सही हिंदी अर्थ चुनिए।</p>
            {["नमस्ते", "धन्यवाद", "अलविदा"].map((x) => (
              <button
                className={`option ${answer === x ? "selected" : ""}`}
                onClick={() => setAnswer(x)}
                key={x}
              >
                {x}
                <span>→</span>
              </button>
            ))}
            {answer && (
              <p
                role="status"
                className={answer === "धन्यवाद" ? "success" : ""}
              >
                {answer === "धन्यवाद"
                  ? "Exactly! That’s your first little win. ✦"
                  : "Almost. Try another word."}
              </p>
            )}
          </div>
        </section>
        <section className="wrap benefits">
          <div>
            <span>↗</span>
            <h3>Progress you can see</h3>
            <p>
              Lesson milestones, daily goals, and a streak that celebrates
              showing up.
            </p>
          </div>
          <div>
            <span>◎</span>
            <h3>Your words, revisited</h3>
            <p>
              Flip through vocabulary cards and give tricky questions another
              go.
            </p>
          </div>
          <div>
            <span>♪</span>
            <h3>Listen. Try. Learn.</h3>
            <p>
              Hear everyday phrases with your browser’s available English voice.
            </p>
          </div>
        </section>
        <section className="wrap section faq">
          <h2>A few good questions.</h2>
          {[
            [
              "Is this for beginners?",
              "Yes. English through Hindi has 20 short lessons. Spanish, Japanese and French through English each have 10 beginner starter lessons.",
            ],
            [
              "Do I need an account?",
              "You can try the sample without one. Create an account to save progress once the database is connected.",
            ],
            [
              "Does it score my pronunciation?",
              "No. Audio uses your browser’s text-to-speech. There is no microphone recording or speech assessment.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </section>
        <section className="closing wrap">
          <span className="eyebrow">YOUR FIRST HELLO STARTS HERE</span>
          <h2>
            Make room for
            <br />a little <em>possibility.</em>
          </h2>
          <Link className="button light" href={user ? "/learn" : "/demo"}>
            {user ? "Continue learning ↗" : "Try your first lesson ↗"}
          </Link>
        </section>
      </main>
      <footer className="wrap">
        <Brand />
        <span>A little every day goes a long way.</span>
        <span>Portfolio edition · Four beginner courses</span>
      </footer>
    </>
  );
}
