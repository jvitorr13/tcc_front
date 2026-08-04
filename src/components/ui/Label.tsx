import { type LabelHTMLAttributes, forwardRef } from "react";

import { cn } from "@/utils/cn";

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn("mb-1.5 block text-sm font-medium text-ink-800", className)}
        {...props}
      />
    );
  },
);

Label.displayName = "Label";
