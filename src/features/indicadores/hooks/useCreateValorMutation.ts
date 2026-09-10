import { useMutation, useQueryClient } from "@tanstack/react-query";

import { indicadoresQueryKeys } from "@/features/indicadores/hooks/indicadores.query-keys";
import { indicadoresService } from "@/features/indicadores/services/indicadores.service";
import type { CreateIndicadorValorInput } from "@/features/indicadores/types/indicador.types";

/**
 * Registrar uma medição também muda `valor_atual`/`situacao` do indicador
 * (efeito colateral no back-end) — por isso invalida `all` (cobre o
 * detalhe do indicador e a listagem, não só o histórico de valores).
 */
export function useCreateValorMutation(indicadorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateIndicadorValorInput) => indicadoresService.createValor(indicadorId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: indicadoresQueryKeys.all });
    },
  });
}
