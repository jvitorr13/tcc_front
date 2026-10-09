import { useMutation, useQueryClient } from "@tanstack/react-query";

import { diagnosticosQueryKeys } from "@/features/diagnosticos/hooks/diagnosticos.query-keys";
import { diagnosticosService } from "@/features/diagnosticos/services/diagnosticos.service";
import type { RegistrarRespostaInput } from "@/features/diagnosticos/types/diagnostico.types";

/**
 * Cada resposta é salva assim que o consultor clica na escala (ver
 * PerguntaField) — não existe um botão "salvar respostas" em lote, é o
 * padrão descrito no fluxo ("isso acontece N vezes, uma para cada pergunta
 * respondida"). Invalida pendências e respostas pra refletir o que ainda
 * falta responder.
 */
export function useResponderPerguntaMutation(diagnosticoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RegistrarRespostaInput) => diagnosticosService.responder(diagnosticoId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: diagnosticosQueryKeys.pendencias(diagnosticoId) });
      queryClient.invalidateQueries({ queryKey: diagnosticosQueryKeys.respostas(diagnosticoId) });
    },
  });
}
