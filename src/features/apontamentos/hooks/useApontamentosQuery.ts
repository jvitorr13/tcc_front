import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { apontamentosQueryKeys } from "@/features/apontamentos/hooks/apontamentos.query-keys";
import { apontamentosService } from "@/features/apontamentos/services/apontamentos.service";
import type { ApontamentosFilters } from "@/features/apontamentos/types/apontamento.types";

/** Paginada no servidor: mantém a página anterior na tela enquanto a próxima carrega. */
export function useApontamentosQuery(empresaId: string | undefined, filters: ApontamentosFilters) {
  return useQuery({
    queryKey: apontamentosQueryKeys.list(empresaId ?? "", filters),
    queryFn: () => apontamentosService.list(empresaId!, filters),
    enabled: Boolean(empresaId),
    placeholderData: keepPreviousData,
  });
}
