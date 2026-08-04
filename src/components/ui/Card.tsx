import { type HTMLAttributes, forwardRef } from "react";

import { cn } from "@/utils/cn";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-ink-900/8 bg-surface shadow-[0_1px_2px_rgba(15,27,45,0.04),0_8px_24px_-8px_rgba(15,27,45,0.08)]",
          className,
        )}
        {...props}
      />
    );
  },
);

Card.displayName = "Card";
