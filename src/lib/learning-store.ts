import type { PrismaClient } from "../generated/prisma/client";
import { lessonAccess } from "./course-store";
import { ApiError } from "./errors";
import { isCorrect, dayKey } from "./learning";
export async function saveAnswer(
  db: PrismaClient,
  userId: string,
  exerciseId: string,
  answer: string,
) {
  const q = await db.exercise.findUnique({ where: { id: exerciseId } });
  if (!q) throw new ApiError(404, "Exercise not found.");
  await lessonAccess(db, userId, q.lessonId);
  const correct = isCorrect(answer, q.answer, q.acceptedAnswers as string[]);
  const profile = await db.profile.findUnique({ where: { userId } });
  if (!profile) throw new ApiError(409, "Complete your learning setup first.");
  for (let i = 0; i < 3; i++) {
    try {
      await db.$transaction(
        async (tx) => {
          const previous = await tx.attempt.findUnique({
            where: {
              userId_exerciseId: { userId: userId, exerciseId: q.id },
            },
          });
          await tx.attempt.upsert({
            where: {
              userId_exerciseId: { userId: userId, exerciseId: q.id },
            },
            create: {
              userId: userId,
              lessonId: q.lessonId,
              exerciseId: q.id,
              answer: answer,
              correct,
              solved: correct,
            },
            update: {
              answer: answer,
              correct,
              solved: correct || previous?.solved || false,
              attempts: { increment: 1 },
            },
          });
          if (correct && !previous?.solved) {
            const day = dayKey(new Date(), profile.timezone);
            await tx.activity.upsert({
              where: { userId_day: { userId: userId, day } },
              create: { userId: userId, day, correctCount: 1 },
              update: { correctCount: { increment: 1 } },
            });
          }
        },
        { isolationLevel: "Serializable" },
      );
      break;
    } catch (e) {
      if (
        !["P2034", "P2002"].includes((e as { code?: string }).code || "") ||
        i === 2
      )
        throw e;
    }
  }
  return { correct, answer: q.answer, explanation: q.explanation };
}
export async function completeLesson(
  db: PrismaClient,
  userId: string,
  lessonId: string,
) {
  await lessonAccess(db, userId, lessonId);
  const [count, solved] = await Promise.all([
    db.exercise.count({ where: { lessonId } }),
    db.attempt.count({ where: { userId, lessonId, solved: true } }),
  ]);
  if (!count || count !== solved)
    throw new ApiError(
      409,
      "Answer every exercise correctly to finish this lesson.",
    );
  const created = await db.completion.createMany({
    data: [{ userId, lessonId, xp: 20 }],
    skipDuplicates: true,
  });
  return { xp: created.count ? 20 : 0, alreadyCompleted: !created.count };
}
