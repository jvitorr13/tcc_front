import { CheckCircle2 } from "lucide-react";

import { cn } from "@/utils/cn";

export interface SuccessMessageProps {
  children?: string | null;
  className?: string;
}

/**
 * Banner de sucesso — mesma linguagem visual do banner de erro (ver
 * ErrorMessage), usado quando uma ação foi concluída fora da tela atual
 * (ex: cadastro concluído, redirecionado para o login).
 */
export function SuccessMessage({ children, className }: SuccessMessageProps) {
  if (!children) return null;

  return (
    <div
      role="status"
      className={cn(
        "flex items-center gap-2 rounded-lg border border-success-500/20 bg-success-50 px-3.5 py-2.5 text-sm text-success-600",
        className,
      )}
    >
      <CheckCircle2 size={16} className="shrink-0" />
      <span>{children}</span>
    </div>
  );
}
