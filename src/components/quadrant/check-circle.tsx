"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CheckCircleProps {
  checked: boolean;
  color: string;
  onToggle: () => void;
  label: string;
  className?: string;
}

export function CheckCircle({ checked, color, onToggle, label, className }: CheckCircleProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        "relative grid size-[22px] shrink-0 place-items-center rounded-full outline-none transition-transform active:scale-90 focus-visible:ring-3 focus-visible:ring-ring/40",
        className,
      )}
      style={{ ["--c" as string]: color }}
    >
      <motion.span
        className="absolute inset-0 rounded-full border-[1.5px]"
        initial={false}
        animate={{
          backgroundColor: checked ? color : "rgba(0,0,0,0)",
          borderColor: color,
          scale: checked ? [1, 1.12, 1] : 1,
        }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      />
      <svg viewBox="0 0 24 24" className="relative size-3.5 text-white" fill="none">
        <motion.path
          d="M5 12.5l4.5 4.5L19 7.5"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ duration: 0.25, delay: checked ? 0.08 : 0 }}
        />
      </svg>
    </button>
  );
}
