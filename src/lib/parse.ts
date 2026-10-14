import * as chrono from "chrono-node";
import { quadrantFor } from "./quadrants";
import type { ContainerId } from "./types";
import { hoursUntilDue } from "./dates";

export interface ParsedInput {
  title: string;
  due: string | null;
  dueHasTime: boolean;
  tags: string[];
  important: boolean;
  urgent: boolean;
  /** Where the task lands if the user doesn't pick explicitly. */
  predicted: ContainerId;
}

const TAG_RE = /(?:^|\s)[#＃]([^\s#＃!！]+)/g;
const FLAG_RE = /[!！](重要|紧急|[!！])?/g;

const URGENT_WITHIN_HOURS = 48;

export function parseTaskInput(raw: string, now = new Date()): ParsedInput {
  let text = raw;

  const tags: string[] = [];
  text = text.replace(TAG_RE, (_, tag: string) => {
    if (!tags.includes(tag)) tags.push(tag);
    return " ";
  });

  let important = false;
  let urgentFlag = false;
  text = text.replace(FLAG_RE, (_, kind?: string) => {
    if (kind === "紧急") urgentFlag = true;
    else if (kind === "重要" || !kind) important = true;
    else {
      important = true;
      urgentFlag = true;
    }
    return " ";
  });

  let due: string | null = null;
  let dueHasTime = false;
  const results = chrono.zh.hans.parse(text, now, { forwardDate: true });
  const hit = results[0];
  if (hit) {
    const date = hit.start.date();
    dueHasTime = hit.start.isCertain("hour");
    if (!dueHasTime) date.setHours(12, 0, 0, 0);
    due = date.toISOString();
    text = text.slice(0, hit.index) + " " + text.slice(hit.index + hit.text.length);
  }

  const title = text.replace(/\s+/g, " ").trim();

  const hours = due ? hoursUntilDue({ due, dueHasTime }, now) : null;
  const urgent = urgentFlag || (hours !== null && hours < URGENT_WITHIN_HOURS);

  const predicted: ContainerId =
    !important && !urgent ? "inbox" : quadrantFor(important, urgent);

  return { title, due, dueHasTime, tags, important, urgent, predicted };
}
