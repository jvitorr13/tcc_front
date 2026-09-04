import { useQuery } from "@tanstack/react-query";

import { planoAcaoQueryKeys } from "@/features/plano-acao/hooks/plano-acao.query-keys";
import { planoAcaoService } from "@/features/plano-acao/services/plano-acao.service";

export function usePlanoAcaoQuery(id: string | undefined) {
  return useQuery({
    queryKey: planoAcaoQueryKeys.detail(id ?? ""),
    queryFn: () => planoAcaoService.getById(id!),
    enabled: Boolean(id),
  });
}
