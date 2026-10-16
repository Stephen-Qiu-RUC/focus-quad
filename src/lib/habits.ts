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

export function clampTimesPerWeek(value: unknown) {
  const raw = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(raw)) return 7;
  return Math.min(7, Math.max(1, Math.round(raw)));
}

/** Monday of the local week that contains `now`. */
export function weekStartKey(now: Date) {
  const day = now.getDay();
  const back = day === 0 ? 6 : day - 1;
  return shiftDayKey(dayKey(now), -back);
}

export function countThisWeek(doneOn: string[], now: Date) {
  const start = weekStartKey(now);
  const end = shiftDayKey(start, 6);
  return doneOn.filter((day) => day >= start && day <= end).length;
}

export function weekMet(habit: Pick<Habit, "doneOn" | "timesPerWeek">, now: Date) {
  return countThisWeek(habit.doneOn, now) >= clampTimesPerWeek(habit.timesPerWeek);
}
