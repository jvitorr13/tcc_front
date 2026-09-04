import { useMutation, useQueryClient } from "@tanstack/react-query";

import { planoAcaoQueryKeys } from "@/features/plano-acao/hooks/plano-acao.query-keys";
import { planoAcaoService } from "@/features/plano-acao/services/plano-acao.service";
import type { CreatePlanoAcaoInput } from "@/features/plano-acao/types/plano-acao.types";

export function useCreatePlanoAcaoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePlanoAcaoInput) => planoAcaoService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planoAcaoQueryKeys.all });
    },
  });
}
