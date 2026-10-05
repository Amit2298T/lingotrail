export function normalizeAnswer(s: string) {
  return s
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("en")
    .replace(/[.!?।]+$/u, "")
    .replace(/\s+/g, " ");
}
export function isCorrect(
  given: string,
  expected: string,
  alternatives: string[] = [],
) {
  return [expected, ...alternatives].some(
    (answer) => normalizeAnswer(given) === normalizeAnswer(answer),
  );
}
export function joinTokens(tokens: string[], joiner = " ") {
  return tokens.join(joiner);
}

export function dayKey(date: Date, timezone: string) {
  const p = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const v = (s: string) => p.find((x) => x.type === s)!.value;
  return `${v("year")}-${v("month")}-${v("day")}`;
}
export function shiftDay(day: string, delta: number) {
  const d = new Date(day + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}
export function streak(days: string[], today: string) {
  const seen = new Set(days);
  let day = seen.has(today) ? today : shiftDay(today, -1),
    n = 0;
  while (seen.has(day)) {
    n++;
    day = shiftDay(day, -1);
  }
  return n;
}
