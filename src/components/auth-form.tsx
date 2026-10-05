"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Brand } from "./brand";
export function AuthForm({
  signup = false,
  enabled,
}: {
  signup?: boolean;
  enabled: boolean;
}) {
  const session = authClient.useSession();
  useEffect(() => {
    if (session.data?.user) window.location.replace("/learn");
  }, [session.data?.user?.id]);
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  if (session.data?.user)
    return (
      <main className="center-page" role="status">
        Opening your trail…
      </main>
    );
  return (
    <div className="auth-layout">
      <aside>
        <Brand />
        <h1>
          Your next
          <br />
          <em>chapter</em>
          <br />
          starts here.
        </h1>
        <p>
          A few words today.
          <br />A world of possibilities tomorrow.
        </p>
        <span className="auth-spark">✦</span>
      </aside>
      <main>
        <Link href="/" className="muted">
          ← Back home
        </Link>
        <h2>{signup ? "A fresh start." : "Welcome back."}</h2>
        <p>
          {signup
            ? "Make a little room for learning."
            : "Ready for your next little win?"}
        </p>
        {!enabled && (
          <div className="notice">
            Connect Neon using START-HERE.md to enable accounts.{" "}
            <Link href="/demo">Try the demo →</Link>
          </div>
        )}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            setBusy(true);
            const f = new FormData(e.currentTarget);
            try {
              const payload = {
                email: String(f.get("email")),
                password: String(f.get("password")),
              };
              const r = signup
                ? await authClient.signUp.email({
                    ...payload,
                    name: String(f.get("name")),
                  })
                : await authClient.signIn.email(payload);
              if (r.error) setError(r.error.message || "Could not sign in.");
              else {
                window.location.replace("/learn");
              }
            } catch {
              setError("Could not connect. Please try again.");
            } finally {
              setBusy(false);
            }
          }}
        >
          {signup && (
            <label>
              Your name
              <input
                name="name"
                required
                minLength={2}
                maxLength={60}
                autoComplete="name"
              />
            </label>
          )}
          <label>
            Email
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              minLength={10}
              maxLength={128}
              required
              autoComplete={signup ? "new-password" : "current-password"}
            />
          </label>
          <small>Use at least 10 characters.</small>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <button className="button" disabled={busy || !enabled}>
            {busy
              ? "One moment…"
              : signup
                ? "Create your account ↗"
                : "Let’s keep going ↗"}
          </button>
        </form>
        <p>
          {signup ? "Already learning?" : "New here?"}{" "}
          <Link href={signup ? "/login" : "/signup"}>
            {signup ? "Log in" : "Create an account"}
          </Link>
        </p>
        <small className="muted">
          Portfolio edition. Email verification and password recovery are not
          enabled.
        </small>
      </main>
    </div>
  );
}
