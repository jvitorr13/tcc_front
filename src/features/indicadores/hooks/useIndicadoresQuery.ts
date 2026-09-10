import { useQueries } from "@tanstack/react-query";

import { indicadoresQueryKeys } from "@/features/indicadores/hooks/indicadores.query-keys";
import { indicadoresService } from "@/features/indicadores/services/indicadores.service";

/**
 * GET /indicadores exige empresa_id — não existe "listar tudo" (mesma
 * situação de Diagnósticos/Planos de Ação). Sem uma empresa específica
 * escolhida, busca-se uma vez por empresa em paralelo e junta o resultado.
 */
export function useIndicadoresQuery(empresaIds: string[]) {
  const results = useQueries({
    queries: empresaIds.map((empresaId) => ({
      queryKey: indicadoresQueryKeys.list(empresaId),
      queryFn: () => indicadoresService.list(empresaId),
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
