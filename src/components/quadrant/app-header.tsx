"use client";

import { useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Download, Hash, Monitor, Moon, MoreHorizontal, Plus, Sun, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { actions } from "@/lib/store";
import { formatToday, toDateInputValue } from "@/lib/dates";
import { Logo } from "./logo";
import { useUI } from "./ui-context";

function ThemeIcon({ theme }: { theme: string | undefined }) {
  if (theme === "light") return <Sun />;
  if (theme === "dark") return <Moon />;
  return <Monitor />;
}

export function AppHeader({ showTagPill }: { showTagPill: boolean }) {
  const { now, openQuickAdd, tagFilter, setTagFilter } = useUI();
  const { theme, setTheme } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  function exportData() {
    const blob = new Blob([actions.exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `四象-${toDateInputValue(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("已导出数据");
  }

  async function importFile(file: File) {
    try {
      actions.importData(await file.text());
      toast.success("导入成功");
    } catch (err) {
      toast.error("导入失败", {
        description: err instanceof Error && err.message === "文件格式不正确" ? err.message : "无法读取这个文件。",
      });
    }
  }

  return (
    <header className="material sticky top-0 z-30 flex h-[52px] shrink-0 items-center gap-2 border-b px-4 lg:px-5">
      <Logo className="size-[22px]" />
      <span className="text-[17px] font-semibold tracking-tight">四象</span>
      <span className="ml-2 hidden text-[13px] text-muted-foreground sm:inline">{formatToday(now)}</span>

      <div className="flex-1" />

      {showTagPill && tagFilter && (
        <button
          type="button"
          onClick={() => setTagFilter(null)}
          className="inline-flex h-7 items-center gap-1 rounded-full bg-primary px-2.5 text-[13px] font-medium text-primary-foreground"
        >
          <Hash className="size-3" aria-hidden />
          {tagFilter}
          <X className="size-3" aria-label="清除筛选" />
        </button>
      )}

      <Button onClick={() => openQuickAdd()} className="hidden h-8 rounded-full px-3 sm:inline-flex">
        <Plus data-icon="inline-start" />
        新任务
        <kbd className="ml-1 rounded bg-white/20 px-1 text-[11px] font-medium">⌘K</kbd>
      </Button>

      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger
            render={
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon" aria-label="外观" className="rounded-full" />}
              />
            }
          >
            <ThemeIcon theme={theme} />
          </TooltipTrigger>
          <TooltipContent>外观</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuRadioGroup value={theme ?? "system"} onValueChange={(v) => setTheme(String(v))}>
            <DropdownMenuRadioItem value="system">
              <Monitor />
              跟随系统
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="light">
              <Sun />
              浅色
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">
              <Moon />
              深色
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon" aria-label="更多" className="rounded-full" />}
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuGroup>
            <DropdownMenuLabel>数据只保存在这台设备的浏览器中</DropdownMenuLabel>
            <DropdownMenuItem onClick={exportData}>
              <Download />
              导出为 JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => fileRef.current?.click()}>
              <Upload />
              从 JSON 导入…
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setConfirmReset(true)}>
            <Trash2 />
            清空所有任务…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) importFile(file);
          e.target.value = "";
        }}
      />

      <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
        <DialogContent className="rounded-[20px]">
          <DialogHeader>
            <DialogTitle>清空所有任务？</DialogTitle>
            <DialogDescription>
              所有象限和收集箱里的任务都会被删除，且无法撤销。建议先导出一份备份。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>取消</DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                actions.resetAll();
                setConfirmReset(false);
                toast("已清空所有任务");
              }}
            >
              清空
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
