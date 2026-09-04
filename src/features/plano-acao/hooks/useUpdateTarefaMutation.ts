import { useMutation, useQueryClient } from "@tanstack/react-query";

import { planoAcaoQueryKeys } from "@/features/plano-acao/hooks/plano-acao.query-keys";
import { planoAcaoService } from "@/features/plano-acao/services/plano-acao.service";
import type { UpdateTarefaInput } from "@/features/plano-acao/types/plano-acao.types";

export function useUpdateTarefaMutation(planoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tarefaId, input }: { tarefaId: string; input: UpdateTarefaInput }) =>
      planoAcaoService.updateTarefa(planoId, tarefaId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planoAcaoQueryKeys.all });
    },
  });
}
