import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatDecimal } from "@/utils/format";

import type { ResultadoDiagnostico } from "@/features/diagnosticos/types/diagnostico.types";

export interface ResultadoResumoProps {
  resultado: ResultadoDiagnostico;
}

/**
 * Só exibe o que o back-end calculou (média geral, nível de maturidade,
 * média por área) — nenhuma conta é feita no front, como pedido no fluxo.
 */
export function ResultadoResumo({ resultado }: ResultadoResumoProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Média geral</p>
          <p className="mt-2 font-display text-3xl text-ink-900">{formatDecimal(resultado.media_geral)}</p>
        </Card>

        <Card className="p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Nível de maturidade</p>
          <p className="mt-3">
            <Badge variant="gold" className="text-sm">
              {resultado.nivel_maturidade}
            </Badge>
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="font-display text-lg text-ink-900">Por área</h2>
        <dl className="mt-3 divide-y divide-ink-900/6">
          {resultado.por_area.map((area) => (
            <div key={area.area_id} className="flex items-center justify-between py-2.5 text-sm">
              <dt className="text-ink-700">{area.area_nome}</dt>
              <dd className="font-medium text-ink-900">{formatDecimal(area.media)}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
