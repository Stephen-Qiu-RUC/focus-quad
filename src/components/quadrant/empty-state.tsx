import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  body: string;
  color: string;
  compact?: boolean;
}

export function EmptyState({ title, body, color, compact }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center",
        compact ? "py-4" : "py-8",
      )}
    >
      <svg viewBox="0 0 48 48" className={cn(compact ? "size-8" : "size-10")} fill="none" aria-hidden>
        <circle cx="24" cy="24" r="17" stroke={color} strokeOpacity="0.35" strokeWidth="1.5" />
        <path
          d="M16.5 24.5l5 5 10-11"
          stroke={color}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div>
        <p className="text-[15px] font-medium">{title}</p>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
