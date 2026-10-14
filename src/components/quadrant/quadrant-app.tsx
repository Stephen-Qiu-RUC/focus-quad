"use client";

import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { useStore, actions } from "@/lib/store";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { ContainerId } from "@/lib/types";
import { AppHeader } from "./app-header";
import { DndBoard } from "./dnd-board";
import { InboxSection, TagFilterList } from "./inbox-panel";
import { DesktopInspector, MobileInspector } from "./inspector";
import { MatrixGrid } from "./matrix-grid";
import { MobileMatrix } from "./mobile-matrix";
import { Notices } from "./notices";
import { QuickAdd } from "./quick-add";
import { deleteWithUndo } from "./task-actions";
import { UIProvider, useUI } from "./ui-context";

const DIGIT_TO_CONTAINER: Record<string, ContainerId> = {
  "0": "inbox",
  "1": "q1",
  "2": "q2",
  "3": "q3",
  "4": "q4",
};

function isTypingTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
}

function useShortcuts() {
  const { openQuickAdd, quickAdd, selectedId, select, expanded, setExpanded } = useUI();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openQuickAdd();
        return;
      }
      if (quickAdd.open || isTypingTarget(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (document.querySelector("[role=dialog][data-open], [role=menu]")) return;

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        openQuickAdd();
        return;
      }
      if (e.key === "Escape") {
        if (selectedId) select(null);
        else if (expanded) setExpanded(null);
        return;
      }
      if (!selectedId) return;
      const target = DIGIT_TO_CONTAINER[e.key];
      if (target) {
        e.preventDefault();
        actions.moveTask(selectedId, target);
        return;
      }
      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        deleteWithUndo(selectedId);
        select(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openQuickAdd, quickAdd.open, selectedId, select, expanded, setExpanded]);
}

function Skeleton() {
  return (
    <div className="flex h-dvh flex-col" aria-busy="true" aria-label="正在载入">
      <div className="material h-[52px] border-b" />
      <div className="flex flex-1 gap-4 p-4 lg:p-6">
        <div className="hidden w-[236px] flex-col gap-3 lg:flex">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-5 animate-pulse rounded-md bg-foreground/[0.06]" />
          ))}
        </div>
        <div className="grid flex-1 grid-cols-2 gap-3 md:gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-3 rounded-[20px] border bg-card p-4 shadow-card">
              <div className="h-4 w-24 animate-pulse rounded bg-foreground/[0.08]" />
              {[0, 1, 2].map((j) => (
                <div key={j} className="h-3.5 animate-pulse rounded bg-foreground/[0.05]" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AppBody() {
  const store = useStore();
  const { selectedId, select, setExpanded } = useUI();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isTablet = useMediaQuery("(min-width: 768px)");
  useShortcuts();

  const tasks = store?.tasks;
  const selected = tasks?.find((t) => t.id === selectedId) ?? null;

  useEffect(() => {
    if (tasks && selectedId && !tasks.some((t) => t.id === selectedId)) select(null);
  }, [tasks, selectedId, select]);

  useEffect(() => {
    if (isTablet) setExpanded(null);
  }, [isTablet, setExpanded]);

  if (!store || !tasks) return <Skeleton />;

  const notices = <Notices tasks={tasks} onboarded={store.onboarded} saveError={store.saveError} />;

  return (
    <DndBoard tasks={tasks}>
      <div className="flex h-dvh flex-col">
        <AppHeader showTagPill={!isDesktop} />
        {isDesktop ? (
          <div className="flex min-h-0 flex-1">
            <aside className="material flex w-[260px] shrink-0 flex-col gap-6 border-r px-2 py-4">
              <InboxSection tasks={tasks} className="flex-1" />
              <TagFilterList tasks={tasks} />
            </aside>
            <main className="scrollbar-thin flex min-w-0 flex-1 flex-col gap-4 overflow-auto p-5 xl:p-6">
              {notices}
              <MatrixGrid tasks={tasks} />
            </main>
            <DesktopInspector task={selected} />
          </div>
        ) : isTablet ? (
          <main className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-5">
            {notices}
            <div className="max-h-64 rounded-[20px] border bg-card px-2 pt-3 pb-1 shadow-card backdrop-blur-xl">
              <InboxSection tasks={tasks} className="h-full max-h-60" />
            </div>
            <MatrixGrid tasks={tasks} />
          </main>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <MobileMatrix tasks={tasks} notices={notices} />
          </div>
        )}
      </div>
      {!isDesktop && <MobileInspector task={selected} />}
      <QuickAdd />
    </DndBoard>
  );
}

export function QuadrantApp() {
  return (
    <MotionConfig reducedMotion="user">
      <UIProvider>
        <AppBody />
      </UIProvider>
    </MotionConfig>
  );
}
