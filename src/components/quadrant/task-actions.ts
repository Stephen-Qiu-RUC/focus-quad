"use client";

import { toast } from "sonner";
import { actions } from "@/lib/store";
import { containerName } from "@/lib/quadrants";
import type { ContainerId, Task } from "@/lib/types";

export function deleteWithUndo(id: string) {
  const removed = actions.deleteTask(id);
  if (!removed) return;
  toast(`已删除「${removed.task.title}」`, {
    duration: 5000,
    action: {
      label: "撤销",
      onClick: () => actions.restoreTask(removed.task, removed.index),
    },
  });
}

export function completeWithUndo(task: Task) {
  actions.setCompleted(task.id, true);
  toast(`已完成「${task.title}」`, {
    duration: 4000,
    action: { label: "撤销", onClick: () => actions.setCompleted(task.id, false) },
  });
}

export function moveWithToast(task: Task, to: ContainerId) {
  if (task.container === to) return;
  const from = task.container;
  actions.moveTask(task.id, to);
  toast(`已移到「${containerName(to)}」`, {
    duration: 3000,
    action: { label: "撤销", onClick: () => actions.moveTask(task.id, from) },
  });
}
