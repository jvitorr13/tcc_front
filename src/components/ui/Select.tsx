import { ChevronDown } from "lucide-react";
import { type SelectHTMLAttributes, forwardRef } from "react";

import { cn } from "@/utils/cn";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

/**
 * Select base do sistema — mesma altura/borda/foco do Input, para poder
 * conviver lado a lado em filtros e formulários sem quebrar o alinhamento.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "h-11 w-full appearance-none rounded-lg border border-ink-900/15 bg-white px-3.5 pr-9 text-sm text-ink-900",
          "transition-colors duration-150",
          "focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-500"
      />
    </div>
  );
});

Select.displayName = "Select";
