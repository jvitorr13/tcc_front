import { useMutation, useQueryClient } from "@tanstack/react-query";

import { indicadoresQueryKeys } from "@/features/indicadores/hooks/indicadores.query-keys";
import { indicadoresService } from "@/features/indicadores/services/indicadores.service";
import type { UpdateIndicadorInput } from "@/features/indicadores/types/indicador.types";

export function useUpdateIndicadorMutation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateIndicadorInput) => indicadoresService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: indicadoresQueryKeys.all });
    },
  });
}
