import { type TextareaHTMLAttributes, forwardRef } from "react";

import { cn } from "@/utils/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

/**
 * Mesmo padrão visual do Input, para campos de texto longo (ex: descrição
 * de um diagnóstico). `hasError` só controla o estilo, igual ao Input.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, hasError, rows = 3, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink-900",
          "placeholder:text-ink-500/60",
          "transition-colors duration-150",
          "focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500",
          hasError ? "border-danger-500 focus:ring-danger-500/30 focus:border-danger-500" : "border-ink-900/15",
          "disabled:bg-canvas disabled:cursor-not-allowed",
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
