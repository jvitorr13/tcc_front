import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina classes condicionais (clsx) e resolve conflitos do Tailwind
 * (tailwind-merge) — ex: cn("px-2", condition && "px-4") sempre resulta em
 * só uma classe de padding-x, a última vence. Usado por todo componente em
 * components/ui para aceitar um prop `className` de override com segurança.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
