import { useMutation, useQueryClient } from "@tanstack/react-query";

import { planoAcaoQueryKeys } from "@/features/plano-acao/hooks/plano-acao.query-keys";
import { planoAcaoService } from "@/features/plano-acao/services/plano-acao.service";
import type { CreateTarefaInput } from "@/features/plano-acao/types/plano-acao.types";

export function useCreateTarefaMutation(planoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTarefaInput) => planoAcaoService.createTarefa(planoId, input),
    // Invalida "all" (prefixo de list/detail) — cobre tanto o detalhe do
    // plano quanto a listagem (contagem de tarefas, se algum dia aparecer lá).
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planoAcaoQueryKeys.all });
    },
  });
}
