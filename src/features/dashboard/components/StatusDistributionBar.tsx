import { cn } from "@/utils/cn";

import type { StatusDistribuicao } from "@/features/dashboard/types/dashboard.types";

export interface StatusDistributionBarProps {
  distribuicao: StatusDistribuicao;
  total: number;
}

const SEGMENTS = [
  { key: "concluida", label: "Concluída", barClassName: "bg-success-500", dotClassName: "bg-success-500" },
  { key: "em_andamento", label: "Em andamento", barClassName: "bg-gold-500", dotClassName: "bg-gold-500" },
  { key: "pendente", label: "Pendente", barClassName: "bg-ink-900/25", dotClassName: "bg-ink-900/25" },
] as const;

/**
 * Barra empilhada com 3 divs lado a lado, cada uma com width proporcional à
 * contagem do status sobre o total — sem lib de gráfico. As contagens vêm
 * de distribuicao_por_status (back-end); só o cálculo de largura em % é
 * feito aqui, é puramente visual.
 */
export function StatusDistributionBar({ distribuicao, total }: StatusDistributionBarProps) {
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-ink-900/5">
        {SEGMENTS.map((segment) => {
          const value = distribuicao[segment.key];
          const width = total > 0 ? (value / total) * 100 : 0;
          return (
            <div
              key={segment.key}
              className={cn("h-full", segment.barClassName)}
              style={{ width: `${width}%` }}
              title={`${segment.label}: ${value}`}
            />
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-ink-600">
        {SEGMENTS.map((segment) => (
          <span key={segment.key} className="flex items-center gap-1.5">
            <span className={cn("size-2 rounded-full", segment.dotClassName)} />
            {segment.label}: {distribuicao[segment.key]}
          </span>
        ))}
      </div>
    </div>
  );
}
