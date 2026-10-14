"use client";

import { QUADRANTS } from "@/lib/quadrants";
import type { Task } from "@/lib/types";
import { QuadrantCard } from "./quadrant-card";

function AxisLabel({ children, vertical }: { children: React.ReactNode; vertical?: boolean }) {
  return (
    <div
      className={
        vertical
          ? "flex items-center justify-center [writing-mode:vertical-rl]"
          : "flex items-center justify-center"
      }
    >
      <span className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground/80">
        {children}
      </span>
    </div>
  );
}

export function MatrixGrid({ tasks }: { tasks: Task[] }) {
  const [q1, q2, q3, q4] = QUADRANTS;
  return (
    <div className="grid min-h-[560px] flex-1 grid-cols-[20px_minmax(0,1fr)_minmax(0,1fr)] grid-rows-[20px_minmax(0,1fr)_minmax(0,1fr)] gap-3 xl:gap-4">
      <div />
      <AxisLabel>紧急</AxisLabel>
      <AxisLabel>不紧急</AxisLabel>
      <AxisLabel vertical>重要</AxisLabel>
      <QuadrantCard meta={q1} tasks={tasks} />
      <QuadrantCard meta={q2} tasks={tasks} />
      <AxisLabel vertical>不重要</AxisLabel>
      <QuadrantCard meta={q3} tasks={tasks} />
      <QuadrantCard meta={q4} tasks={tasks} />
    </div>
  );
}
