import { useMutation, useQueryClient } from "@tanstack/react-query";

import { indicadoresQueryKeys } from "@/features/indicadores/hooks/indicadores.query-keys";
import { indicadoresService } from "@/features/indicadores/services/indicadores.service";

export function useDeleteIndicadorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => indicadoresService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: indicadoresQueryKeys.all });
    },
  });
}
