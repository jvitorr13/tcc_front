import { useQueries } from "@tanstack/react-query";

import { combineListQueries } from "@/lib/combine-list-queries";

import { diagnosticosQueryKeys } from "@/features/diagnosticos/hooks/diagnosticos.query-keys";
import { diagnosticosService } from "@/features/diagnosticos/services/diagnosticos.service";
import type { Diagnostico, DiagnosticoStatus } from "@/features/diagnosticos/types/diagnostico.types";

/**
 * O backend não tem "listar diagnósticos de todas as empresas" — GET
 * /diagnosticos exige empresa_id. Pra Tela de Diagnósticos mostrar todo
 * mundo junto (como no design), buscamos uma vez por empresa em paralelo
 * (useQueries) e juntamos o resultado. Quando o consultor filtra por uma
 * empresa específica, `empresaIds` chega com um item só — mesmo código,
 * uma chamada.
 */
export function useDiagnosticosQuery(empresaIds: string[], status?: DiagnosticoStatus) {
  return useQueries({
    queries: empresaIds.map((empresaId) => ({
      queryKey: diagnosticosQueryKeys.list(empresaId, status),
      queryFn: () => diagnosticosService.list(empresaId, status),
    })),
    combine: combineListQueries<Diagnostico>,
  });
}
