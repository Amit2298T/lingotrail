import { test } from "node:test";
import assert from "node:assert/strict";
import english from "../prisma/content.json";
import starters from "../prisma/starter-content.json";
import { courses, courseInfo } from "../src/lib/courses";
import { courseVocabulary } from "../src/lib/curriculum";
import { isCorrect, joinTokens } from "../src/lib/learning";
import { suitableVoice } from "../src/lib/speech";

test("all courses have complete isolated curricula and namespaced IDs", () => {
  const ids = new Set(
    english.flatMap((l) => [l.id, ...l.exercises.map((q) => q.id)]),
  );
  for (const c of courses.slice(1)) {
    const lessons = starters.filter((l) => l.courseId === c.id);
    assert.equal(lessons.length, 10);
    assert.equal(courseVocabulary(c.id).length, 30);
    for (const [i, l] of lessons.entries()) {
      assert.equal(l.position, i);
      assert.equal(l.exercises.length, 5);
      for (const id of [l.id, ...l.exercises.map((q) => q.id)]) {
        assert.ok(id.startsWith(c.id));
        assert.ok(!ids.has(id));
        ids.add(id);
      }
      for (const q of l.exercises) {
        assert.ok(q.explanation);
        assert.ok(q.hint);
        if (q.kind === "order") {
          const expectedTokens = q.tokenJoiner
            ? q.answer.split(q.tokenJoiner)
            : null;
          if (expectedTokens)
            assert.deepEqual([...q.options].sort(), expectedTokens.sort());
          else
            assert.equal(
              [...q.options].sort().join("").length,
              q.answer.length,
            );
        } else assert.ok(q.options.includes(q.answer));
        if (q.kind === "listen") assert.equal(q.spokenText, q.answer);
      }
    }
  }
  assert.equal(courseVocabulary("english-hi").length, 60);
  assert.equal(courseInfo("invalid"), undefined);
});
test("Japanese sentence tokens join without whitespace and accept their curriculum answers", () => {
  assert.equal(
    joinTokens(["私", "は", "アンナ", "です"], ""),
    "私はアンナです",
  );
  for (const l of starters.filter((l) => l.courseId === "japanese-en")) {
    const q = l.exercises.find((q) => q.kind === "order")!;
    const tokens = [...q.options.slice(-1), ...q.options.slice(0, -1)];
    assert.ok(isCorrect(joinTokens(tokens, q.tokenJoiner), q.answer));
    assert.ok(q.reading);
  }
});
test("accent distinctions remain meaningful and alternatives are explicit", () => {
  assert.ok(!isCorrect("si", "sí"));
  assert.ok(!isCorrect("a", "à"));
  assert.ok(!isCorrect("étudiant", "etudiant"));
  assert.ok(
    isCorrect("Je m'appelle Anne", "Je m’appelle Anne", ["Je m'appelle Anne"]),
  );
  assert.ok(!isCorrect("Je m'appelle Anne", "Je m’appelle Anne"));
});
test("speech selects the exact locale, then the same language, never another language", () => {
  const voices = [
    { lang: "en-US" },
    { lang: "es-MX" },
    { lang: "es-ES" },
    { lang: "ja_JP" },
  ];
  assert.equal(suitableVoice(voices, "es-ES"), voices[2]);
  assert.equal(suitableVoice(voices, "es-AR"), voices[1]);
  assert.equal(suitableVoice(voices, "ja-JP"), voices[3]);
  assert.equal(suitableVoice(voices, "fr-FR"), undefined);
  assert.equal(suitableVoice([], "ja-JP"), undefined);
});

test("curriculum preserves accented text and Japanese scripts without encoding damage", () => {
  for (const l of starters) {
    for (const w of l.words) {
      assert.ok(!/[?\uFFFD]/u.test(w.target));
      if (l.courseId === "japanese-en")
        assert.match(w.target, /[\u3040-\u30ff\u4e00-\u9fff]/u);
    }
    for (const q of l.exercises) {
      assert.ok(!q.prompt.includes("??"));
      assert.ok(!q.answer.includes("??"));
      assert.equal(new Set(q.options).size, q.options.length);
      assert.ok(q.acceptedAnswers.every((a) => !a.includes("??")));
    }
  }
  assert.ok(courseVocabulary("spanish-en").some((w) => w.target === "Sí"));
  assert.ok(courseVocabulary("french-en").some((w) => w.target === "Hôtel"));
});
