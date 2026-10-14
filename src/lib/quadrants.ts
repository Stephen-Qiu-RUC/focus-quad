import type { ContainerId, QuadrantId } from "./types";

export interface QuadrantMeta {
  id: QuadrantId;
  name: string;
  action: string;
  shortcut: string;
  important: boolean;
  urgent: boolean;
  /** CSS variable holding the quadrant tint. */
  color: string;
  emptyTitle: string;
  emptyBody: string;
}

export const QUADRANTS: QuadrantMeta[] = [
  {
    id: "q1",
    name: "立即去做",
    action: "重要且紧急",
    shortcut: "1",
    important: true,
    urgent: true,
    color: "var(--q1)",
    emptyTitle: "没有火要救",
    emptyBody: "享受这段专注时光吧。",
  },
  {
    id: "q2",
    name: "安排时间",
    action: "重要不紧急",
    shortcut: "2",
    important: true,
    urgent: false,
    color: "var(--q2)",
    emptyTitle: "为长期目标留一块位置",
    emptyBody: "学习、健康、关系，都值得被提前安排。",
  },
  {
    id: "q3",
    name: "交给别人",
    action: "紧急不重要",
    shortcut: "3",
    important: false,
    urgent: true,
    color: "var(--q3)",
    emptyTitle: "没有需要委派的事",
    emptyBody: "别人的紧急，未必是你的重要。",
  },
  {
    id: "q4",
    name: "考虑删除",
    action: "不重要不紧急",
    shortcut: "4",
    important: false,
    urgent: false,
    color: "var(--q4)",
    emptyTitle: "干得漂亮",
    emptyBody: "没有在浪费时间的事。",
  },
];

export const QUADRANT_BY_ID = Object.fromEntries(
  QUADRANTS.map((q) => [q.id, q]),
) as Record<QuadrantId, QuadrantMeta>;

export const INBOX_META = {
  id: "inbox" as const,
  name: "收集箱",
  color: "var(--muted-foreground)",
};

export function containerName(id: ContainerId) {
  return id === "inbox" ? INBOX_META.name : QUADRANT_BY_ID[id].name;
}

export function containerColor(id: ContainerId) {
  return id === "inbox" ? INBOX_META.color : QUADRANT_BY_ID[id].color;
}

export function quadrantFor(important: boolean, urgent: boolean): QuadrantId {
  return QUADRANTS.find((q) => q.important === important && q.urgent === urgent)!
    .id;
}
