import { Minus, TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/utils/cn";
import { formatDecimal } from "@/utils/format";

import { formatDataEvolucao } from "@/features/evolucao/utils/format-data-evolucao";

export interface VariacaoBadgeProps {
  variacao: number | null;
  desde: string | null;
}

/**
 * null = "sem comparação ainda" (0 ou 1 diagnóstico concluído) — não
 * renderiza nada, diferente de 0 ("não mudou"), que aparece normalmente.
 * Nunca inferir/calcular a variação aqui, só formatar o que veio pronto.
 */
export function VariacaoBadge({ variacao, desde }: VariacaoBadgeProps) {
  if (variacao == null) return null;

  const isPositive = variacao > 0;
  const isNegative = variacao < 0;
  const sinal = isPositive ? "+" : "";
  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium",
        isPositive && "bg-success-50 text-success-600",
        isNegative && "bg-danger-50 text-danger-600",
        !isPositive && !isNegative && "bg-ink-900/6 text-ink-700",
      )}
    >
      <Icon size={15} />
      {sinal}
      {formatDecimal(variacao)} desde {formatDataEvolucao(desde)}
    </span>
  );
}
