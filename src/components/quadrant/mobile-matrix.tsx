"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Inbox, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { INBOX_META, QUADRANTS, QUADRANT_BY_ID } from "@/lib/quadrants";
import { formatToday, needsEscalation } from "@/lib/dates";
import type { ContainerId, Task } from "@/lib/types";
import { EmptyState } from "./empty-state";
import { InlineAdd } from "./inline-add";
import { TaskList } from "./task-list";
import { TaskRow } from "./task-row";
import { moveWithToast } from "./task-actions";
import { tagCounts, tasksIn } from "./selectors";
import { useUI } from "./ui-context";

const spring = { type: "spring", stiffness: 420, damping: 38 } as const;

function CompactCard({ id, tasks }: { id: (typeof QUADRANTS)[number]["id"]; tasks: Task[] }) {
  const { tagFilter, setExpanded, now } = useUI();
  const meta = QUADRANT_BY_ID[id];
  const { open } = tasksIn(tasks, id, tagFilter);
  const alert = open.some((t) => needsEscalation(t, now));

  return (
    <motion.button
      layoutId={`card-${id}`}
      transition={spring}
      type="button"
      onClick={() => setExpanded(id)}
      className="squircle relative flex min-h-40 flex-col overflow-hidden rounded-[20px] border bg-card p-3.5 text-left shadow-card backdrop-blur-xl active:scale-[0.98]"
      style={{
        backgroundImage: `linear-gradient(color-mix(in srgb, ${meta.color} 5%, transparent), color-mix(in srgb, ${meta.color} 5%, transparent))`,
      }}
    >
      <span aria-hidden className="absolute inset-x-0 top-0 h-[2px]" style={{ background: meta.color }} />
      <span className="flex items-center gap-1.5">
        <span aria-hidden className="size-2 rounded-full" style={{ background: meta.color }} />
        <span className="text-[15px] font-semibold">{meta.name}</span>
        {alert && <span aria-label="有任务即将到期" className="animate-pulse-dot ml-auto size-2 rounded-full bg-q1" />}
      </span>
      <span className="mt-0.5 text-[12px] text-muted-foreground">{meta.action}</span>
      <span
        className="mt-2 text-[34px] leading-[38px] font-bold tracking-tight tabular-nums"
        style={{ color: meta.color }}
      >
        {open.length}
      </span>
      <span className="mt-auto flex flex-col gap-0.5 pt-1">
        {open.slice(0, 2).map((t) => (
          <span key={t.id} className="truncate text-[13px] text-foreground/80">
            {t.title}
          </span>
        ))}
        {open.length === 0 && <span className="text-[13px] text-muted-foreground">{meta.emptyTitle}</span>}
        {open.length > 2 && (
          <span className="text-[12px] text-muted-foreground">还有 {open.length - 2} 项</span>
        )}
      </span>
    </motion.button>
  );
}

function ClassifyButtons({ task }: { task: Task }) {
  return (
    <span className="flex shrink-0 items-center gap-1 self-center" onPointerDown={(e) => e.stopPropagation()}>
      {QUADRANTS.map((q) => (
        <button
          key={q.id}
          type="button"
          aria-label={`移到${q.name}`}
          onClick={(e) => {
            e.stopPropagation();
            moveWithToast(task, q.id);
          }}
          className="grid size-8 place-items-center rounded-full transition-transform active:scale-90"
          style={{ background: `color-mix(in srgb, ${q.color} 16%, transparent)` }}
        >
          <span className="text-[11px] font-bold" style={{ color: q.color }}>
            {q.shortcut}
          </span>
        </button>
      ))}
    </span>
  );
}

