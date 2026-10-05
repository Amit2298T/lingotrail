import "server-only";
import { getDb } from "./db";
import { lessonAccess } from "./course-store";
export async function allowedLesson(userId: string, lessonId: string) {
  return lessonAccess(getDb(), userId, lessonId);
}
