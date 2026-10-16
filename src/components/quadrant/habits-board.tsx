"use client";

import { useState } from "react";
import { Flame, Plus, Repeat, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { actions } from "@/lib/store";
import { habitStreak, isCheckedIn } from "@/lib/habits";
import type { Habit } from "@/lib/types";
import { CheckCircle } from "./check-circle";
import { useUI } from "./ui-context";

function deleteHabit(habit: Habit) {
  const removed = actions.deleteHabit(habit.id);
  if (!removed) return;
  toast(`已删除「${habit.title}」`, {
    duration: 5000,
    action: {
      label: "撤销",
      onClick: () => actions.restoreHabit(removed.habit, removed.index),
    },
  });
}

function HabitCard({ habit }: { habit: Habit }) {
  const { now } = useUI();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(habit.title);
  const [notes, setNotes] = useState(habit.notes);
  const done = isCheckedIn(habit, now);
  const streak = habitStreak(habit.doneOn, now);

  function beginEdit() {
    setTitle(habit.title);
    setNotes(habit.notes);
    setEditing(true);
  }

  function save() {
    const nextTitle = title.trim() || habit.title;
    setTitle(nextTitle);
    actions.updateHabit(habit.id, { title: nextTitle, notes: notes.trim() });
    setEditing(false);
  }

  return (
    <article
      className={cn(
        "flex min-w-[220px] flex-1 items-start gap-3 rounded-2xl border bg-background/70 px-3 py-2.5",
        done && "bg-habit/10",
      )}
      onBlur={(e) => {
        if (editing && !e.currentTarget.contains(e.relatedTarget)) save();
      }}
    >
      <CheckCircle
        checked={done}
        color="var(--habit)"
        onToggle={() => actions.toggleHabitToday(habit.id, now)}
        label={done ? `取消今天的「${habit.title}」打卡` : `为「${habit.title}」打卡`}
        className="mt-0.5"
      />
      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="flex flex-col gap-1.5">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.nativeEvent.isComposing) return;
                if (e.key === "Escape") {
                  setTitle(habit.title);
                  setNotes(habit.notes);
                  setEditing(false);
                }
              }}
              aria-label="长期任务名称"
              className="h-7 w-full bg-transparent text-[15px] font-medium outline-none"
            />
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) save();
              }}
              placeholder="备注，例如每天 20 个"
              aria-label="备注"
              className="h-7 w-full bg-transparent text-[13px] text-muted-foreground outline-none placeholder:text-muted-foreground/70"
            />
          </div>
        ) : (
          <button type="button" onClick={beginEdit} className="block w-full text-left">
            <p className="truncate text-[15px] leading-5 font-medium">{habit.title}</p>
            <p className="mt-0.5 flex items-center gap-1 text-[13px] leading-[18px] text-muted-foreground">
              {streak > 0 && <Flame className="size-3 text-habit" aria-hidden />}
              <span>
                {done ? "今天已打卡" : "今天还没做"}
                {streak > 0 ? ` · 连续 ${streak} 天` : ""}
              </span>
            </p>
            {habit.notes && (
              <p className="mt-0.5 truncate text-[13px] leading-[18px] text-muted-foreground">{habit.notes}</p>
            )}
          </button>
        )}
      </div>
      <button
        type="button"
        aria-label={`删除「${habit.title}」`}
        onClick={() => deleteHabit(habit)}
        className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
      >
        <Trash2 className="size-3.5" />
      </button>
    </article>
  );
}

function AddHabit() {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");

  function submit() {
    const title = value.trim();
    if (!title) {
      setEditing(false);
      return;
    }
    actions.addHabit(title);
    setValue("");
    setEditing(false);
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[14px] text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground"
      >
        <Plus className="size-4" aria-hidden />
        添加长期任务
      </button>
    );
  }

  return (
    <div className="flex h-9 min-w-48 items-center gap-2 rounded-full bg-foreground/[0.05] px-3">
      <Repeat className="size-3.5 text-habit" aria-hidden />
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
        onBlur={submit}
        placeholder="例如：背英语单词"
        aria-label="新的长期任务"
        className="h-7 min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground/70"
      />
    </div>
  );
}

export function HabitsBoard({ habits }: { habits: Habit[] }) {
  const { now } = useUI();
  const doneCount = habits.filter((h) => isCheckedIn(h, now)).length;

  return (
    <section aria-label="长期任务" className="rounded-[20px] border bg-card px-4 py-3.5 shadow-card backdrop-blur-xl">
      <header className="mb-3 flex items-start gap-2.5">
        <span aria-hidden className="mt-1.5 size-2.5 shrink-0 rounded-full bg-habit" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h2 className="text-[17px] leading-[22px] font-semibold tracking-tight">长期任务</h2>
            {habits.length > 0 && (
              <span className="text-[13px] font-semibold text-habit tabular-nums">
                今日 {doneCount}/{habits.length}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[13px] leading-[18px] text-muted-foreground">
            背单词、阅读、运动这类每天都要做的事。打卡后仍留在这里，明天继续。
          </p>
        </div>
      </header>
      {habits.length > 0 && (
        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </div>
      )}
      <AddHabit />
    </section>
  );
}
