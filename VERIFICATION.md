# Verification — 3 October 2026

## Final course structure

Four courses are seeded in Neon: English through Hindi (20 lessons / 100 exercises), Spanish through English, Japanese through English, and French through English (10 lessons / 50 exercises each). Total: 50 lessons and 250 exercises. The existing English curriculum and IDs remain unchanged. Vocabulary is derived from curriculum: 60 English cards and 30 per new course.

Selected course is stored in `Profile.selectedCourseId`. Existing profiles default to `english-hi`. Learning paths, prerequisites, reviews, vocabulary, completion totals and recent milestones are course-specific. XP, daily goal, timezone, streak and newly solved exercise credit remain global. Completing a lesson gives 20 XP once; replays give zero XP and no repeated daily credit.

## Completed checks

- Reviewed `202610030001_courses/migration.sql` before applying it. SQL only inserts a missing default course and adds columns plus a foreign key. No reset, destructive push, deletion or English ID rename was used.
- `npm run db:migrate`: additive migration successfully applied to the locally configured Neon database.
- `npm run db:seed`: successfully imported all four courses. Corrected UTF-8 curriculum was reseeded. Integration verification ran the seed twice more and confirmed exercise rows were identical after both runs.
- Prisma schema format, validation and client generation: passed.
- `npm run typecheck`: passed on final source.
- `npm test`: nine local tests passed; one live Neon test is skipped intentionally in this command. Tests cover original curriculum, day boundaries, streaks, all new curricula/IDs, Japanese joining, explicit alternatives, accent preservation, encoding integrity and voice language selection.
- `npm run test:neon`: the opt-in live Neon test passed against the corrected curriculum. It checked default English selection, invalid course rejection, switching persistence through fresh database connections, prerequisite isolation, cross-course lesson/answer/completion rejection, per-course review and completion counts, and returning to saved English progress. Concurrent repeated answers credited exactly 20 new exercises across four first lessons; concurrent completion/replays awarded exactly 80 global XP in total. Unsolved lesson completion was refused.
- Authenticated HTTP verification against the existing local development app: passed. A unique temporary account signed up, chose Japanese during onboarding, switched into every course, answered and completed the first lesson in all four courses, checked course selection and review pages, received 20 XP once and zero on replay, then signed out and back in with French selection preserved. Invalid IDs, missing authentication and a foreign request origin were refused. These were HTTP/API checks, not browser interaction tests.
- All uniquely named temporary test users/accounts and their cascading profiles, sessions, attempts, completions and activity were cleaned up. Aggregate SHA-256 comparisons confirmed the pre-existing user IDs, profile goal/timezone/creation records, attempts, completions, activities and every English lesson/exercise ID were unchanged after migration, seeding and tests. The temporary hash baseline was removed after successful comparison.
- `npm run build`: final production build passed, including TypeScript and page generation. Course selection and authenticated learning pages are dynamic.
- No dependencies were added, no `.env` edits were made, and no deployment or commit was performed.

## Checks not completed / limitations

No browser was connected to the available browser tools. Interactive onboarding, keyboard interaction, course-switch clicks, desktop/mobile visual layout and real-device speech playback were not visually verified. Native speech voices and `voiceschanged` behavior depend on the browser/device; language-selection logic was unit-tested, but device playback and error events still need manual testing. CSS retains the previous palette, animations, caption readability and compact desktop auth spacing, and provides a single-column course picker on small screens.

These are beginner starter curricula, with no fluency or certification claim. Accent/punctuation and Japanese script/token/romaji checks passed; an educator/native-speaker review remains advisable before expanding the curriculum. Existing account-lifecycle limits in README.md still apply.

## Changed source files

- Database/content: `prisma/schema.prisma`, `prisma/migrations/202610030001_courses/migration.sql`, `prisma/starter-content.json`, `prisma/seed.ts`, `prisma/seed-curriculum.ts`. The Prisma client in `src/generated/prisma` was regenerated.
- Services: `src/lib/courses.ts`, `curriculum.ts`, `course-store.ts`, `course-service.ts`, `learning-store.ts`, `learning.ts`, `dashboard.ts`, `db.ts`, `api.ts`, `errors.ts`, `types.ts`, `vocabulary.ts`, `speech.ts`.
- Components: `src/components/course-picker.tsx`, `course-form.tsx`, `use-course-speech.ts`, `app-shell.tsx`, `goal-form.tsx`, `learning-path.tsx`, `lesson-player.tsx`, `word-deck.tsx`, `home.tsx`.
- Pages/style: `src/app/courses/page.tsx`, `page.tsx`, `layout.tsx`, `onboarding/page.tsx`, `learn/page.tsx`, `lesson/[id]/page.tsx`, `review/page.tsx`, `review/practice/page.tsx`, `progress/page.tsx`, `profile/page.tsx`, `globals.css`.
- APIs: `src/app/api/course/route.ts`, `profile/route.ts`, `answer/route.ts`, `complete/route.ts`.
- Tests/helpers: `tests/courses.test.ts`, `tests/course-neon.test.ts`, `scripts/test-neon.ts`, `scripts/verify-course-http.ts`, `scripts/verify-preservation.mjs`.
- Project/docs: `package.json`, `README.md`, `VERIFICATION.md`.

## Session-aware navigation follow-up — 3 October 2026

The homepage now reads the existing Better Auth session on the server and renders per request (`force-dynamic`). It sends only the display name to the homepage component. Signed-in navigation, hero and closing actions show Continue learning; the navigation also exposes a profile avatar. Guest actions and the public sample remain available. The logo still links to `/`.

Signed-in requests to `/login` and `/signup` redirect to `/learn` when a profile exists and `/onboarding` otherwise. Better Auth’s existing client session hook keeps homepage navigation current without using localStorage or a second auth system. Login and both logout controls replace the document to discard old router snapshots. The session-navigation component refreshes server UI on session changes and client history navigation; restored Back/Forward-cache documents reload. A server-provided session snapshot supplies the first render while the client session hook is pending.

Checks completed on the final source:

- `npm run typecheck`: passed.
- `npm run build`: passed; `/` is now dynamic and `/demo` remains static.
- `node --import tsx scripts/verify-session-navigation.ts http://localhost:3100`: passed against the local production build with existing Neon configuration. Checked guest navigation/hero/closing actions, signed-in Continue learning/profile links with no signup/login links, the public sample, guest auth forms, incomplete and complete learning-setup redirects, two-user/guest isolation, private/no-store homepage responses, logout session invalidation and refreshed sign-in behaviour. The two uniquely named temporary accounts and their cascading records were removed; no existing learner data was changed by this check.

No browser was connected. Visual layouts, the client loading transition, client navigation clicks, browser Back/Forward-cache restoration and cross-tab session updates were not interactively verified. Their event handlers are implemented, but HTTP checks do not verify browser events.

Files changed in this follow-up: `src/lib/session.ts`; `src/app/page.tsx`, `login/page.tsx`, `signup/page.tsx`, `layout.tsx`, `globals.css`; `src/components/home.tsx`, `auth-form.tsx`, `sign-out.tsx`, `app-shell.tsx`, `session-navigation.tsx`; `scripts/verify-session-navigation.ts`; and `VERIFICATION.md`. No schema, migration, curriculum or course-progress changes were required. No deployment or commit was performed.
