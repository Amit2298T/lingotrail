import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
let stage = "initialization";
async function verify() {
  const base = process.argv[2] || "http://localhost:3100";
  if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname))
    throw Error("Use a local preview.");
  const db = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
      max: 2,
    }),
  });
  const accounts = ["A", "B"].map((suffix) => ({
    email: `lingotrail-session-test-${randomUUID()}@example.invalid`,
    name: `Session navigation test ${suffix}`,
    password: randomUUID(),
    cookie: "",
  }));
  async function request(path: string, cookie = "", data?: object) {
    return fetch(base + path, {
      method: data ? "POST" : "GET",
      redirect: "manual",
      headers: {
        ...(cookie ? { cookie } : {}),
        ...(data ? { "content-type": "application/json", origin: base } : {}),
      },
      ...(data ? { body: JSON.stringify(data) } : {}),
    });
  }
  async function redirectTo(path: string, cookie: string, target: string) {
    const r = await request(path, cookie);
    if (r.status === 307 || r.status === 303)
      assert.equal(new URL(r.headers.get("location")!, base).pathname, target);
    else {
      assert.equal(r.status, 200);
      const html = await r.text();
      assert.ok(html.includes("NEXT_REDIRECT") && html.includes(target));
    }
  }
  try {
    stage = "guest homepage and public sample";
    const guest = await request("/");
    assert.equal(guest.status, 200);
    assert.match(guest.headers.get("cache-control") || "", /no-store/);
    const guestHtml = await guest.text();
    assert.ok(
      guestHtml.includes('href="/login"') &&
        guestHtml.includes('href="/signup"'),
    );
    assert.ok(
      guestHtml.includes("Start learning") &&
        guestHtml.includes("Let’s get started") &&
        guestHtml.includes("Try your first lesson"),
    );
    assert.ok(!guestHtml.includes('href="/profile"'));
    assert.equal((await request("/demo")).status, 200);
    for (const path of ["/login", "/signup"])
      assert.equal((await request(path)).status, 200);
    for (const a of accounts) {
      stage = `${a.name}: signup`;
      const r = await request("/api/auth/sign-up/email", "", {
        name: a.name,
        email: a.email,
        password: a.password,
      });
      assert.equal(r.status, 200);
      a.cookie = r.headers
        .getSetCookie()
        .map((s) => s.split(";")[0])
        .join("; ");
      stage = `${a.name}: incomplete setup redirects`;
      for (const path of ["/login", "/signup"])
        await redirectTo(path, a.cookie, "/onboarding");
      stage = `${a.name}: signed-in homepage`;
      const home = await request("/", a.cookie);
      assert.equal(home.status, 200);
      assert.match(home.headers.get("cache-control") || "", /no-store/);
      const html = await home.text();
      assert.ok(
        html.includes("Continue learning") &&
          html.includes('href="/learn"') &&
          html.includes('href="/profile"'),
      );
      assert.ok(html.includes(a.name));
      assert.ok(
        !html.includes('href="/login"') && !html.includes('href="/signup"'),
      );
      stage = `${a.name}: completed setup redirects`;
      assert.equal(
        (
          await request("/api/profile", a.cookie, {
            goal: 5,
            timezone: "Asia/Kolkata",
            selectedCourseId: "spanish-en",
          })
        ).status,
        200,
      );
      for (const path of ["/login", "/signup"])
        await redirectTo(path, a.cookie, "/learn");
    }
    stage = "session UI isolation between two users and guests";
    for (const [index, a] of accounts.entries()) {
      const html = await (await request("/", a.cookie)).text();
      assert.ok(html.includes(a.name));
      assert.ok(!html.includes(accounts[1 - index].name));
    }
    const freshGuest = await (await request("/")).text();
    for (const a of accounts) assert.ok(!freshGuest.includes(a.name));
    assert.ok(freshGuest.includes("Start learning"));
    stage = "logout, refresh and invalidated session";
    const a = accounts[0];
    assert.equal(
      (await request("/api/auth/sign-out", a.cookie, {})).status,
      200,
    );
    const signedOut = await (await request("/", a.cookie)).text();
    assert.ok(
      signedOut.includes("Start learning") &&
        !signedOut.includes('href="/profile"'),
    );
    for (const path of ["/login", "/signup"])
      assert.equal((await request(path, a.cookie)).status, 200);
    stage = "login and refreshed homepage";
    const login = await request("/api/auth/sign-in/email", "", {
      email: a.email,
      password: a.password,
    });
    assert.equal(login.status, 200);
    a.cookie = login.headers
      .getSetCookie()
      .map((s) => s.split(";")[0])
      .join("; ");
    assert.ok(
      (await (await request("/", a.cookie)).text()).includes(
        "Continue learning",
      ),
    );
    await redirectTo("/login", a.cookie, "/learn");
    console.log(
      "Session navigation HTTP checks passed: guest/member homepage CTAs, public sample, incomplete/completed setup redirects, two-user/guest isolation, private no-store responses, logout and sign-in refresh.",
    );
  } finally {
    for (const a of accounts) {
      const own = await db.user.findUnique({ where: { email: a.email } });
      if (own) await db.user.delete({ where: { id: own.id } });
    }
    await db.$disconnect();
  }
}
verify().catch((error) => {
  console.error(
    `Session navigation verification failed at ${stage}; status ${typeof error.actual === "number" ? error.actual : "unavailable"}. No credentials or session tokens printed.`,
  );
  process.exitCode = 1;
});
