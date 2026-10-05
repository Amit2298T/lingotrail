import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  normalizeAnswer,
  isCorrect,
  dayKey,
  streak,
} from "../src/lib/learning";
test("answer comparison allows harmless formatting but rejects different words", () => {
  assert.equal(normalizeAnswer("  Good   MORNING! "), "good morning");
  assert.ok(isCorrect("नमस्ते।", "नमस्ते"));
  assert.ok(!isCorrect("good night", "good morning"));
});
test("activity day follows the learner timezone", () => {
  const date = new Date("2026-09-29T20:00:00Z");
  assert.equal(dayKey(date, "Asia/Kolkata"), "2026-09-30");
  assert.equal(dayKey(date, "America/New_York"), "2026-09-29");
});
test("streak allows yesterday, deduplicates days, and stops at gaps", () => {
  assert.equal(
    streak(["2026-01-01", "2025-12-31", "2025-12-31"], "2026-01-01"),
    2,
  );
  assert.equal(streak(["2025-12-31"], "2026-01-01"), 1);
  assert.equal(streak(["2025-12-30"], "2026-01-01"), 0);
  assert.equal(streak([], "2026-01-01"), 0);
});
test("curriculum contains 20 complete lessons with valid answer options", () => {
  const lessons = JSON.parse(
    readFileSync(new URL("../prisma/content.json", import.meta.url), "utf8"),
  );
  assert.equal(lessons.length, 20);
  const ids = new Set();
  for (const [lidx, l] of lessons.entries()) {
    assert.equal(l.position, lidx);
    assert.equal(l.exercises.length, 5);
    for (const q of l.exercises) {
      assert.ok(!ids.has(q.id));
      ids.add(q.id);
      if (q.kind === "order")
        assert.deepEqual([...q.options].sort(), q.answer.split(" ").sort());
      else assert.ok(q.options.includes(q.answer));
    }
  }
  assert.equal(ids.size, 100);
});
