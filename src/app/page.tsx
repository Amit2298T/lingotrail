import { Home } from "@/components/home";
import { courseVocabulary, courseLessonCount } from "@/lib/curriculum";
import { courses } from "@/lib/courses";
import { currentUser } from "@/lib/session";
export const dynamic = "force-dynamic";
export default async function Page() {
  const user = await currentUser();
  return (
    <Home
      initialUser={user ? { name: user.name } : null}
      vocabulary={courseVocabulary("english-hi").slice(0, 6)}
      lessonCounts={Object.fromEntries(
        courses.map((c) => [c.id, courseLessonCount(c.id)]),
      )}
    />
  );
}
