export type QuadrantId = "q1" | "q2" | "q3" | "q4";
export type ContainerId = "inbox" | QuadrantId;

export interface Task {
  id: string;
  title: string;
  notes: string;
  container: ContainerId;
  /** ISO timestamp. */
  due: string | null;
  /** When false, `due` only carries a calendar day. */
  dueHasTime: boolean;
  tags: string[];
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  escalationDismissed: boolean;
  sample?: boolean;
}

export interface PersistedState {
  version: 1;
  tasks: Task[];
  onboarded: boolean;
}
