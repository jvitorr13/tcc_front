import { useMutation, useQueryClient } from "@tanstack/react-query";

import { modelosQueryKeys } from "@/features/questionario/hooks/questionario.query-keys";
import { modelosService } from "@/features/questionario/services/modelos.service";
import type { CreateVersaoInput } from "@/features/questionario/types/modelo.types";

export function useCreateVersaoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ modeloId, input }: { modeloId: string; input: CreateVersaoInput }) =>
      modelosService.createVersao(modeloId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modelosQueryKeys.all });
    },
  });
}
