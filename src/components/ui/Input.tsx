import { type InputHTMLAttributes, forwardRef } from "react";

import { cn } from "@/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

/**
 * Input base do sistema. `hasError` só controla o estilo (borda/foco); a
 * mensagem de erro em si é responsabilidade do componente ErrorMessage,
 * renderizado ao lado pelo componente de formulário que usa este Input.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-ink-900",
          "placeholder:text-ink-500/60",
          "transition-colors duration-150",
          "focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500",
          hasError
            ? "border-danger-500 focus:ring-danger-500/30 focus:border-danger-500"
            : "border-ink-900/15",
          "disabled:bg-canvas disabled:cursor-not-allowed",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
