import type { LessonSession } from "@wonderpath/engine";

const sessions = new Map<string, LessonSession>();

export function getSession(phoneHash: string): LessonSession | undefined {
  return sessions.get(phoneHash);
}

export function setSession(phoneHash: string, session: LessonSession): void {
  sessions.set(phoneHash, session);
}

export function clearSession(phoneHash: string): void {
  sessions.delete(phoneHash);
}
