import { useMutation } from "@tanstack/react-query";

import { diagnosticosService } from "@/features/diagnosticos/services/diagnosticos.service";
import type { CreateDiagnosticoInput } from "@/features/diagnosticos/types/diagnostico.types";

export function useCreateDiagnosticoMutation() {
  return useMutation({
    mutationFn: (input: CreateDiagnosticoInput) => diagnosticosService.create(input),
  });
}
