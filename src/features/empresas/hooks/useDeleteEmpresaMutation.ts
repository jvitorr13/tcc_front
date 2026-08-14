import { useMutation, useQueryClient } from "@tanstack/react-query";

import { empresasQueryKeys } from "@/features/empresas/hooks/empresas.query-keys";
import { empresasService } from "@/features/empresas/services/empresas.service";

export function useDeleteEmpresaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => empresasService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: empresasQueryKeys.all });
    },
  });
}
