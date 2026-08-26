import { useMutation } from "@tanstack/react-query";

import { diagnosticosService } from "@/features/diagnosticos/services/diagnosticos.service";

export function useIniciarDiagnosticoMutation() {
  return useMutation({
    mutationFn: (id: string) => diagnosticosService.iniciar(id),
  });
}
