import Link from "next/link";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="LingoTrail home">
      <span className="brand-mark">
        L<span />
      </span>
      lingotrail<span className="brand-period">.</span>
    </Link>
  );
}
