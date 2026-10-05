export function suitableVoice<T extends { lang: string }>(
  voices: T[],
  locale: string,
): T | undefined {
  const requested = locale.toLowerCase();
  return (
    voices.find((v) => v.lang.toLowerCase().replace(/_/g, "-") === requested) ||
    voices.find(
      (v) =>
        v.lang.toLowerCase().replace(/_/g, "-").split("-")[0] ===
        requested.split("-")[0],
    )
  );
}
