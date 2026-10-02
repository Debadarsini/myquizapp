import type { Review } from "@wonderpath/schema";
import type { Clock } from "./clock";

const MIN_EASE = 1.3;

export function newReview(cardId: string, now: Date): Review {
  return {
    cardId,
    ease: 2.5,
    intervalDays: 0,
    dueAt: now.toISOString(),
    lapses: 0,
  };
}

/** SM-2: quality 0 = miss, 5 = recall. */
export function applySm2(review: Review, quality: 0 | 5, clock: Clock): Review {
  const now = clock.now();
  if (quality === 0) {
    return {
      ...review,
      intervalDays: 1,
      ease: Math.max(MIN_EASE, review.ease - 0.2),
      lapses: review.lapses + 1,
      dueAt: addDays(now, 1),
    };
  }

  const intervalDays =
    review.intervalDays === 0 ? 1 : review.intervalDays === 1 ? 6 : Math.round(review.intervalDays * review.ease);

  return {
    ...review,
    intervalDays,
    ease: review.ease + 0.1,
    dueAt: addDays(now, intervalDays),
  };
}

export function dueReviews(reviews: Review[], now: Date): Review[] {
  const t = now.getTime();
  return reviews.filter((r) => new Date(r.dueAt).getTime() <= t);
}

function addDays(from: Date, days: number): string {
  const next = new Date(from);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString();
}
