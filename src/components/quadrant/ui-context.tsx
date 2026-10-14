"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import type { ContainerId } from "@/lib/types";

interface QuickAddState {
  open: boolean;
  container: ContainerId | null;
}

interface UIContextValue {
  now: Date;
  selectedId: string | null;
  select: (id: string | null) => void;
  quickAdd: QuickAddState;
  openQuickAdd: (container?: ContainerId | null) => void;
  closeQuickAdd: () => void;
  tagFilter: string | null;
  setTagFilter: (tag: string | null) => void;
  expanded: ContainerId | null;
  setExpanded: (id: ContainerId | null) => void;
}

const UIContext = createContext<UIContextValue | null>(null);

const SERVER_NOW = new Date(0);
let clockNow: Date | null = null;

function subscribeClock(onChange: () => void) {
  const id = setInterval(() => {
    clockNow = new Date();
    onChange();
  }, 30_000);
  return () => clearInterval(id);
}

/** Wall clock that is only read in the browser, so prerendering stays static. */
function useNow() {
  return useSyncExternalStore(
    subscribeClock,
    () => (clockNow ??= new Date()),
    () => SERVER_NOW,
  );
}

export function UIProvider({ children }: { children: React.ReactNode }) {
  const now = useNow();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [quickAdd, setQuickAdd] = useState<QuickAddState>({ open: false, container: null });
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<ContainerId | null>(null);

  const openQuickAdd = useCallback(
    (container: ContainerId | null = null) => setQuickAdd({ open: true, container }),
    [],
  );
  const closeQuickAdd = useCallback(() => setQuickAdd((s) => ({ ...s, open: false })), []);

  const value = useMemo(
    () => ({
      now,
      selectedId,
      select: setSelectedId,
      quickAdd,
      openQuickAdd,
      closeQuickAdd,
      tagFilter,
      setTagFilter,
      expanded,
      setExpanded,
    }),
    [now, selectedId, quickAdd, openQuickAdd, closeQuickAdd, tagFilter, expanded],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside UIProvider");
  return ctx;
}
