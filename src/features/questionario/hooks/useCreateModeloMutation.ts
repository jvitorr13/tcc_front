import { useMutation, useQueryClient } from "@tanstack/react-query";

import { modelosQueryKeys } from "@/features/questionario/hooks/questionario.query-keys";
import { modelosService } from "@/features/questionario/services/modelos.service";
import type { CreateModeloInput } from "@/features/questionario/types/modelo.types";

export function useCreateModeloMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateModeloInput) => modelosService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modelosQueryKeys.all });
    },
  });
}
