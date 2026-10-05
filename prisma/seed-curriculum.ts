import type { PrismaClient } from "../src/generated/prisma/client";
import english from "./content.json";
import starters from "./starter-content.json";
import { courses } from "../src/lib/courses";
export async function seedCurriculum(db: PrismaClient) {
  // One transaction prevents a partially imported course; no learner rows are touched.
  await db.$transaction(
    async (tx) => {
      for (const c of courses) {
        const data = {
          title: c.id === "english-hi" ? "Everyday English" : c.title,
          sourceLanguage: c.sourceLanguage,
          targetLanguage: c.targetLanguage,
        };
        await tx.course.upsert({
          where: { id: c.id },
          create: { id: c.id, ...data },
          update: data,
        });
      }
      for (const item of [
        ...english.map((l) => ({ ...l, courseId: "english-hi" })),
        ...starters,
      ]) {
        const { words: _words, exercises, ...lesson } = item;
        await tx.lesson.upsert({
          where: { id: lesson.id },
          create: lesson,
          update: lesson,
        });
        for (const exercise of exercises) {
          await tx.exercise.upsert({
            where: { id: exercise.id },
            create: { ...exercise, lessonId: lesson.id },
            update: exercise,
          });
        }
      }
    },
    { timeout: 120000 },
  );
}
