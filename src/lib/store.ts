"use client";

import { useSyncExternalStore } from "react";
import { nanoid } from "nanoid";
import type { ContainerId, PersistedState, Task } from "./types";

const STORAGE_KEY = "quadrant:v1";

export interface StoreState extends PersistedState {
  saveError: boolean;
}

let state: StoreState | null = null;
const listeners = new Set<() => void>();

function hoursFromNow(h: number) {
  return new Date(Date.now() + h * 3600_000).toISOString();
}

function atNoon(daysFromNow: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

export function createTask(partial: Partial<Task> & { title: string }): Task {
  return {
    id: nanoid(10),
    notes: "",
    container: "inbox",
    due: null,
    dueHasTime: false,
    tags: [],
    completed: false,
    completedAt: null,
    createdAt: new Date().toISOString(),
    escalationDismissed: false,
    ...partial,
  };
}

function sampleTasks(): Task[] {
  const s = { sample: true };
  return [
    createTask({ ...s, title: "回复客户的合同邮件", tags: ["工作"] }),
    createTask({ ...s, title: "预约牙医检查", tags: ["生活"] }),
    createTask({ ...s, title: "买咖啡豆" }),
    createTask({
      ...s,
      title: "提交季度复盘报告",
      container: "q1",
      due: hoursFromNow(5),
      dueHasTime: true,
      tags: ["工作"],
    }),
    createTask({ ...s, title: "修复登录页线上问题", container: "q1", tags: ["工作"] }),
    createTask({
      ...s,
      title: "准备下周的产品分享",
      container: "q2",
      due: hoursFromNow(20),
      dueHasTime: true,
      notes: "截止日期临近时，四象会提醒你把它移到「立即去做」。",
      tags: ["工作"],
    }),
    createTask({ ...s, title: "每周三次跑步", container: "q2", due: atNoon(5), tags: ["健康"] }),
    createTask({ ...s, title: "预订周五的会议室", container: "q3", due: atNoon(1) }),
    createTask({ ...s, title: "整理手机里的旧照片", container: "q4", tags: ["生活"] }),
  ];
}

function isValidState(value: unknown): value is PersistedState {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as PersistedState).version === 1 &&
    Array.isArray((value as PersistedState).tasks)
  );
}

function load(): StoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isValidState(parsed)) return { ...parsed, saveError: false };
    }
  } catch {
    // fall through to a fresh state
  }
  const fresh: StoreState = {
    version: 1,
    tasks: sampleTasks(),
    onboarded: false,
    saveError: false,
  };
  persist(fresh);
  return fresh;
}

function toPersisted(s: StoreState): PersistedState {
  return { version: s.version, tasks: s.tasks, onboarded: s.onboarded };
}

function persist(next: StoreState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersisted(next)));
    return true;
  } catch {
    return false;
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function setState(updater: (s: StoreState) => StoreState) {
  const next = updater(getState());
  const ok = persist(next);
  state = { ...next, saveError: !ok };
  emit();
}

function getState(): StoreState {
  if (!state) state = load();
  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    state = load();
    emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Returns `null` until the browser store has been read. */
export function useStore(): StoreState | null {
  return useSyncExternalStore(subscribe, getState, () => null);
}

function mapTask(id: string, fn: (t: Task) => Task) {
  setState((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? fn(t) : t)) }));
}

export const actions = {
  addTask(partial: Partial<Task> & { title: string }) {
    const task = createTask(partial);
    setState((s) => ({ ...s, tasks: [...s.tasks, task] }));
    return task;
  },

  updateTask(id: string, patch: Partial<Task>) {
    mapTask(id, (t) => {
      const next = { ...t, ...patch };
      if (patch.due !== undefined && patch.due !== t.due) next.escalationDismissed = false;
      return next;
    });
  },

  setCompleted(id: string, completed: boolean) {
    mapTask(id, (t) => ({
      ...t,
      completed,
      completedAt: completed ? new Date().toISOString() : null,
    }));
  },

  deleteTask(id: string) {
    const s = getState();
    const index = s.tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;
    const task = s.tasks[index];
    setState((st) => ({ ...st, tasks: st.tasks.filter((t) => t.id !== id) }));
    return { task, index };
  },

  restoreTask(task: Task, index: number) {
    setState((s) => {
      const tasks = [...s.tasks];
      tasks.splice(Math.min(index, tasks.length), 0, task);
      return { ...s, tasks };
    });
  },

  /**
   * Moves a task into `container`. With `overId`, it is placed next to that
   * task (after it when `after` is true); otherwise appended.
   */
  moveTask(id: string, container: ContainerId, overId?: string | null, after = false) {
    setState((s) => {
      const moving = s.tasks.find((t) => t.id === id);
      if (!moving) return s;
      const rest = s.tasks.filter((t) => t.id !== id);
      const updated: Task = {
        ...moving,
        container,
        escalationDismissed: container === moving.container ? moving.escalationDismissed : false,
      };
      let index = overId ? rest.findIndex((t) => t.id === overId) : -1;
      if (index === -1) index = rest.length;
      else if (after) index += 1;
      rest.splice(index, 0, updated);
      return { ...s, tasks: rest };
    });
  },

  clearCompleted(container: ContainerId) {
    setState((s) => ({
      ...s,
      tasks: s.tasks.filter((t) => !(t.container === container && t.completed)),
    }));
  },

  dismissEscalation(ids: string[]) {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (ids.includes(t.id) ? { ...t, escalationDismissed: true } : t)),
    }));
  },

  escalate(ids: string[]) {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (ids.includes(t.id) ? { ...t, container: "q1" } : t)),
    }));
  },

  finishOnboarding() {
    setState((s) => ({ ...s, onboarded: true }));
  },

  removeSamples() {
    setState((s) => ({ ...s, tasks: s.tasks.filter((t) => !t.sample), onboarded: true }));
  },

  exportData(): string {
    return JSON.stringify(toPersisted(getState()), null, 2);
  },

  importData(json: string) {
    const parsed = JSON.parse(json);
    if (!isValidState(parsed)) throw new Error("文件格式不正确");
    setState(() => ({ ...parsed, saveError: false }));
  },

  resetAll() {
    setState(() => ({ version: 1, tasks: [], onboarded: true, saveError: false }));
  },

  retrySave() {
    setState((s) => s);
  },
};
