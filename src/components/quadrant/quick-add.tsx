"use client";

import { useMemo, useState } from "react";
import { AlarmClock, CalendarDays, CornerDownLeft, Flag, Hash, Plus, Zap } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { actions } from "@/lib/store";
import { parseTaskInput } from "@/lib/parse";
import { containerName } from "@/lib/quadrants";
import { formatDue } from "@/lib/dates";
import type { ContainerId } from "@/lib/types";
import { QuadrantPicker } from "./quadrant-picker";
import { useUI } from "./ui-context";

const KEY_TO_CONTAINER: Record<string, ContainerId> = {
  "0": "inbox",
  "1": "q1",
  "2": "q2",
  "3": "q3",
  "4": "q4",
};

function Chip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex h-6 items-center gap-1 rounded-full bg-foreground/[0.06] px-2 text-[12px] font-medium">
      {icon}
      {children}
    </span>
  );
}

function QuickAddForm({ initial, onDone }: { initial: ContainerId | null; onDone: () => void }) {
  const { now } = useUI();
  const [value, setValue] = useState("");
  const [picked, setPicked] = useState<ContainerId | null>(initial);
  const parsed = useMemo(() => parseTaskInput(value, now), [value, now]);
  const target = picked ?? parsed.predicted;
  const due = parsed.due ? formatDue(parsed, now) : null;

  function submit(keepOpen: boolean) {
    if (!parsed.title) return;
    actions.addTask({
      title: parsed.title,
      container: target,
      due: parsed.due,
      dueHasTime: parsed.dueHasTime,
      tags: parsed.tags,
    });
    toast(`已添加到「${containerName(target)}」`, { duration: 2000 });
    setValue("");
    setPicked(initial);
    if (!keepOpen) onDone();
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <Plus className="size-5 shrink-0 text-primary" aria-hidden />
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === "Enter") {
              e.preventDefault();
              submit(e.shiftKey);
            }
            if (e.altKey && e.code.startsWith("Digit")) {
              const c = KEY_TO_CONTAINER[e.code.slice(5)];
              if (c) {
                e.preventDefault();
                setPicked(c);
              }
            }
          }}
          placeholder="明天下午3点 提交报告 !重要 #工作"
          aria-label="新任务"
          className="h-9 min-w-0 flex-1 bg-transparent text-[20px] tracking-tight outline-none placeholder:text-muted-foreground/60"
        />
      </div>

      <div className="flex min-h-9 flex-wrap items-center gap-1.5 px-5 pb-3">
        {value.trim() ? (
          <>
            {due && (
              <Chip
                icon={
                  parsed.dueHasTime ? (
                    <AlarmClock className="size-3" aria-hidden />
                  ) : (
                    <CalendarDays className="size-3" aria-hidden />
                  )
                }
              >
                {due}
              </Chip>
            )}
            {parsed.important && <Chip icon={<Flag className="size-3 text-q2" aria-hidden />}>重要</Chip>}
            {parsed.urgent && <Chip icon={<Zap className="size-3 text-q1" aria-hidden />}>紧急</Chip>}
            {parsed.tags.map((t) => (
              <Chip key={t} icon={<Hash className="size-3" aria-hidden />}>
                {t}
              </Chip>
            ))}
            {!due && !parsed.important && !parsed.urgent && parsed.tags.length === 0 && (
              <span className="text-[13px] text-muted-foreground">
                没有识别到日期或标记，默认放进收集箱。
              </span>
            )}
          </>
        ) : (
          <span className="text-[13px] text-muted-foreground">
            支持「明天」「周五」「下午3点」，用 !重要、!紧急、#标签 做标记。
          </span>
        )}
      </div>

      <div className="border-t bg-foreground/[0.02] px-5 py-4">
        <QuadrantPicker
          value={target}
          onChange={setPicked}
          predicted={value.trim() ? parsed.predicted : null}
          kbdPrefix="⌥"
        />
      </div>

      <div className="flex items-center justify-between gap-3 border-t px-5 py-3 text-[12px] text-muted-foreground">
        <span className="hidden sm:inline">⇧↵ 连续添加 · esc 关闭</span>
        <button
          type="button"
          disabled={!parsed.title}
          onClick={() => submit(false)}
          className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-[13px] font-medium text-primary-foreground transition-opacity disabled:opacity-40"
        >
          添加到「{containerName(target)}」
          <CornerDownLeft className="size-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}

export function QuickAdd() {
  const { quickAdd, closeQuickAdd } = useUI();
  return (
    <Dialog open={quickAdd.open} onOpenChange={(open) => !open && closeQuickAdd()}>
      <DialogContent
        showCloseButton={false}
        className="top-[12vh] max-w-[calc(100%-1.5rem)] translate-y-0 gap-0 overflow-hidden rounded-[20px] p-0 shadow-lift sm:max-w-xl"
      >
        <DialogTitle className="sr-only">新任务</DialogTitle>
        <DialogDescription className="sr-only">输入任务内容，选择要放入的象限。</DialogDescription>
        {quickAdd.open && <QuickAddForm initial={quickAdd.container} onDone={closeQuickAdd} />}
      </DialogContent>
    </Dialog>
  );
}
