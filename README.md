# LingoTrail

A Duolingo-inspired portfolio application with four beginner learning courses. Original purple, mint, and peach design with animated vocabulary cards, expanding topic panels, a lesson path, and responsive mobile layouts. Scrolltide was a motion reference; no paid templates or code were copied.

## Included

- Landing page, interactive English/Hindi sample lesson, email/password accounts, course and daily-goal onboarding.
- 50 lessons, 250 exercises: meaning selection, sentence building, and listening selection.
- Curriculum-derived vocabulary: 60 English cards and 30 cards per new course, with tap-to-flip and browser text-to-speech.
- Server-checked answers, sequential lesson unlocks, mistake review, XP, daily progress, and streaks.
- PostgreSQL migration, repeatable seed, environment template, Windows setup instructions.
- Reduced-motion support, labelled controls, visible keyboard focus, and small-screen layouts.

Use START-HERE.md to run it. `npm run dev` supports the public demo without a database; protected features require Neon and the migrations.

## Stack and source map

Next.js App Router / React / TypeScript, Tailwind CSS 4 plus custom CSS, Motion, Lucide icons, Better Auth, Prisma 7 with the PostgreSQL driver adapter, and Neon-compatible PostgreSQL. Runtime dependencies are locked in package-lock.json.

| Location                    | Purpose                                                        |
| --------------------------- | -------------------------------------------------------------- |
| src/app                     | Pages, layouts, and route handlers                             |
| src/components              | Reusable interactive UI                                        |
| src/lib/auth.ts             | Lazy server auth configuration and database-backed rate limits |
| src/lib/api.ts              | Session, origin, JSON, and error handling                      |
| src/lib/course-service.ts   | Server-side lesson access policy                               |
| src/lib/learning.ts         | Answer normalization and timezone/streak rules                 |
| src/lib/dashboard.ts        | Database-derived learner statistics                            |
| prisma/schema.prisma        | Data model and constraints                                     |
| prisma/migrations           | Initial PostgreSQL migration                                   |
| prisma/content.json         | Existing English curriculum; IDs and progress preserved        |
| prisma/starter-content.json | Spanish, Japanese and French starter curricula                 |
| src/lib/courses.ts          | Course IDs, language labels and speech locales                 |
| src/lib/course-store.ts     | Persisted selection, course access and isolated review queries |
| src/lib/learning-store.ts   | Server answer transactions and duplicate-safe lesson rewards   |
| prisma/seed.ts              | Idempotent curriculum import                                   |
| tests                       | Pure-rule and curriculum checks                                |

## Courses

| Course ID   | Learning language | Explanation language | Lessons | Exercises | Speech locale |
| ----------- | ----------------- | -------------------- | ------- | --------- | ------------- |
| english-hi  | English           | Hindi                | 20      | 100       | en-IN         |
| spanish-en  | Spanish           | English              | 10      | 50        | es-ES         |
| japanese-en | Japanese          | English              | 10      | 50        | ja-JP         |
| french-en   | French            | English              | 10      | 50        | fr-FR         |

The three new courses cover greetings, introductions, numbers, family, food, shopping, time, directions, travel, and everyday conversation. These are beginner starter courses, with no fluency or certification claim. Japanese provides kana/kanji and romaji reading support. Sentence exercises declare their token joiner; Japanese tokens join with no whitespace. Accent distinctions are preserved; supported French apostrophe variants are explicit accepted alternatives on individual exercises.

New learners choose a course during onboarding. Existing profiles default to English through Hindi. Use the course link in the header or profile to open `/courses`, inspect progress and switch. Selection persists in PostgreSQL. Lesson paths, prerequisite checks, completion totals, recent milestones, mistakes and vocabulary use the selected course. An old lesson URL or API request for another course is refused until the learner switches to that course. Switching never clears progress.

