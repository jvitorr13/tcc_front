import { type ButtonHTMLAttributes, forwardRef } from "react";

import { Spinner } from "@/components/feedback/Spinner";
import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-950 disabled:bg-ink-900/50",
  secondary:
    "bg-canvas text-ink-900 border border-ink-900/10 hover:bg-ink-900/5",
  ghost: "bg-transparent text-ink-700 hover:bg-ink-900/5",
  danger: "bg-danger-600 text-white hover:bg-danger-500",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
};

/**
 * Botão base do sistema. Toda ação primária/secundária do app deve usar
 * este componente em vez de <button> cru, para manter estados de foco,
 * disabled e loading consistentes em todas as telas.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium",
          "transition-colors duration-150",
          "disabled:cursor-not-allowed disabled:opacity-70",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className,
        )}
        {...props}
      >
        {isLoading && <Spinner size="sm" className="text-current" />}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
