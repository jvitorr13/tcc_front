import { AlertTriangle, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { indicadorDetalhePath } from "@/constants/routes";
import { formatDecimal } from "@/utils/format";

import { PERIODICIDADE_LABELS, SITUACAO_LABELS, SITUACAO_VARIANTS } from "@/features/indicadores/constants/labels";
import type { Indicador } from "@/features/indicadores/types/indicador.types";

export interface IndicadorCardProps {
  indicador: Indicador;
  empresaNome?: string;
}

/** Um indicador por card na listagem — situação/valores só exibidos, nunca calculados aqui. */
export function IndicadorCard({ indicador, empresaNome }: IndicadorCardProps) {
  return (
    <Card className="flex flex-col p-5">
      <p className="text-sm font-medium text-ink-900">{indicador.nome}</p>
      {empresaNome && <p className="mt-0.5 text-xs text-ink-500">{empresaNome}</p>}

      <p className="mt-3 font-display text-2xl text-ink-900">
        {indicador.valor_atual != null ? `${indicador.unidade} ${formatDecimal(indicador.valor_atual)}` : "—"}
      </p>
      <p className="mt-0.5 text-sm text-ink-600">
        Meta: {indicador.meta != null ? `${indicador.unidade} ${formatDecimal(indicador.meta)}` : "—"}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant={SITUACAO_VARIANTS[indicador.situacao]} className="gap-1">
          {indicador.situacao === "ABAIXO_DA_META" && <AlertTriangle size={11} />}
          {SITUACAO_LABELS[indicador.situacao]}
        </Badge>
      </div>
      <p className="mt-2 text-xs text-ink-500">Periodicidade: {PERIODICIDADE_LABELS[indicador.periodicidade]}</p>

      <Link
        to={indicadorDetalhePath(indicador.id)}
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-ink-700 transition-colors hover:text-ink-900"
      >
        Ver detalhes
        <ChevronRight size={15} />
      </Link>
    </Card>
  );
}
