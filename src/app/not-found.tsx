import Link from "next/link";
export default function NotFound() {
  return (
    <main className="center-page">
      <span className="eyebrow">404 · OFF THE TRAIL</span>
      <h1>Let’s get you back on track.</h1>
      <Link className="button" href="/learn">
        Open learning path
      </Link>
    </main>
  );
}
