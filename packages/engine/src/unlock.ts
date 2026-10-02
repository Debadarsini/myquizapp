import type { ContentPack, Lesson } from "@wonderpath/schema";

export function nextUnlockedLesson(pack: ContentPack, completedLessonIds: Set<string>): Lesson | null {
  const ordered = [...pack.lessons].sort((a, b) => a.id.localeCompare(b.id));
  for (const lesson of ordered) {
    if (completedLessonIds.has(lesson.id)) continue;
    if (lesson.unlockAfter === null || completedLessonIds.has(lesson.unlockAfter)) {
      return lesson;
    }
  }
  return null;
}

export function isUnlocked(lesson: Lesson, completedLessonIds: Set<string>): boolean {
  return lesson.unlockAfter === null || completedLessonIds.has(lesson.unlockAfter);
}
