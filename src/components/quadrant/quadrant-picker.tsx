"use client";

import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { QUADRANTS } from "@/lib/quadrants";
import type { ContainerId } from "@/lib/types";

interface QuadrantPickerProps {
  value: ContainerId;
  onChange: (id: ContainerId) => void;
  predicted?: ContainerId | null;
  showInbox?: boolean;
  size?: "sm" | "md";
  kbdPrefix?: string;
}

export function QuadrantPicker({ value, onChange, predicted, showInbox = true, size = "md", kbdPrefix = "" }: QuadrantPickerProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div role="radiogroup" aria-label="选择象限" className="grid grid-cols-2 gap-1.5">
        {QUADRANTS.map((q) => {
          const active = value === q.id;
          return (
            <button
              key={q.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(q.id)}
              className={cn(
                "relative flex items-center gap-2 rounded-xl border text-left transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                size === "sm" ? "h-10 px-2.5" : "h-12 px-3",
                active ? "border-transparent" : "border-border hover:bg-foreground/[0.03]",
              )}
              style={
                active
                  ? {
                      background: `color-mix(in srgb, ${q.color} 14%, transparent)`,
                      boxShadow: `inset 0 0 0 1.5px ${q.color}`,
                    }
                  : undefined
              }
            >
              <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: q.color }} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] leading-4 font-semibold">{q.name}</span>
                {size === "md" && (
                  <span className="block truncate text-[11px] leading-4 text-muted-foreground">
                    {q.action}
                  </span>
                )}
              </span>
              {predicted === q.id && (
                <span className="shrink-0 rounded-full bg-foreground/[0.06] px-1.5 text-[10px] leading-4 text-muted-foreground">
                  推荐
                </span>
              )}
              <kbd className="hidden shrink-0 text-[11px] text-muted-foreground/70 sm:inline">{kbdPrefix}{q.shortcut}</kbd>
            </button>
          );
        })}
      </div>
      {showInbox && (
        <button
          type="button"
          role="radio"
          aria-checked={value === "inbox"}
          onClick={() => onChange("inbox")}
          className={cn(
            "flex h-9 items-center gap-2 rounded-xl border px-3 text-[13px] transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
            value === "inbox"
              ? "border-transparent bg-foreground/[0.08] font-semibold"
              : "border-border text-muted-foreground hover:bg-foreground/[0.03]",
          )}
        >
          <Inbox className="size-3.5" aria-hidden />
          <span className="flex-1 text-left">先放进收集箱，稍后分类</span>
          {predicted === "inbox" && (
            <span className="rounded-full bg-foreground/[0.06] px-1.5 text-[10px] leading-4">推荐</span>
          )}
          <kbd className="hidden text-[11px] text-muted-foreground/70 sm:inline">{kbdPrefix}0</kbd>
        </button>
      )}
    </div>
  );
}
