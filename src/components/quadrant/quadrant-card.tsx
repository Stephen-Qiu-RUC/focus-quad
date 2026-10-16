"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { actions } from "@/lib/store";
import type { QuadrantMeta } from "@/lib/quadrants";
import type { Task } from "@/lib/types";
import { TaskList } from "./task-list";
import { InlineAdd } from "./inline-add";
import { EmptyState } from "./empty-state";
import { tasksIn } from "./selectors";
import { useUI } from "./ui-context";

export function QuadrantCard({ meta, tasks }: { meta: QuadrantMeta; tasks: Task[] }) {
  const { tagFilter, openQuickAdd } = useUI();
  const [showDone, setShowDone] = useState(false);
  const { open, done } = tasksIn(tasks, meta.id, tagFilter);

  return (
    <section
      data-drop-container={meta.id}
      aria-label={`${meta.name}（${meta.action}）`}
      className={cn(
        "squircle relative flex min-h-[260px] flex-col overflow-hidden rounded-[20px] border bg-card shadow-card backdrop-blur-xl transition-[box-shadow,transform] duration-200",
        "has-data-over:scale-[1.008] has-data-over:ring-2 has-data-over:ring-(--qc)",
      )}
      style={{
        ["--qc" as string]: meta.color,
        backgroundImage: `linear-gradient(color-mix(in srgb, ${meta.color} 4%, transparent), color-mix(in srgb, ${meta.color} 4%, transparent))`,
      }}
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-[2px]" style={{ background: meta.color }} />
      <header className="flex items-center gap-2.5 px-4 pt-4 pb-2">
        <span aria-hidden className="size-2.5 rounded-full" style={{ background: meta.color }} />
        <div className="flex min-w-0 flex-1 items-baseline gap-2">
          <h2 className="text-[17px] leading-[22px] font-semibold tracking-tight">{meta.name}</h2>
          <span className="truncate text-[13px] text-muted-foreground">{meta.action}</span>
        </div>
        <span
          className="min-w-6 rounded-full px-1.5 text-center text-[13px] leading-5 font-semibold tabular-nums"
          style={{
            color: meta.color,
            background: `color-mix(in srgb, ${meta.color} 14%, transparent)`,
          }}
        >
          {open.length}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-sm" aria-label={`${meta.name}选项`} />}
          >
            <MoreHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => openQuickAdd(meta.id)}>添加任务…</DropdownMenuItem>
            <DropdownMenuItem disabled={done.length === 0} onClick={() => setShowDone((v) => !v)}>
              {showDone ? "隐藏已完成" : `显示已完成（${done.length}）`}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={done.length === 0}
              onClick={() => actions.clearCompleted(meta.id)}
            >
              清除已完成
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <div className="scrollbar-thin relative flex min-h-0 flex-1 flex-col overflow-y-auto px-2 pt-1 pb-2">
        <TaskList
          container={meta.id}
          tasks={open}
          completed={showDone ? done : []}
          empty={
            <EmptyState
              title={tagFilter ? `没有 #${tagFilter} 的任务` : meta.emptyTitle}
              body={tagFilter ? "换个标签看看，或清除筛选。" : meta.emptyBody}
              color={meta.color}
            />
          }
          className="shrink-0"
        />
        <InlineAdd container={meta.id} className="mb-2 shrink-0" />
      </div>
    </section>
  );
}
