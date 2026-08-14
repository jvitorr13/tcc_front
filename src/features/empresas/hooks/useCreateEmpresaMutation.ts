import { useMutation, useQueryClient } from "@tanstack/react-query";

import { empresasQueryKeys } from "@/features/empresas/hooks/empresas.query-keys";
import { empresasService } from "@/features/empresas/services/empresas.service";
import type { CreateEmpresaInput } from "@/features/empresas/types/empresa.types";

export function useCreateEmpresaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateEmpresaInput) => empresasService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: empresasQueryKeys.all });
    },
  });
}
