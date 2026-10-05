import type { PrismaClient } from "../generated/prisma/client";
import { ApiError } from "./errors";
import { courseInfo } from "./courses";
export async function selectCourse(
  db: PrismaClient,
  userId: string,
  courseId: string,
) {
  if (
    !courseInfo(courseId) ||
    !(await db.course.findUnique({ where: { id: courseId } }))
  )
    throw new ApiError(400, "Choose an available course.");
  if (!(await db.profile.findUnique({ where: { userId } })))
    throw new ApiError(409, "Complete your learning setup first.");
  return db.profile.update({
    where: { userId },
    data: { selectedCourseId: courseId },
  });
}
export async function lessonAccess(
  db: PrismaClient,
  userId: string,
  lessonId: string,
) {
  const [lesson, profile] = await Promise.all([
    db.lesson.findUnique({ where: { id: lessonId } }),
    db.profile.findUnique({ where: { userId } }),
  ]);
  if (!lesson) throw new ApiError(404, "Lesson not found.");
  if (!profile) throw new ApiError(409, "Complete your learning setup first.");
  if (
    !courseInfo(lesson.courseId) ||
    lesson.courseId !== profile.selectedCourseId
  )
    throw new ApiError(
      403,
      "Switch to this course before opening its lessons.",
    );
  if (lesson.position > 0) {
    const previous = await db.lesson.findUnique({
      where: {
        courseId_position: {
          courseId: lesson.courseId,
          position: lesson.position - 1,
        },
      },
    });
    if (
      !previous ||
      !(await db.completion.findUnique({
        where: { userId_lessonId: { userId, lessonId: previous.id } },
      }))
    )
      throw new ApiError(403, "Complete the previous lesson first.");
  }
  return lesson;
}
export async function courseProgress(db: PrismaClient, userId: string) {
  return db.course.findMany({
    where: {
      id: { in: ["english-hi", "spanish-en", "japanese-en", "french-en"] },
    },
    include: {
      lessons: {
        select: {
          id: true,
          completions: { where: { userId }, select: { id: true } },
        },
      },
    },
  });
}

export async function reviewAttempts(
  db: PrismaClient,
  userId: string,
  courseId: string,
) {
  if (!courseInfo(courseId))
    throw new ApiError(400, "Choose an available course.");
  return db.attempt.findMany({
    where: { userId, correct: false, lesson: { courseId } },
    orderBy: { updatedAt: "desc" },
    take: 20,
    include: {
      exercise: {
        select: {
          id: true,
          position: true,
          kind: true,
          prompt: true,
          hint: true,
          options: true,
          spokenText: true,
          tokenJoiner: true,
          reading: true,
        },
      },
    },
  });
}
