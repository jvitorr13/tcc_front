import { useMutation, useQueryClient } from "@tanstack/react-query";

import { planoAcaoQueryKeys } from "@/features/plano-acao/hooks/plano-acao.query-keys";
import { planoAcaoService } from "@/features/plano-acao/services/plano-acao.service";

export function useDeleteTarefaMutation(planoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tarefaId: string) => planoAcaoService.removeTarefa(planoId, tarefaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planoAcaoQueryKeys.all });
    },
  });
}
