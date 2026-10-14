"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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

function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
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
