import { useQueries } from "@tanstack/react-query";

import { diagnosticosQueryKeys } from "@/features/diagnosticos/hooks/diagnosticos.query-keys";
import { diagnosticosService } from "@/features/diagnosticos/services/diagnosticos.service";
import type { DiagnosticoStatus } from "@/features/diagnosticos/types/diagnostico.types";

/**
 * O backend não tem "listar diagnósticos de todas as empresas" — GET
 * /diagnosticos exige empresa_id. Pra Tela de Diagnósticos mostrar todo
 * mundo junto (como no design), buscamos uma vez por empresa em paralelo
 * (useQueries) e juntamos o resultado. Quando o consultor filtra por uma
 * empresa específica, `empresaIds` chega com um item só — mesmo código,
 * uma chamada.
 */
export function useDiagnosticosQuery(empresaIds: string[], status?: DiagnosticoStatus) {
  const results = useQueries({
    queries: empresaIds.map((empresaId) => ({
      queryKey: diagnosticosQueryKeys.list(empresaId, status),
      queryFn: () => diagnosticosService.list(empresaId, status),
    })),
  });

  const isLoading = results.some((result) => result.isLoading);
  const isError = results.some((result) => result.isError);
  const error = results.find((result) => result.isError)?.error;
  const data = results.every((result) => result.data !== undefined)
    ? results.flatMap((result) => result.data ?? [])
    : undefined;

  return { data, isLoading, isError, error };
}
