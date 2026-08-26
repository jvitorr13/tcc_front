import { useQuery } from "@tanstack/react-query";

import { diagnosticosQueryKeys } from "@/features/diagnosticos/hooks/diagnosticos.query-keys";
import { diagnosticosService } from "@/features/diagnosticos/services/diagnosticos.service";

export function usePendenciasQuery(diagnosticoId: string | undefined) {
  return useQuery({
    queryKey: diagnosticosQueryKeys.pendencias(diagnosticoId ?? ""),
    queryFn: () => diagnosticosService.getPendencias(diagnosticoId!),
    enabled: Boolean(diagnosticoId),
  });
}
