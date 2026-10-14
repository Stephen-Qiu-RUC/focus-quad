"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { actions } from "@/lib/store";
import { parseTaskInput } from "@/lib/parse";
import { containerColor } from "@/lib/quadrants";
import type { ContainerId } from "@/lib/types";

export function InlineAdd({ container, className }: { container: ContainerId; className?: string }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");

  function submit() {
    const parsed = parseTaskInput(value);
    if (!parsed.title) return;
    actions.addTask({
      title: parsed.title,
      container,
      due: parsed.due,
      dueHasTime: parsed.dueHasTime,
      tags: parsed.tags,
    });
    setValue("");
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className={cn(
          "flex h-9 w-full items-center gap-3 rounded-xl px-2.5 text-[15px] text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground",
          className,
        )}
      >
        <Plus className="size-[22px] p-0.5" style={{ color: containerColor(container) }} aria-hidden />
        添加
      </button>
    );
  }

  return (
    <div className={cn("flex items-center gap-3 rounded-xl px-2.5 py-1.5", className)}>
      <span
        aria-hidden
        className="size-[22px] shrink-0 rounded-full border-[1.5px] border-dashed"
        style={{ borderColor: containerColor(container) }}
      />
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;
          if (e.key === "Enter") submit();
          if (e.key === "Escape") {
            setValue("");
            setEditing(false);
          }
        }}
        onBlur={() => {
          if (value.trim()) submit();
          setEditing(false);
        }}
        placeholder="新任务，可写「明天下午3点」"
        aria-label="新任务标题"
        className="h-7 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground/70"
      />
    </div>
  );
}
