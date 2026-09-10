import { useQueries } from "@tanstack/react-query";

import { planoAcaoQueryKeys } from "@/features/plano-acao/hooks/plano-acao.query-keys";
import { planoAcaoService } from "@/features/plano-acao/services/plano-acao.service";

/**
 * GET /planos-acao (lista) não traz `tarefas` — só GET /planos-acao/:id/tarefas.
 * Pra mostrar "quantidade de tarefas" na tabela sem inventar o dado, busca
 * por plano (endpoint já existente, sem criar nada novo no back-end) — só
 * para os planos visíveis na página atual, não a listagem inteira.
 */
export function usePlanosTarefasCount(planoIds: string[]) {
  const results = useQueries({
    queries: planoIds.map((planoId) => ({
      queryKey: planoAcaoQueryKeys.tarefas(planoId),
      queryFn: () => planoAcaoService.getTarefas(planoId),
    })),
  });

  const countById = new Map<string, number>();
  planoIds.forEach((planoId, index) => {
    const tarefas = results[index]?.data;
    if (tarefas) countById.set(planoId, tarefas.length);
  });
  return countById;
}
