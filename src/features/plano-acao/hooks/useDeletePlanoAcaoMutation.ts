import { useMutation, useQueryClient } from "@tanstack/react-query";

import { planoAcaoQueryKeys } from "@/features/plano-acao/hooks/plano-acao.query-keys";
import { planoAcaoService } from "@/features/plano-acao/services/plano-acao.service";

export function useDeletePlanoAcaoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => planoAcaoService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planoAcaoQueryKeys.all });
    },
  });
}
