import { useQuery } from "@tanstack/react-query";

import { diagnosticosQueryKeys } from "@/features/diagnosticos/hooks/diagnosticos.query-keys";
import { diagnosticosService } from "@/features/diagnosticos/services/diagnosticos.service";

export function useRespostasQuery(diagnosticoId: string | undefined) {
  return useQuery({
    queryKey: diagnosticosQueryKeys.respostas(diagnosticoId ?? ""),
    queryFn: () => diagnosticosService.getRespostas(diagnosticoId!),
    enabled: Boolean(diagnosticoId),
  });
}
