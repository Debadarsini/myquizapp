export type Clock = {
  now(): Date;
  todayISO(timeZone: string): string;
};

export const systemClock: Clock = {
  now: () => new Date(),
  todayISO: (timeZone) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date()),
};

export function fakeClock(iso: string): Clock {
  const fixed = new Date(iso);
  return {
    now: () => new Date(fixed),
    todayISO: () => iso.slice(0, 10),
  };
}
