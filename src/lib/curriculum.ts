import english from "../../prisma/content.json";
import starters from "../../prisma/starter-content.json";
import type { CourseId } from "./courses";
export type VocabularyWord = {
  target: string;
  meaning: string;
  topic: string;
  reading?: string;
};
export function courseVocabulary(courseId: CourseId): VocabularyWord[] {
  if (courseId === "english-hi")
    return english.flatMap((l) =>
      l.words.map((w) => ({
        target: w.english,
        meaning: w.hindi,
        topic: l.title,
      })),
    );
  return starters
    .filter((l) => l.courseId === courseId)
    .flatMap((l) => l.words.map((w) => ({ ...w, topic: l.title })));
}

export function courseLessonCount(courseId: CourseId) {
  return courseId === "english-hi"
    ? english.length
    : starters.filter((l) => l.courseId === courseId).length;
}
