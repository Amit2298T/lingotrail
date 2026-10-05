import { LessonPlayer } from "@/components/lesson-player";
import { sample } from "@/lib/sample";
export default function Page() {
  return (
    <LessonPlayer
      title="First words"
      lessonId="hello"
      exercises={sample}
      demo
    />
  );
}
