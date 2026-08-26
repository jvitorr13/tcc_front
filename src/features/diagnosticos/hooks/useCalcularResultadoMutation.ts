import { useMutation } from "@tanstack/react-query";

import { diagnosticosService } from "@/features/diagnosticos/services/diagnosticos.service";

export function useCalcularResultadoMutation() {
  return useMutation({
    mutationFn: (id: string) => diagnosticosService.calcularResultado(id),
  });
}
