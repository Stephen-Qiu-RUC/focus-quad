"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Hash, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { actions } from "@/lib/store";
import { containerColor } from "@/lib/quadrants";
import type { Task } from "@/lib/types";
import { CheckCircle } from "./check-circle";
import { DuePicker } from "./due-picker";
import { QuadrantPicker } from "./quadrant-picker";
import { deleteWithUndo } from "./task-actions";
import { useUI } from "./ui-context";

function AutoTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [props.value]);
  return <textarea ref={ref} rows={1} {...props} />;
}

function TagEditor({ task }: { task: Task }) {
  const [draft, setDraft] = useState("");

  function commit() {
    const tag = draft.replace(/^[#＃]/, "").trim();
    if (tag && !task.tags.includes(tag)) actions.updateTask(task.id, { tags: [...task.tags, tag] });
    setDraft("");
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-2.5">
      <Hash className="size-4 text-muted-foreground" aria-hidden />
      {task.tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex h-7 items-center gap-1 rounded-full bg-foreground/[0.06] pr-1 pl-2.5 text-[13px]"
        >
          {tag}
          <button
            type="button"
            aria-label={`移除标签 ${tag}`}
            onClick={() => actions.updateTask(task.id, { tags: task.tags.filter((t) => t !== tag) })}
            className="grid size-5 place-items-center rounded-full text-muted-foreground hover:bg-foreground/10"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          }
          if (e.key === "Backspace" && !draft && task.tags.length)
            actions.updateTask(task.id, { tags: task.tags.slice(0, -1) });
        }}
        onBlur={commit}
        placeholder={task.tags.length ? "" : "添加标签"}
        aria-label="添加标签"
        className="h-7 min-w-20 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

function TaskEditor({ task, onClose }: { task: Task; onClose: () => void }) {
  const { now } = useUI();
  const created = new Date(task.createdAt);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex items-start gap-3 px-5 pt-5 pb-3">
        <CheckCircle
          checked={task.completed}
          color={containerColor(task.container)}
          onToggle={() => actions.setCompleted(task.id, !task.completed)}
          label={task.completed ? "标记为未完成" : "标记为完成"}
          className="mt-1"
        />
        <AutoTextarea
          value={task.title}
          onChange={(e) => actions.updateTask(task.id, { title: e.target.value.replace(/\n/g, "") })}
          onBlur={(e) => {
            if (!e.target.value.trim()) actions.updateTask(task.id, { title: "未命名任务" });
          }}
          aria-label="任务标题"
          className={cn(
            "flex-1 resize-none bg-transparent text-[20px] leading-7 font-semibold tracking-tight outline-none",
            task.completed && "text-muted-foreground line-through",
          )}
        />
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="关闭详情" className="-mr-2">
          <X />
        </Button>
      </div>

      <div className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-3 pb-4">
        <section className="px-2">
          <h3 className="mb-2 text-[13px] font-medium text-muted-foreground">象限</h3>
          <QuadrantPicker
            value={task.container}
            onChange={(c) => actions.moveTask(task.id, c)}
            size="sm"
          />
        </section>

        <section className="flex flex-col gap-1 rounded-2xl bg-foreground/[0.03] py-1.5">
          <DuePicker task={task} now={now} onChange={(patch) => actions.updateTask(task.id, patch)} />
          <div className="mx-2.5 h-px bg-separator" />
          <TagEditor task={task} />
        </section>

        <section className="px-2">
          <h3 className="mb-2 text-[13px] font-medium text-muted-foreground">备注</h3>
          <AutoTextarea
            value={task.notes}
            onChange={(e) => actions.updateTask(task.id, { notes: e.target.value })}
            placeholder="补充一些细节…"
            aria-label="备注"
            className="min-h-24 w-full resize-none rounded-xl bg-foreground/[0.03] px-3 py-2.5 text-[15px] leading-5 outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
          />
        </section>
      </div>

      <footer className="flex items-center gap-2 border-t px-5 py-3">
        <p className="flex-1 text-[12px] text-muted-foreground">
          创建于 {created.getMonth() + 1}月{created.getDate()}日
          <span className="hidden lg:inline"> · 按 1–4 移动，⌫ 删除</span>
        </p>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            deleteWithUndo(task.id);
            onClose();
          }}
        >
          <Trash2 data-icon="inline-start" />
          删除
        </Button>
      </footer>
    </div>
  );
}

export function DesktopInspector({ task }: { task: Task | null }) {
  const { select } = useUI();
  return (
    <AnimatePresence initial={false}>
      {task && (
        <motion.aside
          key="inspector"
          aria-label="任务详情"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 380, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 40 }}
          className="shrink-0 overflow-hidden"
        >
          <div className="material h-full w-[380px] border-l">
            <TaskEditor key={task.id} task={task} onClose={() => select(null)} />
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export function MobileInspector({ task }: { task: Task | null }) {
  const { select } = useUI();
  const [last, setLast] = useState<Task | null>(task);
  if (task && task !== last) setLast(task);
  const shown = task ?? last;

  return (
    <Sheet open={!!task} onOpenChange={(open) => !open && select(null)}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="max-h-[88dvh] gap-0 rounded-t-[20px] p-0"
      >
        <SheetTitle className="sr-only">任务详情</SheetTitle>
        <div aria-hidden className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-foreground/15" />
        {shown && <TaskEditor task={shown} onClose={() => select(null)} />}
      </SheetContent>
    </Sheet>
  );
}
