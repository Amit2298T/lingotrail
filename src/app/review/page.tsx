export const dynamic = "force-dynamic";
import Link from "next/link";
import { dashboard } from "@/lib/dashboard";
import { getDb } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { WordDeck } from "@/components/word-deck";
import { courseVocabulary } from "@/lib/curriculum";
export default async function Page() {
  const d = await dashboard(),
    vocabulary = courseVocabulary(d.course.id),
    count = await getDb().attempt.count({
      where: {
        userId: d.user.id,
        correct: false,
        lesson: { courseId: d.course.id },
      },
    });
  return (
    <AppShell course={d.course} name={d.user.name} xp={d.xp} streak={d.streak}>
      <span className="eyebrow">KEEP YOUR WORDS CLOSE</span>
      <h1>
        A little repetition.
        <br />A lot more confidence.
      </h1>
      <div className="review-grid">
        <div className="card deck-panel">
          <WordDeck key={d.course.id} words={vocabulary} course={d.course} />
        </div>
        <div>
          <section className="card violet">
            <span className="eyebrow">PRACTICE MAKES PROGRESS</span>
            <h2>{count ? `${count} questions to revisit` : "A fresh page."}</h2>
            <p>
              {count
                ? "Your latest incorrect answers are waiting for a second look."
                : "Your tricky questions will appear here after you practise."}
            </p>
            <Link
              className="button"
              href={count ? "/review/practice" : "/learn"}
            >
              {count ? "Practise tricky questions →" : "Back to learning →"}
            </Link>
          </section>
          <section className="card">
            <h3>Make the word yours.</h3>
            <p>
              Tap to flip, listen to the word, then use it in a sentence of your
              own.
            </p>
            <p className="muted">
              {vocabulary.length} words · {d.course.title}
            </p>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
