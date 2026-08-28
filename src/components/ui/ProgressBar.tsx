import { cn } from "@/utils/cn";

export interface ProgressBarProps {
  /** 0-100 */
  value: number;
  label?: string;
  className?: string;
}

export function ProgressBar({ value, label, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-ink-900/8", className)}
    >
      <div className="h-full rounded-full bg-ink-900 transition-[width]" style={{ width: `${clamped}%` }} />
    </div>
  );
}
