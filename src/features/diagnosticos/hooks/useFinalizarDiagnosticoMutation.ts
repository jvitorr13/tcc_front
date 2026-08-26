import { useMutation } from "@tanstack/react-query";

import { diagnosticosService } from "@/features/diagnosticos/services/diagnosticos.service";

export function useFinalizarDiagnosticoMutation() {
  return useMutation({
    mutationFn: (id: string) => diagnosticosService.finalizar(id),
  });
}
