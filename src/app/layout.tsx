import type { Metadata } from "next";
import "./globals.css";
import { SessionNavigation } from "@/components/session-navigation";
import { MotionProvider } from "@/components/motion-provider";
export const metadata: Metadata = {
  title: {
    default: "LingoTrail — A little practice. A bigger world.",
    template: "%s · LingoTrail",
  },
  description:
    "Learn English through Hindi, or Spanish, Japanese and French through English. Beginner lessons, word decks and a path that grows with you.",
  icons: { icon: "/icon.svg" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionNavigation />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
