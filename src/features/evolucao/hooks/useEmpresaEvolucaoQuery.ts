import { useQuery } from "@tanstack/react-query";

import { evolucaoQueryKeys } from "@/features/evolucao/hooks/evolucao.query-keys";
import { evolucaoService } from "@/features/evolucao/services/evolucao.service";

export function useEmpresaEvolucaoQuery(empresaId: string | undefined) {
  return useQuery({
    queryKey: evolucaoQueryKeys.empresa(empresaId ?? ""),
    queryFn: () => evolucaoService.getEmpresaEvolucao(empresaId!),
    enabled: Boolean(empresaId),
  });
}