Apply `npm run db:migrate` before `npm run db:seed`. The `202610030001_courses` migration adds profile selection and exercise metadata; it does not reset tables or change English IDs. Seeds use a transaction and repeatable upserts and never delete learner data. Vocabulary is derived from the same curriculum files on the server; protected exercise payloads exclude answers and accepted alternatives.

Audio selects the exact locale where available, then another voice for the same language. It listens for delayed voice loading, cancels speech when content changes, and provides readable text when support or a suitable voice is unavailable or speech fails. It never selects an English voice for the new languages. Device voice availability still needs browser testing. See [MDN’s voiceschanged documentation](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/voiceschanged_event) for the browser event used.

## How progress works

A learner must complete the previous lesson in the same course before accessing the next. Protected lesson pages select public question fields; answer correctness is checked in the answer API. Listening text is necessarily sent to the browser for text-to-speech, so this is practice software, not a secure exam system. The public sample intentionally includes its answers and never persists progress.

XP, the daily goal, timezone, activity credit and streak are global across courses. Completion progress is separate for each course.

An attempt records the latest answer and correctness, plus whether the exercise has ever been solved. A serializable transaction credits a newly solved exercise only once, with bounded retries for transaction conflicts. Daily activity is recorded in the learner's onboarding timezone. The timezone stays fixed; the daily goal can change. The mistake list uses latest incorrect answers, not a full event history.

Completion requires all exercises in the lesson to have been solved. A unique user/lesson constraint awards 20 XP once. Replays award zero additional XP. The streak counts consecutive days with newly solved exercises, starting today or yesterday. Because the starter course is finite, an all-completed learner cannot extend this streak by replaying. A production learning product should add fresh practice and a separate daily-practice reward policy.

## Portfolio boundaries

This is a working source project for learning and demonstrating full-stack development, not a complete Duolingo replacement or a commercially ready language curriculum. Content needs educator review; some Hindi examples use masculine grammatical forms. Answers use normalized exact matching, not semantic AI grading. The temporary brand/course can be changed later.

Not implemented: native APK, PWA/offline sync, microphone or pronunciation scoring, AI tutoring, matching exercise type, admin editor, payments, social leaderboards, OAuth, email verification, password reset, or account deletion UI. No hosted deployment or Neon account is created by this ZIP. Before a public launch, implement account lifecycle flows, monitoring, retention/deletion controls, and appropriate abuse controls beyond the existing auth rate limits.

## Interview walkthrough

1. Trace signup from the form through Better Auth to User/Session/Account tables.
2. Explain server components versus client components using the lesson page/player.
3. Trace POST /api/answer: session, origin, schema validation, unlock rule, normalization, transaction, feedback.
4. Explain why unique constraints and transactions matter for duplicate clicks and concurrent requests.
5. Explain timezone boundaries and why streaks are computed from date keys.
6. Discuss the current finite-course streak policy and how you would redesign it for a larger product.

No secrets or installed/generated dependencies belong in the source ZIP. npm ci generates the Prisma client. Illustrations use CSS/UI geometry and Lucide icons; no external image/font service is required.

## Course verification

Run `npm run typecheck`, `npm test`, and `npm run build`. `npm test` skips the live Neon test by default. Run `npm run test:neon` explicitly after migration/seeding to test repeatable seeds, persisted switching, isolated prerequisites/review, concurrent duplicate rewards, daily credit and Japanese joining. This uses uniquely named temporary users and deletes only those users and their cascading test records.

With the local app running, `node --import tsx scripts/verify-course-http.ts http://localhost:3000` checks signup, course onboarding, authenticated course APIs, a lesson in all four courses, review, replay XP and sign-in persistence. It creates and cleans up one temporary account. Local Neon credentials stay in `.env`; the scripts do not print credentials or session tokens. `scripts/verify-preservation.mjs` records aggregate hashes before a migration/seed and `--check` compares existing user IDs, profiles, attempts, completions, activity and English lesson/exercise IDs afterwards. See VERIFICATION.md for the checks actually completed.
