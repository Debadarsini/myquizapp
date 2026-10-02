import type { Attempt, ContentPack, Item, Lesson, Progress } from "@wonderpath/schema";
import type { Clock } from "./clock";
import { systemClock } from "./clock";
import { isLessonFailed, loseHeart } from "./hearts";
import { awardLessonComplete } from "./progress";

export type LessonSession = {
  lessonId: string;
  itemIndex: number;
  itemIds: string[];
  attempts: Attempt[];
  progress: Progress;
  startedAt: string;
};

export type SubmitResult = {
  correct: boolean;
  heartsLeft: number;
  failed: boolean;
  complete: boolean;
  nextItem: Item | null;
  feedback: string;
  session: LessonSession;
  progress: Progress;
};

export function startLesson(
  pack: ContentPack,
  lessonId: string,
  progress: Progress,
  clock: Clock = systemClock,
): { session: LessonSession; item: Item; lesson: Lesson } {
  const lesson = pack.lessons.find((l) => l.id === lessonId);
  if (!lesson) throw new Error(`Unknown lesson: ${lessonId}`);
  const firstId = lesson.itemIds[0];
  const item = requireItem(pack, firstId);
  return {
    lesson,
    item,
    session: {
      lessonId,
      itemIndex: 0,
      itemIds: lesson.itemIds,
      attempts: [],
      progress,
      startedAt: clock.now().toISOString(),
    },
  };
}

export function submitAnswer(
  pack: ContentPack,
  session: LessonSession,
  choice: string,
  clock: Clock = systemClock,
  elapsedMs = 0,
): SubmitResult {
  const itemId = session.itemIds[session.itemIndex];
  if (!itemId) throw new Error("Session has no current item");
  const item = requireItem(pack, itemId);
  const card = pack.cards.find((c) => c.id === item.cardId);
  const correct = choice === item.correct;
  const attempt: Attempt = {
    itemId: item.id,
    correct,
    ms: elapsedMs,
    timestamp: clock.now().toISOString(),
  };

  let progress = session.progress;
  if (!correct) progress = loseHeart(progress);

  const failed = isLessonFailed(progress);
  const nextIndex = session.itemIndex + 1;
  const complete = !failed && nextIndex >= session.itemIds.length;
  const nextItemId = !failed && !complete ? session.itemIds[nextIndex] : undefined;
  const nextItem = nextItemId ? requireItem(pack, nextItemId) : null;

  if (complete) {
    progress = awardLessonComplete(progress, clock);
  }

  const nextSession: LessonSession = {
    ...session,
    itemIndex: complete || failed ? session.itemIndex : nextIndex,
    attempts: [...session.attempts, attempt],
    progress,
  };

  const teach = card?.teachText ?? "";
  const feedback = correct ? teach : `Not quite. ${teach}`;

  return {
    correct,
    heartsLeft: progress.hearts,
    failed,
    complete,
    nextItem,
    feedback,
    session: nextSession,
    progress,
  };
}

function requireItem(pack: ContentPack, itemId: string | undefined): Item {
  if (!itemId) throw new Error("Missing item id");
  const item = pack.items.find((i) => i.id === itemId);
  if (!item) throw new Error(`Unknown item: ${itemId}`);
  return item;
}
