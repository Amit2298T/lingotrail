import "dotenv/config";
import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { seedCurriculum } from "../prisma/seed-curriculum";
import {
  selectCourse,
  lessonAccess,
  courseProgress,
  reviewAttempts,
} from "../src/lib/course-store";
import { saveAnswer, completeLesson } from "../src/lib/learning-store";
import { courses } from "../src/lib/courses";
import { joinTokens, dayKey } from "../src/lib/learning";

test(
  "Neon: seed repeatability, persisted selection, isolation, rewards and Japanese joining",
  { skip: process.env.RUN_NEON_TESTS !== "1", timeout: 240000 },
  async () => {
    assert.ok(process.env.DATABASE_URL);
    const db = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL!,
        max: 3,
      }),
    });
    const id = `lingotrail-course-test-${randomUUID()}`;
    let created = false;
    try {
      const before = await db.exercise.findMany({ orderBy: { id: "asc" } });
      await seedCurriculum(db);
      await seedCurriculum(db);
      assert.deepEqual(
        await db.exercise.findMany({ orderBy: { id: "asc" } }),
        before,
      );
      assert.equal(await db.lesson.count(), 50);
      assert.equal(await db.exercise.count(), 250);
      await db.user.create({
        data: {
          id,
          name: "Course integration test",
          email: `${id}@example.invalid`,
        },
      });
      created = true;
      await db.profile.create({ data: { userId: id } });
      assert.equal(
        (await db.profile.findUniqueOrThrow({ where: { userId: id } }))
          .selectedCourseId,
        "english-hi",
      );
      await assert.rejects(selectCourse(db, id, "not-a-course"), {
        status: 400,
      });
      await assert.rejects(lessonAccess(db, id, "spanish-en-01"), {
        status: 403,
      });
      await assert.rejects(completeLesson(db, id, "hello"), { status: 409 });
      for (const c of courses) {
        await selectCourse(db, id, c.id);
        const lessons = await db.lesson.findMany({
          where: { courseId: c.id },
          orderBy: { position: "asc" },
        });
        await assert.rejects(lessonAccess(db, id, lessons[1].id), {
          status: 403,
        });
        const questions = await db.exercise.findMany({
          where: { lessonId: lessons[0].id },
          orderBy: { position: "asc" },
        });
        await saveAnswer(db, id, questions[0].id, "deliberately incorrect");
        const review = await reviewAttempts(db, id, c.id);
        assert.equal(review.length, 1);
        assert.equal(review[0].exerciseId, questions[0].id);
        for (const other of courses.filter((o) => o.id !== c.id))
          assert.equal((await reviewAttempts(db, id, other.id)).length, 0);
        for (const q of questions) {
          let answer = q.answer;
          if (q.kind === "order" && c.id === "japanese-en") {
            const tokens = q.options as string[];
            answer = joinTokens(
              [...tokens.slice(-1), ...tokens.slice(0, -1)],
              q.tokenJoiner,
            );
            assert.equal(answer, q.answer);
          }
          const results = await Promise.all([
            saveAnswer(db, id, q.id, answer),
            saveAnswer(db, id, q.id, answer),
          ]);
          assert.ok(results.every((r) => r.correct));
        }
        assert.equal((await reviewAttempts(db, id, c.id)).length, 0);
        const rewards = await Promise.all([
          completeLesson(db, id, lessons[0].id),
          completeLesson(db, id, lessons[0].id),
        ]);
        assert.equal(
          rewards.reduce((n, r) => n + r.xp, 0),
          20,
        );
        assert.equal((await completeLesson(db, id, lessons[0].id)).xp, 0);
        assert.equal(
          (await lessonAccess(db, id, lessons[1].id)).id,
          lessons[1].id,
        );
        const alternate: PrismaClient = new PrismaClient({
          adapter: new PrismaPg({
            connectionString: process.env.DATABASE_URL!,
            max: 1,
          }),
        });
        try {
          assert.equal(
            (
              await alternate.profile.findUniqueOrThrow({
                where: { userId: id },
              })
            ).selectedCourseId,
            c.id,
          );
        } finally {
          await alternate.$disconnect();
        }
      }
      assert.equal(
        (
          await db.completion.aggregate({
            where: { userId: id },
            _sum: { xp: true },
          })
        )._sum.xp,
        80,
      );
      const activity = await db.activity.findUniqueOrThrow({
        where: {
          userId_day: { userId: id, day: dayKey(new Date(), "Asia/Kolkata") },
        },
      });
      assert.equal(activity.correctCount, 20);
      const progress = await courseProgress(db, id);
      for (const c of progress)
        assert.equal(c.lessons.filter((l) => l.completions.length).length, 1);
      await selectCourse(db, id, "english-hi");
      assert.equal((await lessonAccess(db, id, "hello")).id, "hello");
      assert.equal(await db.completion.count({ where: { userId: id } }), 4);
      await selectCourse(db, id, "spanish-en");
      await assert.rejects(saveAnswer(db, id, "hello-1", "नमस्ते"), {
        status: 403,
      });
      await assert.rejects(completeLesson(db, id, "hello"), { status: 403 });
    } finally {
      if (created) await db.user.delete({ where: { id } });
      await db.$disconnect();
    }
  },
);
