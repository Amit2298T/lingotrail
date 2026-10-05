import Link from "next/link";
import { Check, Lock, Play } from "lucide-react";
import type { LessonCard } from "@/lib/types";
import type { CourseInfo } from "@/lib/courses";
import { courseVocabulary } from "@/lib/curriculum";
export function LearningPath({
  course,
  lessons,
  name,
  goal,
  todayCount,
}: {
  course: CourseInfo;
  lessons: LessonCard[];
  name: string;
  goal: number;
  todayCount: number;
}) {
  const word = courseVocabulary(course.id)[0];
  const next = lessons.find((l) => l.unlocked && !l.completed);
  const units = [...new Set(lessons.map((l) => l.unit))];
  return (
    <>
      <span className="eyebrow">YOUR DAILY DOSE OF POSSIBILITY</span>
      <h1>
        Hi {name.split(" ")[0]},<br />
        let’s make a little progress.
      </h1>
      <div className="learn-grid">
        <div>
          <section className="continue-card violet">
            <div>
              <span className="eyebrow">
                {next ? "YOUR NEXT LITTLE WIN" : "LOOK HOW FAR YOU’VE COME"}
              </span>
              <h2>{next?.title || "Trail complete!"}</h2>
              <p>
                {next?.subtitle ||
                  "Keep your words fresh with a little review."}
              </p>
              <Link
                className="button"
                href={next ? `/lesson/${next.id}` : "/review"}
              >
                {next ? "Continue learning →" : "Review your words →"}
              </Link>
            </div>
            <span className="big-symbol">✦</span>
          </section>
          {units.map((unit, i) => (
            <section className="unit" key={unit}>
              <div className="unit-heading">
                <span>UNIT 0{i + 1}</span>
                <h2>{unit}</h2>
              </div>
              <div className="path">
                {lessons
                  .filter((l) => l.unit === unit)
                  .map((l, j) => (
                    <div className={`path-row offset-${j % 3}`} key={l.id}>
                      {l.unlocked ? (
                        <Link
                          href={`/lesson/${l.id}`}
                          className={`lesson-node ${l.completed ? "done" : ""}`}
                          aria-label={`${l.completed ? "Replay" : "Start"} ${l.title}`}
                        >
                          {l.completed ? (
                            <Check />
                          ) : (
                            <Play fill="currentColor" />
                          )}
                        </Link>
                      ) : (
                        <span className="lesson-node locked">
                          <Lock size={21} />
                        </span>
                      )}
                      <div>
                        <strong>{l.title}</strong>
                        <p>{l.subtitle}</p>
                        {l.completed && (
                          <small>Complete · replay anytime</small>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          ))}
        </div>
        <aside>
          <section className="card daily">
            <span className="eyebrow">A LITTLE EVERY DAY</span>
            <div
              className="goal-ring"
              style={{
                background: `conic-gradient(var(--purple) ${Math.min(todayCount / goal, 1) * 360}deg, #eee9f6 0)`,
              }}
            >
              <div>
                <strong>
                  {todayCount}
                  <small> / {goal}</small>
                </strong>
                <span>new exercises</span>
              </div>
            </div>
            <h3>
              {todayCount >= goal
                ? "You made time for you."
                : "Small steps add up."}
            </h3>
            <p>Finish new exercises to reach today’s goal.</p>
            <Link href="/profile">Adjust my goal →</Link>
          </section>
          <section className="card mint">
            <span className="eyebrow">A WORD TO TAKE WITH YOU</span>
            <h2 lang={course.locale}>{word?.target}</h2>
            <p lang={course.explanationLocale}>{word?.meaning}</p>
            {word?.reading && <p>{word.reading}</p>}
            <p>There’s always something new to learn.</p>
          </section>
        </aside>
      </div>
    </>
  );
}
