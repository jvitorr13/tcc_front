import { useQuery } from "@tanstack/react-query";

import { empresasQueryKeys } from "@/features/empresas/hooks/empresas.query-keys";
import { empresasService } from "@/features/empresas/services/empresas.service";

export function useEmpresasQuery() {
  return useQuery({
    queryKey: empresasQueryKeys.list(),
    queryFn: () => empresasService.list(),
  });
}
