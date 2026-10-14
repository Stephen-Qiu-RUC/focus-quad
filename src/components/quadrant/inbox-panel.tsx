"use client";

import { Inbox, Hash, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";
import { TaskList } from "./task-list";
import { InlineAdd } from "./inline-add";
import { EmptyState } from "./empty-state";
import { tagCounts, tasksIn } from "./selectors";
import { useUI } from "./ui-context";

export function InboxSection({ tasks, className }: { tasks: Task[]; className?: string }) {
  const { tagFilter } = useUI();
  const { open } = tasksIn(tasks, "inbox", tagFilter);

  return (
    <section aria-label="收集箱" className={cn("flex min-h-0 flex-col", className)}>
      <header className="flex items-center gap-2 px-3 pb-1.5">
        <Inbox className="size-4 text-muted-foreground" aria-hidden />
        <h2 className="flex-1 text-[15px] font-semibold">收集箱</h2>
        <span className="text-[13px] font-semibold text-muted-foreground tabular-nums">
          {open.length}
        </span>
      </header>
      <p className="px-3 pb-2 text-[13px] leading-[18px] text-muted-foreground">
        先记下来，再拖进右侧的象限。
      </p>
      <div className="scrollbar-thin -mx-1 min-h-0 flex-1 overflow-y-auto px-1 has-data-over:[&>div]:bg-foreground/[0.04]">
        <TaskList
          container="inbox"
          tasks={open}
          empty={
            <EmptyState
              compact
              title="收集箱已清空"
              body="所有任务都已归位。"
              color="var(--muted-foreground)"
            />
          }
        />
        <InlineAdd container="inbox" />
      </div>
    </section>
  );
}

export function TagFilterList({ tasks }: { tasks: Task[] }) {
  const { tagFilter, setTagFilter } = useUI();
  const tags = tagCounts(tasks);
  if (tags.length === 0) return null;

  return (
    <nav aria-label="标签" className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between px-3 pb-1">
        <h2 className="text-[13px] font-semibold text-muted-foreground">标签</h2>
        {tagFilter && (
          <button
            type="button"
            onClick={() => setTagFilter(null)}
            className="inline-flex items-center gap-0.5 text-[13px] text-primary"
          >
            <X className="size-3" aria-hidden />
            清除
          </button>
        )}
      </div>
      {tags.map(([tag, count]) => {
        const active = tag === tagFilter;
        return (
          <button
            key={tag}
            type="button"
            aria-pressed={active}
            onClick={() => setTagFilter(active ? null : tag)}
            className={cn(
              "flex h-8 items-center gap-2 rounded-lg px-3 text-[15px] transition-colors",
              active ? "bg-primary text-primary-foreground" : "hover:bg-foreground/[0.05]",
            )}
          >
            <Hash
              className={cn("size-3.5", active ? "text-primary-foreground" : "text-muted-foreground")}
              aria-hidden
            />
            <span className="flex-1 truncate text-left">{tag}</span>
            <span
              className={cn(
                "text-[13px] tabular-nums",
                active ? "text-primary-foreground/80" : "text-muted-foreground",
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
