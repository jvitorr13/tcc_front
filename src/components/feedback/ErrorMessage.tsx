import { AlertCircle } from "lucide-react";

import { cn } from "@/utils/cn";

export interface ErrorMessageProps {
  children?: string | null;
  className?: string;
}

/**
 * Mensagem de erro inline — usada abaixo de campos de formulário (erro de
 * validação) e em banners de erro de requisição. Não renderiza nada se
 * `children` for vazio, para poder ser usada incondicionalmente em JSX:
 * <ErrorMessage>{errors.email?.message}</ErrorMessage>
 */
export function ErrorMessage({ children, className }: ErrorMessageProps) {
  if (!children) return null;

  return (
    <p
      role="alert"
      className={cn("mt-1.5 flex items-center gap-1.5 text-sm text-danger-600", className)}
    >
      <AlertCircle size={14} className="shrink-0" />
      <span>{children}</span>
    </p>
  );
}
