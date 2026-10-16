"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import type { ContainerId, Task } from "@/lib/types";
import { TaskRow } from "./task-row";
import { useUI } from "./ui-context";

function SortableTask({ task, container }: { task: Task; container: ContainerId }) {
  const { now, selectedId, select } = useUI();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { container },
  });

  return (
    <TaskRow
      ref={setNodeRef}
      task={task}
      now={now}
      selected={selectedId === task.id}
      onOpen={select}
      ghost={isDragging}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
    />
  );
}

const rowMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

interface TaskListProps {
  container: ContainerId;
  tasks: Task[];
  completed?: Task[];
  empty?: React.ReactNode;
  className?: string;
}

export function TaskList({ container, tasks, completed = [], empty, className }: TaskListProps) {
  const { now, selectedId, select } = useUI();
  const { setNodeRef, isOver } = useDroppable({ id: container, data: { container } });

  return (
    <div
      ref={setNodeRef}
      data-over={isOver || undefined}
      className={cn("flex flex-col gap-1.5 rounded-xl transition-colors", className)}
    >
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <AnimatePresence initial={false}>
          {tasks.map((task) => (
            <motion.div key={task.id} {...rowMotion} className="shrink-0">
              <SortableTask task={task} container={container} />
            </motion.div>
          ))}
        </AnimatePresence>
      </SortableContext>
      {tasks.length === 0 && completed.length === 0 && empty}
      <AnimatePresence initial={false}>
        {completed.map((task) => (
          <motion.div key={task.id} {...rowMotion} className="shrink-0">
            <TaskRow
              task={task}
              now={now}
              selected={selectedId === task.id}
              onOpen={select}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
