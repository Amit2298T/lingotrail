-- Additive only: preserve all English IDs, attempts, completions and activity.
-- Ensure the default course exists even on a migrated but unseeded installation.
INSERT INTO "Course" ("id", "title", "sourceLanguage", "targetLanguage")
VALUES ('english-hi', 'Everyday English', 'Hindi', 'English')
ON CONFLICT ("id") DO NOTHING;

ALTER TABLE "Profile" ADD COLUMN "selectedCourseId" TEXT NOT NULL DEFAULT 'english-hi';
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_selectedCourseId_fkey"
FOREIGN KEY ("selectedCourseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Exercise" ADD COLUMN "acceptedAnswers" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "Exercise" ADD COLUMN "tokenJoiner" TEXT NOT NULL DEFAULT ' ';
ALTER TABLE "Exercise" ADD COLUMN "reading" TEXT;
