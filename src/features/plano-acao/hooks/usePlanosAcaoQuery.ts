import { useQueries } from "@tanstack/react-query";

import { combineListQueries } from "@/lib/combine-list-queries";

import { planoAcaoQueryKeys } from "@/features/plano-acao/hooks/plano-acao.query-keys";
import { planoAcaoService } from "@/features/plano-acao/services/plano-acao.service";
import type { PlanoAcao, PlanosAcaoFilters } from "@/features/plano-acao/types/plano-acao.types";

/**
 * GET /planos-acao exige empresa_id OU diagnostico_id — não existe "listar
 * tudo" (confirmado: 400 "informe empresa_id ou diagnostico_id" sem
 * nenhum dos dois). Mesma situação de GET /diagnosticos (ver
 * useDiagnosticosQuery): quando a tela não tem um filtro específico
 * escolhido, quem chama monta um filtro por empresa e a gente busca em
 * paralelo (useQueries) e junta o resultado.
 */
export function usePlanosAcaoQuery(filterSets: PlanosAcaoFilters[]) {
  return useQueries({
    queries: filterSets.map((filters) => ({
      queryKey: planoAcaoQueryKeys.list(filters),
      queryFn: () => planoAcaoService.list(filters),
    })),
    combine: combineListQueries<PlanoAcao>,
  });
}
