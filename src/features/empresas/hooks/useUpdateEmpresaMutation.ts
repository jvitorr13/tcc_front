import { useMutation, useQueryClient } from "@tanstack/react-query";

import { empresasQueryKeys } from "@/features/empresas/hooks/empresas.query-keys";
import { empresasService } from "@/features/empresas/services/empresas.service";
import type { UpdateEmpresaInput } from "@/features/empresas/types/empresa.types";

interface UpdateEmpresaVariables {
  id: string;
  input: UpdateEmpresaInput;
}

export function useUpdateEmpresaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: UpdateEmpresaVariables) => empresasService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: empresasQueryKeys.all });
    },
  });
}
