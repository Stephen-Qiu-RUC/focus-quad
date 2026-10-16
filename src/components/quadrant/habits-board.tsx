"use client";

import { useState } from "react";
import { Minus, Plus, Repeat, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { actions } from "@/lib/store";
import { clampTimesPerWeek, countThisWeek, isCheckedIn } from "@/lib/habits";
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

function WeekDots({ count, target }: { count: number; target: number }) {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden>
      {Array.from({ length: target }, (_, index) => (
        <span
          key={index}
          className={cn("size-1.5 rounded-full", index < count ? "bg-habit" : "bg-foreground/15")}
        />
      ))}
    </span>
  );
}

function TimesStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <span className="inline-flex h-7 items-center rounded-full bg-foreground/[0.05] text-[13px]">
      <button
        type="button"
        aria-label="减少每周次数"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
        className="grid size-7 place-items-center rounded-full text-muted-foreground enabled:hover:bg-foreground/10 disabled:opacity-30"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="min-w-14 text-center tabular-nums">每周 {value} 次</span>
      <button
        type="button"
        aria-label="增加每周次数"
        disabled={value >= 7}
        onClick={() => onChange(value + 1)}
        className="grid size-7 place-items-center rounded-full text-muted-foreground enabled:hover:bg-foreground/10 disabled:opacity-30"
      >
        <Plus className="size-3.5" />
      </button>
    </span>
  );
}

function HabitCard({ habit }: { habit: Habit }) {
  const { now } = useUI();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(habit.title);
  const [notes, setNotes] = useState(habit.notes);
  const target = clampTimesPerWeek(habit.timesPerWeek);
  const count = countThisWeek(habit.doneOn, now);
  const doneToday = isCheckedIn(habit, now);
  const met = count >= target;

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
        "flex min-w-[240px] flex-1 flex-col gap-2 rounded-2xl border bg-background/70 px-3 py-3",
        met && "bg-habit/10",
      )}
      onBlur={(event) => {
        if (editing && !event.currentTarget.contains(event.relatedTarget)) save();
      }}
    >
      <div className="flex items-start gap-3">
        <CheckCircle
          checked={doneToday}
          color="var(--habit)"
          onToggle={() => actions.toggleHabitToday(habit.id, now)}
          label={doneToday ? `取消今天的「${habit.title}」` : `把今天计入「${habit.title}」`}
          className="mt-0.5"
        />
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex flex-col gap-1.5">
              <input
                autoFocus
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.nativeEvent.isComposing) return;
                  if (event.key === "Escape") {
                    setTitle(habit.title);
                    setNotes(habit.notes);
                    setEditing(false);
                  }
                }}
                aria-label="长期任务名称"
                className="h-7 w-full bg-transparent text-[15px] leading-6 font-medium outline-none"
              />
              <input
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.nativeEvent.isComposing) save();
                }}
                placeholder="备注，例如每天 20 个"
                aria-label="备注"
                className="h-7 w-full bg-transparent text-[13px] text-muted-foreground outline-none placeholder:text-muted-foreground/70"
              />
            </div>
          ) : (
            <button type="button" onClick={beginEdit} className="block w-full text-left">
              <p className="truncate text-[15px] leading-6 font-medium">{habit.title}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] leading-5 text-muted-foreground">
                <WeekDots count={Math.min(count, target)} target={target} />
                <span className={cn("tabular-nums", met && "font-medium text-habit")}>
                  本周 {count}/{target}
                  {met ? " · 已达标" : ""}
                </span>
                <span>{doneToday ? "今天已计入" : "今天还没记"}</span>
              </p>
              {habit.notes && (
                <p className="mt-1 truncate text-[13px] leading-5 text-muted-foreground">{habit.notes}</p>
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
      </div>
      <div className="pl-[34px]">
        <TimesStepper
          value={target}
          onChange={(next) => actions.updateHabit(habit.id, { timesPerWeek: next })}
        />
      </div>
    </article>
  );
}

function AddHabit() {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [times, setTimes] = useState(7);

  function reset() {
    setValue("");
    setTimes(7);
    setEditing(false);
  }

  function submit() {
    const title = value.trim();
    if (!title) {
      reset();
      return;
    }
    actions.addHabit(title, "", times);
    reset();
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
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex h-9 min-w-48 flex-1 items-center gap-2 rounded-full bg-foreground/[0.05] px-3">
        <Repeat className="size-3.5 text-habit" aria-hidden />
        <input
          autoFocus
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing) return;
            if (event.key === "Enter") submit();
            if (event.key === "Escape") reset();
          }}
          placeholder="例如：健身"
          aria-label="新的长期任务"
          className="h-7 min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground/70"
        />
      </div>
      <TimesStepper value={times} onChange={setTimes} />
      <button
        type="button"
        onClick={submit}
        className="h-8 rounded-full bg-primary px-3 text-[13px] font-medium text-primary-foreground"
      >
        添加
      </button>
    </div>
  );
}

export function HabitsBoard({ habits }: { habits: Habit[] }) {
  const { now } = useUI();
  const metCount = habits.filter(
    (habit) => countThisWeek(habit.doneOn, now) >= clampTimesPerWeek(habit.timesPerWeek),
  ).length;

  return (
    <section aria-label="长期任务" className="rounded-[20px] border bg-card px-4 py-3.5 shadow-card backdrop-blur-xl">
      <header className="mb-3 flex items-start gap-2.5">
        <span aria-hidden className="mt-1.5 size-2.5 shrink-0 rounded-full bg-habit" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h2 className="text-[17px] leading-[22px] font-semibold tracking-tight">长期任务</h2>
            {habits.length > 0 && (
              <span className="text-[13px] font-semibold text-habit tabular-nums">
                本周达标 {metCount}/{habits.length}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">
            按周设定次数。背单词可以每周 7 次，健身可以每周 3 次。每天最多记 1 次。
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
