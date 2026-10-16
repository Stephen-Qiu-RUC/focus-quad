"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlarmClock, HardDriveDownload, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { actions } from "@/lib/store";
import { needsEscalation } from "@/lib/dates";
import type { Task } from "@/lib/types";
import { useUI } from "./ui-context";

const noticeMotion = {
  initial: { opacity: 0, y: -8, height: 0 },
  animate: { opacity: 1, y: 0, height: "auto" },
  exit: { opacity: 0, y: -8, height: 0 },
  transition: { type: "spring", stiffness: 400, damping: 34 },
} as const;

function NoticeShell({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.div {...noticeMotion} className="overflow-hidden">
      <div className="material flex flex-col gap-3 rounded-2xl border px-4 py-3 shadow-card sm:flex-row sm:items-center">
        <div className="flex flex-1 items-start gap-3">
          {icon}
          {children}
        </div>
      </div>
    </motion.div>
  );
}

export function Notices({ tasks, onboarded, saveError }: { tasks: Task[]; onboarded: boolean; saveError: boolean }) {
  const { now } = useUI();
  const due = tasks.filter((t) => needsEscalation(t, now));
  const hasSamples = tasks.some((t) => t.sample);

  return (
    <div className="flex flex-col gap-3 empty:hidden">
      <AnimatePresence initial={false}>
        {saveError && (
          <NoticeShell
            key="save"
            icon={<HardDriveDownload className="mt-0.5 size-5 shrink-0 text-q1" aria-hidden />}
          >
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
              <p className="flex-1 text-[15px]">
                <span className="font-medium">无法保存到本地。</span>
                <span className="text-muted-foreground">浏览器存储可能已满或被禁用，刷新前请先导出数据。</span>
              </p>
              <Button size="sm" variant="secondary" onClick={() => actions.retrySave()}>
                重试
              </Button>
            </div>
          </NoticeShell>
        )}

        {!onboarded && (
          <NoticeShell
            key="onboarding"
            icon={<Sparkles className="mt-0.5 size-5 shrink-0 text-q2" aria-hidden />}
          >
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
              <p className="flex-1 text-[15px] leading-5">
                <span className="font-medium">欢迎使用四象。</span>
                <span className="text-muted-foreground">
                  把收集箱里的任务拖进象限：上排重要，左列紧急。每天都要做的事放在「长期任务」里打卡。按 ⌘K 或 N 可随时记下新任务。
                </span>
              </p>
              <div className="flex shrink-0 gap-2">
                {hasSamples && (
                  <Button size="sm" variant="ghost" onClick={() => actions.removeSamples()}>
                    清空示例
                  </Button>
                )}
                <Button size="sm" onClick={() => actions.finishOnboarding()}>
                  知道了
                </Button>
              </div>
            </div>
          </NoticeShell>
        )}

        {due.length > 0 && (
          <NoticeShell
            key="escalation"
            icon={
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center">
                <AlarmClock className="size-5 text-q1" aria-hidden />
              </span>
            }
          >
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
              <p className="flex-1 text-[15px] leading-5">
                <span className="font-medium">
                  {due.length} 项「安排时间」的任务将在 24 小时内到期。
                </span>
                <span className="text-muted-foreground"> 它们已经变得紧急了。</span>
              </p>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" variant="ghost" onClick={() => actions.dismissEscalation(due.map((t) => t.id))}>
                  忽略
                </Button>
                <Button
                  size="sm"
                  className="bg-q1 text-white hover:bg-q1/85"
                  onClick={() => actions.escalate(due.map((t) => t.id))}
                >
                  全部移到立即去做
                </Button>
              </div>
            </div>
          </NoticeShell>
        )}
      </AnimatePresence>
    </div>
  );
}
