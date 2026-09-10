import { useQuery } from "@tanstack/react-query";

import { indicadoresQueryKeys } from "@/features/indicadores/hooks/indicadores.query-keys";
import { indicadoresService } from "@/features/indicadores/services/indicadores.service";

export function useIndicadorQuery(id: string | undefined) {
  return useQuery({
    queryKey: indicadoresQueryKeys.detail(id ?? ""),
    queryFn: () => indicadoresService.getById(id!),
    enabled: Boolean(id),
  });
}
