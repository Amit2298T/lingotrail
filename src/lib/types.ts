export type PublicExercise = {
  id: string;
  position: number;
  kind: string;
  prompt: string;
  hint: string;
  options: string[];
  spokenText: string | null;
  tokenJoiner?: string;
  reading?: string | null;
};
export type Feedback = {
  correct: boolean;
  answer: string;
  explanation: string;
};
export type LessonCard = {
  id: string;
  title: string;
  subtitle: string;
  unit: string;
  position: number;
  color: string;
  icon: string;
  completed: boolean;
  unlocked: boolean;
};
