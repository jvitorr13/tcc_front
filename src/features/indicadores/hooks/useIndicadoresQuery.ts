import { useQueries } from "@tanstack/react-query";

import { combineListQueries } from "@/lib/combine-list-queries";

import { indicadoresQueryKeys } from "@/features/indicadores/hooks/indicadores.query-keys";
import { indicadoresService } from "@/features/indicadores/services/indicadores.service";
import type { Indicador } from "@/features/indicadores/types/indicador.types";

/**
 * GET /indicadores exige empresa_id — não existe "listar tudo" (mesma
 * situação de Diagnósticos/Planos de Ação). Sem uma empresa específica
 * escolhida, busca-se uma vez por empresa em paralelo e junta o resultado.
 */
export function useIndicadoresQuery(empresaIds: string[]) {
  return useQueries({
    queries: empresaIds.map((empresaId) => ({
      queryKey: indicadoresQueryKeys.list(empresaId),
      queryFn: () => indicadoresService.list(empresaId),
    })),
    combine: combineListQueries<Indicador>,
  });
}
