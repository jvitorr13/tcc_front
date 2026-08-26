import { useQuery } from "@tanstack/react-query";

import { diagnosticosQueryKeys } from "@/features/diagnosticos/hooks/diagnosticos.query-keys";
import { diagnosticosService } from "@/features/diagnosticos/services/diagnosticos.service";

export function usePerguntasQuery(diagnosticoId: string | undefined) {
  return useQuery({
    queryKey: diagnosticosQueryKeys.perguntas(diagnosticoId ?? ""),
    queryFn: () => diagnosticosService.getPerguntas(diagnosticoId!),
    enabled: Boolean(diagnosticoId),
  });
}
