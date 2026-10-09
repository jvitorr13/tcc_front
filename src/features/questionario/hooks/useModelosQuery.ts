import { useQuery } from "@tanstack/react-query";

import { modelosQueryKeys } from "@/features/questionario/hooks/questionario.query-keys";
import { modelosService } from "@/features/questionario/services/modelos.service";

/** Rotas /questionario/* são só CONSULTOR (EMPRESA leva 403) — `enabled` desliga nas telas compartilhadas. */
export function useModelosQuery({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: modelosQueryKeys.list(),
    queryFn: () => modelosService.list(),
    enabled,
  });
}
