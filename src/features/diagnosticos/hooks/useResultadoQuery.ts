import { useQuery } from "@tanstack/react-query";

import { diagnosticosQueryKeys } from "@/features/diagnosticos/hooks/diagnosticos.query-keys";
import { diagnosticosService } from "@/features/diagnosticos/services/diagnosticos.service";

/** `enabled` deve ser Boolean(id) && status === "CONCLUIDO" — não faz sentido buscar resultado de um diagnóstico ainda em andamento. */
export function useResultadoQuery(id: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: diagnosticosQueryKeys.resultado(id ?? ""),
    queryFn: () => diagnosticosService.getResultado(id!),
    enabled: Boolean(id) && enabled,
  });
}
