import type { ContainerId, Task } from "@/lib/types";

export function matchesTag(task: Task, tag: string | null) {
  return !tag || task.tags.includes(tag);
}

export function tasksIn(tasks: Task[], container: ContainerId, tag: string | null) {
  const open: Task[] = [];
  const done: Task[] = [];
  for (const t of tasks) {
    if (t.container !== container || !matchesTag(t, tag)) continue;
    (t.completed ? done : open).push(t);
  }
  done.sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));
  return { open, done };
}

export function tagCounts(tasks: Task[]) {
  const counts = new Map<string, number>();
  for (const t of tasks) {
    if (t.completed) continue;
    for (const tag of t.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh"));
}
