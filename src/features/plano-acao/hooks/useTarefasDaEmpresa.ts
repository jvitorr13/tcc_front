import { useQueries } from "@tanstack/react-query";

import { planoAcaoQueryKeys } from "@/features/plano-acao/hooks/plano-acao.query-keys";
import { usePlanosAcaoQuery } from "@/features/plano-acao/hooks/usePlanosAcaoQuery";
import { planoAcaoService } from "@/features/plano-acao/services/plano-acao.service";
import type { Tarefa } from "@/features/plano-acao/types/plano-acao.types";

/**
 * Todas as tarefas de uma empresa. Não existe rota que liste tarefas por
 * empresa: busca os planos (GET /planos-acao?empresa_id=) e as tarefas de
 * cada um (GET /planos-acao/:id/tarefas — mesma chave de cache usada no
 * resto do módulo, então reaproveita o que já estiver carregado).
 */
export function useTarefasDaEmpresa(empresaId: string | undefined) {
  const { data: planos, isLoading: isLoadingPlanos } = usePlanosAcaoQuery(empresaId ? [{ empresa_id: empresaId }] : []);

  const results = useQueries({
    queries: (planos ?? []).map((plano) => ({
      queryKey: planoAcaoQueryKeys.tarefas(plano.id),
      queryFn: () => planoAcaoService.getTarefas(plano.id),
    })),
  });

  const tarefas: Tarefa[] = results.flatMap((result) => result.data ?? []);
  const isLoading = isLoadingPlanos || results.some((result) => result.isLoading);
  return { tarefas, isLoading };
}
