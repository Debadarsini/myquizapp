import type { Progress } from "@wonderpath/schema";
import type { Clock } from "./clock";
import { FRESH_HEARTS } from "./hearts";

export const XP_PER_LESSON = 10;
const TIME_ZONE = "Asia/Kolkata";

export function emptyProgress(): Progress {
  return {
    xp: 0,
    streakDays: 0,
    hearts: FRESH_HEARTS,
    lastPlayedDate: null,
  };
}

export function awardLessonComplete(progress: Progress, clock: Clock): Progress {
  const today = clock.todayISO(TIME_ZONE);
  const yesterday = previousISODate(today);
  let streakDays = 1;
  if (progress.lastPlayedDate === today) {
    streakDays = progress.streakDays;
  } else if (progress.lastPlayedDate === yesterday) {
    streakDays = progress.streakDays + 1;
  }

  return {
    ...progress,
    xp: progress.xp + XP_PER_LESSON,
    streakDays,
    lastPlayedDate: today,
    hearts: FRESH_HEARTS,
  };
}

function previousISODate(iso: string): string {
  const d = new Date(`${iso}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}
