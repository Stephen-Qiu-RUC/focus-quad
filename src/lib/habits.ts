import type { Habit } from "./types";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

/** Local calendar day, so a check-in stays on the user's "today". */
export function dayKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function shiftDayKey(key: string, days: number) {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return dayKey(date);
}

export function isCheckedIn(habit: Pick<Habit, "doneOn">, now: Date) {
  return habit.doneOn.includes(dayKey(now));
}

/**
 * Consecutive days ending today, or ending yesterday when today is still open.
 * A missed day breaks the run.
 */
export function habitStreak(doneOn: string[], now: Date) {
  const done = new Set(doneOn);
  let cursor = dayKey(now);
  if (!done.has(cursor)) cursor = shiftDayKey(cursor, -1);
  let count = 0;
  while (done.has(cursor)) {
    count += 1;
    cursor = shiftDayKey(cursor, -1);
  }
  return count;
}
