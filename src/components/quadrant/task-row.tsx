"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { AlarmClock, ArrowUpLeft, CalendarDays, StickyNote, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { containerColor } from "@/lib/quadrants";
import { formatDue, isOverdue, needsEscalation } from "@/lib/dates";
import { actions } from "@/lib/store";
import type { Task } from "@/lib/types";
import { CheckCircle } from "./check-circle";
import { completeWithUndo } from "./task-actions";

interface TaskRowProps extends React.HTMLAttributes<HTMLDivElement> {
  task: Task;
  now: Date;
  selected?: boolean;
  onOpen?: (id: string) => void;
  /** Rendered inside the drag overlay. */
  lifted?: boolean;
  /** Placeholder left behind while the row is being dragged. */
  ghost?: boolean;
  trailing?: React.ReactNode;
}

const COMPLETE_DELAY_MS = 420;

export const TaskRow = forwardRef<HTMLDivElement, TaskRowProps>(function TaskRow(
  { task, now, selected, onOpen, lifted, ghost, trailing, className, ...rest },
  ref,
) {
  const [completing, setCompleting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const checked = task.completed || completing;
  const color = containerColor(task.container);
  const due = formatDue(task, now);
  const overdue = isOverdue(task, now);
  const escalate = needsEscalation(task, now);

  function toggle() {
    if (task.completed) {
      actions.setCompleted(task.id, false);
      return;
    }
    if (completing) {
      if (timer.current) clearTimeout(timer.current);
      setCompleting(false);
      return;
    }
    setCompleting(true);
    timer.current = setTimeout(() => completeWithUndo(task), COMPLETE_DELAY_MS);
  }

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={`${task.title}${due ? `，${due}` : ""}`}
      data-selected={selected || undefined}
      onClick={() => onOpen?.(task.id)}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter") onOpen?.(task.id);
      }}
      className={cn(
        "group/row relative flex cursor-default items-start gap-3 rounded-xl px-3 py-2.5 text-left outline-none transition-colors select-none",
        "hover:bg-foreground/[0.04] focus-visible:ring-3 focus-visible:ring-ring/30 data-selected:bg-primary/10",
        lifted && "material scale-[1.03] cursor-grabbing bg-card shadow-lift",
        ghost && "opacity-30",
        className,
      )}
      {...rest}
    >
      <CheckCircle
        checked={checked}
        color={color}
        onToggle={toggle}
        label={checked ? "标记为未完成" : "标记为完成"}
        className="mt-px"
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-[15px] leading-6 break-words transition-colors duration-300",
            checked && "text-muted-foreground line-through decoration-muted-foreground/60",
          )}
        >
          {task.title}
        </p>
        {(due || task.tags.length > 0 || task.notes) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] leading-5 text-muted-foreground">
            {due && (
              <span
                className={cn("inline-flex items-center gap-1 tabular-nums", overdue && "text-q1")}
              >
                {task.dueHasTime ? (
                  <AlarmClock className="size-3.5 shrink-0" aria-hidden />
                ) : (
                  <CalendarDays className="size-3.5 shrink-0" aria-hidden />
                )}
                {overdue ? `已逾期 · ${due}` : due}
              </span>
            )}
            {task.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
            {task.notes && <StickyNote className="size-3" aria-label="有备注" />}
          </div>
        )}
        {escalate && !lifted && (
          <div className="mt-1.5 flex items-center gap-1">
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                actions.moveTask(task.id, "q1");
              }}
              className="inline-flex h-6 items-center gap-1 rounded-full bg-q1/12 px-2 text-xs font-medium text-q1 transition-colors hover:bg-q1/20"
            >
              <ArrowUpLeft className="size-3" aria-hidden />
              快到期了，移到立即去做？
            </button>
            <button
              type="button"
              aria-label="忽略提醒"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                actions.dismissEscalation([task.id]);
              }}
              className="grid size-6 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5"
            >
              <X className="size-3" />
            </button>
          </div>
        )}
      </div>
      {escalate && (
        <span
          aria-hidden
          className="animate-pulse-dot mt-1.5 size-2 shrink-0 rounded-full bg-q1"
        />
      )}
      {trailing}
    </div>
  );
});