function ExpandedView({ id, tasks }: { id: ContainerId; tasks: Task[] }) {
  const { setExpanded, tagFilter, now, selectedId, select } = useUI();
  const isInbox = id === "inbox";
  const meta = isInbox ? null : QUADRANT_BY_ID[id];
  const color = meta?.color ?? INBOX_META.color;
  const { open } = tasksIn(tasks, id, tagFilter);

  return (
    <motion.div
      layoutId={`card-${id}`}
      transition={spring}
      className="fixed inset-0 z-40 flex flex-col overflow-hidden bg-background"
    >
      <div className="material sticky top-0 z-10 flex h-12 items-center border-b px-2">
        <button
          type="button"
          onClick={() => setExpanded(null)}
          className="inline-flex h-10 items-center gap-0.5 rounded-lg pr-3 text-[17px] text-primary"
        >
          <ChevronLeft className="size-6" aria-hidden />
          矩阵
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28">
        <div className="mb-1 flex items-center gap-2">
          {isInbox ? (
            <Inbox className="size-6 text-muted-foreground" aria-hidden />
          ) : (
            <span aria-hidden className="size-3 rounded-full" style={{ background: color }} />
          )}
          <h1 className="text-[34px] leading-[41px] font-bold tracking-tight">
            {meta?.name ?? INBOX_META.name}
          </h1>
        </div>
        <p className="mb-4 text-[15px] text-muted-foreground">
          {isInbox ? "点右侧的数字，把任务放进对应象限。" : meta!.action}
        </p>
        <div className="-mx-2 rounded-2xl">
          {isInbox ? (
            open.length === 0 ? (
              <EmptyState title="收集箱已清空" body="所有任务都已归位。" color={color} />
            ) : (
              <AnimatePresence initial={false}>
                {open.map((t) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0, x: 40 }}
                    className="overflow-hidden"
                  >
                    <TaskRow
                      task={t}
                      now={now}
                      selected={selectedId === t.id}
                      onOpen={select}
                      trailing={<ClassifyButtons task={t} />}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )
          ) : (
            <TaskList
              container={id}
              tasks={open}
              empty={<EmptyState title={meta!.emptyTitle} body={meta!.emptyBody} color={color} />}
            />
          )}
          <InlineAdd container={id} />
        </div>
      </div>
    </motion.div>
  );
}

export function MobileMatrix({ tasks, notices }: { tasks: Task[]; notices: React.ReactNode }) {
  const { now, expanded, setExpanded, tagFilter, setTagFilter, openQuickAdd } = useUI();
  const total = tasks.filter((t) => !t.completed).length;
  const inbox = tasksIn(tasks, "inbox", tagFilter).open;
  const tags = tagCounts(tasks);

  return (
    <>
      <main className="flex flex-col gap-4 px-4 pt-3 pb-28">
        <div>
          <h1 className="text-[34px] leading-[41px] font-bold tracking-tight">今日</h1>
          <p className="text-[15px] text-muted-foreground">
            {formatToday(now)} · {total} 项待办
          </p>
        </div>

        {notices}

        {tags.length > 0 && (
          <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none]">
            {tags.map(([tag, count]) => {
              const active = tag === tagFilter;
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setTagFilter(active ? null : tag)}
                  className={cn(
                    "h-8 shrink-0 rounded-full px-3 text-[13px] font-medium transition-colors",
                    active ? "bg-primary text-primary-foreground" : "bg-foreground/[0.06]",
                  )}
                >
                  #{tag} <span className="opacity-60">{count}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {QUADRANTS.map((q) => (
            <CompactCard key={q.id} id={q.id} tasks={tasks} />
          ))}
        </div>

        <motion.button
          layoutId="card-inbox"
          transition={spring}
          type="button"
          onClick={() => setExpanded("inbox")}
          className="flex h-14 items-center gap-3 rounded-[20px] border bg-card px-4 text-left shadow-card backdrop-blur-xl active:scale-[0.99]"
        >
          <Inbox className="size-5 text-muted-foreground" aria-hidden />
          <span className="flex-1 text-[15px]">
            <span className="font-semibold">收集箱</span>
            <span className="text-muted-foreground">
              {inbox.length ? ` · ${inbox.length} 项待分类` : " · 已清空"}
            </span>
          </span>
          <ChevronRight className="size-5 text-muted-foreground/60" aria-hidden />
        </motion.button>
      </main>

      <AnimatePresence>{expanded && <ExpandedView key={expanded} id={expanded} tasks={tasks} />}</AnimatePresence>

      <button
        type="button"
        aria-label="新任务"
        onClick={() => openQuickAdd(expanded)}
        className="fixed right-5 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-50 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lift transition-transform active:scale-90"
      >
        <Plus className="size-7" />
      </button>
    </>
  );
}
