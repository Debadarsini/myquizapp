import type { Progress } from "@wonderpath/schema";

export const MAX_HEARTS = 5;
export const FRESH_HEARTS = 5;

export function loseHeart(progress: Progress): Progress {
  return { ...progress, hearts: Math.max(0, progress.hearts - 1) };
}

export function refillHearts(progress: Progress): Progress {
  return { ...progress, hearts: FRESH_HEARTS };
}

export function isLessonFailed(progress: Progress): boolean {
  return progress.hearts <= 0;
}
