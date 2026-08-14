import { useQuery } from "@tanstack/react-query";

import { empresasQueryKeys } from "@/features/empresas/hooks/empresas.query-keys";
import { empresasService } from "@/features/empresas/services/empresas.service";

export function useEmpresaQuery(id: string | undefined) {
  return useQuery({
    queryKey: empresasQueryKeys.detail(id ?? ""),
    queryFn: () => empresasService.getById(id!),
    enabled: Boolean(id),
  });
}
