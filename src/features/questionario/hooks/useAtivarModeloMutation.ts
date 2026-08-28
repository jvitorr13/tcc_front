import { useMutation, useQueryClient } from "@tanstack/react-query";

import { modelosQueryKeys } from "@/features/questionario/hooks/questionario.query-keys";
import { modelosService } from "@/features/questionario/services/modelos.service";

export function useAtivarModeloMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => modelosService.ativar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modelosQueryKeys.all });
    },
  });
}
