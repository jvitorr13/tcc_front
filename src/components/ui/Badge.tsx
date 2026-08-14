import type { HTMLAttributes } from "react";

import { cn } from "@/utils/cn";

type BadgeVariant = "success" | "neutral" | "gold" | "danger";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  success: "bg-success-50 text-success-600",
  neutral: "bg-ink-900/6 text-ink-700",
  gold: "bg-gold-100 text-gold-600",
  danger: "bg-danger-50 text-danger-600",
};

/**
 * Selo curto para status/categoria (ex: "Ativo", "Consultor"), usado em
 * tabelas e listas. Cada variante mapeia para um par bg/texto já definido
 * no design system — nenhum componente deve escrever essas cores na mão.
 */
export function Badge({ variant = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    />
  );
}
