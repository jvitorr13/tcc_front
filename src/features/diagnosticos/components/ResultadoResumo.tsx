import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatDecimal } from "@/utils/format";

import type { ResultadoDiagnostico } from "@/features/diagnosticos/types/diagnostico.types";

export interface ResultadoResumoProps {
  resultado: ResultadoDiagnostico;
}

/**
 * Assumido: a média por área usa a mesma escala 1-5 do resto do sistema
 * (ResultadoPorArea não carrega escala_min/max) — só afeta o comprimento
 * visual da barra, o número exibido continua vindo direto do back-end.
 */
const ESCALA_MAX_ASSUMIDA = 5;

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
        <h2 className="font-display text-lg text-ink-900">Resultado por área</h2>
        <div className="mt-4 space-y-4">
          {resultado.areas.map((area) => (
            <div key={area.area_id}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-700">{area.area_nome}</span>
                <span className="font-medium text-ink-900">{formatDecimal(area.media)}</span>
              </div>
              <ProgressBar value={(area.media / ESCALA_MAX_ASSUMIDA) * 100} className="mt-1.5" label={area.area_nome} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
