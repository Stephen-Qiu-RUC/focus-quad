import type { Task } from "./types";

const DAY = 24 * 60 * 60 * 1000;
const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function formatTime(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatDay(d: Date, now: Date) {
  const diff = Math.round(
    (startOfDay(d).getTime() - startOfDay(now).getTime()) / DAY,
  );
  if (diff === 0) return "今天";
  if (diff === 1) return "明天";
  if (diff === 2) return "后天";
  if (diff === -1) return "昨天";
  if (diff > 2 && diff < 7) return WEEKDAYS[d.getDay()];
  if (d.getFullYear() === now.getFullYear())
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export function formatDue(task: Pick<Task, "due" | "dueHasTime">, now: Date) {
  if (!task.due) return null;
  const d = new Date(task.due);
  const day = formatDay(d, now);
  return task.dueHasTime ? `${day} ${formatTime(d)}` : day;
}

/** Deadline instant: date-only dues count as the end of that day. */
export function dueInstant(task: Pick<Task, "due" | "dueHasTime">) {
  if (!task.due) return null;
  const d = new Date(task.due);
  if (!task.dueHasTime) d.setHours(23, 59, 59, 999);
  return d;
}

export function isOverdue(task: Task, now: Date) {
  const d = dueInstant(task);
  return !!d && !task.completed && d.getTime() < now.getTime();
}

export function hoursUntilDue(task: Pick<Task, "due" | "dueHasTime">, now: Date) {
  const d = dueInstant(task);
  if (!d) return null;
  return (d.getTime() - now.getTime()) / (60 * 60 * 1000);
}

export function needsEscalation(task: Task, now: Date) {
  if (task.container !== "q2" || task.completed || task.escalationDismissed)
    return false;
  const h = hoursUntilDue(task, now);
  return h !== null && h < 24;
}

export function formatToday(now: Date) {
  return `${now.getMonth() + 1}月${now.getDate()}日 ${WEEKDAYS[now.getDay()]}`;
}

export function toDateInputValue(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
