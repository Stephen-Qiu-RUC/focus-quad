"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { actions } from "@/lib/store";
import type { ContainerId, Task } from "@/lib/types";
import { TaskRow } from "./task-row";
import { useUI } from "./ui-context";

const CONTAINERS: ContainerId[] = ["inbox", "q1", "q2", "q3", "q4"];

function isContainer(id: unknown): id is ContainerId {
  return CONTAINERS.includes(id as ContainerId);
}

const collision: CollisionDetection = (args) => {
  const within = pointerWithin(args);
  if (within.length) {
    const task = within.find((c) => !isContainer(c.id));
    return task ? [task] : within;
  }
  return rectIntersection(args);
};

const lastPointer = { x: 0, y: 0 };

/**
 * Collision state only updates on pointer moves after activation, so a drag
 * that jumps straight to its target in one event would resolve to its origin.
 */
function containerAtPointer(): ContainerId | null {
  for (const el of document.elementsFromPoint(lastPointer.x, lastPointer.y)) {
    const zone = el.closest<HTMLElement>("[data-drop-container]");
    if (zone) {
      const id = zone.dataset.dropContainer;
      return isContainer(id) ? id : null;
    }
  }
  return null;
}

export function DndBoard({ tasks, children }: { tasks: Task[]; children: React.ReactNode }) {
  const { now } = useUI();
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    const track = (e: PointerEvent) => {
      lastPointer.x = e.clientX;
      lastPointer.y = e.clientY;
    };
    window.addEventListener("pointermove", track, true);
    window.addEventListener("pointerup", track, true);
    return () => {
      window.removeEventListener("pointermove", track, true);
      window.removeEventListener("pointerup", track, true);
    };
  }, []);

  const byId = new Map(tasks.map((t) => [t.id, t]));
  const active = activeId ? byId.get(activeId) ?? null : null;

  function containerOf(id: unknown): ContainerId | null {
    if (isContainer(id)) return id;
    return byId.get(String(id))?.container ?? null;
  }

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
    navigator.vibrate?.(8);
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const from = containerOf(active.id);
    const to = containerOf(over.id);
    if (!from || !to || from === to) return;
    if (isContainer(over.id)) {
      actions.moveTask(String(active.id), to);
      return;
    }
    const translated = active.rect.current.translated;
    const below = translated ? translated.top > over.rect.top + over.rect.height / 2 : false;
    actions.moveTask(String(active.id), to, String(over.id), below);
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    const dropped = event.activatorEvent instanceof KeyboardEvent ? null : containerAtPointer();
    if (dropped && dropped !== containerOf(active.id)) {
      actions.moveTask(String(active.id), dropped);
      return;
    }
    if (!over || active.id === over.id) return;
    const container = containerOf(over.id);
    if (!container) return;
    if (containerOf(active.id) !== container) {
      actions.moveTask(String(active.id), container, isContainer(over.id) ? null : String(over.id));
      return;
    }
    if (isContainer(over.id)) return;
    const list = tasks.filter((t) => t.container === container && !t.completed);
    const from = list.findIndex((t) => t.id === active.id);
    const to = list.findIndex((t) => t.id === over.id);
    if (from === -1 || to === -1) return;
    actions.moveTask(String(active.id), container, String(over.id), from < to);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collision}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
      accessibility={{
        screenReaderInstructions: {
          draggable: "按空格键拿起任务，用方向键移动，再按空格键放下，按 Esc 取消。",
        },
      }}
    >
      {children}
      <DragOverlay dropAnimation={{ duration: 220, easing: "cubic-bezier(0.32,0.72,0,1)" }}>
        {active ? <TaskRow task={active} now={now} lifted /> : null}
      </DragOverlay>
    </DndContext>
  );
}
