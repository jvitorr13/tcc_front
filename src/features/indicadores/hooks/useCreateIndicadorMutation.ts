import { useMutation, useQueryClient } from "@tanstack/react-query";

import { indicadoresQueryKeys } from "@/features/indicadores/hooks/indicadores.query-keys";
import { indicadoresService } from "@/features/indicadores/services/indicadores.service";
import type { CreateIndicadorInput } from "@/features/indicadores/types/indicador.types";

export function useCreateIndicadorMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateIndicadorInput) => indicadoresService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: indicadoresQueryKeys.all });
    },
  });
}
