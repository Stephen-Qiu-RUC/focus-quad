"use client";

import { useState } from "react";
import { CalendarDays, X } from "lucide-react";
import { zhCN } from "react-day-picker/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatDue, formatTime, isOverdue } from "@/lib/dates";
import type { Task } from "@/lib/types";

interface DuePickerProps {
  task: Task;
  now: Date;
  onChange: (patch: Pick<Task, "due" | "dueHasTime">) => void;
}

function shift(days: number, base = new Date()) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  d.setHours(12, 0, 0, 0);
  return d;
}

function nextMonday() {
  const d = new Date();
  const offset = ((8 - d.getDay()) % 7) || 7;
  return shift(offset);
}

export function DuePicker({ task, now, onChange }: DuePickerProps) {
  const [open, setOpen] = useState(false);
  const current = task.due ? new Date(task.due) : null;
  const label = formatDue(task, now);
  const overdue = isOverdue(task, now);

  function setDay(day: Date) {
    const next = new Date(day);
    if (current && task.dueHasTime) next.setHours(current.getHours(), current.getMinutes(), 0, 0);
    else next.setHours(12, 0, 0, 0);
    onChange({ due: next.toISOString(), dueHasTime: task.dueHasTime && !!current });
  }

  function setTime(value: string) {
    const base = current ?? shift(0);
    if (!value) {
      const d = new Date(base);
      d.setHours(12, 0, 0, 0);
      onChange({ due: d.toISOString(), dueHasTime: false });
      return;
    }
    const [h, m] = value.split(":").map(Number);
    const d = new Date(base);
    d.setHours(h, m, 0, 0);
    onChange({ due: d.toISOString(), dueHasTime: true });
  }

  const quick = [
    { label: "今天", date: shift(0) },
    { label: "明天", date: shift(1) },
    { label: "下周一", date: nextMonday() },
  ];

  return (
    <div className="flex items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-lg px-2.5 text-[15px] transition-colors hover:bg-foreground/[0.05]",
            !label && "text-muted-foreground",
            overdue && "text-q1",
          )}
        >
          <CalendarDays className="size-4" aria-hidden />
          {label ? (overdue ? `已逾期 · ${label}` : label) : "添加截止日期"}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto gap-0 rounded-2xl p-0">
          <div className="flex gap-1.5 border-b p-2">
            {quick.map((q) => (
              <button
                key={q.label}
                type="button"
                onClick={() => {
                  setDay(q.date);
                  setOpen(false);
                }}
                className="h-7 flex-1 rounded-lg bg-foreground/[0.05] px-2 text-[13px] font-medium transition-colors hover:bg-foreground/[0.09]"
              >
                {q.label}
              </button>
            ))}
          </div>
          <Calendar
            mode="single"
            locale={zhCN}
            selected={current ?? undefined}
            defaultMonth={current ?? undefined}
            onSelect={(d) => d && setDay(d)}
            className="p-2"
          />
          <div className="flex items-center gap-2 border-t p-2">
            <label htmlFor="due-time" className="text-[13px] text-muted-foreground">
              时间
            </label>
            <input
              id="due-time"
              type="time"
              value={current && task.dueHasTime ? formatTime(current) : ""}
              onChange={(e) => setTime(e.target.value)}
              className="h-7 flex-1 rounded-md bg-foreground/[0.05] px-2 text-[13px] tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </div>
        </PopoverContent>
      </Popover>
      {label && (
        <button
          type="button"
          aria-label="清除截止日期"
          onClick={() => onChange({ due: null, dueHasTime: false })}
          className="grid size-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/[0.06]"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
