import { useQuery } from "@tanstack/react-query";

import { indicadoresQueryKeys } from "@/features/indicadores/hooks/indicadores.query-keys";
import { indicadoresService } from "@/features/indicadores/services/indicadores.service";

export function useIndicadorValoresQuery(indicadorId: string | undefined) {
  return useQuery({
    queryKey: indicadoresQueryKeys.valores(indicadorId ?? ""),
    queryFn: () => indicadoresService.getValores(indicadorId!),
    enabled: Boolean(indicadorId),
  });
}
