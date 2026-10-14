"use client";

import { cn } from "@/lib/utils";
import { QUADRANTS } from "@/lib/quadrants";
import type { Task } from "@/lib/types";
import { QuadrantCard } from "./quadrant-card";

function AxisLabel({ children, vertical }: { children: React.ReactNode; vertical?: boolean }) {
  return (
    <div className="flex items-center justify-center">
      <span
        className={cn(
          "rounded-full bg-foreground/[0.05] text-[12px] leading-4 font-semibold tracking-[0.25em] text-muted-foreground",
          vertical ? "px-0.5 py-2.5 [writing-mode:vertical-rl]" : "px-2.5 py-0.5",
        )}
      >
        {children}
      </span>
    </div>
  );
}

export function MatrixGrid({ tasks }: { tasks: Task[] }) {
  const [q1, q2, q3, q4] = QUADRANTS;
  return (
    <div className="grid min-h-[560px] flex-1 grid-cols-[24px_minmax(0,1fr)_minmax(0,1fr)] grid-rows-[24px_minmax(0,1fr)_minmax(0,1fr)] gap-3 xl:gap-4">
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
