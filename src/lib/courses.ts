export const courses = [
  {
    id: "english-hi",
    title: "English through Hindi",
    targetLanguage: "English",
    sourceLanguage: "Hindi",
    locale: "en-IN",
    explanationLocale: "hi",
    color: "violet",
  },
  {
    id: "spanish-en",
    title: "Spanish through English",
    targetLanguage: "Spanish",
    sourceLanguage: "English",
    locale: "es-ES",
    explanationLocale: "en",
    color: "peach",
  },
  {
    id: "japanese-en",
    title: "Japanese through English",
    targetLanguage: "Japanese",
    sourceLanguage: "English",
    locale: "ja-JP",
    explanationLocale: "en",
    color: "mint",
  },
  {
    id: "french-en",
    title: "French through English",
    targetLanguage: "French",
    sourceLanguage: "English",
    locale: "fr-FR",
    explanationLocale: "en",
    color: "blue",
  },
] as const;
export type CourseId = (typeof courses)[number]["id"];
export type CourseInfo = (typeof courses)[number];
export const defaultCourseId: CourseId = "english-hi";
export function courseInfo(id: string): CourseInfo | undefined {
  return courses.find((c) => c.id === id);
}
