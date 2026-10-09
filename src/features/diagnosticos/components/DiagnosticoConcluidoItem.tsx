import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import { diagnosticoDetalhePath } from "@/constants/routes";
import { formatDate, formatDecimal } from "@/utils/format";

import { MaturidadeBadge } from "@/features/evolucao/components/MaturidadeBadge";

import { useResultadoQuery } from "@/features/diagnosticos/hooks/useResultadoQuery";
import type { Diagnostico } from "@/features/diagnosticos/types/diagnostico.types";

export interface DiagnosticoConcluidoItemProps {
  diagnostico: Diagnostico;
}

/**
 * Linha de um diagnóstico CONCLUIDO no histórico da EMPRESA. A listagem não
 * traz o resultado, então cada linha busca o seu (GET /resultado — mesma
 * query da tela de detalhe, já fica em cache ao clicar). 404 = finalizado
 * mas ainda sem cálculo: mostra "Resultado pendente" e a tela de detalhe
 * oferece o botão de calcular.
 */
export function DiagnosticoConcluidoItem({ diagnostico }: DiagnosticoConcluidoItemProps) {
  const { data: resultado, isLoading, isError } = useResultadoQuery(diagnostico.id, true);

  return (
    <li className="flex flex-wrap items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="font-medium text-ink-900">{diagnostico.nome}</p>
        <p className="mt-0.5 text-sm text-ink-500">Concluído em {formatDate(diagnostico.data_conclusao)}</p>
      </div>

      <div className="flex items-center gap-4">
        {isLoading && <span className="text-sm text-ink-500">Carregando…</span>}
        {isError && <span className="text-sm text-ink-500">Resultado pendente</span>}
        {resultado && (
          <>
            <span className="font-display text-2xl tabular-nums text-ink-900">
              {formatDecimal(resultado.media_geral)}
            </span>
            <MaturidadeBadge nivel={resultado.nivel_maturidade} />
          </>
        )}

        <Link
          to={diagnosticoDetalhePath(diagnostico.id, diagnostico.empresa_id)}
          className="inline-flex items-center gap-1 text-sm font-medium text-ink-700 transition-colors hover:text-ink-900"
        >
          {isError ? "Ver diagnóstico" : "Ver resultado"}
          <ChevronRight size={15} />
        </Link>
      </div>
    </li>
  );
}
