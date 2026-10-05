import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { courses } from "../src/lib/courses";
let stage = "initialization";
async function verify() {
  const base = process.argv[2] || "http://localhost:3000";
  if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname))
    throw Error("Use a local preview.");
  const db = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
      max: 2,
    }),
  });
  const marker = `lingotrail-http-test-${randomUUID()}`,
    email = `${marker}@example.invalid`,
    password = randomUUID();
  let userId: string | undefined,
    cookies = "";
  async function call(path: string, data?: object, auth = true, origin = base) {
    const r = await fetch(base + path, {
      method: data ? "POST" : "GET",
      headers: {
        ...(data ? { "Content-Type": "application/json", origin } : {}),
        ...(auth && cookies ? { cookie: cookies } : {}),
      },
      ...(data ? { body: JSON.stringify(data) } : {}),
    });
    const set = r.headers.getSetCookie();
    if (set.length && auth)
      cookies = set.map((s) => s.split(";")[0]).join("; ");
    return r;
  }
  try {
    stage = "signup";
    const signup = await call("/api/auth/sign-up/email", {
      name: "Course HTTP test",
      email,
      password,
    });
    assert.equal(signup.status, 200, "Temporary account signup");
    userId = (await signup.json()).user.id;
    stage = "onboarding";
    assert.equal((await call("/onboarding")).status, 200);
    stage = "save onboarding profile";
    assert.equal(
      (
        await call("/api/profile", {
          goal: 5,
          timezone: "Asia/Kolkata",
          selectedCourseId: "japanese-en",
        })
      ).status,
      200,
    );
    assert.equal(
      (await db.profile.findUniqueOrThrow({ where: { userId } }))
        .selectedCourseId,
      "japanese-en",
    );
    assert.equal(
      (await call("/api/course", { courseId: "invalid" })).status,
      400,
    );
    assert.equal(
      (await call("/api/course", { courseId: "spanish-en" }, false)).status,
      401,
    );
    assert.equal(
      (
        await call(
          "/api/course",
          { courseId: "spanish-en" },
          true,
          "https://untrusted.example",
        )
      ).status,
      403,
    );
    stage = "course selection page";
    const coursePage = await call("/courses");
    assert.equal(coursePage.status, 200);
    const cards = await coursePage.text();
    for (const c of courses) assert.ok(cards.includes(c.title));
    for (const c of courses) {
      stage = `${c.id} lesson and review`;
      assert.equal((await call("/api/course", { courseId: c.id })).status, 200);
      stage = `${c.id} learning page`;
      const learn = await call("/learn");
      assert.equal(learn.status, 200);
      assert.ok((await learn.text()).includes(`Explained in`));
      const first = await db.lesson.findFirstOrThrow({
        where: { courseId: c.id },
        orderBy: { position: "asc" },
      });
      stage = `${c.id} lesson page`;
      const lesson = await call(`/lesson/${first.id}`);
      assert.equal(lesson.status, 200);
      if (c.id !== "english-hi")
        assert.equal(
          (
            await call("/api/answer", {
              exerciseId: "hello-1",
              answer: "नमस्ते",
            })
          ).status,
          403,
        );
      const qs = await db.exercise.findMany({
        where: { lessonId: first.id },
        orderBy: { position: "asc" },
      });
      stage = `${c.id} wrong answer`;
      assert.equal(
        (
          await call("/api/answer", {
            exerciseId: qs[0].id,
            answer: "incorrect",
          })
        ).status,
        200,
      );
      stage = `${c.id} review count`;
      assert.ok(
        (await (await call("/review")).text()).includes(
          "1 questions to revisit",
        ),
      );
      stage = `${c.id} review practice`;
      const review = await (await call("/review/practice")).text();
      assert.ok(review.includes(qs[0].id));
      stage = `${c.id} solve lesson`;
      for (const q of qs) {
        const r = await call("/api/answer", {
          exerciseId: q.id,
          answer: q.answer,
        });
        assert.equal(r.status, 200);
        assert.equal((await r.json()).correct, true);
      }
      stage = `${c.id} complete and replay`;
      assert.equal(
        (await (await call("/api/complete", { lessonId: first.id })).json()).xp,
        20,
      );
      assert.equal(
        (await (await call("/api/complete", { lessonId: first.id })).json()).xp,
        0,
      );
    }
    stage = "sign out and sign in";
    assert.equal((await call("/api/auth/sign-out", {})).status, 200);
    cookies = "";
    assert.equal(
      (await call("/api/auth/sign-in/email", { email, password })).status,
      200,
    );
    assert.equal(
      (await db.profile.findUniqueOrThrow({ where: { userId } }))
        .selectedCourseId,
      "french-en",
    );
    assert.ok(
      (await (await call("/progress")).text()).includes(
        "French lessons complete",
      ),
    );
    console.log(
      "Authenticated HTTP checks passed: signup/onboarding, four course switches and lessons, server authorization, review filtering, replay XP, sign-in persistence.",
    );
  } finally {
    // Only the uniquely named account created by this run may be removed.
    const own = await db.user.findUnique({ where: { email } });
    if (own && (!userId || own.id === userId))
      await db.user.delete({ where: { id: own.id } });
    await db.$disconnect();
  }
}
verify().catch((error) => {
  console.error(
    `Course HTTP verification failed at ${stage}; status ${typeof error.actual === "number" ? error.actual : "not available"}; no credentials or response bodies printed.`,
  );
  process.exitCode = 1;
});
