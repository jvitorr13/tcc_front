import { Loader2 } from "lucide-react";

import { cn } from "@/utils/cn";

const SIZE_PX: Record<"sm" | "md" | "lg", number> = {
  sm: 14,
  md: 20,
  lg: 28,
};

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <Loader2
      size={SIZE_PX[size]}
      className={cn("animate-spin", className)}
      aria-hidden="true"
    />
  );
}
