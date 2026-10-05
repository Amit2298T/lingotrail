"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="center-page">
      <span className="eyebrow">A SMALL DETOUR</span>
      <h1>We couldn’t load this page.</h1>
      <p>
        Retry, or check your database connection and migrations if you are
        setting up the project.
      </p>
      <button className="button" onClick={reset}>
        Try again
      </button>
      <Link className="text-link" href="/">
        Back home
      </Link>
    </main>
  );
}
